/**
 * Page 48 · Platform Health, Runner Fleet, and Administration
 * Route: /runops/platform
 *
 * Operates NOVA RunOps as a reliable enterprise platform: SLO,
 * runner fleet, execution queues, capacity, backups, DR, upgrades,
 * feature flags, retention/residency, consumption/licensing, and audit.
 *
 * Persistence (localStorage):
 *   runops.platform.tenants.v1
 *   runops.platform.regions.v1
 *   runops.platform.runners.v1
 *   runops.platform.queues.v1
 *   runops.platform.capacity.v1
 *   runops.platform.integrations.v1
 *   runops.platform.backups.v1
 *   runops.platform.dr.v1
 *   runops.platform.upgrades.v1
 *   runops.platform.flags.v1
 *   runops.platform.retention.v1
 *   runops.platform.residency.v1
 *   runops.platform.consumption.v1
 *   runops.platform.licenses.v1
 *   runops.platform.admin_audit.v1
 *   runops.audit.events.v1
 *   runops.domain.events.v1
 *   runops.command.platform_status.v1  → Command Center cross-screen
 *   runops.operations.tasks.v1         → Operations Queue cross-screen
 *   runops.evidence.artifacts.v1       → Evidence (DR exercise evidence)
 *
 * No fixture-array imports. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, Boxes, CheckCircle2, Cloud, Cpu, Database,
  FlaskConical, Gauge, Globe, HardDrive, KeyRound, PauseCircle, PlayCircle,
  Plus, PowerOff, RefreshCw, ScrollText, Server, ShieldAlert, Sparkles,
  Users, Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EntityHeader } from "@/runops/components";
import { useOperations } from "@/runops/state/RunOpsProviders";

/* --------------------------------- Types -------------------------------- */

type PlatformState =
  | "Healthy"
  | "Capacity warning"
  | "Runner degraded"
  | "Region unavailable"
  | "Upgrade scheduled"
  | "Disaster recovery active"
  | "Administrative restriction";

type RunnerType = "cloud" | "customer-hosted" | "regional" | "edge" | "isolated" | "air-gapped";
type RunnerState = "healthy" | "draining" | "degraded" | "offline";
type QueueState = "running" | "paused" | "draining";
type RegionState = "healthy" | "degraded" | "unavailable";
type BackupState = "ok" | "warn" | "fail";

interface Tenant {
  id: string;              // TEN-XXXX
  name: string;
  plan: "enterprise" | "business" | "trial";
  residency: string;       // "eu-central", "us-east", etc.
  isolated: boolean;
  activeUsers: number;
  monthlyExecutions: number;
  seats: number;
  status: "active" | "suspended";
}

interface Region {
  id: string;              // REG-XXXX (region, not registry)
  code: string;            // "us-east-1"
  name: string;
  state: RegionState;
  runnerCount: number;
  tenantsHosted: number;
  latencyP95Ms: number;
}

interface Runner {
  id: string;              // RUN-XXXX
  type: RunnerType;
  regionCode: string;
  tenantId: string | null; // null = shared pool
  state: RunnerState;
  cpuPct: number;
  memPct: number;
  activeExecutions: number;
  maxConcurrency: number;
  version: string;
  lastHeartbeatAt: string;
}

interface ExecutionQueue {
  id: string;              // Q-XXXX
  name: string;
  tenantId: string | null;
  regionCode: string;
  depth: number;
  inflight: number;
  ratePerMin: number;
  state: QueueState;
}

interface CapacityReading {
  regionCode: string;
  cpuPct: number;
  memPct: number;
  concurrencyPct: number;
  risk: "low" | "medium" | "high";
}

interface PlatformIntegration {
  id: string;              // PINT-XXXX
  name: string;
  kind: "connector" | "database" | "storage" | "edge-functions" | "identity" | "email";
  state: "healthy" | "degraded" | "unavailable";
  latencyMs: number;
  errorRate: number;       // 0..1
}

interface BackupRecord {
  id: string;              // BKP-XXXX
  scope: "database" | "configuration" | "evidence-store" | "runbook-catalog";
  lastAt: string;
  rpoMinutes: number;
  rtoMinutes: number;
  encrypted: boolean;
  state: BackupState;
  lastRestoreTestAt: string | null;
}

interface DrExercise {
  id: string;              // DR-XXXX
  scenario: string;
  scheduledAt: string;
  ranAt: string | null;
  outcome: "not-run" | "passed" | "failed";
  rtoAchievedMinutes: number | null;
  evidenceId: string | null;
}

interface Upgrade {
  id: string;              // UPG-XXXX
  fromVersion: string;
  toVersion: string;
  scope: "control-plane" | "runners" | "connectors" | "worker-runtime";
  scheduledFor: string;
  window: string;          // "2h maintenance window"
  requiresRestart: boolean;
  state: "scheduled" | "in-progress" | "completed" | "rolled-back";
}

interface FeatureFlag {
  id: string;              // FF-XXXX
  key: string;
  description: string;
  enabled: boolean;
  audience: "all-tenants" | "opted-in" | "internal-only";
  authorized: boolean;     // requires elevated role to toggle
}

interface RetentionPolicy {
  id: string;              // RET-XXXX
  scope: "audit" | "executions" | "evidence" | "telemetry" | "notifications";
  days: number;
  legalHold: boolean;
  updatedAt: string;
}

interface ResidencyBinding {
  tenantId: string;
  primaryRegion: string;
  allowedRegions: string[];
  crossBorderTransferAllowed: boolean;
}

interface ConsumptionRow {
  tenantId: string;
  executions30d: number;
  modelTokens30d: number;
  storageGb: number;
  costUsd30d: number;
}

interface License {
  tenantId: string;
  seatsPurchased: number;
  seatsUsed: number;
  executionsAllowed: number;
  executionsUsed: number;
  expiresAt: string;
}

interface AdminAudit {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  confirmed: boolean;
  ip: string;
}

interface AuditEvent {
  id: string; at: string; kind: string; actor: string; target: string;
  detail: Record<string, string | number | boolean | string[] | null>;
}
interface DomainEvent {
  id: string; at: string; kind: string;
  payload: Record<string, string | number | boolean | string[] | null>;
}
interface OpsTask {
  id: string; kind: string; title: string;
  severity: "low" | "medium" | "high" | "critical" | "policy";
  at: string; state: "open" | "in_progress" | "done";
}
interface PlatformStatus {
  slo: number; availability: number; latencyP95Ms: number;
  queueDepth: number; state: PlatformState;
  runnerDegraded: number; regionUnavailable: number;
  at: string;
}
interface EvidenceArtifact {
  id: string; kind: string; at: string; digest: string; detail: string;
}

type Tab =
  | "overview" | "tenants" | "regions" | "runners" | "queues" | "capacity"
  | "integrations" | "backups" | "dr" | "upgrades" | "flags" | "retention"
  | "residency" | "consumption" | "licensing" | "audit";

/* --------------------------- Keys / constants --------------------------- */

const K_TEN = "runops.platform.tenants.v1";
const K_REG = "runops.platform.regions.v1";
const K_RUN = "runops.platform.runners.v1";
const K_QUE = "runops.platform.queues.v1";
const K_CAP = "runops.platform.capacity.v1";
const K_PINT = "runops.platform.integrations.v1";
const K_BKP = "runops.platform.backups.v1";
const K_DR = "runops.platform.dr.v1";
const K_UPG = "runops.platform.upgrades.v1";
const K_FF = "runops.platform.flags.v1";
const K_RET = "runops.platform.retention.v1";
const K_RESID = "runops.platform.residency.v1";
const K_CONS = "runops.platform.consumption.v1";
const K_LIC = "runops.platform.licenses.v1";
const K_ADMIN = "runops.platform.admin_audit.v1";
const K_AUD = "runops.audit.events.v1";
const K_DOM = "runops.domain.events.v1";
const K_CMD_STATUS = "runops.command.platform_status.v1";
const K_OPS_TASKS = "runops.operations.tasks.v1";
const K_EVID = "runops.evidence.artifacts.v1";

const AI_RECOMMENDATION = {
  id: "REC-PLAT-1",
  title: "Add 2 regional runners to eu-central-1 before the 10:00 wave",
  conclusion:
    "eu-central-1 concurrency has held above 82% for six consecutive 5-minute buckets while queue depth trends up 34%/hour. Scheduled runbook batch RB-1001 at 10:00 will add ~140 concurrent steps; without new capacity the projected concurrency crosses 100% by 09:47, spilling into queue backpressure and violating the platform p95 latency SLO by ~11 minutes.",
  confidence: 87,
  uncertainty:
    "Confidence interval 82–92%. The projection assumes RB-1001 wave sizing matches the last four runs (±8% variance). If the payments freeze reduces its size by >15% the risk drops to medium and one runner would suffice.",
  supportingEvidence: [
    "capacity: eu-central-1 concurrency 82–86% for last 30 minutes.",
    "queue depth (eu-central-1): +34%/hour trend, backpressure risk 'high'.",
    "runbook release: RB-1001 wave adds ~140 concurrent steps historically.",
    "SLO policy platform-availability-1.2: p95 latency ≤ 400ms.",
  ],
  contradictoryEvidence: [
    "Two draining runners in us-east-1 are due to return to the pool at 09:35 and could partially cover the gap through cross-region overflow (if residency policy permits).",
  ],
  sources: [
    "capacity://eu-central-1 (30m window)",
    "queue://eu-central-1/depth-trend",
    "release://RB-1001 (wave history)",
    "policy://platform-availability/1.2",
  ],
};

/* --------------------------------- Helpers ------------------------------ */

