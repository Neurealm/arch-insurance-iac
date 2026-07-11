/**
 * Page 43 · Identity, Secrets & Execution Security
 * Route: /runops/security/execution
 *
 * Controls who or what may perform operational actions. Human, workload,
 * runner, and digital-worker identities are kept in separate registries.
 * Secret values are never rendered — only references (name, provider,
 * scope, rotation state). Rotations are simulated as server-side workflows.
 *
 * Persistence (localStorage):
 *   runops.security.identities.v1       → Identity[]
 *   runops.security.privileged.v1       → PrivilegedGrant[]  (time-bound)
 *   runops.security.secrets.v1          → SecretRef[]        (no values)
 *   runops.security.zones.v1            → ExecutionZone[]
 *   runops.security.command_policies.v1 → CommandPolicy[]
 *   runops.security.sessions.v1         → PrivilegedSession[]
 *   runops.security.breakglass.v1       → BreakGlassRequest[]
 *   runops.audit.events.v1              → audit stream
 *   runops.domain.events.v1             → domain event stream
 *   runops.launch.restrictions.v1       → cross-screen for Launch Center
 *   runops.step.permissions.v1          → cross-screen for Step Builder
 *   runops.executions.paused.v1         → cross-screen for exec monitors
 *   runops.workers.tool_grants.v1       → cross-screen for Worker Studio
 *
 * No fixture-array imports. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck, Ban, Clock, Fingerprint, KeyRound, Lock, PlayCircle, PlusCircle,
  RefreshCw, ShieldAlert, ShieldCheck, Terminal, UserRound, Users, XCircle,
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

type IdentityType = "human" | "service_account" | "workload" | "digital_worker" | "runner";
type IdentityStatus = "Active" | "Expiring" | "Revoked" | "Access pending" | "Policy violation" | "Break glass" | "Session terminated";
type Env = "dev" | "staging" | "prod";
type Risk = "low" | "medium" | "high" | "critical";

interface Identity {
  id: string;                  // ID-XXXX
  displayName: string;
  type: IdentityType;
  tenantRef: string;
  role: string;                // runops role
  serviceScope: string[];      // service ids
  envScope: Env[];
  privilege: "read" | "operate" | "admin" | "elevated";
  credentialLifetimeHours: number | null; // null = long-lived (flagged)
  lastUseAt: string | null;
  risk: Risk;
  status: IdentityStatus;
  ownerRef: string;
  approvalRequirement: "none" | "single" | "dual";
  createdAt: string;
}

interface PrivilegedGrant {
  id: string;                  // PG-XXXX
  identityId: string;
  scopeRef: string;            // e.g., "service:checkout-api/env:prod"
  reason: string;
  requestedBy: string;
  approvedBy: string | null;
  state: "Access pending" | "Active" | "Revoked" | "Expired";
  issuedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface SecretRef {
  id: string;                  // SR-XXXX  (reference only, never a value)
  name: string;                // "STRIPE_API_KEY_PROD"
  provider: "vault" | "kms" | "cloud_secrets" | "external";
  scopeRef: string;
  ownerRef: string;
  lastRotatedAt: string;
  rotationEveryDays: number;
  boundIdentityIds: string[];
  state: "Active" | "Rotating" | "Compromised" | "Deprecated";
  createdAt: string;
}

interface ExecutionZone {
  id: string;                  // EZ-XXXX
  name: string;                // "prod-runner-us"
  env: Env;
  cidrAllowlist: string[];
  egressPolicy: "deny_all" | "allowlist" | "unrestricted";
  requireMfa: boolean;
  requireDualApproval: boolean;
  active: boolean;
  createdAt: string;
}

interface CommandPolicy {
  id: string;                  // CP-XXXX
  name: string;
  targetType: "runbook" | "script" | "tool" | "worker";
  allowlist: string[];         // e.g. ["kubectl rollout status", "aws s3 ls"]
  denylist: string[];          // e.g. ["rm -rf", "aws iam delete-user"]
  env: Env | "all";
  active: boolean;
  createdAt: string;
}

interface PrivilegedSession {
  id: string;                  // SES-XXXX
  identityId: string;
  scopeRef: string;
  startedAt: string;
  endsAt: string;
  state: "Active" | "Session terminated" | "Expired";
  recordingRef: string;        // simulated recording locator
}

interface BreakGlassRequest {
  id: string;                  // BG-XXXX
  identityId: string;
  reason: string;
  requestedBy: string;
  approvedBy: string | null;
  state: "Access pending" | "Active" | "Revoked" | "Expired";
  expiresAt: string | null;
  createdAt: string;
}

interface AuditEvt { id: string; at: string; actor: string; action: string; target: string; detail?: string; }
interface DomainEvt { id: string; at: string; kind: string; payload: unknown; }
interface LaunchRestrictionLite { id: string; scopeRef: string; reason: string; issuedAt: string; expiresAt: string | null; }
interface PausedExecutionLite { id: string; executionRef: string; reason: string; at: string; }
interface StepPermissionLite { id: string; identityId: string; scopeRef: string; at: string; effect: "grant" | "revoke"; }
interface WorkerToolGrantLite { id: string; workerId: string; toolRef: string; at: string; effect: "grant" | "revoke"; }

/* --------------------------- Storage helpers ---------------------------- */

const IDN_KEY = "runops.security.identities.v1";
const PG_KEY  = "runops.security.privileged.v1";
const SEC_KEY = "runops.security.secrets.v1";
const EZ_KEY  = "runops.security.zones.v1";
const CP_KEY  = "runops.security.command_policies.v1";
const SES_KEY = "runops.security.sessions.v1";
const BG_KEY  = "runops.security.breakglass.v1";
const AUD_KEY = "runops.audit.events.v1";
const DOM_KEY = "runops.domain.events.v1";
const LR_KEY  = "runops.launch.restrictions.v1";
const SP_KEY  = "runops.step.permissions.v1";
const PE_KEY  = "runops.executions.paused.v1";
const WT_KEY  = "runops.workers.tool_grants.v1";

function readList<T>(k: string): T[] {
  try { const v = JSON.parse(localStorage.getItem(k) ?? "[]"); return Array.isArray(v) ? (v as T[]) : []; }
  catch { return []; }
}
function writeList<T>(k: string, v: T[]) { localStorage.setItem(k, JSON.stringify(v)); }

const nowIso = () => new Date().toISOString();
const rid = (p: string) => `${p}-${(Math.floor(Math.random() * 9000) + 1000).toString()}`;
const inHours = (h: number) => { const t = new Date(); t.setHours(t.getHours() + h); return t.toISOString(); };
const inDays  = (d: number) => { const t = new Date(); t.setDate(t.getDate() + d); return t.toISOString(); };

function ensureSeed<T>(key: string, seed: () => T[]): T[] {
  const raw = localStorage.getItem(key);
  if (raw !== null) { try { const v = JSON.parse(raw); if (Array.isArray(v)) return v as T[]; } catch { /* fall */ } }
  const s = seed(); writeList(key, s); return s;
}

