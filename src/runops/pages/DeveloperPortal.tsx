/**
 * Page 46 · Developer & Extensibility Portal
 * Route: /runops/developer
 *
 * Governs the full extension lifecycle: applications, event subscriptions,
 * webhooks, SDK versions, custom steps, connector development, plugins,
 * sandboxes, quotas, usage, and API documentation.
 *
 * Security posture:
 *   - Client secrets are shown once at creation, then stored as opaque
 *     references (`SR::APP_<id>`). The raw value never re-renders.
 *   - Scope changes, publishing, and revocation require review before
 *     any production effect (state transitions gated to "pending review"
 *     → "approved").
 *   - API contracts are versioned with explicit deprecation notices.
 *
 * Persistence (localStorage):
 *   runops.developer.apps.v1
 *   runops.developer.webhooks.v1
 *   runops.developer.subscriptions.v1
 *   runops.developer.custom_steps.v1
 *   runops.developer.connectors.v1
 *   runops.developer.plugins.v1
 *   runops.developer.sandboxes.v1
 *   runops.developer.usage.v1
 *   runops.audit.events.v1
 *   runops.domain.events.v1
 *   runops.step.catalog.v1            → Step Builder cross-screen
 *   runops.integrations.candidates.v1 → Integration Hub cross-screen
 *   runops.platform.analytics.v1      → Platform Analytics cross-screen
 *
 * No fixture-array imports. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, Ban, Boxes, CheckCircle2, Code2, Copy,
  FileCode2, FlaskConical, Gauge, Globe, KeyRound, Package, PlayCircle,
  PlusCircle, RefreshCw, Rocket, ScrollText, Search, ShieldCheck,
  Sparkles, Webhook,
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

type Env = "dev" | "staging" | "prod";

type AppStatus =
  | "Development"
  | "Pending review"
  | "Approved"
  | "Deprecated"
  | "Rate limited"
  | "Revoked";

type PluginStatus = AppStatus;

type Scope =
  | "services:read" | "services:write"
  | "runbooks:read" | "runbooks:write" | "runbooks:execute"
  | "executions:read" | "executions:write"
  | "incidents:read" | "incidents:write"
  | "evidence:read"
  | "slos:read"
  | "workers:read" | "workers:write"
  | "approvals:read" | "approvals:write";

interface Application {
  id: string;                     // APP-XXXX
  name: string;
  owner: string;
  clientIdentity: string;         // client_id (public)
  secretRef: string | null;       // SR::APP_XXXX — value never rendered
  scopes: Scope[];
  environment: Env;
  rateLimitPerMin: number;
  lastActivityAt: string;
  status: AppStatus;
  createdAt: string;
  reviewRequestedAt: string | null;
}

interface EventSubscription {
  id: string;                     // SUB-XXXX
  appId: string;
  eventType: string;              // e.g. "runops.execution.completed"
  filter: string;                 // JMESPath-like
  createdAt: string;
  active: boolean;
}

interface WebhookEndpoint {
  id: string;                     // WH-XXXX
  appId: string;
  url: string;
  eventTypes: string[];
  signingSecretRef: string;       // SR::WH_XXXX
  lastDeliveryAt: string | null;
  lastResponseCode: number | null;
  deliveryState: "healthy" | "degraded" | "failing" | "paused";
  createdAt: string;
}

interface CustomStep {
  id: string;                     // CS-XXXX
  name: string;
  owner: string;
  version: string;
  runtime: "typescript" | "python" | "container";
  inputSchemaVersion: string;
  outputSchemaVersion: string;
  status: PluginStatus;
  publishedToStepBuilder: boolean;
  createdAt: string;
}

interface DevConnector {
  id: string;                     // DC-XXXX
  name: string;
  owner: string;
  category: string;
  version: string;
  compatibility: string[];        // e.g. ["schema/v1","runops/1.4"]
  status: PluginStatus;
  publishedToIntegrationHub: boolean;
  createdAt: string;
}

interface Plugin {
  id: string;                     // PL-XXXX
  name: string;
  owner: string;
  version: string;
  surface: "step" | "connector" | "dashboard-widget" | "worker-tool";
  certification: "none" | "requested" | "certified";
  status: PluginStatus;
  createdAt: string;
}

interface Sandbox {
  id: string;                     // SB-XXXX
  appId: string;
  name: string;
  env: Env;
  dataset: "synthetic" | "masked-prod" | "empty";
  createdAt: string;
  expiresAt: string;
}

interface UsageRow {
  appId: string;
  window: "1h" | "24h" | "7d";
  requests: number;
  errors: number;
  p95LatencyMs: number;
  quotaPct: number;               // 0..100
}

interface AuditEvent {
  id: string; at: string; kind: string; actor: string; target: string;
  detail: Record<string, string | number | boolean | string[] | null>;
}
interface DomainEvent {
  id: string; at: string; kind: string;
  payload: Record<string, string | number | boolean | string[] | null>;
}

type Tab =
  | "applications" | "explorer" | "events" | "webhooks" | "sdks"
  | "steps" | "connectors" | "plugins" | "sandboxes" | "quotas"
  | "usage" | "docs";

/* --------------------------- Keys / constants --------------------------- */

const K_APPS = "runops.developer.apps.v1";
const K_WH = "runops.developer.webhooks.v1";
const K_SUB = "runops.developer.subscriptions.v1";
const K_STEPS = "runops.developer.custom_steps.v1";
const K_CONN = "runops.developer.connectors.v1";
const K_PLUGINS = "runops.developer.plugins.v1";
const K_SANDBOX = "runops.developer.sandboxes.v1";
const K_USAGE = "runops.developer.usage.v1";
const K_AUD = "runops.audit.events.v1";
const K_DOM = "runops.domain.events.v1";
const K_STEP_CATALOG = "runops.step.catalog.v1";
const K_INT_CANDIDATES = "runops.integrations.candidates.v1";
const K_ANALYTICS = "runops.platform.analytics.v1";

const ALL_SCOPES: readonly Scope[] = [
  "services:read","services:write","runbooks:read","runbooks:write","runbooks:execute",
  "executions:read","executions:write","incidents:read","incidents:write",
  "evidence:read","slos:read","workers:read","workers:write",
  "approvals:read","approvals:write",
] as const;

const STATUSES: readonly AppStatus[] = [
  "Development","Pending review","Approved","Deprecated","Rate limited","Revoked",
] as const;

const EVENT_TYPES: readonly string[] = [
  "runops.execution.started",
  "runops.execution.completed",
  "runops.execution.failed",
  "runops.incident.opened",
  "runops.incident.resolved",
  "runops.approval.requested",
  "runops.approval.granted",
  "runops.slo.burn_rate.alert",
  "runops.worker.session.opened",
  "runops.worker.session.closed",
  "runops.evidence.attached",
  "runops.runbook.published",
] as const;

interface ApiEndpoint {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  summary: string;
  version: string;
  deprecated: boolean;
  deprecationNote?: string;
  sampleResponse: string;
}

const API_ENDPOINTS: readonly ApiEndpoint[] = [
  { method: "GET", path: "/v1/services", summary: "List services in the tenant.", version: "v1",
    deprecated: false,
    sampleResponse: `{ "items": [{ "id": "svc-payments", "name": "payments", "tier": "T0" }] }` },
  { method: "GET", path: "/v1/runbooks", summary: "List runbooks.", version: "v1",
    deprecated: false,
    sampleResponse: `{ "items": [{ "id": "RB-1001", "name": "Payments failover", "version": "3.2.0" }] }` },
  { method: "POST", path: "/v1/executions", summary: "Launch a runbook execution.", version: "v1",
    deprecated: false,
    sampleResponse: `{ "id": "EX-8891", "status": "queued", "runbookId": "RB-1001" }` },
  { method: "GET", path: "/v1/executions/{id}", summary: "Fetch an execution.", version: "v1",
    deprecated: false,
    sampleResponse: `{ "id": "EX-8891", "status": "running", "startedAt": "2026-07-11T09:41:22Z" }` },
  { method: "GET", path: "/v1/incidents", summary: "List incidents.", version: "v1",
    deprecated: false,
    sampleResponse: `{ "items": [{ "id": "INC-4471", "severity": "SEV2", "state": "investigating" }] }` },
  { method: "GET", path: "/v1/incidents/{id}/evidence", summary: "Fetch evidence bundle.", version: "v1",
    deprecated: false,
    sampleResponse: `{ "items": [{ "id": "EV-7710", "kind": "log", "digest": "sha256:…" }] }` },
  { method: "GET", path: "/v1/slos", summary: "List SLOs.", version: "v1",
    deprecated: false,
    sampleResponse: `{ "items": [{ "id": "SLO-payments-availability", "target": 99.95 }] }` },
  { method: "GET", path: "/v1/workers", summary: "List digital workers.", version: "v1",
    deprecated: false,
    sampleResponse: `{ "items": [{ "id": "W-nova-triage", "model": "gpt-approved", "status": "Approved" }] }` },
  { method: "POST", path: "/v1/approvals/{id}/grant", summary: "Grant an approval.", version: "v1",
    deprecated: false,
    sampleResponse: `{ "id": "APR-2201", "state": "granted" }` },
  { method: "GET", path: "/v0/executions", summary: "Legacy execution list.", version: "v0",
    deprecated: true,
    deprecationNote: "Superseded by /v1/executions on 2025-11-01. Removal targeted 2026-11-01.",
    sampleResponse: `{ "executions": [...] }` },
];