const now = () => new Date().toISOString();
const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
const inHours = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

function readJSON<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) as T : fallback; }
  catch { return fallback; }
}
function writeJSON<T>(key: string, v: T): void {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* quota */ }
}

function appendAudit(kind: string, actor: string, target: string, detail: AuditEvent["detail"]): void {
  const prev = readJSON<AuditEvent[]>(K_AUD, []);
  const evt: AuditEvent = {
    id: `AUD-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    at: now(), kind, actor, target, detail,
  };
  writeJSON(K_AUD, [evt, ...prev].slice(0, 500));
}
function appendDomain(kind: string, payload: DomainEvent["payload"]): void {
  const prev = readJSON<DomainEvent[]>(K_DOM, []);
  const evt: DomainEvent = {
    id: `DOM-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    at: now(), kind, payload,
  };
  writeJSON(K_DOM, [evt, ...prev].slice(0, 500));
}
function appendAdmin(actor: string, action: string, target: string, ip: string, confirmed: boolean): void {
  const prev = readJSON<AdminAudit[]>(K_ADMIN, []);
  const row: AdminAudit = {
    id: `ADM-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    at: now(), actor, action, target, confirmed, ip,
  };
  writeJSON(K_ADMIN, [row, ...prev].slice(0, 300));
}

/* --------------------------- Deterministic seed ------------------------- */

function seedTenants(): Tenant[] {
  return [
    { id: "TEN-0001", name: "contoso-financial", plan: "enterprise", residency: "eu-central",
      isolated: true, activeUsers: 412, monthlyExecutions: 128_400, seats: 500, status: "active" },
    { id: "TEN-0002", name: "acme-manufacturing", plan: "business", residency: "us-east",
      isolated: false, activeUsers: 168, monthlyExecutions: 42_900, seats: 200, status: "active" },
    { id: "TEN-0003", name: "globex-air-gapped", plan: "enterprise", residency: "customer-hosted",
      isolated: true, activeUsers: 22, monthlyExecutions: 6_900, seats: 50, status: "active" },
    { id: "TEN-0004", name: "north-star-trial", plan: "trial", residency: "us-east",
      isolated: false, activeUsers: 8, monthlyExecutions: 240, seats: 10, status: "active" },
    { id: "TEN-0005", name: "legacy-suspended", plan: "business", residency: "us-east",
      isolated: false, activeUsers: 0, monthlyExecutions: 0, seats: 100, status: "suspended" },
  ];
}

function seedRegions(): Region[] {
  return [
    { id: "REG-01", code: "us-east-1", name: "US East (Virginia)", state: "healthy",
      runnerCount: 24, tenantsHosted: 34, latencyP95Ms: 182 },
    { id: "REG-02", code: "eu-central-1", name: "EU Central (Frankfurt)", state: "degraded",
      runnerCount: 18, tenantsHosted: 22, latencyP95Ms: 341 },
    { id: "REG-03", code: "ap-south-1", name: "AP South (Mumbai)", state: "healthy",
      runnerCount: 9, tenantsHosted: 7, latencyP95Ms: 227 },
    { id: "REG-04", code: "customer-hosted", name: "Customer Hosted (globex-airgap)", state: "healthy",
      runnerCount: 4, tenantsHosted: 1, latencyP95Ms: 96 },
    { id: "REG-05", code: "edge-pop-west", name: "Edge PoP · SF/LA", state: "healthy",
      runnerCount: 6, tenantsHosted: 12, latencyP95Ms: 44 },
  ];
}

function seedRunners(scenario: string): Runner[] {
  const rows: Array<Omit<Runner, "lastHeartbeatAt" | "cpuPct" | "memPct" | "activeExecutions">> = [
    { id: "RUN-0001", type: "cloud", regionCode: "us-east-1", tenantId: null,
      state: "healthy", maxConcurrency: 40, version: "1.14.2" },
    { id: "RUN-0002", type: "cloud", regionCode: "us-east-1", tenantId: null,
      state: "draining", maxConcurrency: 40, version: "1.13.4" },
    { id: "RUN-0003", type: "regional", regionCode: "eu-central-1", tenantId: "TEN-0001",
      state: "healthy", maxConcurrency: 40, version: "1.14.2" },
    { id: "RUN-0004", type: "regional", regionCode: "eu-central-1", tenantId: "TEN-0001",
      state: "degraded", maxConcurrency: 40, version: "1.14.2" },
    { id: "RUN-0005", type: "customer-hosted", regionCode: "customer-hosted", tenantId: "TEN-0003",
      state: "healthy", maxConcurrency: 20, version: "1.14.1" },
    { id: "RUN-0006", type: "air-gapped", regionCode: "customer-hosted", tenantId: "TEN-0003",
      state: "healthy", maxConcurrency: 10, version: "1.14.1" },
    { id: "RUN-0007", type: "edge", regionCode: "edge-pop-west", tenantId: null,
      state: "healthy", maxConcurrency: 20, version: "1.14.2" },
    { id: "RUN-0008", type: "isolated", regionCode: "us-east-1", tenantId: "TEN-0001",
      state: "healthy", maxConcurrency: 15, version: "1.14.2" },
    { id: "RUN-0009", type: "cloud", regionCode: "ap-south-1", tenantId: null,
      state: "offline", maxConcurrency: 20, version: "1.13.4" },
  ];
  return rows.map((r) => {
    const s = hash(r.id + scenario);
    const load = r.state === "healthy" ? 40 + (s % 45)
      : r.state === "degraded" ? 78 + (s % 15)
      : r.state === "draining" ? 20 + (s % 20)
      : 0;
    return {
      ...r,
      cpuPct: load,
      memPct: Math.min(95, load - 6 + (s % 12)),
      activeExecutions: r.state === "offline" ? 0 : Math.min(r.maxConcurrency, Math.round(r.maxConcurrency * load / 100)),
      lastHeartbeatAt: ago(r.state === "offline" ? 4 : 0.05),
    };
  });
}

function seedQueues(): ExecutionQueue[] {
  return [
    { id: "Q-0001", name: "shared/us-east", tenantId: null, regionCode: "us-east-1",
      depth: 12, inflight: 34, ratePerMin: 220, state: "running" },
    { id: "Q-0002", name: "TEN-0001/eu-central", tenantId: "TEN-0001", regionCode: "eu-central-1",
      depth: 88, inflight: 32, ratePerMin: 140, state: "running" },
    { id: "Q-0003", name: "TEN-0003/airgap", tenantId: "TEN-0003", regionCode: "customer-hosted",
      depth: 0, inflight: 4, ratePerMin: 12, state: "running" },
    { id: "Q-0004", name: "edge/west", tenantId: null, regionCode: "edge-pop-west",
      depth: 3, inflight: 11, ratePerMin: 68, state: "running" },
    { id: "Q-0005", name: "ap-south (paused)", tenantId: null, regionCode: "ap-south-1",
      depth: 41, inflight: 0, ratePerMin: 0, state: "paused" },
  ];
}

function seedCapacity(): CapacityReading[] {
  return [
    { regionCode: "us-east-1", cpuPct: 52, memPct: 48, concurrencyPct: 61, risk: "low" },
    { regionCode: "eu-central-1", cpuPct: 84, memPct: 79, concurrencyPct: 86, risk: "high" },
    { regionCode: "ap-south-1", cpuPct: 22, memPct: 30, concurrencyPct: 18, risk: "low" },
    { regionCode: "customer-hosted", cpuPct: 41, memPct: 38, concurrencyPct: 55, risk: "medium" },
    { regionCode: "edge-pop-west", cpuPct: 33, memPct: 29, concurrencyPct: 40, risk: "low" },
  ];
}

function seedIntegrations(): PlatformIntegration[] {
  return [
    { id: "PINT-01", name: "Primary Postgres", kind: "database", state: "healthy", latencyMs: 4, errorRate: 0.0001 },
    { id: "PINT-02", name: "Evidence Object Store", kind: "storage", state: "healthy", latencyMs: 22, errorRate: 0.0002 },
    { id: "PINT-03", name: "Edge Functions Gateway", kind: "edge-functions", state: "degraded", latencyMs: 148, errorRate: 0.021 },
    { id: "PINT-04", name: "SSO Provider (OIDC)", kind: "identity", state: "healthy", latencyMs: 60, errorRate: 0.0005 },
    { id: "PINT-05", name: "Email Delivery", kind: "email", state: "healthy", latencyMs: 720, errorRate: 0.002 },
    { id: "PINT-06", name: "Downstream Connector Gateway", kind: "connector", state: "healthy", latencyMs: 88, errorRate: 0.004 },
  ];
}

function seedBackups(): BackupRecord[] {
  return [
    { id: "BKP-01", scope: "database", lastAt: ago(1), rpoMinutes: 5, rtoMinutes: 30,
      encrypted: true, state: "ok", lastRestoreTestAt: ago(24 * 7) },
    { id: "BKP-02", scope: "configuration", lastAt: ago(6), rpoMinutes: 60, rtoMinutes: 15,
      encrypted: true, state: "ok", lastRestoreTestAt: ago(24 * 14) },
    { id: "BKP-03", scope: "evidence-store", lastAt: ago(2), rpoMinutes: 30, rtoMinutes: 60,
      encrypted: true, state: "warn", lastRestoreTestAt: ago(24 * 40) },
    { id: "BKP-04", scope: "runbook-catalog", lastAt: ago(3), rpoMinutes: 15, rtoMinutes: 10,
      encrypted: true, state: "ok", lastRestoreTestAt: ago(24 * 5) },
  ];
}

function seedDR(): DrExercise[] {
  return [
    { id: "DR-01", scenario: "Primary region failover (us-east-1 → us-west-2)",
      scheduledAt: inHours(24 * 21), ranAt: ago(24 * 30), outcome: "passed",
      rtoAchievedMinutes: 22, evidenceId: "EV-DR-01" },
    { id: "DR-02", scenario: "Postgres PITR to T-15m",
      scheduledAt: inHours(24 * 7), ranAt: ago(24 * 90), outcome: "passed",
      rtoAchievedMinutes: 18, evidenceId: "EV-DR-02" },
    { id: "DR-03", scenario: "Evidence store bucket loss (regional)",
      scheduledAt: inHours(24 * 3), ranAt: null, outcome: "not-run",
      rtoAchievedMinutes: null, evidenceId: null },
  ];
}

function seedUpgrades(): Upgrade[] {
  return [
    { id: "UPG-01", fromVersion: "1.14.2", toVersion: "1.15.0", scope: "control-plane",
      scheduledFor: inHours(48), window: "2h maintenance window",
      requiresRestart: true, state: "scheduled" },
    { id: "UPG-02", fromVersion: "1.13.4", toVersion: "1.14.2", scope: "runners",
      scheduledFor: inHours(6), window: "rolling drain", requiresRestart: false, state: "in-progress" },
    { id: "UPG-03", fromVersion: "1.14.0", toVersion: "1.14.1", scope: "worker-runtime",
      scheduledFor: ago(24 * 3), window: "rolling", requiresRestart: false, state: "completed" },
  ];
}

function seedFlags(): FeatureFlag[] {
  return [
    { id: "FF-01", key: "multi_agent_collab", description: "Enable multi-agent worker collaboration.",
      enabled: true, audience: "opted-in", authorized: true },
    { id: "FF-02", key: "autonomy_high", description: "Allow high-autonomy runbook execution without step approvals.",
      enabled: false, audience: "internal-only", authorized: true },
    { id: "FF-03", key: "supply_chain_enforce", description: "Block un-provenance-attested artifacts from prod execution.",
      enabled: true, audience: "all-tenants", authorized: true },
    { id: "FF-04", key: "regional_overflow", description: "Allow queue overflow into peer region when residency permits.",
      enabled: false, audience: "opted-in", authorized: true },
    { id: "FF-05", key: "experimental_pgvector_search", description: "Use pgvector for evidence semantic search.",
      enabled: true, audience: "internal-only", authorized: false },
  ];
}

function seedRetention(): RetentionPolicy[] {
  return [
    { id: "RET-01", scope: "audit", days: 2555, legalHold: true, updatedAt: ago(24 * 30) },
    { id: "RET-02", scope: "executions", days: 365, legalHold: false, updatedAt: ago(24 * 12) },
    { id: "RET-03", scope: "evidence", days: 2555, legalHold: true, updatedAt: ago(24 * 30) },
    { id: "RET-04", scope: "telemetry", days: 30, legalHold: false, updatedAt: ago(24 * 45) },
    { id: "RET-05", scope: "notifications", days: 90, legalHold: false, updatedAt: ago(24 * 20) },
  ];
}

function seedResidency(tenants: Tenant[]): ResidencyBinding[] {
  return tenants.map((t) => ({
    tenantId: t.id,
    primaryRegion: t.residency === "eu-central" ? "eu-central-1"
      : t.residency === "us-east" ? "us-east-1"
      : t.residency === "customer-hosted" ? "customer-hosted" : "us-east-1",
    allowedRegions: t.residency === "eu-central" ? ["eu-central-1"]
      : t.residency === "customer-hosted" ? ["customer-hosted"]
      : ["us-east-1", "ap-south-1"],
    crossBorderTransferAllowed: t.residency !== "eu-central" && t.residency !== "customer-hosted",
  }));
}

function seedConsumption(tenants: Tenant[]): ConsumptionRow[] {
  return tenants.map((t) => {
    const s = hash(t.id);
    return {
      tenantId: t.id,
      executions30d: t.monthlyExecutions,
      modelTokens30d: t.monthlyExecutions * (300 + (s % 900)),
      storageGb: Math.round(50 + (s % 600)),
      costUsd30d: Math.round(1200 + (t.monthlyExecutions * 0.03) + (s % 2400)),
    };
  });
}

function seedLicenses(tenants: Tenant[]): License[] {
  return tenants.map((t) => ({
    tenantId: t.id,
    seatsPurchased: t.seats,
    seatsUsed: t.activeUsers,
    executionsAllowed: t.plan === "trial" ? 500 : t.plan === "business" ? 60_000 : 250_000,
    executionsUsed: t.monthlyExecutions,
    expiresAt: inHours(24 * (t.plan === "trial" ? 12 : 365)),
  }));
}

/* -------------------------------- Badges -------------------------------- */

function StateBadge({ state }: { state: PlatformState }) {
  const map: Record<PlatformState, string> = {
    Healthy: "bg-emerald-100 text-emerald-800 border-emerald-200",
    "Capacity warning": "bg-amber-100 text-amber-800 border-amber-200",
    "Runner degraded": "bg-orange-100 text-orange-800 border-orange-200",
    "Region unavailable": "bg-red-100 text-red-800 border-red-200",
    "Upgrade scheduled": "bg-indigo-100 text-indigo-800 border-indigo-200",
    "Disaster recovery active": "bg-rose-100 text-rose-800 border-rose-200",
    "Administrative restriction": "bg-slate-200 text-slate-800 border-slate-300",
  };
  return <Badge variant="outline" className={cn("border text-[10px]", map[state])}>{state}</Badge>;
}

function RunnerStateBadge({ s }: { s: RunnerState }) {
  const map: Record<RunnerState, string> = {
    healthy: "bg-emerald-100 text-emerald-800 border-emerald-200",
    draining: "bg-slate-100 text-slate-700 border-slate-200",
    degraded: "bg-orange-100 text-orange-800 border-orange-200",
    offline: "bg-red-100 text-red-800 border-red-200",
  };
  return <Badge variant="outline" className={cn("border text-[10px]", map[s])}>{s}</Badge>;
}

function Meter({ value, label }: { value: number; label?: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  const tone = clamped >= 85 ? "bg-red-500" : clamped >= 70 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-24 rounded-full bg-slate-200">
        <div className={cn("h-1.5 rounded-full", tone)} style={{ width: `${clamped}%` }} />
      </div>
      <span className="tabular-nums text-[10px] text-slate-600">{clamped}%{label ? ` ${label}` : ""}</span>
    </div>
  );
}

/* ================================ Page ================================= */

export default function PlatformHealth() {
  const ops = useOperations();
  const scenario = String(ops.stageIndex ?? "0");
  const role = ops.role;
  const tenantName = ops.tenant?.name ?? "tenant";

  const [tab, setTab] = useState<Tab>("overview");
  const [runnerFilter, setRunnerFilter] = useState<RunnerType | "all">("all");
  const [runnerRegion, setRunnerRegion] = useState<string>("all");
  const [runnerSearch, setRunnerSearch] = useState("");

  const [tenants, setTenants] = useState<Tenant[]>(() =>
    readJSON<Tenant[] | null>(K_TEN, null) ?? seedTenants());
  const [regions, setRegions] = useState<Region[]>(() =>
    readJSON<Region[] | null>(K_REG, null) ?? seedRegions());
  const [runners, setRunners] = useState<Runner[]>(() =>
    readJSON<Runner[] | null>(K_RUN, null) ?? seedRunners(scenario));
  const [queues, setQueues] = useState<ExecutionQueue[]>(() =>
    readJSON<ExecutionQueue[] | null>(K_QUE, null) ?? seedQueues());
  const [capacity, setCapacity] = useState<CapacityReading[]>(() =>
    readJSON<CapacityReading[] | null>(K_CAP, null) ?? seedCapacity());
  const [integrations] = useState<PlatformIntegration[]>(() =>
    readJSON<PlatformIntegration[] | null>(K_PINT, null) ?? seedIntegrations());
  const [backups, setBackups] = useState<BackupRecord[]>(() =>
    readJSON<BackupRecord[] | null>(K_BKP, null) ?? seedBackups());
  const [dr, setDr] = useState<DrExercise[]>(() =>
    readJSON<DrExercise[] | null>(K_DR, null) ?? seedDR());
  const [upgrades, setUpgrades] = useState<Upgrade[]>(() =>
    readJSON<Upgrade[] | null>(K_UPG, null) ?? seedUpgrades());
  const [flags, setFlags] = useState<FeatureFlag[]>(() =>
    readJSON<FeatureFlag[] | null>(K_FF, null) ?? seedFlags());
  const [retention, setRetention] = useState<RetentionPolicy[]>(() =>
    readJSON<RetentionPolicy[] | null>(K_RET, null) ?? seedRetention());
  const [residency, setResidency] = useState<ResidencyBinding[]>(() =>
    readJSON<ResidencyBinding[] | null>(K_RESID, null) ?? seedResidency(seedTenants()));
  const [consumption] = useState<ConsumptionRow[]>(() =>
    readJSON<ConsumptionRow[] | null>(K_CONS, null) ?? seedConsumption(seedTenants()));
  const [licenses] = useState<License[]>(() =>
    readJSON<License[] | null>(K_LIC, null) ?? seedLicenses(seedTenants()));
  const [admin, setAdmin] = useState<AdminAudit[]>(() =>
    readJSON<AdminAudit[]>(K_ADMIN, []));

  const [showAI, setShowAI] = useState(false);
  const [addRunnerOpen, setAddRunnerOpen] = useState(false);
  const [addRunnerType, setAddRunnerType] = useState<RunnerType>("cloud");
  const [addRunnerRegion, setAddRunnerRegion] = useState<string>("us-east-1");
  const [addRunnerConcurrency, setAddRunnerConcurrency] = useState<number>(40);
  const [confirmOpen, setConfirmOpen] = useState<{
    action: string; target: string; explain: string; onConfirm: () => void;
  } | null>(null);
  const [retentionEdit, setRetentionEdit] = useState<RetentionPolicy | null>(null);
  const [retentionDays, setRetentionDays] = useState<number>(0);
  const [residencyEdit, setResidencyEdit] = useState<ResidencyBinding | null>(null);
  const [tenantConfigure, setTenantConfigure] = useState<Tenant | null>(null);
  const [tenantNote, setTenantNote] = useState<string>("");
  const [restoreOpen, setRestoreOpen] = useState<BackupRecord | null>(null);
  const [restoreNote, setRestoreNote] = useState<string>("");

  const actor = `${role}@${tenantName}`;
  const localIp = "10.0.0.42";

  /* --------------------------- Derived counters ------------------------- */

  const derivedState: PlatformState = useMemo(() => {
    if (dr.some((d) => d.outcome === "not-run" && new Date(d.scheduledAt).getTime() < Date.now())) return "Disaster recovery active";
    if (regions.some((r) => r.state === "unavailable")) return "Region unavailable";
    if (runners.filter((r) => r.state === "degraded" || r.state === "offline").length >= 2) return "Runner degraded";
    if (capacity.some((c) => c.risk === "high")) return "Capacity warning";
    if (upgrades.some((u) => u.state === "scheduled" || u.state === "in-progress")) return "Upgrade scheduled";
    return "Healthy";
  }, [dr, regions, runners, capacity, upgrades]);

  const queueDepth = useMemo(() => queues.reduce((a, q) => a + q.depth, 0), [queues]);
  const runnerHealthPct = useMemo(() => {
    const healthy = runners.filter((r) => r.state === "healthy").length;
    return runners.length ? Math.round(100 * healthy / runners.length) : 0;
  }, [runners]);
  const platformSlo = 99.95;
  const availability30d = 99.92;
  const latencyP95Ms = 342;
  const activeUsers = tenants.reduce((a, t) => a + t.activeUsers, 0);
  const executions30d = tenants.reduce((a, t) => a + t.monthlyExecutions, 0);
  const totalCost = consumption.reduce((a, r) => a + r.costUsd30d, 0);

  /* --------------------------- Persist / project ------------------------ */

  useEffect(() => { writeJSON(K_TEN, tenants); }, [tenants]);
  useEffect(() => { writeJSON(K_REG, regions); }, [regions]);
  useEffect(() => { writeJSON(K_RUN, runners); }, [runners]);
  useEffect(() => { writeJSON(K_QUE, queues); }, [queues]);
  useEffect(() => { writeJSON(K_CAP, capacity); }, [capacity]);
  useEffect(() => { writeJSON(K_BKP, backups); }, [backups]);
  useEffect(() => { writeJSON(K_DR, dr); }, [dr]);
  useEffect(() => { writeJSON(K_UPG, upgrades); }, [upgrades]);
  useEffect(() => { writeJSON(K_FF, flags); }, [flags]);
  useEffect(() => { writeJSON(K_RET, retention); }, [retention]);
  useEffect(() => { writeJSON(K_RESID, residency); }, [residency]);
  useEffect(() => { writeJSON(K_ADMIN, admin); }, [admin]);

  useEffect(() => {
    const status: PlatformStatus = {
      slo: platformSlo, availability: availability30d, latencyP95Ms,
      queueDepth, state: derivedState,
      runnerDegraded: runners.filter((r) => r.state === "degraded" || r.state === "offline").length,
      regionUnavailable: regions.filter((r) => r.state === "unavailable").length,
      at: now(),
    };
    writeJSON(K_CMD_STATUS, status);
  }, [derivedState, queueDepth, runners, regions]);

  /* ------------------------------ Actions ------------------------------- */

  const confirm = useCallback((action: string, target: string, explain: string, onConfirm: () => void) => {
    setConfirmOpen({ action, target, explain, onConfirm });
  }, []);

  const onAddRunner = useCallback(() => {
    const id = `RUN-${(Math.floor(Math.random() * 9000) + 1000).toString()}`;
    const r: Runner = {
      id, type: addRunnerType, regionCode: addRunnerRegion,
      tenantId: null, state: "healthy",
      cpuPct: 12, memPct: 18, activeExecutions: 0,
      maxConcurrency: addRunnerConcurrency, version: "1.14.2",
      lastHeartbeatAt: now(),
    };
    setRunners((prev) => [r, ...prev]);
    appendAudit("platform.runner.add", actor, id, { type: r.type, region: r.regionCode, concurrency: r.maxConcurrency });
    appendDomain("platform.runner.add", { runnerId: id, region: r.regionCode });
    appendAdmin(actor, "runner.add", id, localIp, true);
    setAddRunnerOpen(false);
  }, [addRunnerType, addRunnerRegion, addRunnerConcurrency, actor]);

  const onDrainRunner = useCallback((r: Runner) => {
    setRunners((prev) => prev.map((x) => x.id === r.id ? { ...x, state: "draining" } : x));
    appendAudit("platform.runner.drain", actor, r.id, { region: r.regionCode });
    appendDomain("platform.runner.drain", { runnerId: r.id, activeExecutions: r.activeExecutions });
    appendAdmin(actor, "runner.drain", r.id, localIp, true);
    // Runner drain surfaces to Operations Queue when active executions exist
    if (r.activeExecutions > 0) {
      const tasksPrev = readJSON<OpsTask[]>(K_OPS_TASKS, []);
      const task: OpsTask = {
        id: `TASK-${Date.now().toString(36).slice(-6).toUpperCase()}`,
        kind: "platform.runner.drain",
        title: `Runner ${r.id} draining · ${r.activeExecutions} active executions may need to migrate`,
        severity: "medium", at: now(), state: "open",
      };
      writeJSON(K_OPS_TASKS, [task, ...tasksPrev].slice(0, 200));
    }
  }, [actor]);

  const onPauseQueue = useCallback((q: ExecutionQueue) => {
    setQueues((prev) => prev.map((x) => x.id === q.id
      ? { ...x, state: x.state === "paused" ? "running" : "paused",
        ratePerMin: x.state === "paused" ? Math.max(30, q.ratePerMin) : 0 }
      : x));
    const next = q.state === "paused" ? "running" : "paused";
    appendAudit("platform.queue.pause", actor, q.id, { region: q.regionCode, next });
    appendDomain("platform.queue.pause", { queueId: q.id, next });
    appendAdmin(actor, next === "paused" ? "queue.pause" : "queue.resume", q.id, localIp, true);
  }, [actor]);

  const onScaleCapacity = useCallback((regionCode: string, deltaPct: number) => {
    setCapacity((prev) => prev.map((c) => c.regionCode === regionCode
      ? { ...c, concurrencyPct: Math.max(5, Math.min(100, c.concurrencyPct + deltaPct)),
        risk: c.concurrencyPct + deltaPct > 85 ? "high"
          : c.concurrencyPct + deltaPct > 65 ? "medium" : "low" }
      : c));
    appendAudit("platform.capacity.scale", actor, regionCode, { deltaPct });
    appendDomain("platform.capacity.scale", { regionCode, deltaPct });
    appendAdmin(actor, "capacity.scale", regionCode, localIp, true);
  }, [actor]);

  const onConfigureTenant = useCallback((t: Tenant, note: string) => {
    appendAudit("platform.tenant.configure", actor, t.id, { name: t.name, note });
    appendDomain("platform.tenant.configure", { tenantId: t.id, note });
    appendAdmin(actor, "tenant.configure", t.id, localIp, true);
    setTenantConfigure(null); setTenantNote("");
  }, [actor]);

  const onSetRetention = useCallback((r: RetentionPolicy, days: number) => {
    setRetention((prev) => prev.map((x) => x.id === r.id
      ? { ...x, days, updatedAt: now() } : x));
    appendAudit("platform.retention.set", actor, r.id, { scope: r.scope, days, prev: r.days });
    appendDomain("platform.retention.set", { scope: r.scope, days });
    appendAdmin(actor, "retention.set", r.id, localIp, true);
  }, [actor]);

  const onToggleResidencyOverflow = useCallback((b: ResidencyBinding) => {
    setResidency((prev) => prev.map((x) => x.tenantId === b.tenantId
      ? { ...x, crossBorderTransferAllowed: !x.crossBorderTransferAllowed } : x));
    appendAudit("platform.residency.update", actor, b.tenantId, {
      crossBorderTransferAllowed: !b.crossBorderTransferAllowed });
    appendDomain("platform.residency.update", { tenantId: b.tenantId, crossBorder: !b.crossBorderTransferAllowed });
    appendAdmin(actor, "residency.update", b.tenantId, localIp, true);
  }, [actor]);

  const onScheduleUpgrade = useCallback((u: Upgrade) => {
    setUpgrades((prev) => prev.map((x) => x.id === u.id
      ? { ...x, scheduledFor: inHours(24 * 3), state: "scheduled" } : x));
    appendAudit("platform.upgrade.schedule", actor, u.id, { to: u.toVersion, scope: u.scope });
    appendDomain("platform.upgrade.schedule", { upgradeId: u.id, to: u.toVersion });
    appendAdmin(actor, "upgrade.schedule", u.id, localIp, true);
  }, [actor]);

  const onToggleFlag = useCallback((f: FeatureFlag) => {
    if (!f.authorized) return; // insufficient role
    setFlags((prev) => prev.map((x) => x.id === f.id ? { ...x, enabled: !x.enabled } : x));
    appendAudit("platform.flag.toggle", actor, f.key, { enabled: !f.enabled, audience: f.audience });
    appendDomain("platform.flag.toggle", { key: f.key, enabled: !f.enabled });
    appendAdmin(actor, "flag.toggle", f.key, localIp, true);
  }, [actor]);

  const onTestBackup = useCallback((b: BackupRecord) => {
    // Deterministic simulation: if state is 'fail' remains fail, otherwise -> ok
    const nextState: BackupState = b.state === "fail" ? "fail" : "ok";
    setBackups((prev) => prev.map((x) => x.id === b.id
      ? { ...x, lastRestoreTestAt: now(), state: nextState } : x));
    appendAudit("platform.backup.test", actor, b.id, { scope: b.scope, result: nextState });
    appendDomain("platform.backup.test", { backupId: b.id, result: nextState });
    appendAdmin(actor, "backup.test", b.id, localIp, true);
  }, [actor]);

  const onRunDR = useCallback((d: DrExercise) => {
    const rto = 15 + Math.floor(Math.random() * 20);
    const evidenceId = `EV-DR-${Date.now().toString(36).slice(-5).toUpperCase()}`;
    setDr((prev) => prev.map((x) => x.id === d.id
      ? { ...x, ranAt: now(), outcome: "passed", rtoAchievedMinutes: rto, evidenceId } : x));
    appendAudit("platform.dr.exercise", actor, d.id, { scenario: d.scenario, rto });
    appendDomain("platform.dr.exercise", { drId: d.id, evidenceId, rto });
    appendAdmin(actor, "dr.exercise", d.id, localIp, true);
    // Attach DR evidence artifact for Evidence Replay
    const evidPrev = readJSON<EvidenceArtifact[]>(K_EVID, []);
    const ev: EvidenceArtifact = {
      id: evidenceId, kind: "dr-exercise", at: now(),
      digest: `sha256:${(hash(evidenceId).toString(16) + "0".repeat(64)).slice(0, 64)}`,
      detail: `${d.scenario} · RTO ${rto}m`,
    };
    writeJSON(K_EVID, [ev, ...evidPrev].slice(0, 200));
  }, [actor]);

  const onRestoreConfig = useCallback((b: BackupRecord, note: string) => {
    appendAudit("platform.config.restore", actor, b.id, { scope: b.scope, note });
    appendDomain("platform.config.restore", { backupId: b.id, scope: b.scope });
    appendAdmin(actor, "config.restore", b.id, localIp, true);
    setRestoreOpen(null); setRestoreNote("");
  }, [actor]);

  const onDelegateAdmin = useCallback((tenantId: string, delegate: string) => {
    appendAudit("platform.admin.delegate", actor, tenantId, { delegate });
    appendDomain("platform.admin.delegate", { tenantId, delegate });
    appendAdmin(actor, "admin.delegate", tenantId, localIp, true);
  }, [actor]);

  const applyAI = useCallback(() => {
    onScaleCapacity("eu-central-1", -18); // reduce concurrency % by adding capacity headroom
    onAddRunnerFromRec("regional", "eu-central-1", 40);
    onAddRunnerFromRec("regional", "eu-central-1", 40);
    setShowAI(false);
  }, []);

  const onAddRunnerFromRec = useCallback((type: RunnerType, region: string, conc: number) => {
    const id = `RUN-${(Math.floor(Math.random() * 9000) + 1000).toString()}`;
    const r: Runner = {
      id, type, regionCode: region, tenantId: null, state: "healthy",
      cpuPct: 8, memPct: 12, activeExecutions: 0, maxConcurrency: conc,
      version: "1.14.2", lastHeartbeatAt: now(),
    };
    setRunners((prev) => [r, ...prev]);
    appendAudit("platform.runner.add", actor, id, { type, region, concurrency: conc, source: "REC-PLAT-1" });
    appendDomain("platform.runner.add", { runnerId: id, region, source: "ai" });
    appendAdmin(actor, "runner.add", id, localIp, true);
  }, [actor]);

  /* ------------------------------ Render -------------------------------- */

  const filteredRunners = runners.filter((r) => {
    if (runnerFilter !== "all" && r.type !== runnerFilter) return false;
    if (runnerRegion !== "all" && r.regionCode !== runnerRegion) return false;
    const q = runnerSearch.trim().toLowerCase();
    if (!q) return true;
    return r.id.toLowerCase().includes(q) || r.regionCode.toLowerCase().includes(q) ||
           (r.tenantId?.toLowerCase().includes(q) ?? false);
  });

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <EntityHeader
        eyebrow="Platform"
        title="Platform Health, Runner Fleet & Administration"
        subtitle="Operate NOVA RunOps itself: SLO, runners, queues, capacity, backups, DR, and administration."
        status={{
          label: derivedState,
          tone: derivedState === "Healthy" ? "healthy"
            : derivedState === "Capacity warning" ? "warning"
            : derivedState === "Runner degraded" || derivedState === "Region unavailable" ? "critical"
            : derivedState === "Upgrade scheduled" ? "pending"
            : derivedState === "Disaster recovery active" ? "simulation"
            : "neutral",
        }}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowAI(true)}>
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> AI recommendation
            </Button>
            <Button size="sm" onClick={() => setAddRunnerOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add runner
            </Button>
          </div>
        }
        meta={
          <>
            <span>tenant · <strong>{tenantName}</strong></span><span>·</span>
            <span>env · <strong>{ops.environment}</strong></span><span>·</span>
            <span>role · <strong>{role}</strong></span><span>·</span>
            <span>scenario stage · <strong>{scenario}</strong></span><span>·</span>
            <span>{tenants.length} tenants · {runners.length} runners · {queueDepth} queued</span>
          </>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-3 mt-2 flex w-fit flex-wrap justify-start bg-white">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
          <TabsTrigger value="runners">Runner fleet</TabsTrigger>
          <TabsTrigger value="queues">Queues</TabsTrigger>
          <TabsTrigger value="capacity">Capacity</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="dr">Disaster recovery</TabsTrigger>
          <TabsTrigger value="upgrades">Upgrades</TabsTrigger>
          <TabsTrigger value="flags">Feature flags</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="residency">Residency</TabsTrigger>
          <TabsTrigger value="consumption">Consumption</TabsTrigger>
          <TabsTrigger value="licensing">Licensing</TabsTrigger>
          <TabsTrigger value="audit">Admin audit</TabsTrigger>
        </TabsList>

        {/* ========================= OVERVIEW ========================= */}
        <TabsContent value="overview" className="mx-3 my-3 min-h-0 flex-1 space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Gauge} label="Platform SLO" value={`${platformSlo}%`} sub={`30d availability ${availability30d}%`} />
            <StatCard icon={Zap} label="Latency p95" value={`${latencyP95Ms} ms`} sub={`target ≤ 400 ms`} />
            <StatCard icon={Boxes} label="Queue depth" value={`${queueDepth}`} sub={`across ${queues.length} queues`} />
            <StatCard icon={Server} label="Runner health" value={`${runnerHealthPct}%`} sub={`${runners.length} runners`} />
            <StatCard icon={Globe} label="Regions" value={`${regions.filter((r) => r.state === "healthy").length}/${regions.length} healthy`} sub={regions.map((r) => r.code).join(", ")} />
            <StatCard icon={Database} label="Database health" value={integrations.find((i) => i.kind === "database")?.state ?? "?"} sub={`p99 ${integrations.find((i) => i.kind === "database")?.latencyMs}ms`} />
            <StatCard icon={HardDrive} label="Storage" value={integrations.find((i) => i.kind === "storage")?.state ?? "?"} sub={`err ${((integrations.find((i) => i.kind === "storage")?.errorRate ?? 0) * 100).toFixed(3)}%`} />
            <StatCard icon={Cpu} label="Edge functions" value={integrations.find((i) => i.kind === "edge-functions")?.state ?? "?"} sub={`p95 ${integrations.find((i) => i.kind === "edge-functions")?.latencyMs}ms`} />
            <StatCard icon={Users} label="Active users" value={activeUsers.toLocaleString()} sub={`${tenants.length} tenants`} />
            <StatCard icon={Activity} label="Executions (30d)" value={executions30d.toLocaleString()} sub="all tenants" />
            <StatCard icon={Sparkles} label="Model usage" value={`${(consumption.reduce((a, r) => a + r.modelTokens30d, 0) / 1_000_000).toFixed(1)}M tok`} sub="30 day window" />
            <StatCard icon={ScrollText} label="Cost (30d)" value={`$${totalCost.toLocaleString()}`} sub="all tenants" />
            <StatCard icon={CheckCircle2} label="Backups" value={`${backups.filter((b) => b.state === "ok").length}/${backups.length} ok`} sub={`oldest test ${Math.round((Date.now() - Math.min(...backups.filter((b) => b.lastRestoreTestAt).map((b) => new Date(b.lastRestoreTestAt ?? 0).getTime()))) / 86_400_000)}d`} />
            <StatCard icon={FlaskConical} label="Recovery readiness" value={dr.every((d) => d.outcome === "passed") ? "ready" : "attention"} sub={`${dr.filter((d) => d.outcome === "passed").length}/${dr.length} passed`} />
          </div>

          <Card><CardContent className="p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">Current platform state</div>
            <div className="flex items-center gap-2">
              <StateBadge state={derivedState} />
              <span className="text-xs text-slate-600">
                {derivedState === "Capacity warning" && "One or more regions are running above 70% headroom. Consider Add runner or Scale capacity."}
                {derivedState === "Runner degraded" && "Multiple runners are degraded or offline. Active executions may be affected."}
                {derivedState === "Region unavailable" && "A region is unavailable. Failover targets are shown in the Regions tab."}
                {derivedState === "Upgrade scheduled" && "A control-plane or runner upgrade is queued. Review Upgrades tab."}
                {derivedState === "Disaster recovery active" && "A DR exercise is in flight and blocking related administrative actions."}
                {derivedState === "Healthy" && "All platform components are within their targets."}
                {(derivedState as string) === "Administrative restriction" && "Some destructive actions are held pending elevated authorization."}
              </span>
            </div>
          </CardContent></Card>
        </TabsContent>

        {/* ========================= TENANTS ========================= */}
        <TabsContent value="tenants" className="mx-3 my-3">
          <Card><CardContent className="p-0">
            <SimpleTable
              head={["Tenant", "Plan", "Residency", "Isolated", "Active users", "Executions/mo", "Seats", "Status", "Actions"]}
              rows={tenants.map((t) => [
                <>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-[10px] text-slate-500">{t.id}</div>
                </>,
                t.plan, t.residency,
                t.isolated ? <CheckCircle2 className="inline h-3.5 w-3.5 text-emerald-600" /> : "—",
                t.activeUsers.toLocaleString(),
                t.monthlyExecutions.toLocaleString(),
                t.seats,
                t.status,
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => { setTenantConfigure(t); setTenantNote(""); }}>Configure</Button>
                  <Button size="sm" variant="outline" onClick={() =>
                    confirm(
                      "Delegate administrator",
                      t.name,
                      "Assign a delegated administrator with tenant-scoped elevated permissions. Recorded in the administrative audit log.",
                      () => onDelegateAdmin(t.id, "tenant-admin@" + t.name)
                    )
                  }>Delegate admin</Button>
                </div>,
              ])}
            />
          </CardContent></Card>
        </TabsContent>

        {/* ========================= REGIONS ========================= */}
        <TabsContent value="regions" className="mx-3 my-3">
          <Card><CardContent className="p-0">
            <SimpleTable
              head={["Region", "Code", "State", "Runners", "Tenants", "p95 latency"]}
              rows={regions.map((r) => [
                r.name, <span className="font-mono">{r.code}</span>,
                <Badge variant="outline" className={cn("border text-[10px]",
                  r.state === "healthy" ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : r.state === "degraded" ? "border-amber-200 bg-amber-50 text-amber-800"
                    : "border-red-200 bg-red-50 text-red-800")}>{r.state}</Badge>,
                r.runnerCount, r.tenantsHosted,
                <span className="tabular-nums">{r.latencyP95Ms} ms</span>,
              ])}
            />
          </CardContent></Card>
        </TabsContent>

        {/* ========================= RUNNERS ========================= */}
        <TabsContent value="runners" className="mx-3 my-3 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Input placeholder="Search runners" value={runnerSearch} onChange={(e) => setRunnerSearch(e.target.value)} className="h-8 max-w-xs" />
            <Select value={runnerFilter} onValueChange={(v) => setRunnerFilter(v as RunnerType | "all")}>
              <SelectTrigger className="h-8 w-40"><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="cloud">Cloud</SelectItem>
                <SelectItem value="customer-hosted">Customer Hosted</SelectItem>
                <SelectItem value="regional">Regional</SelectItem>
                <SelectItem value="edge">Edge</SelectItem>
                <SelectItem value="isolated">Isolated</SelectItem>
                <SelectItem value="air-gapped">Air Gapped</SelectItem>
              </SelectContent>
            </Select>
            <Select value={runnerRegion} onValueChange={setRunnerRegion}>
              <SelectTrigger className="h-8 w-44"><SelectValue placeholder="All regions" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All regions</SelectItem>
                {regions.map((r) => <SelectItem key={r.code} value={r.code}>{r.code}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="ml-auto text-[11px] text-slate-600">
              {filteredRunners.length} / {runners.length} runners · {runners.filter((r) => r.state === "healthy").length} healthy
            </div>
          </div>
          <Card><CardContent className="p-0">
            <SimpleTable
              head={["Runner", "Type", "Region", "Tenant", "State", "CPU", "Mem", "Active/Max", "Version", "Actions"]}
              rows={filteredRunners.map((r) => [
                <span className="font-mono text-[10px]">{r.id}</span>,
                r.type, r.regionCode, r.tenantId ?? "shared",
                <RunnerStateBadge s={r.state} />,
                <Meter value={r.cpuPct} />, <Meter value={r.memPct} />,
                <span className="tabular-nums">{r.activeExecutions}/{r.maxConcurrency}</span>,
                <span className="font-mono text-[10px]">{r.version}</span>,
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" disabled={r.state !== "healthy" && r.state !== "degraded"}
                    onClick={() => confirm(
                      "Drain runner",
                      r.id,
                      `Draining ${r.id} will stop accepting new executions and let ${r.activeExecutions} active step${r.activeExecutions === 1 ? "" : "s"} finish or migrate. Runner returns to the pool after draining.`,
                      () => onDrainRunner(r)
                    )}>
                    <PowerOff className="mr-1 h-3 w-3" /> Drain
                  </Button>
                </div>,
              ])}
            />
          </CardContent></Card>
        </TabsContent>

        {/* ========================= QUEUES ========================= */}
        <TabsContent value="queues" className="mx-3 my-3">
          <Card><CardContent className="p-0">
            <SimpleTable
              head={["Queue", "Tenant", "Region", "Depth", "In-flight", "Rate/min", "State", "Actions"]}
              rows={queues.map((q) => [
                q.name, q.tenantId ?? "shared", <span className="font-mono">{q.regionCode}</span>,
                <span className={cn("tabular-nums", q.depth > 50 ? "text-red-700" : q.depth > 20 ? "text-amber-700" : "")}>{q.depth}</span>,
                <span className="tabular-nums">{q.inflight}</span>,
                <span className="tabular-nums">{q.ratePerMin}</span>,
                <Badge variant="outline" className="border text-[10px]">{q.state}</Badge>,
                <Button size="sm" variant="outline" onClick={() =>
                  confirm(
                    q.state === "paused" ? "Resume queue" : "Pause queue",
                    q.name,
                    q.state === "paused"
                      ? `Resume ${q.name}. Enqueued executions will begin dispatching immediately.`
                      : `Pause ${q.name}. New enqueues remain accepted but dispatch stops until resumed. In-flight steps continue.`,
                    () => onPauseQueue(q)
                  )
                }>
                  {q.state === "paused"
                    ? <><PlayCircle className="mr-1 h-3 w-3" /> Resume</>
                    : <><PauseCircle className="mr-1 h-3 w-3" /> Pause</>}
                </Button>,
              ])}
            />
          </CardContent></Card>
        </TabsContent>

        {/* ========================= CAPACITY ========================= */}
        <TabsContent value="capacity" className="mx-3 my-3">
          <Card><CardContent className="p-0">
            <SimpleTable
              head={["Region", "CPU", "Memory", "Concurrency", "Risk", "Scale"]}
              rows={capacity.map((c) => [
                <span className="font-mono">{c.regionCode}</span>,
                <Meter value={c.cpuPct} />, <Meter value={c.memPct} />, <Meter value={c.concurrencyPct} />,
                <Badge variant="outline" className={cn("border text-[10px]",
                  c.risk === "high" ? "border-red-200 bg-red-50 text-red-800"
                    : c.risk === "medium" ? "border-amber-200 bg-amber-50 text-amber-800"
                    : "border-emerald-200 bg-emerald-50 text-emerald-800")}>{c.risk}</Badge>,
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() =>
                    confirm("Scale capacity", c.regionCode,
                      `Increase capacity by ~20% in ${c.regionCode}. Adds headroom and reduces concurrency %.`,
                      () => onScaleCapacity(c.regionCode, -20))}>+ Scale up</Button>
                  <Button size="sm" variant="outline" onClick={() =>
                    confirm("Scale capacity", c.regionCode,
                      `Decrease capacity in ${c.regionCode}. Concurrency % will rise; may trigger a Capacity warning.`,
                      () => onScaleCapacity(c.regionCode, +15))}>Scale down</Button>
                </div>,
              ])}
            />
          </CardContent></Card>
        </TabsContent>

        {/* ========================= INTEGRATIONS ========================= */}
        <TabsContent value="integrations" className="mx-3 my-3">
          <Card><CardContent className="p-0">
            <SimpleTable
              head={["Integration", "Kind", "State", "Latency", "Error rate"]}
              rows={integrations.map((i) => [
                i.name, i.kind,
                <Badge variant="outline" className={cn("border text-[10px]",
                  i.state === "healthy" ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : i.state === "degraded" ? "border-amber-200 bg-amber-50 text-amber-800"
                    : "border-red-200 bg-red-50 text-red-800")}>{i.state}</Badge>,
                <span className="tabular-nums">{i.latencyMs} ms</span>,
                <span className="tabular-nums">{(i.errorRate * 100).toFixed(3)}%</span>,
              ])}
            />
          </CardContent></Card>
        </TabsContent>

        {/* ========================= BACKUPS ========================= */}
        <TabsContent value="backups" className="mx-3 my-3">
          <Card><CardContent className="p-0">
            <SimpleTable
              head={["Scope", "Last backup", "RPO", "RTO", "Encrypted", "State", "Last restore test", "Actions"]}
              rows={backups.map((b) => [
                b.scope, new Date(b.lastAt).toLocaleString(),
                `${b.rpoMinutes}m`, `${b.rtoMinutes}m`,
                b.encrypted ? "yes" : <span className="text-red-700">no</span>,
                <Badge variant="outline" className={cn("border text-[10px]",
                  b.state === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : b.state === "warn" ? "border-amber-200 bg-amber-50 text-amber-800"
                    : "border-red-200 bg-red-50 text-red-800")}>{b.state}</Badge>,
                b.lastRestoreTestAt ? new Date(b.lastRestoreTestAt).toLocaleDateString() : "—",
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() =>
                    confirm("Test backup", b.scope,
                      `Run a non-destructive restore test for the ${b.scope} backup into a scratch environment. Result is recorded in the administrative audit.`,
                      () => onTestBackup(b))}>Test</Button>
                  <Button size="sm" variant="outline" onClick={() => { setRestoreOpen(b); setRestoreNote(""); }}>Restore config</Button>
                </div>,
              ])}
            />
          </CardContent></Card>
        </TabsContent>

        {/* ========================= DR ========================= */}
        <TabsContent value="dr" className="mx-3 my-3">
          <Card><CardContent className="p-0">
            <SimpleTable
              head={["DR Scenario", "Scheduled", "Last ran", "Outcome", "RTO achieved", "Evidence", "Actions"]}
              rows={dr.map((d) => [
                d.scenario,
                new Date(d.scheduledAt).toLocaleDateString(),
                d.ranAt ? new Date(d.ranAt).toLocaleDateString() : "—",
                <Badge variant="outline" className={cn("border text-[10px]",
                  d.outcome === "passed" ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : d.outcome === "failed" ? "border-red-200 bg-red-50 text-red-800"
                    : "border-slate-200 bg-slate-50 text-slate-700")}>{d.outcome}</Badge>,
                d.rtoAchievedMinutes ? `${d.rtoAchievedMinutes} min` : "—",
                d.evidenceId ? <span className="font-mono text-[10px]">{d.evidenceId}</span> : "—",
                <Button size="sm" variant="outline" onClick={() =>
                  confirm("Run DR exercise", d.scenario,
                    `Execute the DR exercise "${d.scenario}" in the isolated DR environment. Evidence artifact and readiness state will be updated on success.`,
                    () => onRunDR(d))}>
                  <FlaskConical className="mr-1 h-3 w-3" /> Run exercise
                </Button>,
              ])}
            />
          </CardContent></Card>
        </TabsContent>

        {/* ========================= UPGRADES ========================= */}
        <TabsContent value="upgrades" className="mx-3 my-3">
          <Card><CardContent className="p-0">
            <SimpleTable
              head={["Upgrade", "Scope", "From", "To", "Scheduled", "Window", "Restart", "State", "Actions"]}
              rows={upgrades.map((u) => [
                <span className="font-mono">{u.id}</span>, u.scope,
                <span className="font-mono">{u.fromVersion}</span>,
                <span className="font-mono">{u.toVersion}</span>,
                new Date(u.scheduledFor).toLocaleString(),
                u.window, u.requiresRestart ? "yes" : "no",
                <Badge variant="outline" className="border text-[10px]">{u.state}</Badge>,
                <Button size="sm" variant="outline" disabled={u.state === "completed" || u.state === "rolled-back"}
                  onClick={() =>
                    confirm("Schedule upgrade", u.id,
                      `Reschedule ${u.id} (${u.scope}) from ${u.fromVersion} to ${u.toVersion} into the next available maintenance window (T+72h). Runbook executions in-flight will be drained before restart.`,
                      () => onScheduleUpgrade(u))}>
                  Reschedule
                </Button>,
              ])}
            />
          </CardContent></Card>
        </TabsContent>

        {/* ========================= FLAGS ========================= */}
        <TabsContent value="flags" className="mx-3 my-3">
          <Card><CardContent className="p-0">
            <SimpleTable
              head={["Flag", "Description", "Audience", "Enabled", "Authorized"]}
              rows={flags.map((f) => [
                <span className="font-mono text-[11px]">{f.key}</span>,
                f.description, f.audience,
                <div className="flex items-center gap-2">
                  <Switch checked={f.enabled} disabled={!f.authorized}
                    onCheckedChange={() => {
                      if (!f.authorized) return;
                      confirm(
                        f.enabled ? "Disable feature flag" : "Enable feature flag",
                        f.key,
                        `Toggling ${f.key} to ${!f.enabled ? "enabled" : "disabled"} will change function availability for ${f.audience}. Existing sessions may see the change on next request.`,
                        () => onToggleFlag(f)
                      );
                    }} />
                  <span className="text-[10px] text-slate-600">{f.enabled ? "on" : "off"}</span>
                </div>,
                f.authorized ? "yes" :
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" /> requires elevated role
                  </span>,
              ])}
            />
          </CardContent></Card>
        </TabsContent>

        {/* ========================= RETENTION ========================= */}
        <TabsContent value="retention" className="mx-3 my-3">
          <Card><CardContent className="p-0">
            <SimpleTable
              head={["Scope", "Days", "Legal hold", "Updated", "Actions"]}
              rows={retention.map((r) => [
                r.scope, `${r.days} days`,
                r.legalHold ? <span className="inline-flex items-center gap-1 text-slate-800"><KeyRound className="h-3 w-3" /> held</span> : "—",
                new Date(r.updatedAt).toLocaleDateString(),
                <Button size="sm" variant="outline" disabled={r.legalHold}
                  onClick={() => { setRetentionEdit(r); setRetentionDays(r.days); }}>
                  {r.legalHold ? "Locked by legal hold" : "Set retention"}
                </Button>,
              ])}
            />
          </CardContent></Card>
        </TabsContent>

        {/* ========================= RESIDENCY ========================= */}
        <TabsContent value="residency" className="mx-3 my-3">
          <Card><CardContent className="p-0">
            <SimpleTable
              head={["Tenant", "Primary region", "Allowed regions", "Cross-border transfer", "Actions"]}
              rows={residency.map((b) => {
                const t = tenants.find((x) => x.id === b.tenantId);
                return [
                  <>
                    <div className="font-medium">{t?.name ?? b.tenantId}</div>
                    <div className="text-[10px] text-slate-500">{b.tenantId}</div>
                  </>,
                  <span className="font-mono">{b.primaryRegion}</span>,
                  <span className="font-mono text-[10px]">{b.allowedRegions.join(", ")}</span>,
                  b.crossBorderTransferAllowed ? "allowed" : "restricted",
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() =>
                      confirm(
                        b.crossBorderTransferAllowed ? "Restrict cross-border transfer" : "Allow cross-border transfer",
                        b.tenantId,
                        `Toggling cross-border transfer changes whether ${t?.name ?? b.tenantId} traffic may spill into peer regions. This must reflect the tenant's data protection agreement.`,
                        () => onToggleResidencyOverflow(b)
                      )}>Toggle transfer</Button>
                    <Button size="sm" variant="outline" onClick={() => setResidencyEdit(b)}>Details</Button>
                  </div>,
                ];
              })}
            />
          </CardContent></Card>
        </TabsContent>

        {/* ========================= CONSUMPTION ========================= */}
        <TabsContent value="consumption" className="mx-3 my-3">
          <Card><CardContent className="p-0">
            <SimpleTable
              head={["Tenant", "Executions 30d", "Model tokens 30d", "Storage", "Cost 30d"]}
              rows={consumption.map((c) => {
                const t = tenants.find((x) => x.id === c.tenantId);
                return [
                  t?.name ?? c.tenantId,
                  c.executions30d.toLocaleString(),
                  `${(c.modelTokens30d / 1_000_000).toFixed(2)}M`,
                  `${c.storageGb} GB`,
                  `$${c.costUsd30d.toLocaleString()}`,
                ];
              })}
            />
          </CardContent></Card>
        </TabsContent>

        {/* ========================= LICENSING ========================= */}
        <TabsContent value="licensing" className="mx-3 my-3">
          <Card><CardContent className="p-0">
            <SimpleTable
              head={["Tenant", "Seats used/purchased", "Executions used/allowed", "Expires"]}
              rows={licenses.map((l) => {
                const t = tenants.find((x) => x.id === l.tenantId);
                const seatUse = l.seatsPurchased ? Math.round(100 * l.seatsUsed / l.seatsPurchased) : 0;
                const execUse = l.executionsAllowed ? Math.round(100 * l.executionsUsed / l.executionsAllowed) : 0;
                return [
                  t?.name ?? l.tenantId,
                  <><div>{l.seatsUsed} / {l.seatsPurchased}</div><Meter value={seatUse} /></>,
                  <><div>{l.executionsUsed.toLocaleString()} / {l.executionsAllowed.toLocaleString()}</div><Meter value={execUse} /></>,
                  new Date(l.expiresAt).toLocaleDateString(),
                ];
              })}
            />
          </CardContent></Card>
        </TabsContent>

        {/* ========================= AUDIT ========================= */}
        <TabsContent value="audit" className="mx-3 my-3">
          <Card><CardContent className="p-0">
            {admin.length === 0 ? (
              <div className="p-4 text-sm text-slate-600">
                No administrative events yet. Actions such as Add runner, Drain, Pause queue, Schedule upgrade, Toggle flag, Set retention, Delegate admin, Test backup, and Run DR appear here.
              </div>
            ) : (
              <SimpleTable
                head={["When", "Actor", "Action", "Target", "IP", "Confirmed"]}
                rows={admin.map((a) => [
                  new Date(a.at).toLocaleString(), a.actor,
                  <span className="font-mono text-[11px]">{a.action}</span>,
                  <span className="font-mono text-[11px]">{a.target}</span>,
                  <span className="font-mono text-[11px]">{a.ip}</span>,
                  a.confirmed ? <CheckCircle2 className="inline h-3.5 w-3.5 text-emerald-600" /> : "—",
                ])}
              />
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* ============================ Confirm dialog ============================ */}
      <Dialog open={!!confirmOpen} onOpenChange={(o) => !o && setConfirmOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              Confirm {confirmOpen?.action.toLowerCase()}
            </DialogTitle>
          </DialogHeader>
          {confirmOpen && (
            <div className="space-y-2 text-xs">
              <div><strong>Target:</strong> <span className="font-mono">{confirmOpen.target}</span></div>
              <div className="rounded border border-amber-200 bg-amber-50 p-2 text-amber-900">
                {confirmOpen.explain}
              </div>
              <div className="text-slate-600">
                Actor: <span className="font-mono">{actor}</span> · IP <span className="font-mono">{localIp}</span> · recorded in administrative audit.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(null)}>Cancel</Button>
            <Button onClick={() => { confirmOpen?.onConfirm(); setConfirmOpen(null); }}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================ Add runner ============================ */}
      <Dialog open={addRunnerOpen} onOpenChange={setAddRunnerOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add runner</DialogTitle></DialogHeader>
          <div className="space-y-2 text-xs">
            <label className="block">Type
              <Select value={addRunnerType} onValueChange={(v) => setAddRunnerType(v as RunnerType)}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cloud">Cloud</SelectItem>
                  <SelectItem value="customer-hosted">Customer Hosted</SelectItem>
                  <SelectItem value="regional">Regional</SelectItem>
                  <SelectItem value="edge">Edge</SelectItem>
                  <SelectItem value="isolated">Isolated</SelectItem>
                  <SelectItem value="air-gapped">Air Gapped</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label className="block">Region
              <Select value={addRunnerRegion} onValueChange={setAddRunnerRegion}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {regions.map((r) => <SelectItem key={r.code} value={r.code}>{r.code}</SelectItem>)}
                </SelectContent>
              </Select>
            </label>
            <label className="block">Max concurrency
              <Input type="number" min={1} max={200} value={addRunnerConcurrency}
                onChange={(e) => setAddRunnerConcurrency(Math.max(1, Math.min(200, parseInt(e.target.value || "1", 10))))} />
            </label>
            <div className="rounded border border-slate-200 bg-slate-50 p-2 text-slate-600">
              New runners register into the shared pool for their region. Tenant-scoped assignment is handled from the Runners tab after registration.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddRunnerOpen(false)}>Cancel</Button>
            <Button onClick={onAddRunner}>Add runner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================ Retention edit ============================ */}
      <Dialog open={!!retentionEdit} onOpenChange={(o) => !o && setRetentionEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Set retention · {retentionEdit?.scope}</DialogTitle></DialogHeader>
          {retentionEdit && (
            <div className="space-y-2 text-xs">
              <label className="block">Retention (days)
                <Input type="number" min={1} max={3650} value={retentionDays}
                  onChange={(e) => setRetentionDays(Math.max(1, Math.min(3650, parseInt(e.target.value || "1", 10))))} />
              </label>
              <div className="text-slate-600">
                Changing retention takes effect on the next nightly compaction. Legal hold is enforced independently.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRetentionEdit(null)}>Cancel</Button>
            <Button onClick={() => {
              if (retentionEdit) {
                confirm("Set retention", retentionEdit.scope,
                  `Change ${retentionEdit.scope} retention from ${retentionEdit.days} to ${retentionDays} days.`,
                  () => { onSetRetention(retentionEdit, retentionDays); setRetentionEdit(null); });
              }
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================ Residency details ============================ */}
      <Dialog open={!!residencyEdit} onOpenChange={(o) => !o && setResidencyEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Residency binding</DialogTitle></DialogHeader>
          {residencyEdit && (
            <div className="space-y-2 text-xs">
              <div><strong>Tenant:</strong> <span className="font-mono">{residencyEdit.tenantId}</span></div>
              <div><strong>Primary region:</strong> <span className="font-mono">{residencyEdit.primaryRegion}</span></div>
              <div><strong>Allowed regions:</strong> <span className="font-mono">{residencyEdit.allowedRegions.join(", ")}</span></div>
              <div><strong>Cross-border transfer:</strong> {residencyEdit.crossBorderTransferAllowed ? "allowed" : "restricted"}</div>
              <div className="rounded border border-slate-200 bg-slate-50 p-2 text-slate-600">
                Residency bindings are enforced by the routing layer. Changes require a data protection review; only cross-border transfer is toggleable from this screen.
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setResidencyEdit(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================ Tenant configure ============================ */}
      <Dialog open={!!tenantConfigure} onOpenChange={(o) => !o && setTenantConfigure(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Configure tenant · {tenantConfigure?.name}</DialogTitle></DialogHeader>
          {tenantConfigure && (
            <div className="space-y-2 text-xs">
              <div>Plan · {tenantConfigure.plan}</div>
              <div>Residency · <span className="font-mono">{tenantConfigure.residency}</span></div>
              <div>Isolated · {tenantConfigure.isolated ? "yes" : "no"}</div>
              <label className="block">Configuration note
                <Textarea value={tenantNote} onChange={(e) => setTenantNote(e.target.value)}
                  placeholder="Describe the configuration change for the audit log…" />
              </label>
              <div className="rounded border border-slate-200 bg-slate-50 p-2 text-slate-600">
                Isolation and plan changes are handled in the tenant contract system. Configuration notes are recorded to the administrative audit log.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTenantConfigure(null)}>Cancel</Button>
            <Button disabled={!tenantNote.trim()}
              onClick={() => tenantConfigure && onConfigureTenant(tenantConfigure, tenantNote.trim())}>
              Save configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================ Restore config ============================ */}
      <Dialog open={!!restoreOpen} onOpenChange={(o) => !o && setRestoreOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Restore configuration · {restoreOpen?.scope}</DialogTitle></DialogHeader>
          {restoreOpen && (
            <div className="space-y-2 text-xs">
              <div className="rounded border border-red-200 bg-red-50 p-2 text-red-900">
                <strong>Destructive.</strong> Restoring the {restoreOpen.scope} backup overwrites current configuration. This action is recorded in the administrative audit.
              </div>
              <label className="block">Change ticket / justification
                <Textarea value={restoreNote} onChange={(e) => setRestoreNote(e.target.value)}
                  placeholder="Reference the change ticket authorizing the restore…" />
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreOpen(null)}>Cancel</Button>
            <Button disabled={!restoreNote.trim()} onClick={() => restoreOpen && onRestoreConfig(restoreOpen, restoreNote.trim())}>
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================ AI recommendation ============================ */}
      <Dialog open={showAI} onOpenChange={setShowAI}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> {AI_RECOMMENDATION.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div>
              <div className="text-[10px] uppercase text-slate-500">Conclusion</div>
              <p className="mt-0.5">{AI_RECOMMENDATION.conclusion}</p>
            </div>
            <div className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-800 border border-emerald-200 inline-block">
              Confidence · {AI_RECOMMENDATION.confidence}%
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-500">Uncertainty</div>
              <p className="mt-0.5 text-slate-700">{AI_RECOMMENDATION.uncertainty}</p>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-500">Supporting evidence</div>
              <ul className="mt-0.5 list-disc pl-4">{AI_RECOMMENDATION.supportingEvidence.map((e) => <li key={e}>{e}</li>)}</ul>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-500">Contradictory evidence</div>
              <ul className="mt-0.5 list-disc pl-4">{AI_RECOMMENDATION.contradictoryEvidence.map((e) => <li key={e}>{e}</li>)}</ul>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-500">Sources</div>
              <ul className="mt-0.5 list-disc pl-4 font-mono text-[10px]">
                {AI_RECOMMENDATION.sources.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAI(false)}>Dismiss</Button>
            <Button onClick={applyAI}>Apply recommendation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer context strip */}
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 bg-white px-3 py-1.5 text-[10px] text-slate-500">
        <Cloud className="h-3 w-3" />
        <span>Platform state and connector health are exported to Command Center. Runner drains and queue pauses may create Operations tasks. DR exercises create Evidence artifacts.</span>
        <span className="ml-auto">state · <StateBadge state={derivedState} /></span>
      </div>
    </div>
  );
}

/* --------------------------- Local UI helpers --------------------------- */

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: React.ReactNode; sub?: React.ReactNode;
}) {
  return (
    <Card><CardContent className="p-3">
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 text-slate-500" />
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
          <div className="truncate text-lg font-semibold text-slate-900">{value}</div>
          {sub && <div className="mt-0.5 truncate text-[10px] text-slate-500">{sub}</div>}
        </div>
      </div>
    </CardContent></Card>
  );
}

function SimpleTable({ head, rows }: { head: React.ReactNode[]; rows: React.ReactNode[][] }) {
  return (
    <table className="w-full text-xs">
      <thead className="bg-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-600">
        <tr>{head.map((h, i) => <th key={i} className="px-3 py-2">{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-slate-100 align-top hover:bg-slate-50">
            {r.map((c, j) => <td key={j} className="px-3 py-2">{c}</td>)}
          </tr>
        ))}
        {rows.length === 0 && (
          <tr><td colSpan={head.length} className="px-3 py-6 text-center text-slate-500">No records.</td></tr>
        )}
      </tbody>
    </table>
  );
}