/* --------------------------- Seed --------------------------------------- */

function seedIdentities(): Identity[] {
  const now = nowIso();
  return [
    { id: "ID-1001", displayName: "sre-lead@contoso", type: "human", tenantRef: "tenant-contoso",
      role: "SRE Engineer", serviceScope: ["checkout-api","orders-api","payments-api"], envScope: ["staging","prod"],
      privilege: "operate", credentialLifetimeHours: 12, lastUseAt: inHours(-1),
      risk: "medium", status: "Active", ownerRef: "sre-team", approvalRequirement: "single", createdAt: inDays(-120) },
    { id: "ID-1002", displayName: "change-manager@contoso", type: "human", tenantRef: "tenant-contoso",
      role: "Change Manager", serviceScope: ["*"], envScope: ["staging","prod"],
      privilege: "elevated", credentialLifetimeHours: 8, lastUseAt: inHours(-3),
      risk: "high", status: "Active", ownerRef: "governance", approvalRequirement: "dual", createdAt: inDays(-360) },
    { id: "ID-1003", displayName: "sa-orders-api-runner", type: "service_account", tenantRef: "tenant-contoso",
      role: "Runner", serviceScope: ["orders-api"], envScope: ["prod"],
      privilege: "operate", credentialLifetimeHours: 1, lastUseAt: inHours(-1),
      risk: "medium", status: "Active", ownerRef: "orders-eng", approvalRequirement: "single", createdAt: inDays(-90) },
    { id: "ID-1004", displayName: "workload-checkout-api-pod", type: "workload", tenantRef: "tenant-contoso",
      role: "Workload", serviceScope: ["checkout-api"], envScope: ["prod"],
      privilege: "read", credentialLifetimeHours: 1, lastUseAt: inHours(-1),
      risk: "low", status: "Active", ownerRef: "checkout-eng", approvalRequirement: "none", createdAt: inDays(-30) },
    { id: "ID-1005", displayName: "worker-nova-triage", type: "digital_worker", tenantRef: "tenant-contoso",
      role: "Digital Worker", serviceScope: ["checkout-api","orders-api","payments-api"], envScope: ["staging","prod"],
      privilege: "operate", credentialLifetimeHours: 4, lastUseAt: inHours(-2),
      risk: "medium", status: "Active", ownerRef: "platform-ai", approvalRequirement: "single", createdAt: inDays(-45) },
    { id: "ID-1006", displayName: "legacy-batch-cred", type: "service_account", tenantRef: "tenant-contoso",
      role: "Runner", serviceScope: ["payments-api"], envScope: ["prod"],
      privilege: "operate", credentialLifetimeHours: null, lastUseAt: inDays(-42),
      risk: "critical", status: "Policy violation", ownerRef: "payments-eng", approvalRequirement: "single", createdAt: inDays(-540) },
    { id: "ID-1007", displayName: "contractor-ext@partner.io", type: "human", tenantRef: "tenant-contoso",
      role: "Read Only User", serviceScope: ["orders-api"], envScope: ["staging"],
      privilege: "read", credentialLifetimeHours: 24, lastUseAt: null,
      risk: "medium", status: "Access pending", ownerRef: "orders-eng", approvalRequirement: "dual", createdAt: now },
    { id: "ID-1008", displayName: "runner-github-actions", type: "runner", tenantRef: "tenant-contoso",
      role: "Runner", serviceScope: ["checkout-api","orders-api"], envScope: ["dev","staging"],
      privilege: "operate", credentialLifetimeHours: 1, lastUseAt: inHours(-8),
      risk: "medium", status: "Expiring", ownerRef: "platform-eng", approvalRequirement: "single", createdAt: inDays(-14) },
  ];
}

function seedPrivileged(): PrivilegedGrant[] {
  return [
    { id: "PG-2001", identityId: "ID-1001", scopeRef: "service:payments-api/env:prod",
      reason: "Emergency remediation for INC-10482", requestedBy: "sre-lead@contoso",
      approvedBy: "change-manager@contoso", state: "Active",
      issuedAt: inHours(-2), expiresAt: inHours(2), createdAt: inHours(-3) },
    { id: "PG-2002", identityId: "ID-1007", scopeRef: "service:orders-api/env:staging",
      reason: "Vendor troubleshooting window", requestedBy: "orders-eng@contoso",
      approvedBy: null, state: "Access pending", issuedAt: null, expiresAt: null, createdAt: inHours(-1) },
  ];
}

function seedSecretRefs(): SecretRef[] {
  return [
    { id: "SR-3001", name: "STRIPE_API_KEY_PROD", provider: "vault", scopeRef: "service:payments-api/env:prod",
      ownerRef: "payments-eng", lastRotatedAt: inDays(-6), rotationEveryDays: 30,
      boundIdentityIds: ["ID-1003","ID-1004"], state: "Active", createdAt: inDays(-200) },
    { id: "SR-3002", name: "OIDC_SIGNING_KEY", provider: "kms", scopeRef: "tenant:contoso",
      ownerRef: "platform-eng", lastRotatedAt: inDays(-95), rotationEveryDays: 90,
      boundIdentityIds: ["ID-1002"], state: "Active", createdAt: inDays(-400) },
    { id: "SR-3003", name: "GITHUB_ACTIONS_TOKEN", provider: "cloud_secrets", scopeRef: "runner:github",
      ownerRef: "platform-eng", lastRotatedAt: inDays(-2), rotationEveryDays: 14,
      boundIdentityIds: ["ID-1008"], state: "Active", createdAt: inDays(-30) },
    { id: "SR-3004", name: "LEGACY_BATCH_KEY", provider: "external", scopeRef: "service:payments-api/env:prod",
      ownerRef: "payments-eng", lastRotatedAt: inDays(-540), rotationEveryDays: 90,
      boundIdentityIds: ["ID-1006"], state: "Compromised", createdAt: inDays(-540) },
  ];
}

function seedZones(): ExecutionZone[] {
  return [
    { id: "EZ-4001", name: "prod-runner-us", env: "prod",
      cidrAllowlist: ["10.20.0.0/16"], egressPolicy: "allowlist",
      requireMfa: true, requireDualApproval: true, active: true, createdAt: inDays(-200) },
    { id: "EZ-4002", name: "staging-runner", env: "staging",
      cidrAllowlist: ["10.30.0.0/16"], egressPolicy: "allowlist",
      requireMfa: true, requireDualApproval: false, active: true, createdAt: inDays(-200) },
    { id: "EZ-4003", name: "dev-shared", env: "dev",
      cidrAllowlist: ["0.0.0.0/0"], egressPolicy: "unrestricted",
      requireMfa: false, requireDualApproval: false, active: true, createdAt: inDays(-200) },
  ];
}