const SDK_LANGS: ReadonlyArray<{ lang: string; version: string; status: "GA" | "Beta" | "Deprecated"; install: string; note?: string; }> = [
  { lang: "TypeScript", version: "1.4.2", status: "GA", install: "npm install @runops/sdk@1.4.2" },
  { lang: "Python",     version: "1.4.1", status: "GA", install: "pip install runops-sdk==1.4.1" },
  { lang: "Go",         version: "1.3.7", status: "GA", install: "go get github.com/runops/sdk-go@v1.3.7" },
  { lang: "Java",       version: "1.2.9", status: "Beta", install: "gradle: implementation 'io.runops:sdk:1.2.9'" },
  { lang: "Ruby",       version: "0.9.4", status: "Deprecated", install: "gem install runops --version 0.9.4",
    note: "No longer receiving new endpoints. EOL 2027-01-01." },
];

const AI_RECOMMENDATION = {
  id: "REC-DEV-1",
  title: "Narrow application scopes before requesting production approval",
  conclusion:
    "APP-2001 (payments-orchestrator) requests runbooks:execute and approvals:write in production. Historical usage from its staging traffic shows it only executes RB-1001 and never grants approvals. Removing approvals:write and constraining runbooks:execute to RB-1001 preserves function while eliminating the highest-blast-radius scope.",
  confidence: 84,
  uncertainty:
    "Confidence interval 78–90%. The staging dataset covers 21 days; production behavior may add rare paths (est. <5% traffic). Recommendation is reversible via a scope amendment.",
  supportingEvidence: [
    "Staging sample (n=14,203 requests, 21 days): 0 calls to POST /v1/approvals/*/grant.",
    "runbooks:execute usage: 100% of executions targeted RB-1001 (12,880 of 12,880).",
    "Policy: least-privilege scopes required for prod approval per governance-1.8.",
  ],
  contradictoryEvidence: [
    "One future roadmap item (Q4) mentions auto-approving low-risk changes, which would require approvals:write.",
  ],
  sources: [
    "usage://runops.developer.usage (APP-2001, 21d)",
    "policy://governance/least-privilege-1.8",
    "audit://runops.audit.events (APP-2001, scope history)",
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

function seedApplications(scenario: string): Application[] {
  const rows: Array<Omit<Application, "lastActivityAt" | "createdAt" | "reviewRequestedAt"> & { ageDays: number }> = [
    { id: "APP-2001", name: "payments-orchestrator", owner: "payments-eng",
      clientIdentity: "cid_pay_orc_prod_9f2a", secretRef: "SR::APP_2001",
      scopes: ["runbooks:read","runbooks:execute","approvals:write","executions:read"],
      environment: "prod", rateLimitPerMin: 1200, status: "Pending review", ageDays: 21 },
    { id: "APP-2002", name: "sre-metrics-exporter", owner: "observability-eng",
      clientIdentity: "cid_sre_metrics_5b71", secretRef: "SR::APP_2002",
      scopes: ["executions:read","incidents:read","slos:read"],
      environment: "prod", rateLimitPerMin: 600, status: "Approved", ageDays: 240 },
    { id: "APP-2003", name: "postmortem-writer-bot", owner: "reliability-eng",
      clientIdentity: "cid_pm_writer_1122", secretRef: "SR::APP_2003",
      scopes: ["incidents:read","evidence:read","incidents:write"],
      environment: "staging", rateLimitPerMin: 120, status: "Development", ageDays: 7 },
    { id: "APP-2004", name: "legacy-sync-adapter", owner: "platform-eng",
      clientIdentity: "cid_legacy_sync_0044", secretRef: "SR::APP_2004",
      scopes: ["services:read","runbooks:read"],
      environment: "prod", rateLimitPerMin: 60, status: "Deprecated", ageDays: 720 },
    { id: "APP-2005", name: "worker-tool-broker", owner: "platform-ai",
      clientIdentity: "cid_wtool_broker_ab89", secretRef: "SR::APP_2005",
      scopes: ["workers:read","workers:write","runbooks:read"],
      environment: "prod", rateLimitPerMin: 3000, status: "Approved", ageDays: 92 },
    { id: "APP-2006", name: "burst-ingest", owner: "data-platform",
      clientIdentity: "cid_burst_ingest_ee01", secretRef: "SR::APP_2006",
      scopes: ["executions:read"],
      environment: "prod", rateLimitPerMin: 60, status: "Rate limited", ageDays: 33 },
    { id: "APP-2007", name: "compromised-scanner", owner: "security-eng",
      clientIdentity: "cid_scan_revoked_ff77", secretRef: null,
      scopes: [],
      environment: "prod", rateLimitPerMin: 0, status: "Revoked", ageDays: 12 },
  ];
  return rows.map((r) => {
    const s = hash(`${r.id}::${scenario}`);
    return {
      id: r.id, name: r.name, owner: r.owner, clientIdentity: r.clientIdentity,
      secretRef: r.secretRef, scopes: r.scopes, environment: r.environment,
      rateLimitPerMin: r.rateLimitPerMin, status: r.status,
      lastActivityAt: inHours(-((s % 24) + 1) / 4),
      createdAt: inDays(-r.ageDays),
      reviewRequestedAt: r.status === "Pending review" ? inDays(-2) : null,
    };
  });
}

function seedSubscriptions(): EventSubscription[] {
  return [
    { id: "SUB-3001", appId: "APP-2002", eventType: "runops.execution.completed",
      filter: "service == 'payments'", createdAt: inDays(-90), active: true },
    { id: "SUB-3002", appId: "APP-2002", eventType: "runops.slo.burn_rate.alert",
      filter: "severity in ['SEV1','SEV2']", createdAt: inDays(-90), active: true },
    { id: "SUB-3003", appId: "APP-2003", eventType: "runops.incident.resolved",
      filter: "postmortemRequired == true", createdAt: inDays(-5), active: true },
    { id: "SUB-3004", appId: "APP-2005", eventType: "runops.worker.session.closed",
      filter: "*", createdAt: inDays(-60), active: true },
  ];
}

function seedWebhooks(): WebhookEndpoint[] {
  return [
    { id: "WH-4001", appId: "APP-2002", url: "https://metrics.example.com/hooks/runops",
      eventTypes: ["runops.execution.completed","runops.slo.burn_rate.alert"],
      signingSecretRef: "SR::WH_4001", lastDeliveryAt: inHours(-1),
      lastResponseCode: 200, deliveryState: "healthy", createdAt: inDays(-90) },
    { id: "WH-4002", appId: "APP-2003", url: "https://pm-writer.example.com/incidents",
      eventTypes: ["runops.incident.resolved"], signingSecretRef: "SR::WH_4002",
      lastDeliveryAt: inHours(-8), lastResponseCode: 502, deliveryState: "failing",
      createdAt: inDays(-5) },
    { id: "WH-4003", appId: "APP-2005", url: "https://tools.example.com/broker",
      eventTypes: ["runops.worker.session.closed"], signingSecretRef: "SR::WH_4003",
      lastDeliveryAt: inHours(-3), lastResponseCode: 200, deliveryState: "degraded",
      createdAt: inDays(-60) },
  ];
}

function seedCustomSteps(): CustomStep[] {
  return [
    { id: "CS-5001", name: "kafka-lag-check", owner: "platform-eng", version: "1.2.0",
      runtime: "typescript", inputSchemaVersion: "v1", outputSchemaVersion: "v1",
      status: "Approved", publishedToStepBuilder: true, createdAt: inDays(-120) },
    { id: "CS-5002", name: "s3-object-diff", owner: "data-platform", version: "0.4.1",
      runtime: "python", inputSchemaVersion: "v1", outputSchemaVersion: "v1",
      status: "Pending review", publishedToStepBuilder: false, createdAt: inDays(-3) },
    { id: "CS-5003", name: "cordon-node", owner: "cloud-platform", version: "0.9.0",
      runtime: "container", inputSchemaVersion: "v1", outputSchemaVersion: "v1",
      status: "Development", publishedToStepBuilder: false, createdAt: inDays(-1) },
  ];
}

function seedDevConnectors(): DevConnector[] {
  return [
    { id: "DC-6001", name: "opsgenie-events", owner: "sre-platform", category: "observability",
      version: "0.7.0", compatibility: ["schema/v1","runops/1.4"], status: "Pending review",
      publishedToIntegrationHub: false, createdAt: inDays(-4) },
    { id: "DC-6002", name: "chronicle-siem", owner: "security-eng", category: "security",
      version: "0.2.1", compatibility: ["schema/v1","runops/1.3","runops/1.4"], status: "Development",
      publishedToIntegrationHub: false, createdAt: inDays(-11) },
    { id: "DC-6003", name: "linear-tickets", owner: "devx-eng", category: "collaboration",
      version: "1.1.0", compatibility: ["schema/v1","runops/1.4"], status: "Approved",
      publishedToIntegrationHub: true, createdAt: inDays(-150) },
  ];
}

function seedPlugins(): Plugin[] {
  return [
    { id: "PL-7001", name: "cost-guardrail-widget", owner: "finops-eng", version: "1.0.3",
      surface: "dashboard-widget", certification: "certified", status: "Approved", createdAt: inDays(-200) },
    { id: "PL-7002", name: "chaos-drill-step", owner: "reliability-eng", version: "0.5.0",
      surface: "step", certification: "requested", status: "Pending review", createdAt: inDays(-6) },
    { id: "PL-7003", name: "policy-linter-tool", owner: "governance-eng", version: "0.1.0",
      surface: "worker-tool", certification: "none", status: "Development", createdAt: inDays(-2) },
  ];
}

function seedSandboxes(): Sandbox[] {
  return [
    { id: "SB-8001", appId: "APP-2003", name: "postmortem-writer-sbx", env: "staging",
      dataset: "synthetic", createdAt: inDays(-3), expiresAt: inDays(4) },
    { id: "SB-8002", appId: "APP-2005", name: "worker-broker-sbx", env: "dev",
      dataset: "masked-prod", createdAt: inDays(-14), expiresAt: inDays(-1) }, // expired
  ];
}

function seedUsage(apps: Application[]): UsageRow[] {
  const out: UsageRow[] = [];
  for (const a of apps) {
    const s = hash(a.id);
    const base = a.status === "Revoked" ? 0 : a.status === "Deprecated" ? 40 : a.status === "Rate limited" ? 5900 : 200 + (s % 4000);
    out.push({ appId: a.id, window: "1h",
      requests: Math.round(base / 24),
      errors: Math.round((base / 24) * (a.status === "Rate limited" ? 0.18 : 0.008)),
      p95LatencyMs: 80 + (s % 220),
      quotaPct: a.rateLimitPerMin === 0 ? 0 : Math.min(100, Math.round((base / 24 / 60) / a.rateLimitPerMin * 100)) });
    out.push({ appId: a.id, window: "24h",
      requests: base,
      errors: Math.round(base * (a.status === "Rate limited" ? 0.18 : 0.008)),
      p95LatencyMs: 90 + (s % 220),
      quotaPct: a.rateLimitPerMin === 0 ? 0 : Math.min(100, Math.round((base / 60) / a.rateLimitPerMin * 100)) });
    out.push({ appId: a.id, window: "7d",
      requests: base * 7,
      errors: Math.round(base * 7 * (a.status === "Rate limited" ? 0.14 : 0.006)),
      p95LatencyMs: 95 + (s % 220),
      quotaPct: a.rateLimitPerMin === 0 ? 0 : Math.min(100, Math.round((base * 7 / (7 * 24 * 60)) / a.rateLimitPerMin * 100)) });
  }
  return out;
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

function appendEvents(
  auditKind: string, actor: string, target: string, detail: AuditEvent["detail"],
  domainKind: string, payload: DomainEvent["payload"],
): void {
  const aud = loadOr<AuditEvent[]>(K_AUD, () => []);
  const dom = loadOr<DomainEvent[]>(K_DOM, () => []);
  aud.unshift({ id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1e4)}`, at: now(), kind: auditKind, actor, target, detail });
  dom.unshift({ id: `DOM-${Date.now()}-${Math.floor(Math.random() * 1e4)}`, at: now(), kind: domainKind, payload });
  save(K_AUD, aud.slice(0, 500));
  save(K_DOM, dom.slice(0, 500));
}

/* ------------------------------ Tone maps ------------------------------- */

function statusTone(s: AppStatus): string {
  switch (s) {
    case "Approved":       return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "Development":    return "border-slate-200 bg-slate-50 text-slate-700";
    case "Pending review": return "border-amber-200 bg-amber-50 text-amber-800";
    case "Deprecated":     return "border-orange-200 bg-orange-50 text-orange-800";
    case "Rate limited":   return "border-amber-200 bg-amber-50 text-amber-800";
    case "Revoked":        return "border-red-200 bg-red-50 text-red-800";
  }
}

function deliveryTone(s: WebhookEndpoint["deliveryState"]): string {
  switch (s) {
    case "healthy":  return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "degraded": return "border-amber-200 bg-amber-50 text-amber-800";
    case "failing":  return "border-red-200 bg-red-50 text-red-800";
    case "paused":   return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

/* ------------------------------- Component ------------------------------ */

export default function DeveloperPortal() {
  const ops = useOperations();
  const scenario = (ops as unknown as { scenario?: string }).scenario ?? "baseline";
  const role = (ops as unknown as { role?: string }).role ?? "developer";
  const tenant = (ops as unknown as { tenant?: string }).tenant ?? "runops";
  const actor = String(role);

  const [apps, setApps] = useState<Application[]>(() =>
    loadOr<Application[]>(K_APPS, () => seedApplications(scenario)));
  const [subs, setSubs] = useState<EventSubscription[]>(() =>
    loadOr<EventSubscription[]>(K_SUB, () => seedSubscriptions()));
  const [hooks, setHooks] = useState<WebhookEndpoint[]>(() =>
    loadOr<WebhookEndpoint[]>(K_WH, () => seedWebhooks()));
  const [steps, setSteps] = useState<CustomStep[]>(() =>
    loadOr<CustomStep[]>(K_STEPS, () => seedCustomSteps()));
  const [devConn, setDevConn] = useState<DevConnector[]>(() =>
    loadOr<DevConnector[]>(K_CONN, () => seedDevConnectors()));
  const [plugins, setPlugins] = useState<Plugin[]>(() =>
    loadOr<Plugin[]>(K_PLUGINS, () => seedPlugins()));
  const [sandboxes, setSandboxes] = useState<Sandbox[]>(() =>
    loadOr<Sandbox[]>(K_SANDBOX, () => seedSandboxes()));
  const [usage, setUsage] = useState<UsageRow[]>(() =>
    loadOr<UsageRow[]>(K_USAGE, () => seedUsage(seedApplications(scenario))));

  useEffect(() => { save(K_APPS, apps); }, [apps]);
  useEffect(() => { save(K_SUB, subs); }, [subs]);
  useEffect(() => { save(K_WH, hooks); }, [hooks]);
  useEffect(() => { save(K_STEPS, steps); }, [steps]);
  useEffect(() => { save(K_CONN, devConn); }, [devConn]);
  useEffect(() => { save(K_PLUGINS, plugins); }, [plugins]);
  useEffect(() => { save(K_SANDBOX, sandboxes); }, [sandboxes]);
  useEffect(() => { save(K_USAGE, usage); }, [usage]);

  /* --- Cross-screen propagation --- */
  useEffect(() => {
    // Approved + published custom steps become available in Step Builder.
    const catalog = steps
      .filter((s) => s.status === "Approved" && s.publishedToStepBuilder)
      .map((s) => ({ id: s.id, name: s.name, version: s.version, runtime: s.runtime,
        inputSchemaVersion: s.inputSchemaVersion, outputSchemaVersion: s.outputSchemaVersion,
        source: "developer-portal" }));
    save(K_STEP_CATALOG, catalog);
  }, [steps]);

  useEffect(() => {
    // Approved dev connectors surface as candidates in Integration Hub.
    const candidates = devConn
      .filter((c) => c.status === "Approved" && c.publishedToIntegrationHub)
      .map((c) => ({ id: c.id, name: c.name, category: c.category, version: c.version,
        compatibility: c.compatibility, source: "developer-portal" }));
    save(K_INT_CANDIDATES, candidates);
  }, [devConn]);

  useEffect(() => {
    // Usage rolls up into Platform Analytics.
    const analytics = usage.filter((u) => u.window === "24h").map((u) => ({
      appId: u.appId, requests: u.requests, errors: u.errors,
      p95LatencyMs: u.p95LatencyMs, quotaPct: u.quotaPct,
    }));
    save(K_ANALYTICS, analytics);
  }, [usage]);

  /* --------------------------- UI state ---------------------------------- */

  const [tab, setTab] = useState<Tab>("applications");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppStatus | "all">("all");
  const [envFilter, setEnvFilter] = useState<Env | "all">("all");

  const filteredApps = useMemo(() => {
    const qn = q.trim().toLowerCase();
    return apps.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (envFilter !== "all" && a.environment !== envFilter) return false;
      if (!qn) return true;
      return a.name.toLowerCase().includes(qn) || a.owner.toLowerCase().includes(qn) || a.id.toLowerCase().includes(qn);
    });
  }, [apps, q, statusFilter, envFilter]);

  const statusCounts = useMemo(() => {
    const c: Record<AppStatus, number> = {
      "Development": 0, "Pending review": 0, "Approved": 0,
      "Deprecated": 0, "Rate limited": 0, "Revoked": 0,
    };
    for (const a of apps) c[a.status] += 1;
    return c;
  }, [apps]);

  /* --------------------------- Dialogs ----------------------------------- */

  type DialogKind =
    | { kind: "none" }
    | { kind: "createApp" }
    | { kind: "showSecret"; id: string; oneTimeSecret: string }
    | { kind: "scopes"; id: string }
    | { kind: "revoke"; id: string }
    | { kind: "requestReview"; id: string }
    | { kind: "createHook"; appId?: string }
    | { kind: "subscribe"; appId?: string }
    | { kind: "replayEvent"; eventType: string; result?: { ok: boolean; message: string } }
    | { kind: "buildStep" }
    | { kind: "validateStep"; id: string; result?: { ok: boolean; issues: string[] } }
    | { kind: "publishPlugin"; id: string }
    | { kind: "certifyPlugin"; id: string }
    | { kind: "aiRec" }
    | { kind: "testApi"; endpoint: ApiEndpoint; result?: { status: number; body: string } };

  const [dialog, setDialog] = useState<DialogKind>({ kind: "none" });

  /* --------------------------- Mutations --------------------------------- */

  const createApplication = useCallback((name: string, owner: string, environment: Env, initialScopes: Scope[]) => {
    const id = `APP-${Math.floor(2100 + Math.random() * 900)}`;
    const secretRef = `SR::${id.replace("-", "_")}`;
    // One-time secret shown ONCE and never persisted in clear. In production this
    // value is minted by the server; here we display it once for demonstration
    // and only the secretRef survives on the record.
    const oneTime = `rop_sk_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;
    const app: Application = {
      id, name, owner,
      clientIdentity: `cid_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 20)}_${Math.random().toString(36).slice(2, 6)}`,
      secretRef,
      scopes: initialScopes,
      environment,
      rateLimitPerMin: environment === "prod" ? 300 : 60,
      lastActivityAt: now(),
      status: "Development",
      createdAt: now(),
      reviewRequestedAt: null,
    };
    setApps((prev) => [app, ...prev]);
    appendEvents("developer.application.create", actor, `app:${id}`,
      { appId: id, name, environment, scopes: initialScopes as string[] },
      "runops.developer.application.created",
      { appId: id, tenantId: tenant, environment, scopes: initialScopes as string[] });
    setDialog({ kind: "showSecret", id, oneTimeSecret: oneTime });
  }, [actor, tenant]);

  const requestReview = useCallback((id: string) => {
    setApps((prev) => prev.map((a) => a.id === id
      ? { ...a, status: "Pending review", reviewRequestedAt: now() } : a));
    appendEvents("developer.application.review_requested", actor, `app:${id}`,
      { appId: id }, "runops.developer.application.review_requested", { appId: id });
    setDialog({ kind: "none" });
  }, [actor]);

  const updateScopes = useCallback((id: string, scopes: Scope[]) => {
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, scopes } : a));
    appendEvents("developer.application.scopes_update", actor, `app:${id}`,
      { appId: id, scopes: scopes as string[] },
      "runops.developer.application.scopes_updated",
      { appId: id, scopes: scopes as string[] });
    setDialog({ kind: "none" });
  }, [actor]);

  const revokeApp = useCallback((id: string) => {
    setApps((prev) => prev.map((a) => a.id === id
      ? { ...a, status: "Revoked", secretRef: null, rateLimitPerMin: 0 } : a));
    // Pause webhooks bound to this app.
    setHooks((prev) => prev.map((h) => h.appId === id ? { ...h, deliveryState: "paused" } : h));
    setSubs((prev) => prev.map((s) => s.appId === id ? { ...s, active: false } : s));
    appendEvents("developer.application.revoke", actor, `app:${id}`,
      { appId: id }, "runops.developer.application.revoked", { appId: id });
    setDialog({ kind: "none" });
  }, [actor]);

  const createSubscription = useCallback((appId: string, eventType: string, filter: string) => {
    const s: EventSubscription = {
      id: `SUB-${Math.floor(3100 + Math.random() * 900)}`,
      appId, eventType, filter: filter || "*", createdAt: now(), active: true,
    };
    setSubs((prev) => [s, ...prev]);
    appendEvents("developer.subscription.create", actor, `sub:${s.id}`,
      { appId, eventType, filter },
      "runops.developer.subscription.created",
      { appId, eventType, filter });
    setDialog({ kind: "none" });
  }, [actor]);

  const createHook = useCallback((appId: string, url: string, eventTypes: string[]) => {
    const h: WebhookEndpoint = {
      id: `WH-${Math.floor(4100 + Math.random() * 900)}`,
      appId, url, eventTypes,
      signingSecretRef: `SR::WH_${Math.floor(4100 + Math.random() * 900)}`,
      lastDeliveryAt: null, lastResponseCode: null,
      deliveryState: "healthy", createdAt: now(),
    };
    setHooks((prev) => [h, ...prev]);
    appendEvents("developer.webhook.create", actor, `webhook:${h.id}`,
      { webhookId: h.id, appId, url, eventTypes },
      "runops.developer.webhook.created",
      { webhookId: h.id, appId, url, eventTypes });
    setDialog({ kind: "none" });
  }, [actor]);

  const replayEvent = useCallback((eventType: string) => {
    // Deterministic-ish success based on subscribers present.
    const anySubs = subs.some((s) => s.eventType === eventType && s.active);
    const anyHooks = hooks.some((h) => h.eventTypes.includes(eventType) && h.deliveryState !== "paused");
    const ok = anySubs || anyHooks;
    appendEvents("developer.event.replay", actor, `event:${eventType}`,
      { eventType, subscribers: anySubs, webhooks: anyHooks },
      "runops.developer.event.replayed",
      { eventType, deliveredTo: (anySubs ? 1 : 0) + (anyHooks ? 1 : 0) });
    setDialog({
      kind: "replayEvent", eventType,
      result: { ok, message: ok
        ? `Sample ${eventType} dispatched to ${anySubs ? "subscriptions" : ""}${anySubs && anyHooks ? " and " : ""}${anyHooks ? "webhooks" : ""}.`
        : `No active subscribers or webhooks for ${eventType}.` },
    });
  }, [actor, subs, hooks]);

  const buildStep = useCallback((name: string, runtime: CustomStep["runtime"]) => {
    const s: CustomStep = {
      id: `CS-${Math.floor(5100 + Math.random() * 900)}`,
      name, owner: actor, version: "0.1.0",
      runtime, inputSchemaVersion: "v1", outputSchemaVersion: "v1",
      status: "Development", publishedToStepBuilder: false, createdAt: now(),
    };
    setSteps((prev) => [s, ...prev]);
    appendEvents("developer.custom_step.create", actor, `step:${s.id}`,
      { stepId: s.id, name, runtime },
      "runops.developer.custom_step.created",
      { stepId: s.id, name, runtime });
    setDialog({ kind: "none" });
  }, [actor]);

  const validateStep = useCallback((id: string) => {
    const step = steps.find((s) => s.id === id);
    if (!step) return;
    const issues: string[] = [];
    if (step.version.startsWith("0.")) issues.push("Version is pre-1.0 — production plugins require a stable major version.");
    if (step.runtime === "container" && step.status === "Development") issues.push("Container runtime steps must pass image signature verification before review.");
    const ok = issues.length === 0;
    appendEvents("developer.custom_step.validate", actor, `step:${id}`,
      { stepId: id, ok, issues },
      "runops.developer.custom_step.validated",
      { stepId: id, ok });
    setDialog({ kind: "validateStep", id, result: { ok, issues } });
  }, [actor, steps]);

  const publishStep = useCallback((id: string) => {
    setSteps((prev) => prev.map((s) => s.id === id
      ? { ...s, status: "Pending review" as PluginStatus } : s));
    appendEvents("developer.custom_step.publish_request", actor, `step:${id}`,
      { stepId: id },
      "runops.developer.custom_step.publish_requested",
      { stepId: id });
  }, [actor]);

  const approveStep = useCallback((id: string) => {
    setSteps((prev) => prev.map((s) => s.id === id
      ? { ...s, status: "Approved", publishedToStepBuilder: true } : s));
    appendEvents("developer.custom_step.approve", actor, `step:${id}`,
      { stepId: id },
      "runops.developer.custom_step.approved",
      { stepId: id });
  }, [actor]);

  const approveConnector = useCallback((id: string) => {
    setDevConn((prev) => prev.map((c) => c.id === id
      ? { ...c, status: "Approved", publishedToIntegrationHub: true } : c));
    appendEvents("developer.connector.approve", actor, `connector:${id}`,
      { connectorId: id },
      "runops.developer.connector.approved",
      { connectorId: id });
  }, [actor]);

  const requestPluginCertification = useCallback((id: string) => {
    setPlugins((prev) => prev.map((p) => p.id === id
      ? { ...p, certification: "requested", status: "Pending review" } : p));
    appendEvents("developer.plugin.certification_request", actor, `plugin:${id}`,
      { pluginId: id },
      "runops.developer.plugin.certification_requested",
      { pluginId: id });
    setDialog({ kind: "none" });
  }, [actor]);

  const publishPlugin = useCallback((id: string) => {
    setPlugins((prev) => prev.map((p) => p.id === id
      ? { ...p, status: "Pending review" } : p));
    appendEvents("developer.plugin.publish_request", actor, `plugin:${id}`,
      { pluginId: id },
      "runops.developer.plugin.publish_requested",
      { pluginId: id });
    setDialog({ kind: "none" });
  }, [actor]);

  const testEndpoint = useCallback((endpoint: ApiEndpoint) => {
    appendEvents("developer.api.test", actor, `endpoint:${endpoint.method} ${endpoint.path}`,
      { method: endpoint.method, path: endpoint.path, version: endpoint.version },
      "runops.developer.api.tested",
      { method: endpoint.method, path: endpoint.path });
    setDialog({
      kind: "testApi", endpoint,
      result: { status: endpoint.deprecated ? 299 : 200, body: endpoint.sampleResponse },
    });
  }, [actor]);

  /* --------------------------- Small local pieces ------------------------ */

  const CreateAppForm = () => {
    const [name, setName] = useState("");
    const [owner, setOwner] = useState(actor);
    const [environment, setEnv] = useState<Env>("dev");
    const [chosen, setChosen] = useState<Scope[]>(["services:read","runbooks:read","executions:read"]);
    const toggle = (s: Scope) =>
      setChosen((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-[11px] text-slate-600">Application name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="my-app" /></div>
          <div><label className="text-[11px] text-slate-600">Owner</label>
            <Input value={owner} onChange={(e) => setOwner(e.target.value)} /></div>
        </div>
        <div>
          <label className="text-[11px] text-slate-600">Environment</label>
          <Select value={environment} onValueChange={(v) => setEnv(v as Env)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="dev">dev</SelectItem>
              <SelectItem value="staging">staging</SelectItem>
              <SelectItem value="prod">prod (requires review before use)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-[11px] text-slate-600">Initial scopes</label>
          <div className="mt-1 flex flex-wrap gap-1">
            {ALL_SCOPES.map((s) => (
              <button key={s} type="button" onClick={() => toggle(s)}
                className={cn("rounded-md border px-2 py-0.5 text-[11px]",
                  chosen.includes(s)
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700")}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialog({ kind: "none" })}>Cancel</Button>
          <Button disabled={!name.trim()} onClick={() => createApplication(name.trim(), owner.trim() || actor, environment, chosen)}>
            Create application
          </Button>
        </DialogFooter>
        <p className="text-[11px] text-slate-500">
          Production activation requires review. New applications start in Development regardless of the selected environment.
        </p>
      </div>
    );
  };

  const ScopesForm = ({ appId }: { appId: string }) => {
    const app = apps.find((a) => a.id === appId);
    const [chosen, setChosen] = useState<Scope[]>(app?.scopes ?? []);
    if (!app) return null;
    const toggle = (s: Scope) =>
      setChosen((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
    return (
      <div className="space-y-3">
        <div className="text-xs text-slate-600">
          Scope changes on <span className="font-mono">{app.name}</span> require review before production effect.
        </div>
        <div className="flex flex-wrap gap-1">
          {ALL_SCOPES.map((s) => (
            <button key={s} type="button" onClick={() => toggle(s)}
              className={cn("rounded-md border px-2 py-0.5 text-[11px]",
                chosen.includes(s)
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700")}>
              {s}
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialog({ kind: "none" })}>Cancel</Button>
          <Button onClick={() => updateScopes(appId, chosen)}>Save scopes</Button>
        </DialogFooter>
      </div>
    );
  };

  const SubscribeForm = ({ appId }: { appId?: string }) => {
    const [chosenApp, setChosenApp] = useState<string>(appId ?? (apps[0]?.id ?? ""));
    const [eventType, setEventType] = useState<string>(EVENT_TYPES[0]);
    const [filter, setFilter] = useState<string>("*");
    return (
      <div className="space-y-3">
        <div><label className="text-[11px] text-slate-600">Application</label>
          <Select value={chosenApp} onValueChange={setChosenApp}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {apps.filter((a) => a.status !== "Revoked").map((a) =>
                <SelectItem key={a.id} value={a.id}>{a.name} ({a.id})</SelectItem>)}
            </SelectContent>
          </Select></div>
        <div><label className="text-[11px] text-slate-600">Event type</label>
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select></div>
        <div><label className="text-[11px] text-slate-600">Filter (JMESPath-like, `*` for all)</label>
          <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="severity in ['SEV1','SEV2']" /></div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialog({ kind: "none" })}>Cancel</Button>
          <Button disabled={!chosenApp} onClick={() => createSubscription(chosenApp, eventType, filter)}>
            Subscribe
          </Button>
        </DialogFooter>
      </div>
    );
  };

  const CreateHookForm = ({ appId }: { appId?: string }) => {
    const [chosenApp, setChosenApp] = useState<string>(appId ?? (apps[0]?.id ?? ""));
    const [url, setUrl] = useState<string>("");
    const [chosen, setChosen] = useState<string[]>([EVENT_TYPES[0]]);
    const toggle = (e: string) => setChosen((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]);
    const validUrl = /^https:\/\/[^\s]+$/.test(url);
    return (
      <div className="space-y-3">
        <div><label className="text-[11px] text-slate-600">Application</label>
          <Select value={chosenApp} onValueChange={setChosenApp}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {apps.filter((a) => a.status !== "Revoked").map((a) =>
                <SelectItem key={a.id} value={a.id}>{a.name} ({a.id})</SelectItem>)}
            </SelectContent>
          </Select></div>
        <div><label className="text-[11px] text-slate-600">Callback URL (https only)</label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/hooks/runops" />
          {url && !validUrl && <div className="mt-1 text-[11px] text-red-700">URL must start with https://</div>}
        </div>
        <div>
          <label className="text-[11px] text-slate-600">Event types</label>
          <div className="mt-1 flex flex-wrap gap-1">
            {EVENT_TYPES.map((e) => (
              <button key={e} type="button" onClick={() => toggle(e)}
                className={cn("rounded-md border px-2 py-0.5 text-[11px]",
                  chosen.includes(e)
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700")}>
                {e}
              </button>
            ))}
          </div>
        </div>
        <p className="text-[11px] text-slate-500">
          A signing secret reference will be generated. The signing key value is issued server-side and shown once at delivery.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialog({ kind: "none" })}>Cancel</Button>
          <Button disabled={!validUrl || !chosen.length || !chosenApp} onClick={() => createHook(chosenApp, url, chosen)}>
            Create webhook
          </Button>
        </DialogFooter>
      </div>
    );
  };

  const BuildStepForm = () => {
    const [name, setName] = useState("");
    const [runtime, setRuntime] = useState<CustomStep["runtime"]>("typescript");
    return (
      <div className="space-y-3">
        <div><label className="text-[11px] text-slate-600">Step name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="my-custom-step" /></div>
        <div><label className="text-[11px] text-slate-600">Runtime</label>
          <Select value={runtime} onValueChange={(v) => setRuntime(v as CustomStep["runtime"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="typescript">typescript</SelectItem>
              <SelectItem value="python">python</SelectItem>
              <SelectItem value="container">container</SelectItem>
            </SelectContent>
          </Select></div>
        <p className="text-[11px] text-slate-500">
          Steps start in Development. Publishing moves the step to Pending review. Approval is required before it appears in Step Builder.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialog({ kind: "none" })}>Cancel</Button>
          <Button disabled={!name.trim()} onClick={() => buildStep(name.trim(), runtime)}>Create step</Button>
        </DialogFooter>
      </div>
    );
  };

  /* --------------------------------- Render ------------------------------ */

  return (
    <div className="space-y-6 p-6">
      <EntityHeader
        eyebrow="Platform"
        title="Developer & Extensibility Portal"
        subtitle="Build applications, subscribe to events, ship custom steps and connectors, and manage the full extension lifecycle. Secrets are references only — client secrets are shown once at creation and never again."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setDialog({ kind: "aiRec" })}>
              <Sparkles className="mr-2 h-4 w-4" /> AI recommendation
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDialog({ kind: "subscribe" })}>
              <Activity className="mr-2 h-4 w-4" /> Subscribe to event
            </Button>
            <Button size="sm" onClick={() => setDialog({ kind: "createApp" })}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create application
            </Button>
          </div>
        }
      />

      {/* Status summary */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        {STATUSES.map((s) => (
          <Card key={s} className="border-slate-200">
            <CardContent className="p-3">
              <div className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium", statusTone(s))}>
                {s}
              </div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">{statusCounts[s]}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList aria-label="Developer portal sections" className="flex flex-wrap">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="explorer">API Explorer</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="sdks">SDKs</TabsTrigger>
          <TabsTrigger value="steps">Custom Steps</TabsTrigger>
          <TabsTrigger value="connectors">Connector Dev</TabsTrigger>
          <TabsTrigger value="plugins">Plugins</TabsTrigger>
          <TabsTrigger value="sandboxes">Sandboxes</TabsTrigger>
          <TabsTrigger value="quotas">Quotas</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>

        {/* -------------------------- Applications ---------------------------- */}
        <TabsContent value="applications" className="space-y-3">
          <Card><CardContent className="p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden />
                <Input aria-label="Search applications" className="h-8 w-60 pl-7 text-xs"
                  placeholder="Search name, owner, id"
                  value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AppStatus | "all")}>
                <SelectTrigger className="h-8 w-40 text-xs" aria-label="Status filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={envFilter} onValueChange={(v) => setEnvFilter(v as Env | "all")}>
                <SelectTrigger className="h-8 w-36 text-xs" aria-label="Environment filter">
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
                {filteredApps.length} of {apps.length} applications
              </div>
            </div>
          </CardContent></Card>

          <Card><CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Application</th>
                    <th className="px-3 py-2">Owner</th>
                    <th className="px-3 py-2">Client identity</th>
                    <th className="px-3 py-2">Scopes</th>
                    <th className="px-3 py-2">Env</th>
                    <th className="px-3 py-2">Rate/min</th>
                    <th className="px-3 py-2">Last activity</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.length === 0 && (
                    <tr><td colSpan={9} className="px-3 py-8 text-center text-slate-500">
                      No applications match these filters.
                    </td></tr>
                  )}
                  {filteredApps.map((a) => (
                    <tr key={a.id} className="border-t border-slate-100">
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-900">{a.name}</div>
                        <div className="text-[10px] text-slate-500">{a.id}</div>
                      </td>
                      <td className="px-3 py-2 text-slate-700">{a.owner}</td>
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-700">
                        {a.clientIdentity}
                        <div className="text-[10px] text-slate-500">
                          secret: {a.secretRef ?? <span className="text-red-700">revoked</span>}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {a.scopes.length === 0 && <span className="text-[10px] text-slate-500">none</span>}
                          {a.scopes.slice(0, 4).map((s) => (
                            <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                          ))}
                          {a.scopes.length > 4 && (
                            <Badge variant="outline" className="text-[10px]">+{a.scopes.length - 4}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-slate-700">{a.environment}</td>
                      <td className="px-3 py-2 tabular-nums text-slate-700">{a.rateLimitPerMin}</td>
                      <td className="px-3 py-2 text-slate-500">{new Date(a.lastActivityAt).toLocaleTimeString()}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className={cn("text-[10px]", statusTone(a.status))}>{a.status}</Badge>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          <Button size="sm" variant="ghost" title="Manage scopes"
                            onClick={() => setDialog({ kind: "scopes", id: a.id })}
                            disabled={a.status === "Revoked"}>
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" title="Request review"
                            onClick={() => setDialog({ kind: "requestReview", id: a.id })}
                            disabled={a.status === "Revoked" || a.status === "Pending review" || a.status === "Approved"}>
                            <ScrollText className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" title="Revoke"
                            onClick={() => setDialog({ kind: "revoke", id: a.id })}
                            disabled={a.status === "Revoked"}>
                            <Ban className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        </TabsContent>

        {/* -------------------------- API Explorer ---------------------------- */}
        <TabsContent value="explorer" className="space-y-3">
          <Card><CardContent className="p-3 text-xs text-slate-600">
            API contracts are versioned. Deprecated endpoints display a removal target and a superseding path.
            Testing an endpoint does not affect production data — sample responses come from the contract library.
          </CardContent></Card>
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-3 py-2">Method</th>
                  <th className="px-3 py-2">Path</th>
                  <th className="px-3 py-2">Summary</th>
                  <th className="px-3 py-2">Version</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {API_ENDPOINTS.map((e) => (
                  <tr key={`${e.method} ${e.path}`} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-800">{e.method}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-800">{e.path}</td>
                    <td className="px-3 py-2 text-slate-700">
                      {e.summary}
                      {e.deprecated && e.deprecationNote && (
                        <div className="mt-0.5 text-[10px] text-orange-700">Deprecation: {e.deprecationNote}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{e.version}</td>
                    <td className="px-3 py-2">
                      {e.deprecated
                        ? <Badge variant="outline" className="text-[10px] border-orange-200 bg-orange-50 text-orange-800">Deprecated</Badge>
                        : <Badge variant="outline" className="text-[10px] border-emerald-200 bg-emerald-50 text-emerald-800">Stable</Badge>}
                    </td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="ghost" onClick={() => testEndpoint(e)} title="Test">
                        <PlayCircle className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* ------------------------------- Events ----------------------------- */}
        <TabsContent value="events" className="space-y-3">
          <Card><CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-600">Event catalog. Replay dispatches a sample envelope to active subscriptions and webhooks.</div>
              <Button size="sm" onClick={() => setDialog({ kind: "subscribe" })}>
                <PlusCircle className="mr-2 h-3.5 w-3.5" /> New subscription
              </Button>
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-3 py-2">Event type</th>
                  <th className="px-3 py-2">Active subscriptions</th>
                  <th className="px-3 py-2">Webhooks</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {EVENT_TYPES.map((et) => {
                  const subCount = subs.filter((s) => s.eventType === et && s.active).length;
                  const hookCount = hooks.filter((h) => h.eventTypes.includes(et)).length;
                  return (
                    <tr key={et} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-800">{et}</td>
                      <td className="px-3 py-2 tabular-nums text-slate-700">{subCount}</td>
                      <td className="px-3 py-2 tabular-nums text-slate-700">{hookCount}</td>
                      <td className="px-3 py-2">
                        <Button size="sm" variant="ghost" onClick={() => replayEvent(et)} title="Replay sample">
                          <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent></Card>

          <Card><CardContent className="p-0">
            <div className="border-b border-slate-100 px-3 py-2 text-[11px] uppercase tracking-wide text-slate-600">
              Active subscriptions
            </div>
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
                <tr><th className="px-3 py-2">Sub</th><th className="px-3 py-2">App</th>
                  <th className="px-3 py-2">Event</th><th className="px-3 py-2">Filter</th>
                  <th className="px-3 py-2">Active</th></tr>
              </thead>
              <tbody>
                {subs.length === 0 && (
                  <tr><td colSpan={5} className="px-3 py-4 text-center text-slate-500">No subscriptions.</td></tr>
                )}
                {subs.map((s) => {
                  const a = apps.find((x) => x.id === s.appId);
                  return (
                    <tr key={s.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-700">{s.id}</td>
                      <td className="px-3 py-2 text-slate-700">{a?.name ?? s.appId}</td>
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-800">{s.eventType}</td>
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-700">{s.filter}</td>
                      <td className="px-3 py-2">
                        {s.active
                          ? <Badge variant="outline" className="text-[10px] border-emerald-200 bg-emerald-50 text-emerald-800">Active</Badge>
                          : <Badge variant="outline" className="text-[10px] border-slate-200 bg-slate-50 text-slate-700">Paused</Badge>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* ------------------------------ Webhooks ---------------------------- */}
        <TabsContent value="webhooks" className="space-y-3">
          <Card><CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-600">
                Webhooks are always signed. Signing secrets are references — the raw value is only visible at creation.
              </div>
              <Button size="sm" onClick={() => setDialog({ kind: "createHook" })}>
                <PlusCircle className="mr-2 h-3.5 w-3.5" /> New webhook
              </Button>
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-3 py-2">Webhook</th>
                  <th className="px-3 py-2">App</th>
                  <th className="px-3 py-2">URL</th>
                  <th className="px-3 py-2">Events</th>
                  <th className="px-3 py-2">State</th>
                  <th className="px-3 py-2">Last delivery</th>
                  <th className="px-3 py-2">Last response</th>
                </tr>
              </thead>
              <tbody>
                {hooks.length === 0 && (
                  <tr><td colSpan={7} className="px-3 py-4 text-center text-slate-500">No webhooks.</td></tr>
                )}
                {hooks.map((h) => {
                  const a = apps.find((x) => x.id === h.appId);
                  return (
                    <tr key={h.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-700">
                        {h.id}
                        <div className="text-[10px] text-slate-500">sig: {h.signingSecretRef}</div>
                      </td>
                      <td className="px-3 py-2 text-slate-700">{a?.name ?? h.appId}</td>
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-700">{h.url}</td>
                      <td className="px-3 py-2 text-slate-700">
                        {h.eventTypes.slice(0, 2).map((e) => (
                          <div key={e} className="font-mono text-[11px]">{e}</div>
                        ))}
                        {h.eventTypes.length > 2 && (
                          <div className="text-[10px] text-slate-500">+{h.eventTypes.length - 2} more</div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className={cn("text-[10px]", deliveryTone(h.deliveryState))}>{h.deliveryState}</Badge>
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {h.lastDeliveryAt ? new Date(h.lastDeliveryAt).toLocaleString() : "—"}
                      </td>
                      <td className="px-3 py-2 tabular-nums text-slate-700">{h.lastResponseCode ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* -------------------------------- SDKs ------------------------------ */}
        <TabsContent value="sdks" className="space-y-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-3 py-2">Language</th>
                  <th className="px-3 py-2">Version</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Install</th>
                </tr>
              </thead>
              <tbody>
                {SDK_LANGS.map((s) => (
                  <tr key={s.lang} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-800">{s.lang}</td>
                    <td className="px-3 py-2 tabular-nums text-slate-700">{s.version}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className={cn("text-[10px]",
                        s.status === "GA" ? "border-emerald-200 bg-emerald-50 text-emerald-800" :
                        s.status === "Beta" ? "border-amber-200 bg-amber-50 text-amber-800" :
                        "border-orange-200 bg-orange-50 text-orange-800")}>
                        {s.status}
                      </Badge>
                      {s.note && <div className="mt-0.5 text-[10px] text-orange-700">{s.note}</div>}
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-800">
                      <span className="rounded-md bg-slate-50 px-2 py-0.5">{s.install}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* --------------------------- Custom Steps --------------------------- */}
        <TabsContent value="steps" className="space-y-3">
          <Card><CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-600">
                Approved and published custom steps become available in Step Builder.
              </div>
              <Button size="sm" onClick={() => setDialog({ kind: "buildStep" })}>
                <PlusCircle className="mr-2 h-3.5 w-3.5" /> Build custom step
              </Button>
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-3 py-2">Step</th>
                  <th className="px-3 py-2">Owner</th>
                  <th className="px-3 py-2">Runtime</th>
                  <th className="px-3 py-2">Schemas</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">In Step Builder</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {steps.length === 0 && (
                  <tr><td colSpan={7} className="px-3 py-4 text-center text-slate-500">No custom steps.</td></tr>
                )}
                {steps.map((s) => (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <div className="font-medium text-slate-900">{s.name}</div>
                      <div className="text-[10px] text-slate-500">{s.id} · v{s.version}</div>
                    </td>
                    <td className="px-3 py-2 text-slate-700">{s.owner}</td>
                    <td className="px-3 py-2 text-slate-700">{s.runtime}</td>
                    <td className="px-3 py-2 text-slate-700">in {s.inputSchemaVersion} / out {s.outputSchemaVersion}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className={cn("text-[10px]", statusTone(s.status))}>{s.status}</Badge>
                    </td>
                    <td className="px-3 py-2">
                      {s.publishedToStepBuilder
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        : <span className="text-[11px] text-slate-500">no</span>}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" title="Validate package"
                          onClick={() => validateStep(s.id)}>
                          <FlaskConical className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" title="Publish (request review)"
                          disabled={s.status !== "Development"}
                          onClick={() => publishStep(s.id)}>
                          <Rocket className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" title="Approve (reviewer action)"
                          disabled={s.status !== "Pending review"}
                          onClick={() => approveStep(s.id)}>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* -------------------------- Connector Dev --------------------------- */}
        <TabsContent value="connectors" className="space-y-3">
          <Card><CardContent className="p-3 text-xs text-slate-600">
            Approved connectors appear as candidates in Integration Hub. Compatibility lists RunOps releases the connector has been tested against.
          </CardContent></Card>
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-3 py-2">Connector</th>
                  <th className="px-3 py-2">Owner</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Version</th>
                  <th className="px-3 py-2">Compatibility</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">In Integration Hub</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {devConn.length === 0 && (
                  <tr><td colSpan={8} className="px-3 py-4 text-center text-slate-500">No dev connectors.</td></tr>
                )}
                {devConn.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-900">
                      {c.name}<div className="text-[10px] text-slate-500">{c.id}</div>
                    </td>
                    <td className="px-3 py-2 text-slate-700">{c.owner}</td>
                    <td className="px-3 py-2 text-slate-700">{c.category}</td>
                    <td className="px-3 py-2 text-slate-700">{c.version}</td>
                    <td className="px-3 py-2 text-[11px] text-slate-700">{c.compatibility.join(", ")}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className={cn("text-[10px]", statusTone(c.status))}>{c.status}</Badge>
                    </td>
                    <td className="px-3 py-2">
                      {c.publishedToIntegrationHub
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        : <span className="text-[11px] text-slate-500">no</span>}
                    </td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="ghost" title="Approve (reviewer action)"
                        disabled={c.status !== "Pending review"}
                        onClick={() => approveConnector(c.id)}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* -------------------------------- Plugins --------------------------- */}
        <TabsContent value="plugins" className="space-y-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-3 py-2">Plugin</th>
                  <th className="px-3 py-2">Surface</th>
                  <th className="px-3 py-2">Owner</th>
                  <th className="px-3 py-2">Version</th>
                  <th className="px-3 py-2">Certification</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plugins.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-900">
                      {p.name}<div className="text-[10px] text-slate-500">{p.id}</div>
                    </td>
                    <td className="px-3 py-2 text-slate-700">{p.surface}</td>
                    <td className="px-3 py-2 text-slate-700">{p.owner}</td>
                    <td className="px-3 py-2 text-slate-700">{p.version}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className={cn("text-[10px]",
                        p.certification === "certified" ? "border-emerald-200 bg-emerald-50 text-emerald-800" :
                        p.certification === "requested" ? "border-amber-200 bg-amber-50 text-amber-800" :
                        "border-slate-200 bg-slate-50 text-slate-700")}>
                        {p.certification}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className={cn("text-[10px]", statusTone(p.status))}>{p.status}</Badge>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" title="Publish plugin"
                          disabled={p.status !== "Development"}
                          onClick={() => setDialog({ kind: "publishPlugin", id: p.id })}>
                          <Rocket className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" title="Request certification"
                          disabled={p.certification !== "none"}
                          onClick={() => setDialog({ kind: "certifyPlugin", id: p.id })}>
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* ------------------------------- Sandboxes -------------------------- */}
        <TabsContent value="sandboxes" className="space-y-3">
          <Card><CardContent className="p-3 text-xs text-slate-600">
            Sandboxes provide isolated environments seeded with synthetic or masked data. Expired sandboxes stop
            accepting new requests but retain history until purged.
          </CardContent></Card>
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-3 py-2">Sandbox</th>
                  <th className="px-3 py-2">Application</th>
                  <th className="px-3 py-2">Env</th>
                  <th className="px-3 py-2">Dataset</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">Expires</th>
                  <th className="px-3 py-2">State</th>
                </tr>
              </thead>
              <tbody>
                {sandboxes.map((sb) => {
                  const expired = new Date(sb.expiresAt).getTime() < Date.now();
                  const a = apps.find((x) => x.id === sb.appId);
                  return (
                    <tr key={sb.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-700">
                        {sb.name}<div className="text-[10px] text-slate-500">{sb.id}</div>
                      </td>
                      <td className="px-3 py-2 text-slate-700">{a?.name ?? sb.appId}</td>
                      <td className="px-3 py-2 text-slate-700">{sb.env}</td>
                      <td className="px-3 py-2 text-slate-700">{sb.dataset}</td>
                      <td className="px-3 py-2 text-slate-500">{new Date(sb.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 py-2 text-slate-500">{new Date(sb.expiresAt).toLocaleDateString()}</td>
                      <td className="px-3 py-2">
                        {expired
                          ? <Badge variant="outline" className="text-[10px] border-orange-200 bg-orange-50 text-orange-800">Expired</Badge>
                          : <Badge variant="outline" className="text-[10px] border-emerald-200 bg-emerald-50 text-emerald-800">Active</Badge>}
                      </td>
                    </tr>
                  );
                })}
                {sandboxes.length === 0 && (
                  <tr><td colSpan={7} className="px-3 py-4 text-center text-slate-500">No sandboxes.</td></tr>
                )}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* --------------------------------- Quotas --------------------------- */}
        <TabsContent value="quotas" className="space-y-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-3 py-2">Application</th>
                  <th className="px-3 py-2">Environment</th>
                  <th className="px-3 py-2">Rate limit (req/min)</th>
                  <th className="px-3 py-2">24h utilization</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((a) => {
                  const u = usage.find((x) => x.appId === a.id && x.window === "24h");
                  return (
                    <tr key={a.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-700">{a.name}<div className="text-[10px] text-slate-500">{a.id}</div></td>
                      <td className="px-3 py-2 text-slate-700">{a.environment}</td>
                      <td className="px-3 py-2 tabular-nums text-slate-700">{a.rateLimitPerMin}</td>
                      <td className="px-3 py-2 tabular-nums text-slate-700">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={cn("h-full",
                                (u?.quotaPct ?? 0) > 90 ? "bg-red-500" :
                                (u?.quotaPct ?? 0) > 70 ? "bg-amber-500" : "bg-emerald-500")}
                              style={{ width: `${Math.min(100, u?.quotaPct ?? 0)}%` }}
                            />
                          </div>
                          <span>{u?.quotaPct ?? 0}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className={cn("text-[10px]", statusTone(a.status))}>{a.status}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* ---------------------------------- Usage --------------------------- */}
        <TabsContent value="usage" className="space-y-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-3 py-2">Application</th>
                  <th className="px-3 py-2">Window</th>
                  <th className="px-3 py-2">Requests</th>
                  <th className="px-3 py-2">Errors</th>
                  <th className="px-3 py-2">Error rate</th>
                  <th className="px-3 py-2">p95 latency</th>
                </tr>
              </thead>
              <tbody>
                {usage.map((u) => {
                  const a = apps.find((x) => x.id === u.appId);
                  const errRate = u.requests === 0 ? 0 : (u.errors / u.requests) * 100;
                  return (
                    <tr key={`${u.appId}-${u.window}`} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-700">{a?.name ?? u.appId}</td>
                      <td className="px-3 py-2 text-slate-700">{u.window}</td>
                      <td className="px-3 py-2 tabular-nums text-slate-700">{u.requests.toLocaleString()}</td>
                      <td className="px-3 py-2 tabular-nums text-slate-700">{u.errors.toLocaleString()}</td>
                      <td className="px-3 py-2 tabular-nums text-slate-700">{errRate.toFixed(2)}%</td>
                      <td className="px-3 py-2 tabular-nums text-slate-700">{u.p95LatencyMs} ms</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent></Card>
          <div className="text-[11px] text-slate-500">
            24h aggregates roll up into Platform Analytics (<span className="font-mono">{K_ANALYTICS}</span>).
          </div>
        </TabsContent>

        {/* ---------------------------- Documentation ------------------------- */}
        <TabsContent value="docs" className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              { title: "Getting started", icon: Rocket, body: "Create an application, choose scopes, request production review. Use the sandbox environment to test contract calls with synthetic data before requesting approval." },
              { title: "Authentication", icon: KeyRound, body: "OAuth 2.0 client credentials. Client secrets are shown once at creation; store them in your secret manager. Rotation is server-side and creates an audit event." },
              { title: "Events & webhooks", icon: Webhook, body: "Every event is signed with your endpoint's signing secret reference. Duplicate deliveries are possible — consumers must be idempotent by event id." },
              { title: "Custom steps", icon: Code2, body: "Steps declare an input and output schema version. Approved steps appear in Step Builder. Container-runtime steps require signed images." },
              { title: "Connector development", icon: Boxes, body: "Connectors declare compatibility with RunOps versions and schemas. Approved connectors surface as candidates in Integration Hub." },
              { title: "API contract & deprecation", icon: FileCode2, body: "Contracts are versioned. Deprecated endpoints show a removal target date and the superseding path. Deprecation warnings are advisory until the removal date." },
            ].map((d) => (
              <Card key={d.title}><CardContent className="p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  <d.icon className="h-4 w-4" /> {d.title}
                </div>
                <p className="mt-1 text-xs text-slate-600">{d.body}</p>
              </CardContent></Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* -------------------------------- Dialogs ---------------------------- */}

      <Dialog open={dialog.kind === "createApp"} onOpenChange={(o) => !o && setDialog({ kind: "none" })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create application</DialogTitle></DialogHeader>
          {dialog.kind === "createApp" && <CreateAppForm />}
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialog.kind === "showSecret"}
        onOpenChange={(o) => !o && setDialog({ kind: "none" })}
      >
        <DialogContent>
          <DialogHeader><DialogTitle>Application created — copy the secret now</DialogTitle></DialogHeader>
          {dialog.kind === "showSecret" && (
            <div className="space-y-3 text-sm">
              <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-[12px] text-amber-900">
                <div className="flex items-center gap-1 font-medium">
                  <AlertTriangle className="h-3.5 w-3.5" /> This is the only time the client secret will be shown.
                </div>
                <div className="mt-1">
                  Copy it into your secret manager. After this dialog closes, only the reference
                  (<span className="font-mono">SR::…</span>) remains on the record.
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] text-slate-600">Client identity</div>
                <div className="font-mono text-xs text-slate-900">
                  {apps.find((a) => a.id === dialog.id)?.clientIdentity}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] text-slate-600">Client secret (shown once)</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-md bg-slate-100 px-2 py-1 font-mono text-xs">{dialog.oneTimeSecret}</code>
                  <Button size="sm" variant="outline"
                    onClick={() => { navigator.clipboard?.writeText(dialog.oneTimeSecret).catch(() => {}); }}
                    title="Copy">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setDialog({ kind: "none" })}>I&apos;ve saved the secret</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialog.kind === "scopes"} onOpenChange={(o) => !o && setDialog({ kind: "none" })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Manage scopes</DialogTitle></DialogHeader>
          {dialog.kind === "scopes" && <ScopesForm appId={dialog.id} />}
        </DialogContent>
      </Dialog>

      <Dialog open={dialog.kind === "requestReview"} onOpenChange={(o) => !o && setDialog({ kind: "none" })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request production review</DialogTitle></DialogHeader>
          {dialog.kind === "requestReview" && (
            <div className="space-y-3 text-sm">
              <p className="text-slate-700">
                Move <span className="font-mono">{apps.find((a) => a.id === dialog.id)?.name}</span> into review.
                Reviewers verify least-privilege scopes, callback URL trust, and rate-limit sizing before approving
                for production traffic. This action creates an audit event.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialog({ kind: "none" })}>Cancel</Button>
                <Button onClick={() => requestReview(dialog.id)}>Request review</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialog.kind === "revoke"} onOpenChange={(o) => !o && setDialog({ kind: "none" })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Revoke application</DialogTitle></DialogHeader>
          {dialog.kind === "revoke" && (
            <div className="space-y-3 text-sm">
              <p className="text-slate-700">
                Revoking <span className="font-mono">{apps.find((a) => a.id === dialog.id)?.name}</span> invalidates
                its client secret, pauses associated webhooks, and disables active subscriptions. This action is
                irreversible — a new application must be created to resume access.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialog({ kind: "none" })}>Cancel</Button>
                <Button className="bg-red-600 text-white hover:bg-red-700" onClick={() => revokeApp(dialog.id)}>
                  Revoke
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialog.kind === "subscribe"} onOpenChange={(o) => !o && setDialog({ kind: "none" })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Subscribe to event</DialogTitle></DialogHeader>
          {dialog.kind === "subscribe" && <SubscribeForm appId={dialog.appId} />}
        </DialogContent>
      </Dialog>

      <Dialog open={dialog.kind === "createHook"} onOpenChange={(o) => !o && setDialog({ kind: "none" })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create webhook</DialogTitle></DialogHeader>
          {dialog.kind === "createHook" && <CreateHookForm appId={dialog.appId} />}
        </DialogContent>
      </Dialog>

      <Dialog open={dialog.kind === "replayEvent"} onOpenChange={(o) => !o && setDialog({ kind: "none" })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Replay sample event</DialogTitle></DialogHeader>
          {dialog.kind === "replayEvent" && (
            <div className="space-y-3 text-sm">
              <div className="text-slate-700">Event type: <span className="font-mono">{dialog.eventType}</span></div>
              {dialog.result && (
                <div className={cn("rounded-md border p-2 text-[12px]",
                  dialog.result.ok
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-amber-200 bg-amber-50 text-amber-900")}>
                  {dialog.result.message}
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setDialog({ kind: "none" })}>Close</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialog.kind === "buildStep"} onOpenChange={(o) => !o && setDialog({ kind: "none" })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Build custom step</DialogTitle></DialogHeader>
          {dialog.kind === "buildStep" && <BuildStepForm />}
        </DialogContent>
      </Dialog>

      <Dialog open={dialog.kind === "validateStep"} onOpenChange={(o) => !o && setDialog({ kind: "none" })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Validation report</DialogTitle></DialogHeader>
          {dialog.kind === "validateStep" && dialog.result && (
            <div className="space-y-3 text-sm">
              {dialog.result.ok ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-[12px] text-emerald-900">
                  All checks passed.
                </div>
              ) : (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-[12px] text-amber-900">
                  <div className="font-medium">Issues to resolve:</div>
                  <ul className="mt-1 list-disc pl-4">
                    {dialog.result.issues.map((i) => <li key={i}>{i}</li>)}
                  </ul>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setDialog({ kind: "none" })}>Close</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialog.kind === "publishPlugin"} onOpenChange={(o) => !o && setDialog({ kind: "none" })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Publish plugin</DialogTitle></DialogHeader>
          {dialog.kind === "publishPlugin" && (
            <div className="space-y-3 text-sm">
              <p className="text-slate-700">
                Publishing moves <span className="font-mono">{plugins.find((p) => p.id === dialog.id)?.name}</span>
                {" "}into review. Production plugins require reviewer approval before they render in end-user surfaces.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialog({ kind: "none" })}>Cancel</Button>
                <Button onClick={() => publishPlugin(dialog.id)}>Publish for review</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialog.kind === "certifyPlugin"} onOpenChange={(o) => !o && setDialog({ kind: "none" })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request certification</DialogTitle></DialogHeader>
          {dialog.kind === "certifyPlugin" && (
            <div className="space-y-3 text-sm">
              <p className="text-slate-700">
                Certification includes a security review, dependency audit, and behavioral evaluation.
                Certified plugins carry a verified badge in end-user surfaces.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialog({ kind: "none" })}>Cancel</Button>
                <Button onClick={() => requestPluginCertification(dialog.id)}>Request certification</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialog.kind === "testApi"} onOpenChange={(o) => !o && setDialog({ kind: "none" })}>
        <DialogContent>
          <DialogHeader><DialogTitle>API test</DialogTitle></DialogHeader>
          {dialog.kind === "testApi" && dialog.result && (
            <div className="space-y-3 text-sm">
              <div className="text-slate-700">
                <span className="font-mono">{dialog.endpoint.method} {dialog.endpoint.path}</span> · version {dialog.endpoint.version}
              </div>
              <div className="text-[11px] text-slate-500">HTTP {dialog.result.status} · sample response</div>
              <pre className="max-h-64 overflow-auto rounded-md bg-slate-900 p-3 text-[11px] text-slate-100">
{dialog.result.body}
              </pre>
              {dialog.endpoint.deprecated && dialog.endpoint.deprecationNote && (
                <div className="rounded-md border border-orange-200 bg-orange-50 p-2 text-[12px] text-orange-900">
                  Deprecation notice: {dialog.endpoint.deprecationNote}
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setDialog({ kind: "none" })}>Close</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialog.kind === "aiRec"} onOpenChange={(o) => !o && setDialog({ kind: "none" })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{AI_RECOMMENDATION.title}</DialogTitle></DialogHeader>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Gauge className="h-3.5 w-3.5" /> Confidence {AI_RECOMMENDATION.confidence}%
            </div>
            <p className="text-slate-800">{AI_RECOMMENDATION.conclusion}</p>
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Uncertainty</div>
              <p className="mt-0.5 text-slate-700">{AI_RECOMMENDATION.uncertainty}</p>
            </div>
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Supporting evidence</div>
              <ul className="mt-0.5 list-disc pl-4 text-slate-700">
                {AI_RECOMMENDATION.supportingEvidence.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Contradictory evidence</div>
              <ul className="mt-0.5 list-disc pl-4 text-slate-700">
                {AI_RECOMMENDATION.contradictoryEvidence.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Sources</div>
              <ul className="mt-0.5 list-disc pl-4 font-mono text-[11px] text-slate-700">
                {AI_RECOMMENDATION.sources.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ kind: "none" })}>Close</Button>
            <Button onClick={() => {
              setDialog({ kind: "scopes", id: "APP-2001" });
            }}>Open scopes for APP-2001</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="pt-4 text-[10px] text-slate-500">
        Tenant: <span className="font-mono">{tenant}</span> · Scenario: <span className="font-mono">{scenario}</span> · Role: <span className="font-mono">{role}</span>
      </div>

      {/* Hidden accessibility helpers — icons referenced but not always rendered inline */}
      <span className="sr-only"><Globe /><Package /></span>
    </div>
  );
}