function seedCommandPolicies(): CommandPolicy[] {
  return [
    { id: "CP-5001", name: "Prod kubectl allowlist", targetType: "runbook",
      allowlist: ["kubectl get","kubectl describe","kubectl rollout status"],
      denylist: ["kubectl delete","kubectl exec"],
      env: "prod", active: true, createdAt: inDays(-180) },
    { id: "CP-5002", name: "Global destructive deny", targetType: "script",
      allowlist: [],
      denylist: ["rm -rf /","aws iam delete-user","dropdb","truncate table"],
      env: "all", active: true, createdAt: inDays(-365) },
    { id: "CP-5003", name: "Digital worker tool allowlist", targetType: "worker",
      allowlist: ["read.metrics","read.logs","open.runbook","propose.action"],
      denylist: ["write.database","admin.api"],
      env: "all", active: true, createdAt: inDays(-60) },
  ];
}

function seedSessions(): PrivilegedSession[] {
  return [
    { id: "SES-6001", identityId: "ID-1001", scopeRef: "service:payments-api/env:prod",
      startedAt: inHours(-1), endsAt: inHours(1), state: "Active", recordingRef: "rec://ses-6001" },
    { id: "SES-6002", identityId: "ID-1008", scopeRef: "service:orders-api/env:staging",
      startedAt: inHours(-9), endsAt: inHours(-8), state: "Expired", recordingRef: "rec://ses-6002" },
  ];
}

function seedBreakGlass(): BreakGlassRequest[] {
  return [
    { id: "BG-7001", identityId: "ID-1001", reason: "Payments outage — INC-10482 recovery",
      requestedBy: "sre-lead@contoso", approvedBy: "change-manager@contoso",
      state: "Active", expiresAt: inHours(2), createdAt: inHours(-2) },
  ];
}

/* --------------------------- Helpers ------------------------------------ */

function statusTone(s: IdentityStatus): string {
  switch (s) {
    case "Active":              return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "Expiring":            return "border-amber-200 bg-amber-50 text-amber-800";
    case "Revoked":             return "border-slate-200 bg-slate-50 text-slate-700";
    case "Access pending":      return "border-blue-200 bg-blue-50 text-blue-800";
    case "Policy violation":    return "border-red-200 bg-red-50 text-red-800";
    case "Break glass":         return "border-red-200 bg-red-50 text-red-800";
    case "Session terminated":  return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function riskTone(r: Risk): string {
  switch (r) {
    case "low":      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "medium":   return "border-amber-200 bg-amber-50 text-amber-800";
    case "high":     return "border-orange-200 bg-orange-50 text-orange-800";
    case "critical": return "border-red-200 bg-red-50 text-red-800";
  }
}

function typeIcon(t: IdentityType) {
  switch (t) {
    case "human":          return <UserRound className="h-3.5 w-3.5" />;
    case "service_account":return <KeyRound className="h-3.5 w-3.5" />;
    case "workload":       return <Terminal className="h-3.5 w-3.5" />;
    case "digital_worker": return <Fingerprint className="h-3.5 w-3.5" />;
    case "runner":         return <PlayCircle className="h-3.5 w-3.5" />;
  }
}

/* --------------------------- Component ---------------------------------- */

type Tab =
  | "users" | "roles" | "service_accounts" | "workloads" | "workers"
  | "privileged" | "secrets" | "zones" | "commands" | "sessions" | "breakglass";

const TAB_LABEL: Record<Tab, string> = {
  users:            "Users",
  roles:            "Roles",
  service_accounts: "Service Accounts",
  workloads:        "Workload Identities",
  workers:          "Digital Worker Identities",
  privileged:       "Privileged Access",
  secrets:          "Secret References",
  zones:            "Execution Zones",
  commands:         "Command Policies",
  sessions:         "Sessions",
  breakglass:       "Break Glass",
};

export default function ExecutionSecurity() {
  const ops = useOperations();

  const roleLabel = ops.role ?? "viewer";
  const canWrite = !(roleLabel === "Read Only User" || roleLabel === "Auditor");
  const isSecurityAdmin =
    roleLabel === "Change Manager" ||
    roleLabel === "Incident Commander" ||
    roleLabel === "Platform Engineer";

  const [tab, setTab] = useState<Tab>("users");
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [privileged, setPrivileged] = useState<PrivilegedGrant[]>([]);
  const [secrets, setSecrets] = useState<SecretRef[]>([]);
  const [zones, setZones] = useState<ExecutionZone[]>([]);
  const [commands, setCommands] = useState<CommandPolicy[]>([]);
  const [sessions, setSessions] = useState<PrivilegedSession[]>([]);
  const [breakglass, setBreakglass] = useState<BreakGlassRequest[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<IdentityStatus | "all">("all");

  const [detail, setDetail] = useState<Identity | null>(null);
  const [grantOpen, setGrantOpen] = useState<Identity | null>(null);
  const [grantDraft, setGrantDraft] = useState({ scope: "service:checkout-api/env:prod", reason: "", hours: "2" });
  const [bgOpen, setBgOpen] = useState(false);
  const [bgDraft, setBgDraft] = useState({ identityId: "", reason: "", hours: "2" });
  const [zoneOpen, setZoneOpen] = useState(false);
  const [zoneDraft, setZoneDraft] = useState({ name: "", env: "staging" as Env, cidr: "10.30.0.0/16", egress: "allowlist" as ExecutionZone["egressPolicy"], mfa: true, dual: false });
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdDraft, setCmdDraft] = useState({ name: "", targetType: "runbook" as CommandPolicy["targetType"], allow: "", deny: "", env: "prod" as Env | "all" });
  const [rotateOpen, setRotateOpen] = useState<SecretRef | null>(null);

  const audit = useCallback((action: string, target: string, detailStr?: string) => {
    const list = readList<AuditEvt>(AUD_KEY);
    writeList(AUD_KEY, [{ id: rid("AUD"), at: nowIso(), actor: roleLabel, action, target, detail: detailStr }, ...list].slice(0, 1000));
    const dom = readList<DomainEvt>(DOM_KEY);
    writeList(DOM_KEY, [{ id: rid("DEV"), at: nowIso(), kind: action, payload: { target, detail: detailStr } }, ...dom].slice(0, 1000));
  }, [roleLabel]);

  useEffect(() => {
    setIdentities(ensureSeed<Identity>(IDN_KEY, seedIdentities));
    setPrivileged(ensureSeed<PrivilegedGrant>(PG_KEY, seedPrivileged));
    setSecrets(ensureSeed<SecretRef>(SEC_KEY, seedSecretRefs));
    setZones(ensureSeed<ExecutionZone>(EZ_KEY, seedZones));
    setCommands(ensureSeed<CommandPolicy>(CP_KEY, seedCommandPolicies));
    setSessions(ensureSeed<PrivilegedSession>(SES_KEY, seedSessions));
    setBreakglass(ensureSeed<BreakGlassRequest>(BG_KEY, seedBreakGlass));
  }, []);

  // Scope all identities to the currently selected tenant so no cross-tenant
  // records ever surface. Seed data is Contoso-only; other tenants show an
  // empty registry until identities are provisioned for their profile.
  const tenantIdentities = useMemo(
    () => identities.filter((i) => i.tenantRef === ops.tenant.id),
    [identities, ops.tenant.id],
  );

  const filteredIdentities = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tenantIdentities.filter((i) => {
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (!q) return true;
      const hay = [i.id, i.displayName, i.role, i.type, ...i.serviceScope, ...i.envScope].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [tenantIdentities, search, statusFilter]);

  /* --------------------------- Mutations -------------------------------- */

  const setStatus = useCallback((id: string, status: IdentityStatus, action: string, note?: string) => {
    const next = identities.map((i) => i.id === id ? { ...i, status } : i);
    setIdentities(next); writeList(IDN_KEY, next);
    audit(action, id, note);
    ops.pushNotification({ kind: status === "Revoked" || status === "Session terminated" ? "warning" : "info",
      title: `Identity ${status.toLowerCase()}`, detail: `${id}${note ? ` — ${note}` : ""}`, entityRef: id, route: "/runops/security/execution" });
  }, [identities, audit, ops]);

  const assignRole = useCallback((id: string, role: string) => {
    if (!canWrite) return;
    const next = identities.map((i) => i.id === id ? { ...i, role } : i);
    setIdentities(next); writeList(IDN_KEY, next);
    audit("identity.role.assigned", id, role);
    // Cross-screen: notify Step Builder that permissions changed.
    const sp = readList<StepPermissionLite>(SP_KEY);
    writeList(SP_KEY, [{ id: rid("SP"), identityId: id, scopeRef: `role:${role}`, at: nowIso(), effect: "grant" }, ...sp].slice(0, 200));
  }, [identities, canWrite, audit]);

  const revoke = useCallback((id: string) => {
    if (!isSecurityAdmin) return;
    setStatus(id, "Revoked", "identity.revoked");
    // Cross-screen: pause affected executions.
    const paused = readList<PausedExecutionLite>(PE_KEY);
    writeList(PE_KEY, [{ id: rid("PE"), executionRef: `identity:${id}`, reason: "identity revoked", at: nowIso() }, ...paused].slice(0, 200));
    // And add a launch restriction.
    const lr = readList<LaunchRestrictionLite>(LR_KEY);
    writeList(LR_KEY, [{ id: rid("LR"), scopeRef: `identity:${id}`, reason: "identity revoked", issuedAt: nowIso(), expiresAt: null }, ...lr].slice(0, 200));
    // Revoke step permissions.
    const sp = readList<StepPermissionLite>(SP_KEY);
    writeList(SP_KEY, [{ id: rid("SP"), identityId: id, scopeRef: "*", at: nowIso(), effect: "revoke" }, ...sp].slice(0, 200));
  }, [isSecurityAdmin, setStatus]);

  const grantPrivileged = useCallback(() => {
    if (!grantOpen || !isSecurityAdmin) return;
    if (!grantDraft.reason.trim()) return;
    // SoD: approver ≠ requester (owner)
    if (grantOpen.ownerRef === roleLabel) {
      ops.pushNotification({ kind: "warning", title: "Blocked by SoD",
        detail: "Approver must not be the identity owner.", entityRef: grantOpen.id, route: "/runops/security/execution" });
      audit("privileged.blocked.sod", grantOpen.id, "owner=approver");
      return;
    }
    const hours = Math.max(1, Number(grantDraft.hours || "2"));
    const g: PrivilegedGrant = {
      id: rid("PG"), identityId: grantOpen.id, scopeRef: grantDraft.scope,
      reason: grantDraft.reason, requestedBy: grantOpen.ownerRef, approvedBy: roleLabel,
      state: "Active", issuedAt: nowIso(), expiresAt: inHours(hours), createdAt: nowIso(),
    };
    const next = [g, ...privileged]; setPrivileged(next); writeList(PG_KEY, next);
    audit("privileged.granted", g.id, `${g.scopeRef} · ${hours}h`);
    ops.pushNotification({ kind: "info", title: "Privileged access granted",
      detail: `${grantOpen.id} → ${g.scopeRef} for ${hours}h`, entityRef: g.id, route: "/runops/security/execution" });
    setGrantOpen(null); setGrantDraft({ scope: "service:checkout-api/env:prod", reason: "", hours: "2" });
  }, [grantOpen, grantDraft, privileged, isSecurityAdmin, roleLabel, audit, ops]);

  const revokePrivileged = useCallback((pg: PrivilegedGrant) => {
    if (!isSecurityAdmin) return;
    if (pg.state !== "Active") return;
    const next = privileged.map((x) => x.id === pg.id ? { ...x, state: "Revoked" as const } : x);
    setPrivileged(next); writeList(PG_KEY, next);
    audit("privileged.revoked", pg.id, pg.scopeRef);
    ops.pushNotification({ kind: "warning", title: "Privileged access revoked", detail: pg.id, entityRef: pg.id, route: "/runops/security/execution" });
    // Cross-screen pause.
    const paused = readList<PausedExecutionLite>(PE_KEY);
    writeList(PE_KEY, [{ id: rid("PE"), executionRef: `grant:${pg.id}`, reason: "privileged access revoked", at: nowIso() }, ...paused].slice(0, 200));
  }, [privileged, isSecurityAdmin, audit, ops]);

  const rotateSecret = useCallback((s: SecretRef) => {
    if (!isSecurityAdmin) return;
    // Simulated server-side rotation workflow: enter Rotating → Active. Values are never revealed.
    const rotating = secrets.map((x) => x.id === s.id ? { ...x, state: "Rotating" as const } : x);
    setSecrets(rotating); writeList(SEC_KEY, rotating);
    audit("secret.rotation.started", s.id, s.name);
    ops.pushNotification({ kind: "info", title: "Secret rotation started",
      detail: `${s.name} — server-side workflow`, entityRef: s.id, route: "/runops/security/execution" });
    // Simulate completion.
    setTimeout(() => {
      const done = readList<SecretRef>(SEC_KEY).map((x) => x.id === s.id
        ? { ...x, state: "Active" as const, lastRotatedAt: nowIso() }
        : x);
      setSecrets(done); writeList(SEC_KEY, done);
      audit("secret.rotation.completed", s.id, s.name);
      ops.pushNotification({ kind: "info", title: "Secret rotated",
        detail: `${s.name} rotated (server-side)`, entityRef: s.id, route: "/runops/security/execution" });
    }, 1200);
    setRotateOpen(null);
  }, [secrets, isSecurityAdmin, audit, ops]);

  const configureZone = useCallback(() => {
    if (!isSecurityAdmin) return;
    if (!zoneDraft.name.trim()) return;
    const z: ExecutionZone = {
      id: rid("EZ"), name: zoneDraft.name.trim(), env: zoneDraft.env,
      cidrAllowlist: [zoneDraft.cidr], egressPolicy: zoneDraft.egress,
      requireMfa: zoneDraft.mfa, requireDualApproval: zoneDraft.dual,
      active: true, createdAt: nowIso(),
    };
    const next = [z, ...zones]; setZones(next); writeList(EZ_KEY, next);
    audit("zone.configured", z.id, `${z.name}/${z.env}`);
    ops.pushNotification({ kind: "info", title: "Execution zone configured", detail: `${z.name}`, entityRef: z.id, route: "/runops/security/execution" });
    setZoneOpen(false);
  }, [zoneDraft, zones, isSecurityAdmin, audit, ops]);

  const configureCommandPolicy = useCallback(() => {
    if (!isSecurityAdmin) return;
    if (!cmdDraft.name.trim()) return;
    const allow = cmdDraft.allow.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    const deny  = cmdDraft.deny.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    const c: CommandPolicy = {
      id: rid("CP"), name: cmdDraft.name.trim(), targetType: cmdDraft.targetType,
      allowlist: allow, denylist: deny, env: cmdDraft.env, active: true, createdAt: nowIso(),
    };
    const next = [c, ...commands]; setCommands(next); writeList(CP_KEY, next);
    audit("command_policy.configured", c.id, c.name);
    if (c.targetType === "worker") {
      // Cross-screen: reflect worker tool grants.
      const wt = readList<WorkerToolGrantLite>(WT_KEY);
      const rows: WorkerToolGrantLite[] = [
        ...allow.map((t) => ({ id: rid("WT"), workerId: "*", toolRef: t, at: nowIso(), effect: "grant" as const })),
        ...deny.map ((t) => ({ id: rid("WT"), workerId: "*", toolRef: t, at: nowIso(), effect: "revoke" as const })),
      ];
      writeList(WT_KEY, [...rows, ...wt].slice(0, 500));
    }
    ops.pushNotification({ kind: "info", title: "Command policy configured", detail: c.name, entityRef: c.id, route: "/runops/security/execution" });
    setCmdOpen(false);
    setCmdDraft({ name: "", targetType: "runbook", allow: "", deny: "", env: "prod" });
  }, [cmdDraft, commands, isSecurityAdmin, audit, ops]);

  const terminateSession = useCallback((s: PrivilegedSession) => {
    if (!isSecurityAdmin) return;
    if (s.state !== "Active") return;
    const next = sessions.map((x) => x.id === s.id ? { ...x, state: "Session terminated" as const } : x);
    setSessions(next); writeList(SES_KEY, next);
    audit("session.terminated", s.id, s.scopeRef);
    ops.pushNotification({ kind: "warning", title: "Session terminated", detail: s.id, entityRef: s.id, route: "/runops/security/execution" });
    // Pause associated executions.
    const paused = readList<PausedExecutionLite>(PE_KEY);
    writeList(PE_KEY, [{ id: rid("PE"), executionRef: `session:${s.id}`, reason: "privileged session terminated", at: nowIso() }, ...paused].slice(0, 200));
  }, [sessions, isSecurityAdmin, audit, ops]);

  const requestBreakGlass = useCallback(() => {
    if (!canWrite) return;
    if (!bgDraft.reason.trim() || !bgDraft.identityId) return;
    const bg: BreakGlassRequest = {
      id: rid("BG"), identityId: bgDraft.identityId, reason: bgDraft.reason,
      requestedBy: roleLabel, approvedBy: null,
      state: "Access pending", expiresAt: null, createdAt: nowIso(),
    };
    const next = [bg, ...breakglass]; setBreakglass(next); writeList(BG_KEY, next);
    audit("breakglass.requested", bg.id, bg.reason);
    ops.pushNotification({ kind: "warning", title: "Break glass requested",
      detail: `${bg.id} for ${bg.identityId}`, entityRef: bg.id, route: "/runops/security/execution" });
    setBgOpen(false); setBgDraft({ identityId: "", reason: "", hours: "2" });
  }, [bgDraft, breakglass, canWrite, roleLabel, audit, ops]);

  const approveBreakGlass = useCallback((bg: BreakGlassRequest) => {
    if (!isSecurityAdmin) return;
    // SoD: requester ≠ approver
    if (bg.requestedBy === roleLabel) {
      ops.pushNotification({ kind: "warning", title: "Blocked by SoD",
        detail: "Approver must not be the requester.", entityRef: bg.id, route: "/runops/security/execution" });
      audit("breakglass.blocked.sod", bg.id, "requester=approver");
      return;
    }
    const hours = 2;
    const next = breakglass.map((x) => x.id === bg.id ? { ...x, state: "Active" as const, approvedBy: roleLabel, expiresAt: inHours(hours) } : x);
    setBreakglass(next); writeList(BG_KEY, next);
    // Mark identity as Break glass.
    setStatus(bg.identityId, "Break glass", "breakglass.approved", bg.id);
    // Governance/audit trail already covered; also cross-screen restriction (record).
    audit("breakglass.approved", bg.id, bg.identityId);
  }, [breakglass, isSecurityAdmin, roleLabel, setStatus, audit, ops]);

  /* --------------------------- Render ----------------------------------- */

  const summary = useMemo(() => ({
    total: identities.length,
    active: identities.filter((i) => i.status === "Active").length,
    pending: identities.filter((i) => i.status === "Access pending").length,
    expiring: identities.filter((i) => i.status === "Expiring").length,
    violations: identities.filter((i) => i.status === "Policy violation").length,
    activeBg: breakglass.filter((b) => b.state === "Active").length,
  }), [identities, breakglass]);

  return (
    <div className="space-y-6">
      <EntityHeader
        eyebrow="Governance"
        title="Identity, Secrets & Execution Security"
        subtitle="Least-privilege boundaries for who — and what — may perform operational actions. Human, workload, runner, and digital-worker identities kept separate."
        meta={
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">{summary.total} identities</Badge>
            <Badge variant="outline">{summary.active} active</Badge>
            <Badge variant="outline" className={cn(summary.pending > 0 && statusTone("Access pending"))}>{summary.pending} pending</Badge>
            <Badge variant="outline" className={cn(summary.expiring > 0 && statusTone("Expiring"))}>{summary.expiring} expiring</Badge>
            <Badge variant="outline" className={cn(summary.violations > 0 && statusTone("Policy violation"))}>{summary.violations} violations</Badge>
            <Badge variant="outline" className={cn(summary.activeBg > 0 && statusTone("Break glass"))}>{summary.activeBg} break-glass</Badge>
          </div>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setBgOpen(true)} disabled={!canWrite}>
              <ShieldAlert className="h-4 w-4 mr-1.5" /> Break glass
            </Button>
            <Button size="sm" variant="outline" onClick={() => setZoneOpen(true)} disabled={!isSecurityAdmin}>
              <Lock className="h-4 w-4 mr-1.5" /> Configure zone
            </Button>
            <Button size="sm" variant="outline" onClick={() => setCmdOpen(true)} disabled={!isSecurityAdmin}>
              <Terminal className="h-4 w-4 mr-1.5" /> Command policy
            </Button>
          </div>
        }
      />

      {!canWrite && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-3 text-sm text-amber-900 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> You have <strong className="mx-1">read-only</strong> access.
            Mutations are disabled and secret values are never rendered on this screen.
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="flex flex-wrap gap-1 h-auto">
          {(Object.keys(TAB_LABEL) as Tab[]).map((t) => (
            <TabsTrigger key={t} value={t} aria-label={`Switch to ${TAB_LABEL[t]} tab`}>{TAB_LABEL[t]}</TabsTrigger>
          ))}
        </TabsList>

        {/* Identity registries — filtered by type */}
        {(["users","service_accounts","workloads","workers"] as Tab[]).map((tabKey) => {
          const wanted: IdentityType =
            tabKey === "users" ? "human" :
            tabKey === "service_accounts" ? "service_account" :
            tabKey === "workloads" ? "workload" : "digital_worker";
          return (
            <TabsContent key={tabKey} value={tabKey} className="mt-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Input value={search} onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search identity, role, service…" aria-label="Search identities"
                      className="w-64" />
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as IdentityStatus | "all")}>
                      <SelectTrigger className="w-44" aria-label="Filter by status"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        {(["Active","Expiring","Revoked","Access pending","Policy violation","Break glass","Session terminated"] as IdentityStatus[]).map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-muted-foreground ml-auto">
                      Human, workload, runner, and digital-worker identities are kept separate.
                    </div>
                  </div>
                  <IdentityTable
                    rows={filteredIdentities.filter((i) => i.type === wanted)}
                    onOpen={setDetail}
                    onGrant={setGrantOpen}
                    onRevoke={revoke}
                    canWrite={canWrite}
                    isAdmin={isSecurityAdmin}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}

        {/* Roles */}
        <TabsContent value="roles" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="text-sm text-muted-foreground">
                Role assignments are enforced server-side by <code className="font-mono">runops_has_role</code>.
                Client-side controls only decide affordances.
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-2">Identity</th>
                      <th className="py-2 pr-2">Type</th>
                      <th className="py-2 pr-2">Role</th>
                      <th className="py-2 pr-2">Privilege</th>
                      <th className="py-2 pr-2">Approval</th>
                      <th className="py-2 pr-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {identities.map((i) => (
                      <tr key={i.id} className="border-t border-border">
                        <td className="py-2 pr-2 font-mono text-xs">{i.displayName}</td>
                        <td className="py-2 pr-2"><span className="inline-flex items-center gap-1">{typeIcon(i.type)}{i.type}</span></td>
                        <td className="py-2 pr-2">
                          <Select value={i.role} onValueChange={(v) => assignRole(i.id, v)} disabled={!canWrite}>
                            <SelectTrigger className="w-44" aria-label={`Assign role for ${i.displayName}`}><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {["SRE Engineer","Change Manager","Incident Commander","Platform Engineer","Service Owner","Runner","Workload","Digital Worker","Read Only User","Auditor"].map((r) => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-2 pr-2">{i.privilege}</td>
                        <td className="py-2 pr-2">{i.approvalRequirement}</td>
                        <td className="py-2 pr-2 text-right">
                          <Button size="sm" variant="ghost" onClick={() => setDetail(i)}>Open</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privileged Access */}
        <TabsContent value="privileged" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              {privileged.length === 0 && <div className="text-sm text-muted-foreground">No privileged grants.</div>}
              {privileged.map((g) => {
                const identity = identities.find((i) => i.id === g.identityId);
                return (
                  <div key={g.id} className="rounded-md border border-border p-3 text-sm space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium">{g.id} · {identity?.displayName ?? g.identityId}</div>
                      <Badge variant="outline" className={cn(
                        g.state === "Active" && statusTone("Active"),
                        g.state === "Access pending" && statusTone("Access pending"),
                        g.state === "Revoked" && statusTone("Revoked"),
                      )}>{g.state}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Scope: <span className="font-mono">{g.scopeRef}</span> ·
                      requested by {g.requestedBy}{g.approvedBy ? ` · approved by ${g.approvedBy}` : ""}
                      {g.expiresAt ? ` · expires ${new Date(g.expiresAt).toLocaleString()}` : ""}
                    </div>
                    <div className="text-xs">{g.reason}</div>
                    {g.state === "Active" && (
                      <div className="pt-1">
                        <Button size="sm" variant="outline" onClick={() => revokePrivileged(g)} disabled={!isSecurityAdmin}>
                          <Ban className="h-3.5 w-3.5 mr-1" /> Revoke
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Secret References */}
        <TabsContent value="secrets" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Lock className="h-3.5 w-3.5" /> Secret <strong>values</strong> are never shown. Only references,
                provider, scope, and rotation state.
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-2">Ref</th>
                      <th className="py-2 pr-2">Name</th>
                      <th className="py-2 pr-2">Provider</th>
                      <th className="py-2 pr-2">Scope</th>
                      <th className="py-2 pr-2">Bound identities</th>
                      <th className="py-2 pr-2">Last rotated</th>
                      <th className="py-2 pr-2">State</th>
                      <th className="py-2 pr-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {secrets.map((s) => {
                      const overdue = (Date.now() - new Date(s.lastRotatedAt).getTime()) > s.rotationEveryDays * 86400 * 1000;
                      return (
                        <tr key={s.id} className="border-t border-border">
                          <td className="py-2 pr-2 font-mono text-xs">{s.id}</td>
                          <td className="py-2 pr-2 font-mono">{s.name}</td>
                          <td className="py-2 pr-2">{s.provider}</td>
                          <td className="py-2 pr-2 font-mono text-xs">{s.scopeRef}</td>
                          <td className="py-2 pr-2 text-xs">{s.boundIdentityIds.join(", ")}</td>
                          <td className="py-2 pr-2 text-xs">
                            {new Date(s.lastRotatedAt).toLocaleDateString()}
                            {overdue && <span className="text-red-600 ml-1">(overdue)</span>}
                          </td>
                          <td className="py-2 pr-2">
                            <Badge variant="outline" className={cn(
                              s.state === "Active" && statusTone("Active"),
                              s.state === "Rotating" && statusTone("Expiring"),
                              s.state === "Compromised" && statusTone("Policy violation"),
                            )}>{s.state}</Badge>
                          </td>
                          <td className="py-2 pr-2 text-right">
                            <Button size="sm" variant="outline" onClick={() => setRotateOpen(s)}
                              disabled={!isSecurityAdmin || s.state === "Rotating"}>
                              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Rotate
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Execution Zones */}
        <TabsContent value="zones" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {zones.map((z) => (
              <Card key={z.id}>
                <CardContent className="p-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">{z.name}</div>
                    <Badge variant={z.active ? "default" : "outline"}>{z.active ? "Active" : "Inactive"}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{z.id} · env: {z.env}</div>
                  <div className="text-xs">CIDR: <span className="font-mono">{z.cidrAllowlist.join(", ")}</span></div>
                  <div className="text-xs">Egress: {z.egressPolicy}</div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline">{z.requireMfa ? "MFA required" : "MFA optional"}</Badge>
                    <Badge variant="outline">{z.requireDualApproval ? "Dual approval" : "Single approval"}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Command Policies */}
        <TabsContent value="commands" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {commands.map((c) => (
              <Card key={c.id}>
                <CardContent className="p-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">{c.name}</div>
                    <Badge variant={c.active ? "default" : "outline"}>{c.active ? "Active" : "Inactive"}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{c.id} · target: {c.targetType} · env: {c.env}</div>
                  <div className="text-xs">
                    <div className="font-medium">Allow</div>
                    <ul className="list-disc list-inside">
                      {c.allowlist.map((a) => <li key={a} className="font-mono">{a}</li>)}
                      {c.allowlist.length === 0 && <li className="text-muted-foreground">(none)</li>}
                    </ul>
                  </div>
                  <div className="text-xs">
                    <div className="font-medium">Deny</div>
                    <ul className="list-disc list-inside">
                      {c.denylist.map((a) => <li key={a} className="font-mono">{a}</li>)}
                      {c.denylist.length === 0 && <li className="text-muted-foreground">(none)</li>}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sessions */}
        <TabsContent value="sessions" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              {sessions.length === 0 && <div className="text-sm text-muted-foreground">No sessions recorded.</div>}
              {sessions.map((s) => {
                const identity = identities.find((i) => i.id === s.identityId);
                return (
                  <div key={s.id} className="rounded-md border border-border p-3 text-sm space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium">{s.id} · {identity?.displayName ?? s.identityId}</div>
                      <Badge variant="outline" className={cn(
                        s.state === "Active" && statusTone("Active"),
                        s.state === "Session terminated" && statusTone("Session terminated"),
                        s.state === "Expired" && statusTone("Revoked"),
                      )}>{s.state}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Scope: <span className="font-mono">{s.scopeRef}</span> ·
                      {new Date(s.startedAt).toLocaleString()} → {new Date(s.endsAt).toLocaleString()} ·
                      recording: <span className="font-mono">{s.recordingRef}</span>
                    </div>
                    {s.state === "Active" && (
                      <div className="pt-1 flex gap-2">
                        <Button size="sm" variant="outline"
                          onClick={() => { audit("session.reviewed", s.id, s.recordingRef);
                            ops.pushNotification({ kind: "info", title: "Session marked reviewed", detail: s.id, entityRef: s.id, route: "/runops/security/execution" }); }}
                          disabled={!canWrite}>
                          <BadgeCheck className="h-3.5 w-3.5 mr-1" /> Review
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => terminateSession(s)} disabled={!isSecurityAdmin}>
                          <XCircle className="h-3.5 w-3.5 mr-1" /> Terminate
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Break Glass */}
        <TabsContent value="breakglass" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <ShieldAlert className="h-3.5 w-3.5" /> Break-glass creates governance + audit events and is
                short-lived. Approver must not be the requester.
              </div>
              {breakglass.length === 0 && <div className="text-sm text-muted-foreground">No break-glass requests.</div>}
              {breakglass.map((b) => {
                const identity = identities.find((i) => i.id === b.identityId);
                return (
                  <div key={b.id} className="rounded-md border border-border p-3 text-sm space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium">{b.id} · {identity?.displayName ?? b.identityId}</div>
                      <Badge variant="outline" className={cn(
                        b.state === "Access pending" && statusTone("Access pending"),
                        b.state === "Active" && statusTone("Break glass"),
                        b.state === "Revoked" && statusTone("Revoked"),
                        b.state === "Expired" && statusTone("Revoked"),
                      )}>{b.state}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Requested by {b.requestedBy}{b.approvedBy ? ` · approved by ${b.approvedBy}` : ""}
                      {b.expiresAt ? ` · expires ${new Date(b.expiresAt).toLocaleString()}` : ""}
                    </div>
                    <div className="text-xs">{b.reason}</div>
                    {b.state === "Access pending" && (
                      <div className="pt-1">
                        <Button size="sm" onClick={() => approveBreakGlass(b)}
                          disabled={!isSecurityAdmin || b.requestedBy === roleLabel}
                          title={b.requestedBy === roleLabel ? "Separation of duties: approver must not be requester" : undefined}>
                          <BadgeCheck className="h-3.5 w-3.5 mr-1" /> Approve
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail drawer */}
      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{detail?.displayName}</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-2 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{detail.type}</Badge>
                <Badge variant="outline">{detail.role}</Badge>
                <Badge variant="outline" className={cn(statusTone(detail.status))}>{detail.status}</Badge>
                <Badge variant="outline" className={cn(riskTone(detail.risk))}>{detail.risk}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Tenant: <span className="font-mono">{detail.tenantRef}</span> · Owner: {detail.ownerRef} ·
                Approval: {detail.approvalRequirement}
              </div>
              <div className="text-xs">Service scope: <span className="font-mono">{detail.serviceScope.join(", ")}</span></div>
              <div className="text-xs">Environment scope: {detail.envScope.join(", ")}</div>
              <div className="text-xs">Privilege: {detail.privilege} · Credential lifetime:{" "}
                {detail.credentialLifetimeHours === null
                  ? <span className="text-red-600">long-lived (flagged)</span>
                  : `${detail.credentialLifetimeHours}h`}
              </div>
              <div className="text-xs">Last use: {detail.lastUseAt ? new Date(detail.lastUseAt).toLocaleString() : "never"}</div>
            </div>
          )}
          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" onClick={() => detail && setGrantOpen(detail)} disabled={!isSecurityAdmin || !detail}>
              <Clock className="h-4 w-4 mr-1.5" /> Grant time-limited access
            </Button>
            <Button variant="outline" onClick={() => detail && revoke(detail.id)} disabled={!isSecurityAdmin || !detail}>
              <Ban className="h-4 w-4 mr-1.5" /> Revoke
            </Button>
            <Button variant="ghost" onClick={() => setDetail(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grant privileged access */}
      <Dialog open={grantOpen !== null} onOpenChange={(o) => !o && setGrantOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Grant time-limited access</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="text-xs text-muted-foreground">Identity: <span className="font-mono">{grantOpen?.displayName}</span></div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Scope</label>
              <Input value={grantDraft.scope} onChange={(e) => setGrantDraft({ ...grantDraft, scope: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Reason (required)</label>
              <Textarea value={grantDraft.reason} onChange={(e) => setGrantDraft({ ...grantDraft, reason: e.target.value })} rows={3} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Duration (hours)</label>
              <Input type="number" min={1} max={72} value={grantDraft.hours} onChange={(e) => setGrantDraft({ ...grantDraft, hours: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setGrantOpen(null)}>Cancel</Button>
            <Button onClick={grantPrivileged} disabled={!grantDraft.reason.trim()}>Grant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Break glass request */}
      <Dialog open={bgOpen} onOpenChange={setBgOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request break-glass access</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="space-y-1">
              <label className="text-xs font-medium">Identity</label>
              <Select value={bgDraft.identityId} onValueChange={(v) => setBgDraft({ ...bgDraft, identityId: v })}>
                <SelectTrigger><SelectValue placeholder="Choose identity" /></SelectTrigger>
                <SelectContent>
                  {identities.filter((i) => i.type === "human").map((i) => (
                    <SelectItem key={i.id} value={i.id}>{i.displayName} ({i.id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Reason (required)</label>
              <Textarea value={bgDraft.reason} onChange={(e) => setBgDraft({ ...bgDraft, reason: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBgOpen(false)}>Cancel</Button>
            <Button onClick={requestBreakGlass} disabled={!bgDraft.identityId || !bgDraft.reason.trim()}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure zone */}
      <Dialog open={zoneOpen} onOpenChange={setZoneOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Configure execution zone</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="space-y-1">
              <label className="text-xs font-medium">Zone name</label>
              <Input value={zoneDraft.name} onChange={(e) => setZoneDraft({ ...zoneDraft, name: e.target.value })} placeholder="prod-runner-eu" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Environment</label>
                <Select value={zoneDraft.env} onValueChange={(v) => setZoneDraft({ ...zoneDraft, env: v as Env })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dev">dev</SelectItem>
                    <SelectItem value="staging">staging</SelectItem>
                    <SelectItem value="prod">prod</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Egress</label>
                <Select value={zoneDraft.egress} onValueChange={(v) => setZoneDraft({ ...zoneDraft, egress: v as ExecutionZone["egressPolicy"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deny_all">deny_all</SelectItem>
                    <SelectItem value="allowlist">allowlist</SelectItem>
                    <SelectItem value="unrestricted">unrestricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">CIDR allowlist</label>
              <Input value={zoneDraft.cidr} onChange={(e) => setZoneDraft({ ...zoneDraft, cidr: e.target.value })} />
            </div>
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={zoneDraft.mfa} onChange={(e) => setZoneDraft({ ...zoneDraft, mfa: e.target.checked })} /> Require MFA
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={zoneDraft.dual} onChange={(e) => setZoneDraft({ ...zoneDraft, dual: e.target.checked })} /> Dual approval
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setZoneOpen(false)}>Cancel</Button>
            <Button onClick={configureZone} disabled={!zoneDraft.name.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure command policy */}
      <Dialog open={cmdOpen} onOpenChange={setCmdOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Configure command policy</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="space-y-1">
              <label className="text-xs font-medium">Name</label>
              <Input value={cmdDraft.name} onChange={(e) => setCmdDraft({ ...cmdDraft, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Target type</label>
                <Select value={cmdDraft.targetType} onValueChange={(v) => setCmdDraft({ ...cmdDraft, targetType: v as CommandPolicy["targetType"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="runbook">runbook</SelectItem>
                    <SelectItem value="script">script</SelectItem>
                    <SelectItem value="tool">tool</SelectItem>
                    <SelectItem value="worker">worker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Environment</label>
                <Select value={cmdDraft.env} onValueChange={(v) => setCmdDraft({ ...cmdDraft, env: v as Env | "all" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">all</SelectItem>
                    <SelectItem value="dev">dev</SelectItem>
                    <SelectItem value="staging">staging</SelectItem>
                    <SelectItem value="prod">prod</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Allowlist (one per line)</label>
              <Textarea rows={3} value={cmdDraft.allow} onChange={(e) => setCmdDraft({ ...cmdDraft, allow: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Denylist (one per line)</label>
              <Textarea rows={3} value={cmdDraft.deny} onChange={(e) => setCmdDraft({ ...cmdDraft, deny: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCmdOpen(false)}>Cancel</Button>
            <Button onClick={configureCommandPolicy} disabled={!cmdDraft.name.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rotate secret confirm */}
      <Dialog open={rotateOpen !== null} onOpenChange={(o) => !o && setRotateOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rotate secret reference</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm">
            <div>Rotate <span className="font-mono">{rotateOpen?.name}</span>?</div>
            <div className="text-xs text-muted-foreground">
              This triggers a server-side rotation workflow. The secret value is never revealed to the client.
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRotateOpen(null)}>Cancel</Button>
            <Button onClick={() => rotateOpen && rotateSecret(rotateOpen)}>
              <RefreshCw className="h-4 w-4 mr-1.5" /> Rotate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* --------------------------- Sub-components ----------------------------- */

function IdentityTable(props: {
  rows: Identity[];
  onOpen: (i: Identity) => void;
  onGrant: (i: Identity) => void;
  onRevoke: (id: string) => void;
  canWrite: boolean;
  isAdmin: boolean;
}) {
  const { rows, onOpen, onGrant, onRevoke, isAdmin } = props;
  if (rows.length === 0) {
    return <div className="py-8 text-center text-sm text-muted-foreground">No identities match the filters.</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="py-2 pr-2">Identity</th>
            <th className="py-2 pr-2">Role</th>
            <th className="py-2 pr-2">Scope</th>
            <th className="py-2 pr-2">Privilege</th>
            <th className="py-2 pr-2">Lifetime</th>
            <th className="py-2 pr-2">Last use</th>
            <th className="py-2 pr-2">Risk</th>
            <th className="py-2 pr-2">Status</th>
            <th className="py-2 pr-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((i) => (
            <tr key={i.id} className="border-t border-border">
              <td className="py-2 pr-2">
                <div className="flex items-center gap-1.5">{typeIcon(i.type)}<span className="font-mono text-xs">{i.displayName}</span></div>
                <div className="text-[10px] text-muted-foreground font-mono">{i.id}</div>
              </td>
              <td className="py-2 pr-2 text-xs">{i.role}</td>
              <td className="py-2 pr-2 text-xs">
                <div>{i.serviceScope.join(", ")}</div>
                <div className="text-muted-foreground">{i.envScope.join(", ")}</div>
              </td>
              <td className="py-2 pr-2 text-xs">{i.privilege}</td>
              <td className="py-2 pr-2 text-xs">
                {i.credentialLifetimeHours === null
                  ? <span className="text-red-600">long-lived</span>
                  : `${i.credentialLifetimeHours}h`}
              </td>
              <td className="py-2 pr-2 text-xs">{i.lastUseAt ? new Date(i.lastUseAt).toLocaleString() : "never"}</td>
              <td className="py-2 pr-2"><Badge variant="outline" className={cn(riskTone(i.risk))}>{i.risk}</Badge></td>
              <td className="py-2 pr-2"><Badge variant="outline" className={cn(statusTone(i.status))}>{i.status}</Badge></td>
              <td className="py-2 pr-2 text-right">
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="ghost" onClick={() => onOpen(i)}>Open</Button>
                  <Button size="sm" variant="outline" onClick={() => onGrant(i)} disabled={!isAdmin}>
                    <PlusCircle className="h-3.5 w-3.5 mr-1" /> Grant
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onRevoke(i.id)}
                    disabled={!isAdmin || i.status === "Revoked"}>
                    <Ban className="h-3.5 w-3.5 mr-1" /> Revoke
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
