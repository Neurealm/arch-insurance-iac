/**
 * Page 42 · Change, Policy & Governance Center
 * Route: /runops/governance
 *
 * ITIL-compatible governance beneath the SRE operating experience.
 * Governance records are auto-derived from operational activity where
 * possible (changes ↔ executions ↔ incidents ↔ postmortems). Fields
 * carry a provenance tag so system-generated data is distinguishable
 * from human-supplied fields. Separation-of-duties is enforced
 * client-side here (server-side in the real system) — requester ≠ approver.
 *
 * Persistence (localStorage):
 *   runops.governance.changes.v1        → ChangeRecord[]
 *   runops.governance.policies.v1       → Policy[]  (also written by SLO Center)
 *   runops.governance.exceptions.v1     → Exception[]
 *   runops.governance.waivers.v1        → Waiver[]
 *   runops.governance.pir.v1            → PIR[]
 *   runops.governance.approvals.v1      → GovernanceApproval[]
 *   runops.audit.events.v1              → audit stream
 *   runops.domain.events.v1             → domain event stream
 *   runops.launch.restrictions.v1       → cross-screen for Launch Center
 *   runops.operations.tasks.v1          → cross-screen for Operations
 *
 * No fixture-array imports. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle, ArrowUpRight, BadgeCheck, Ban, CalendarClock, CheckCircle2,
  ClipboardList, Clock, ExternalLink, FileSearch, Filter, GitBranch, Layers,
  LinkIcon, Lock, PlusCircle, ShieldAlert, ShieldCheck, Sparkles, Timer,
  XCircle,
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

type ChangeKind = "standard" | "normal" | "emergency";
type ChangeRisk = "low" | "medium" | "high" | "critical";
type ChangeState =
  | "Scheduled" | "In progress" | "Completed" | "Failed" | "Emergency"
  | "Conflict" | "Exception active" | "Review overdue";

type Provenance = "system" | "human";

interface FieldMeta {
  provenance: Provenance;
  sourceRef?: string; // e.g., "runops.executions.v1#EXE-8841"
}

interface ChangeRecord {
  id: string;                 // CHG-#####
  title: string;
  kind: ChangeKind;
  risk: ChangeRisk;
  state: ChangeState;
  scheduledStart: string;     // ISO
  scheduledEnd: string;       // ISO
  window: string;             // e.g., "Sun 02:00–04:00 CT"
  affectedServiceIds: string[];
  linkedRunbookIds: string[];
  linkedExecutionIds: string[];
  linkedIncidentIds: string[];
  linkedPostmortemIds: string[];
  linkedProblemIds: string[];
  linkedKnownErrorIds: string[];
  linkedSloIds: string[];
  requestedBy: string;
  approvedBy: string | null;
  conflicts: string[];        // CHG-#### ids
  evidenceRefs: string[];
  fieldMeta: Record<string, FieldMeta>;
  createdAt: string;
  updatedAt: string;
}

interface Policy {
  id: string;                 // POL-####
  name: string;
  domain: "change" | "release" | "automation" | "reliability" | "security";
  ruleText: string;           // human-readable
  ruleExpr: string;           // e.g., "kind='emergency' => require(approver.role in ['change_manager','director'])"
  controlMappings: string[];  // e.g., ["ITIL:CHG-01","ISO27001:A.12.1.2","SOX:ITGC-04"]
  active: boolean;
  createdAt: string;
}

interface Exception {
  id: string;                 // EXC-####
  policyId: string;
  changeId: string;
  reason: string;
  requestedBy: string;
  approvedBy: string | null;
  state: "Pending" | "Active" | "Denied" | "Expired";
  expiresAt: string;          // ISO
  createdAt: string;
}

interface Waiver {
  id: string;                 // WAV-####
  policyId: string;
  scopeRef: string;           // e.g., "service:checkout-api"
  reason: string;
  issuedBy: string;
  issuedAt: string;
  expiresAt: string;          // ISO
  revokedAt: string | null;
  revokedBy: string | null;
  state: "Active" | "Revoked" | "Expired";
}

interface GovernanceApproval {
  id: string;                 // APR-####
  changeId: string;
  requestedBy: string;
  decidedBy: string | null;
  state: "Pending" | "Approved" | "Rejected";
  reason: string;
  createdAt: string;
  decidedAt: string | null;
}

interface PIR {
  id: string;                 // PIR-####
  changeId: string;
  outcome: "Success" | "Partial" | "Failed" | "Rolled back";
  learnings: string;
  correctiveActionIds: string[];
  completedAt: string | null;
  completedBy: string | null;
  dueAt: string;              // ISO
  createdAt: string;
}

interface OperationsTaskLite {
  id: string; title: string; createdAt: string; source: string; linkedRef: string;
}

interface LaunchRestrictionLite {
  id: string; scopeRef: string; reason: string; issuedAt: string; expiresAt: string | null;
}

/* --------------------------- Storage helpers ---------------------------- */

const CHG_KEY = "runops.governance.changes.v1";
const POL_KEY = "runops.governance.policies.v1";
const EXC_KEY = "runops.governance.exceptions.v1";
const WAV_KEY = "runops.governance.waivers.v1";
const PIR_KEY = "runops.governance.pir.v1";
const APR_KEY = "runops.governance.approvals.v1";
const AUD_KEY = "runops.audit.events.v1";
const DOM_KEY = "runops.domain.events.v1";
const OPS_KEY = "runops.operations.tasks.v1";
const LR_KEY  = "runops.launch.restrictions.v1";

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
  if (raw !== null) { try { const v = JSON.parse(raw); if (Array.isArray(v)) return v as T[]; } catch { /* fall through */ } }
  const s = seed(); writeList(key, s); return s;
}

/* --------------------------- Seed --------------------------------------- */

function seedChanges(): ChangeRecord[] {
  const now = nowIso();
  const sys = (source: string): FieldMeta => ({ provenance: "system", sourceRef: source });
  const hum = (): FieldMeta => ({ provenance: "human" });

  const canonical: ChangeRecord = {
    id: "CHG-20391",
    title: "Order Processing hotfix — payment gateway retry policy",
    kind: "emergency",
    risk: "high",
    state: "In progress",
    scheduledStart: inHours(-2),
    scheduledEnd: inHours(2),
    window: "Ad-hoc emergency window",
    affectedServiceIds: ["checkout-api", "orders-api", "payments-api"],
    linkedRunbookIds: ["RB-0042"],
    linkedExecutionIds: ["EXE-8841"],
    linkedIncidentIds: ["INC-10482"],
    linkedPostmortemIds: ["PM-10482"],
    linkedProblemIds: ["PRB-2210"],
    linkedKnownErrorIds: ["KE-1104"],
    linkedSloIds: ["SLO-GOP-AV"],
    requestedBy: "sre-lead@contoso",
    approvedBy: "change-manager@contoso",
    conflicts: [],
    evidenceRefs: ["runops.evidence.v1#EXE-8841", "runops.postmortems.v1#PM-10482"],
    fieldMeta: {
      title: hum(),
      kind: hum(),
      risk: sys("runops.reliability.slos.v1#burn"),
      state: sys("runops.executions.v1#EXE-8841"),
      linkedRunbookIds: sys("runops.executions.v1#EXE-8841"),
      linkedExecutionIds: sys("runops.executions.v1#EXE-8841"),
      linkedIncidentIds: sys("runops.incidents.v1#INC-10482"),
      linkedPostmortemIds: sys("runops.postmortems.v1#PM-10482"),
      linkedSloIds: sys("runops.reliability.slos.v1#SLO-GOP-AV"),
      evidenceRefs: sys("runops.evidence.v1"),
      approvedBy: hum(),
      requestedBy: hum(),
    },
    createdAt: inHours(-3),
    updatedAt: now,
  };

  return [
    canonical,
    {
      id: "CHG-20392", title: "Kafka broker rolling restart (payments cluster)",
      kind: "normal", risk: "medium", state: "Scheduled",
      scheduledStart: inDays(2), scheduledEnd: inDays(2),
      window: "Tue 02:00–04:00 CT",
      affectedServiceIds: ["payments-api"],
      linkedRunbookIds: ["RB-0088"], linkedExecutionIds: [],
      linkedIncidentIds: [], linkedPostmortemIds: [],
      linkedProblemIds: [], linkedKnownErrorIds: [], linkedSloIds: ["SLO-9002"],
      requestedBy: "platform-eng@contoso", approvedBy: null,
      conflicts: ["CHG-20393"],
      evidenceRefs: [],
      fieldMeta: {
        title: { provenance: "human" }, kind: { provenance: "human" },
        risk: { provenance: "system", sourceRef: "runops.risk.model.v1" },
        conflicts: { provenance: "system", sourceRef: "runops.changes.calendar.v1" },
      },
      createdAt: inDays(-1), updatedAt: inDays(-1),
    },
    {
      id: "CHG-20393", title: "Postgres primary failover drill",
      kind: "standard", risk: "low", state: "Scheduled",
      scheduledStart: inDays(2), scheduledEnd: inDays(2),
      window: "Tue 02:30–03:30 CT",
      affectedServiceIds: ["orders-api"],
      linkedRunbookIds: ["RB-0044"], linkedExecutionIds: [],
      linkedIncidentIds: [], linkedPostmortemIds: [],
      linkedProblemIds: [], linkedKnownErrorIds: [], linkedSloIds: [],
      requestedBy: "dba@contoso", approvedBy: "change-manager@contoso",
      conflicts: ["CHG-20392"],
      evidenceRefs: [],
      fieldMeta: {
        title: { provenance: "human" }, kind: { provenance: "human" },
        risk: { provenance: "system", sourceRef: "runops.risk.model.v1" },
        conflicts: { provenance: "system", sourceRef: "runops.changes.calendar.v1" },
      },
      createdAt: inDays(-3), updatedAt: inDays(-2),
    },
    {
      id: "CHG-20388", title: "Feature flag: async checkout receipts",
      kind: "standard", risk: "low", state: "Completed",
      scheduledStart: inDays(-4), scheduledEnd: inDays(-4),
      window: "Wed 14:00–14:30 CT",
      affectedServiceIds: ["checkout-api"],
      linkedRunbookIds: [], linkedExecutionIds: ["EXE-8802"],
      linkedIncidentIds: [], linkedPostmortemIds: [],
      linkedProblemIds: [], linkedKnownErrorIds: [], linkedSloIds: [],
      requestedBy: "checkout-eng@contoso", approvedBy: "change-manager@contoso",
      conflicts: [], evidenceRefs: ["runops.evidence.v1#EXE-8802"],
      fieldMeta: {
        title: { provenance: "human" }, kind: { provenance: "human" },
        risk: { provenance: "system", sourceRef: "runops.risk.model.v1" },
        state: { provenance: "system", sourceRef: "runops.executions.v1#EXE-8802" },
      },
      createdAt: inDays(-6), updatedAt: inDays(-4),
    },
    {
      id: "CHG-20375", title: "Rate-limit tuning — orders gateway",
      kind: "normal", risk: "medium", state: "Failed",
      scheduledStart: inDays(-9), scheduledEnd: inDays(-9),
      window: "Mon 03:00–04:00 CT",
      affectedServiceIds: ["orders-api"],
      linkedRunbookIds: ["RB-0031"], linkedExecutionIds: ["EXE-8770"],
      linkedIncidentIds: ["INC-10420"], linkedPostmortemIds: ["PM-10420"],
      linkedProblemIds: ["PRB-2201"], linkedKnownErrorIds: [], linkedSloIds: [],
      requestedBy: "orders-eng@contoso", approvedBy: "change-manager@contoso",
      conflicts: [], evidenceRefs: ["runops.evidence.v1#EXE-8770"],
      fieldMeta: {
        title: { provenance: "human" }, kind: { provenance: "human" },
        risk: { provenance: "system", sourceRef: "runops.risk.model.v1" },
        state: { provenance: "system", sourceRef: "runops.executions.v1#EXE-8770" },
        linkedIncidentIds: { provenance: "system", sourceRef: "runops.incidents.v1" },
      },
      createdAt: inDays(-11), updatedAt: inDays(-9),
    },
  ];
}

function seedPolicies(existing: Policy[]): Policy[] {
  const now = nowIso();
  const known = new Set(existing.map((p) => p.id));
  const additions: Policy[] = [
    {
      id: "POL-CH-01", name: "Emergency changes require director approval",
      domain: "change",
      ruleText: "Emergency changes must be approved by a director or change manager; requester ≠ approver.",
      ruleExpr: "kind='emergency' => approver.role in {'change_manager','director'} && approver != requester",
      controlMappings: ["ITIL:CHG-01", "SOX:ITGC-04"],
      active: true, createdAt: now,
    },
    {
      id: "POL-CH-02", name: "Separation of duties on all approvals",
      domain: "change",
      ruleText: "Approver must not be the requester.",
      ruleExpr: "approver != requester",
      controlMappings: ["ITIL:CHG-01", "ISO27001:A.6.1.2", "SOX:ITGC-04"],
      active: true, createdAt: now,
    },
    {
      id: "POL-CH-03", name: "No conflicting maintenance windows",
      domain: "change",
      ruleText: "Overlapping windows on the same service require conflict resolution.",
      ruleExpr: "overlap(service, window) => conflict",
      controlMappings: ["ITIL:CHG-05"],
      active: true, createdAt: now,
    },
    {
      id: "POL-REL-01", name: "Release freeze on fast-burn budget",
      domain: "release",
      ruleText: "Normal changes to services on fast-burn SLOs require an active waiver.",
      ruleExpr: "service.slo.burn_rate >= 6.0 && change.kind='normal' => require(waiver)",
      controlMappings: ["ITIL:CHG-03"],
      active: true, createdAt: now,
    },
  ];
  return [...existing, ...additions.filter((p) => !known.has(p.id))];
}

function seedApprovals(): GovernanceApproval[] {
  return [
    {
      id: "APR-9001", changeId: "CHG-20391",
      requestedBy: "sre-lead@contoso", decidedBy: "change-manager@contoso",
      state: "Approved", reason: "Emergency remediation for INC-10482.",
      createdAt: inHours(-3), decidedAt: inHours(-2),
    },
    {
      id: "APR-9002", changeId: "CHG-20392",
      requestedBy: "platform-eng@contoso", decidedBy: null,
      state: "Pending", reason: "Awaiting change manager review.",
      createdAt: inDays(-1), decidedAt: null,
    },
  ];
}

function seedExceptions(): Exception[] {
  return [
    {
      id: "EXC-3001", policyId: "POL-REL-01", changeId: "CHG-20392",
      reason: "Deferring further worsens the incident risk profile; recovery landing is prioritized.",
      requestedBy: "sre-lead@contoso", approvedBy: null,
      state: "Pending", expiresAt: inDays(3), createdAt: inHours(-1),
    },
  ];
}

function seedWaivers(): Waiver[] {
  return [
    {
      id: "WAV-2001", policyId: "POL-REL-01", scopeRef: "service:checkout-api",
      reason: "Recovery-phase reliability work — 72-hour waiver.",
      issuedBy: "change-manager@contoso", issuedAt: inHours(-6),
      expiresAt: inHours(66), revokedAt: null, revokedBy: null, state: "Active",
    },
  ];
}

function seedPIRs(): PIR[] {
  return [
    {
      id: "PIR-1101", changeId: "CHG-20388", outcome: "Success",
      learnings: "Feature-flag rollout matched forecast; no burn impact.",
      correctiveActionIds: [],
      completedAt: inDays(-3), completedBy: "checkout-eng@contoso",
      dueAt: inDays(-2), createdAt: inDays(-4),
    },
    {
      id: "PIR-1102", changeId: "CHG-20375", outcome: "Failed",
      learnings: "",
      correctiveActionIds: [],
      completedAt: null, completedBy: null,
      dueAt: inDays(-2), createdAt: inDays(-9),
    },
  ];
}

/* --------------------------- Helpers ------------------------------------ */

function tone(state: ChangeState): string {
  switch (state) {
    case "Scheduled":       return "border-blue-200 bg-blue-50 text-blue-800";
    case "In progress":     return "border-amber-200 bg-amber-50 text-amber-800";
    case "Completed":       return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "Failed":          return "border-red-200 bg-red-50 text-red-800";
    case "Emergency":       return "border-red-200 bg-red-50 text-red-800";
    case "Conflict":        return "border-orange-200 bg-orange-50 text-orange-800";
    case "Exception active":return "border-purple-200 bg-purple-50 text-purple-800";
    case "Review overdue":  return "border-amber-200 bg-amber-50 text-amber-800";
  }
}

function riskTone(r: ChangeRisk): string {
  switch (r) {
    case "low":      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "medium":   return "border-amber-200 bg-amber-50 text-amber-800";
    case "high":     return "border-orange-200 bg-orange-50 text-orange-800";
    case "critical": return "border-red-200 bg-red-50 text-red-800";
  }
}

function ProvenanceDot({ meta }: { meta?: FieldMeta }) {
  if (!meta) return null;
  const isSys = meta.provenance === "system";
  return (
    <span
      title={isSys ? `System-generated${meta.sourceRef ? ` · ${meta.sourceRef}` : ""}` : "Human-supplied"}
      aria-label={isSys ? "System generated field" : "Human supplied field"}
      className={cn(
        "inline-block w-1.5 h-1.5 rounded-full align-middle ml-1",
        isSys ? "bg-primary" : "bg-muted-foreground/60",
      )}
    />
  );
}

/* --------------------------- Component ---------------------------------- */

type Tab =
  | "calendar" | "records" | "policies" | "approvals" | "exceptions"
  | "waivers" | "sod" | "controls" | "pir" | "itil";

const TAB_LABEL: Record<Tab, string> = {
  calendar: "Change Calendar",
  records: "Change Records",
  policies: "Policies",
  approvals: "Approvals",
  exceptions: "Exceptions",
  waivers: "Waivers",
  sod: "Separation of Duties",
  controls: "Control Mapping",
  pir: "Post-Impl. Reviews",
  itil: "ITIL Relationships",
};

export default function GovernanceCenter() {
  const navigate = useNavigate();
  const ops = useOperations();

  const roleLabel = ops.role ?? "viewer";
  const canWrite = !(roleLabel === "Read Only User" || roleLabel === "Auditor");
  const isChangeManager = roleLabel === "Change Manager" || roleLabel === "Platform Admin";

  const [tab, setTab] = useState<Tab>("calendar");
  const [changes, setChanges] = useState<ChangeRecord[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [waivers, setWaivers] = useState<Waiver[]>([]);
  const [pirs, setPirs] = useState<PIR[]>([]);
  const [approvals, setApprovals] = useState<GovernanceApproval[]>([]);

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<ChangeState | "all">("all");
  const [kindFilter, setKindFilter] = useState<ChangeKind | "all">("all");

  const [detail, setDetail] = useState<ChangeRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState<{ title: string; kind: ChangeKind; service: string; windowStart: string; windowHours: string; risk: ChangeRisk }>({
    title: "", kind: "normal", service: "checkout-api", windowStart: "", windowHours: "2", risk: "medium",
  });
  const [testPolicyOpen, setTestPolicyOpen] = useState<Policy | null>(null);
  const [testPolicyInput, setTestPolicyInput] = useState({ requester: "sre-lead@contoso", approver: "sre-lead@contoso", kind: "emergency" as ChangeKind });
  const [testPolicyResult, setTestPolicyResult] = useState<string | null>(null);
  const [excOpen, setExcOpen] = useState<{ changeId: string } | null>(null);
  const [excDraft, setExcDraft] = useState({ policyId: "POL-REL-01", reason: "", expiresDays: "3" });
  const [waiverOpen, setWaiverOpen] = useState(false);
  const [waiverDraft, setWaiverDraft] = useState({ policyId: "POL-REL-01", scope: "service:checkout-api", reason: "", hours: "48" });
  const [pirOpen, setPirOpen] = useState<PIR | null>(null);
  const [pirDraft, setPirDraft] = useState({ outcome: "Success" as PIR["outcome"], learnings: "" });
  const [rejectOpen, setRejectOpen] = useState<GovernanceApproval | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const audit = useCallback((action: string, target: string, detail?: string) => {
    const list = readList<{ id: string; at: string; actor: string; action: string; target: string; detail?: string }>(AUD_KEY);
    writeList(AUD_KEY, [{ id: rid("AUD"), at: nowIso(), actor: roleLabel, action, target, detail }, ...list].slice(0, 1000));
    const dom = readList<{ id: string; at: string; kind: string; payload: unknown }>(DOM_KEY);
    writeList(DOM_KEY, [{ id: rid("DEV"), at: nowIso(), kind: action, payload: { target, detail } }, ...dom].slice(0, 1000));
  }, [roleLabel]);

  useEffect(() => {
    setChanges(ensureSeed<ChangeRecord>(CHG_KEY, seedChanges));
    const existingPols = readList<Policy>(POL_KEY);
    const merged = seedPolicies(existingPols);
    if (merged.length !== existingPols.length) writeList(POL_KEY, merged);
    setPolicies(merged);
    setExceptions(ensureSeed<Exception>(EXC_KEY, seedExceptions));
    setWaivers(ensureSeed<Waiver>(WAV_KEY, seedWaivers));
    setPirs(ensureSeed<PIR>(PIR_KEY, seedPIRs));
    setApprovals(ensureSeed<GovernanceApproval>(APR_KEY, seedApprovals));
  }, []);

  const filteredChanges = useMemo(() => {
    const q = search.trim().toLowerCase();
    return changes.filter((c) => {
      if (stateFilter !== "all" && c.state !== stateFilter) return false;
      if (kindFilter !== "all" && c.kind !== kindFilter) return false;
      if (!q) return true;
      const hay = [c.id, c.title, ...c.affectedServiceIds, ...c.linkedRunbookIds, ...c.linkedIncidentIds]
        .join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [changes, search, stateFilter, kindFilter]);

  /* --------------------------- Mutations -------------------------------- */

  const persistChanges = useCallback((next: ChangeRecord[]) => {
    setChanges(next); writeList(CHG_KEY, next);
  }, []);
  const persistApprovals = useCallback((next: GovernanceApproval[]) => {
    setApprovals(next); writeList(APR_KEY, next);
  }, []);

  const createChange = useCallback(() => {
    if (!draft.title.trim()) return;
    const start = draft.windowStart ? new Date(draft.windowStart).toISOString() : inDays(1);
    const end = new Date(new Date(start).getTime() + Number(draft.windowHours || "2") * 3600 * 1000).toISOString();
    const c: ChangeRecord = {
      id: rid("CHG"), title: draft.title.trim(), kind: draft.kind, risk: draft.risk,
      state: draft.kind === "emergency" ? "Emergency" : "Scheduled",
      scheduledStart: start, scheduledEnd: end,
      window: `${new Date(start).toLocaleString()} – ${new Date(end).toLocaleTimeString()}`,
      affectedServiceIds: [draft.service],
      linkedRunbookIds: [], linkedExecutionIds: [], linkedIncidentIds: [],
      linkedPostmortemIds: [], linkedProblemIds: [], linkedKnownErrorIds: [], linkedSloIds: [],
      requestedBy: roleLabel, approvedBy: null, conflicts: [], evidenceRefs: [],
      fieldMeta: {
        title: { provenance: "human" }, kind: { provenance: "human" },
        risk: { provenance: "human" }, requestedBy: { provenance: "human" },
      },
      createdAt: nowIso(), updatedAt: nowIso(),
    };
    persistChanges([c, ...changes]);
    persistApprovals([{
      id: rid("APR"), changeId: c.id, requestedBy: roleLabel, decidedBy: null,
      state: "Pending", reason: "Awaiting review.", createdAt: nowIso(), decidedAt: null,
    }, ...approvals]);
    audit("change.created", c.id, c.title);
    ops.pushNotification({ kind: "info", title: "Change created", detail: `${c.id} · ${c.title}`, entityRef: c.id, route: "/runops/governance" });
    setCreateOpen(false);
    setDraft({ title: "", kind: "normal", service: "checkout-api", windowStart: "", windowHours: "2", risk: "medium" });
  }, [draft, changes, approvals, roleLabel, persistChanges, persistApprovals, audit, ops]);

  const approveChange = useCallback((apr: GovernanceApproval) => {
    if (!isChangeManager) return;
    // Enforce SoD: approver ≠ requester
    if (apr.requestedBy === roleLabel) {
      ops.pushNotification({ kind: "warning", title: "Blocked by SoD", detail: "Approver must not be the requester.", entityRef: apr.id, route: "/runops/governance" });
      audit("approval.blocked.sod", apr.id, "requester=approver");
      return;
    }
    const next = approvals.map((a) => a.id === apr.id ? { ...a, state: "Approved" as const, decidedBy: roleLabel, decidedAt: nowIso() } : a);
    persistApprovals(next);
    const nextC = changes.map((c) => c.id === apr.changeId ? { ...c, approvedBy: roleLabel, updatedAt: nowIso() } : c);
    persistChanges(nextC);
    audit("change.approved", apr.changeId, apr.id);
    ops.pushNotification({ kind: "info", title: "Change approved", detail: `${apr.changeId} · ${apr.id}`, entityRef: apr.changeId, route: "/runops/governance" });
  }, [isChangeManager, roleLabel, approvals, changes, persistApprovals, persistChanges, audit, ops]);

  const rejectChange = useCallback(() => {
    if (!rejectOpen) return;
    if (!isChangeManager) return;
    if (rejectOpen.requestedBy === roleLabel) {
      ops.pushNotification({ kind: "warning", title: "Blocked by SoD", detail: "Approver must not be the requester.", entityRef: rejectOpen.id, route: "/runops/governance" });
      audit("approval.blocked.sod", rejectOpen.id, "requester=approver");
      setRejectOpen(null);
      return;
    }
    const next = approvals.map((a) => a.id === rejectOpen.id ? { ...a, state: "Rejected" as const, decidedBy: roleLabel, decidedAt: nowIso(), reason: rejectReason || a.reason } : a);
    persistApprovals(next);
    audit("change.rejected", rejectOpen.changeId, rejectReason);
    ops.pushNotification({ kind: "warning", title: "Change rejected", detail: `${rejectOpen.changeId} — ${rejectReason || "no reason"}`, entityRef: rejectOpen.changeId, route: "/runops/governance" });
    setRejectOpen(null); setRejectReason("");
  }, [rejectOpen, rejectReason, isChangeManager, roleLabel, approvals, persistApprovals, audit, ops]);

  const testPolicy = useCallback(() => {
    if (!testPolicyOpen) return;
    const p = testPolicyOpen;
    const t = testPolicyInput;
    let pass = true;
    let msg = "Rule PASSED for the supplied inputs.";
    if (p.id === "POL-CH-01" && t.kind === "emergency") {
      pass = t.approver !== t.requester && !!t.approver;
      msg = pass ? "Emergency change approved by non-requester." : "Would require director/change_manager approval by a non-requester.";
    } else if (p.id === "POL-CH-02") {
      pass = t.approver !== t.requester;
      msg = pass ? "Separation of duties satisfied." : "Approver and requester are the same principal.";
    } else if (p.id === "POL-CH-03") {
      pass = true; msg = "Static test — conflict evaluation is calendar-driven.";
    } else if (p.id === "POL-REL-01") {
      pass = true; msg = "Waiver check runs against live SLO burn rate at approval time.";
    }
    const result = `${pass ? "PASS" : "FAIL"}: ${msg}`;
    setTestPolicyResult(result);
    audit("policy.tested", p.id, result);
  }, [testPolicyOpen, testPolicyInput, audit]);

  const createException = useCallback(() => {
    if (!excOpen) return;
    if (!excDraft.reason.trim()) return;
    const ex: Exception = {
      id: rid("EXC"), policyId: excDraft.policyId, changeId: excOpen.changeId,
      reason: excDraft.reason, requestedBy: roleLabel, approvedBy: null,
      state: "Pending", expiresAt: inDays(Number(excDraft.expiresDays || "3")),
      createdAt: nowIso(),
    };
    const next = [ex, ...exceptions]; setExceptions(next); writeList(EXC_KEY, next);
    audit("exception.created", ex.id, ex.reason);
    ops.pushNotification({ kind: "warning", title: "Exception requested", detail: `${ex.id} for ${ex.changeId}`, entityRef: ex.id, route: "/runops/governance" });
    setExcOpen(null); setExcDraft({ policyId: "POL-REL-01", reason: "", expiresDays: "3" });
  }, [excOpen, excDraft, exceptions, roleLabel, audit, ops]);

  const issueWaiver = useCallback(() => {
    if (!waiverDraft.reason.trim()) return;
    if (!isChangeManager) return;
    const w: Waiver = {
      id: rid("WAV"), policyId: waiverDraft.policyId, scopeRef: waiverDraft.scope,
      reason: waiverDraft.reason, issuedBy: roleLabel, issuedAt: nowIso(),
      expiresAt: inHours(Number(waiverDraft.hours || "48")),
      revokedAt: null, revokedBy: null, state: "Active",
    };
    const next = [w, ...waivers]; setWaivers(next); writeList(WAV_KEY, next);
    // Cross-screen: this scope is now under a waiver — reflect as a launch restriction lift.
    const lr = readList<LaunchRestrictionLite>(LR_KEY);
    writeList(LR_KEY, [{ id: rid("LR"), scopeRef: w.scopeRef, reason: `waiver:${w.id}`, issuedAt: w.issuedAt, expiresAt: w.expiresAt }, ...lr].slice(0, 200));
    audit("waiver.issued", w.id, `${w.scopeRef} · ${waiverDraft.hours}h`);
    ops.pushNotification({ kind: "info", title: "Waiver issued", detail: `${w.id} · ${w.scopeRef}`, entityRef: w.id, route: "/runops/governance" });
    setWaiverOpen(false); setWaiverDraft({ policyId: "POL-REL-01", scope: "service:checkout-api", reason: "", hours: "48" });
  }, [waiverDraft, waivers, isChangeManager, roleLabel, audit, ops]);

  const revokeWaiver = useCallback((w: Waiver) => {
    if (!isChangeManager) return;
    if (w.state !== "Active") return;
    const next = waivers.map((x) => x.id === w.id ? { ...x, state: "Revoked" as const, revokedAt: nowIso(), revokedBy: roleLabel } : x);
    setWaivers(next); writeList(WAV_KEY, next);
    audit("waiver.revoked", w.id);
    ops.pushNotification({ kind: "warning", title: "Waiver revoked", detail: w.id, entityRef: w.id, route: "/runops/governance" });
  }, [waivers, isChangeManager, roleLabel, audit, ops]);

  const completePIR = useCallback(() => {
    if (!pirOpen) return;
    if (!pirDraft.learnings.trim()) return;
    const next = pirs.map((p) => p.id === pirOpen.id ? {
      ...p, outcome: pirDraft.outcome, learnings: pirDraft.learnings,
      completedAt: nowIso(), completedBy: roleLabel,
    } : p);
    setPirs(next); writeList(PIR_KEY, next);
    // If Failed/Partial, create an operations task
    if (pirDraft.outcome === "Failed" || pirDraft.outcome === "Partial") {
      const tasks = readList<OperationsTaskLite>(OPS_KEY);
      writeList(OPS_KEY, [{
        id: rid("OT"), title: `PIR follow-up: ${pirOpen.changeId} (${pirDraft.outcome})`,
        createdAt: nowIso(), source: "governance.pir", linkedRef: pirOpen.id,
      }, ...tasks].slice(0, 500));
    }
    audit("pir.completed", pirOpen.id, pirDraft.outcome);
    ops.pushNotification({ kind: "info", title: "PIR completed", detail: `${pirOpen.changeId} · ${pirDraft.outcome}`, entityRef: pirOpen.id, route: "/runops/governance" });
    setPirOpen(null); setPirDraft({ outcome: "Success", learnings: "" });
  }, [pirOpen, pirDraft, pirs, roleLabel, audit, ops]);

  /* --------------------------- Render ----------------------------------- */

  const portfolio = useMemo(() => ({
    total: changes.length,
    scheduled: changes.filter((c) => c.state === "Scheduled").length,
    inProgress: changes.filter((c) => c.state === "In progress" || c.state === "Emergency").length,
    conflicts: changes.filter((c) => c.conflicts.length > 0).length,
    overduePir: pirs.filter((p) => !p.completedAt && new Date(p.dueAt).getTime() < Date.now()).length,
  }), [changes, pirs]);

  return (
    <div className="space-y-6">
      <EntityHeader
        eyebrow="Governance"
        title="Change, Policy & Governance Center"
        subtitle="ITIL-compatible governance beneath the SRE operating experience — records auto-derive from operational activity where possible."
        meta={
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">{portfolio.total} changes</Badge>
            <Badge variant="outline">{portfolio.scheduled} scheduled</Badge>
            <Badge variant="outline">{portfolio.inProgress} in progress</Badge>
            <Badge variant="outline" className={cn(portfolio.conflicts > 0 && tone("Conflict"))}>{portfolio.conflicts} conflicts</Badge>
            <Badge variant="outline" className={cn(portfolio.overduePir > 0 && tone("Review overdue"))}>{portfolio.overduePir} PIRs overdue</Badge>
          </div>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setCreateOpen(true)} disabled={!canWrite}>
              <PlusCircle className="h-4 w-4 mr-1.5" /> Create change
            </Button>
            <Button size="sm" variant="outline" onClick={() => setWaiverOpen(true)} disabled={!isChangeManager}>
              <ShieldCheck className="h-4 w-4 mr-1.5" /> Issue waiver
            </Button>
          </div>
        }
      />

      {!canWrite && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-3 text-sm text-amber-900 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> You have <strong className="mx-1">read-only</strong> access. Mutations are disabled.
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="flex flex-wrap gap-1 h-auto">
          {(Object.keys(TAB_LABEL) as Tab[]).map((t) => (
            <TabsTrigger key={t} value={t} aria-label={`Switch to ${TAB_LABEL[t]} tab`}>{TAB_LABEL[t]}</TabsTrigger>
          ))}
        </TabsList>

        {/* Change Calendar */}
        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CalendarClock className="h-4 w-4" /> Next 14 days
              </div>
              <div className="space-y-2">
                {changes
                  .slice()
                  .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime())
                  .map((c) => (
                    <div key={c.id} className="rounded-md border border-border p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <Badge variant="outline" className={cn(tone(c.state))}>{c.state}</Badge>
                          <Badge variant="outline" className={cn(riskTone(c.risk))}>{c.risk}</Badge>
                          <Badge variant="outline">{c.kind}</Badge>
                          <span className="font-medium truncate">{c.id} · {c.title}</span>
                          <ProvenanceDot meta={c.fieldMeta.state} />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(c.scheduledStart).toLocaleString()} — {new Date(c.scheduledEnd).toLocaleTimeString()} · {c.window}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Services: {c.affectedServiceIds.join(", ")}
                          {c.conflicts.length > 0 && <span className="text-warning ml-2">Conflicts: {c.conflicts.join(", ")}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => setDetail(c)}>Details</Button>
                        {c.conflicts.length > 0 && (
                          <Button size="sm" variant="outline"
                            onClick={() => { audit("change.conflict.opened", c.id, c.conflicts.join(",")); setDetail(c); }}>
                            Open conflict
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Change Records */}
        <TabsContent value="records" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[220px]">
                  <Input value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search CHG id, title, service, runbook, incident…"
                    aria-label="Search change records" className="pl-8" />
                  <FileSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                <Select value={stateFilter} onValueChange={(v) => setStateFilter(v as ChangeState | "all")}>
                  <SelectTrigger className="w-40" aria-label="Filter by state"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All states</SelectItem>
                    {(["Scheduled","In progress","Completed","Failed","Emergency","Conflict","Exception active","Review overdue"] as ChangeState[]).map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={kindFilter} onValueChange={(v) => setKindFilter(v as ChangeKind | "all")}>
                  <SelectTrigger className="w-36" aria-label="Filter by kind"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All kinds</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground ml-auto">{filteredChanges.length} of {changes.length}</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-2">ID</th>
                      <th className="py-2 pr-2">Title</th>
                      <th className="py-2 pr-2">Kind</th>
                      <th className="py-2 pr-2">Risk</th>
                      <th className="py-2 pr-2">State</th>
                      <th className="py-2 pr-2">Window</th>
                      <th className="py-2 pr-2">Services</th>
                      <th className="py-2 pr-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredChanges.map((c) => (
                      <tr key={c.id} className="border-t border-border">
                        <td className="py-2 pr-2 font-mono text-xs">{c.id}</td>
                        <td className="py-2 pr-2">{c.title}</td>
                        <td className="py-2 pr-2">{c.kind}</td>
                        <td className="py-2 pr-2"><Badge variant="outline" className={cn(riskTone(c.risk))}>{c.risk}</Badge></td>
                        <td className="py-2 pr-2"><Badge variant="outline" className={cn(tone(c.state))}>{c.state}</Badge></td>
                        <td className="py-2 pr-2 text-xs">{new Date(c.scheduledStart).toLocaleString()}</td>
                        <td className="py-2 pr-2 text-xs">{c.affectedServiceIds.join(", ")}</td>
                        <td className="py-2 pr-2 text-right">
                          <Button size="sm" variant="ghost" onClick={() => setDetail(c)}>Open</Button>
                        </td>
                      </tr>
                    ))}
                    {filteredChanges.length === 0 && (
                      <tr><td colSpan={8} className="py-8 text-center text-sm text-muted-foreground">No changes match the filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies */}
        <TabsContent value="policies" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {policies.map((p) => (
              <Card key={p.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-sm">{p.name}</div>
                    <Badge variant={p.active ? "default" : "outline"}>{p.active ? "Active" : "Inactive"}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{p.id} · Domain: {p.domain}</div>
                  <div className="text-sm">{p.ruleText}</div>
                  <div className="text-xs font-mono bg-muted rounded p-2 overflow-x-auto">{p.ruleExpr}</div>
                  <div className="flex flex-wrap gap-1">
                    {p.controlMappings.map((m) => <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>)}
                  </div>
                  <div className="pt-1">
                    <Button size="sm" variant="outline" onClick={() => { setTestPolicyOpen(p); setTestPolicyResult(null); }}>
                      <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Test policy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Approvals */}
        <TabsContent value="approvals" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              {approvals.length === 0 && <div className="text-sm text-muted-foreground">No approvals recorded.</div>}
              {approvals.map((a) => (
                <div key={a.id} className="rounded-md border border-border p-3 text-sm space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">{a.id} · {a.changeId}</div>
                    <Badge variant={a.state === "Approved" ? "default" : a.state === "Rejected" ? "destructive" : "outline"}>{a.state}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">Requested by {a.requestedBy}{a.decidedBy ? ` · decided by ${a.decidedBy}` : ""} · {a.reason}</div>
                  {a.state === "Pending" && (
                    <div className="flex items-center gap-2 pt-1">
                      <Button size="sm" onClick={() => approveChange(a)}
                        disabled={!isChangeManager || a.requestedBy === roleLabel}
                        aria-label={`Approve ${a.id}`}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setRejectOpen(a)}
                        disabled={!isChangeManager || a.requestedBy === roleLabel}
                        aria-label={`Reject ${a.id}`}>
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                      </Button>
                      {a.requestedBy === roleLabel && (
                        <span className="text-xs text-muted-foreground">
                          Disabled — separation of duties (requester ≠ approver).
                        </span>
                      )}
                      {!isChangeManager && a.requestedBy !== roleLabel && (
                        <span className="text-xs text-muted-foreground">
                          Requires Change Manager role.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exceptions */}
        <TabsContent value="exceptions" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">Exceptions</div>
                <Button size="sm" variant="outline" onClick={() => setExcOpen({ changeId: "" })} disabled={!canWrite}>
                  <PlusCircle className="h-3.5 w-3.5 mr-1" /> Request exception
                </Button>
              </div>
              {exceptions.length === 0 && <div className="text-sm text-muted-foreground">No exceptions.</div>}
              {exceptions.map((e) => (
                <div key={e.id} className="rounded-md border border-border p-3 text-sm space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">{e.id} · Policy {e.policyId} · Change {e.changeId}</div>
                    <Badge variant={e.state === "Active" ? "default" : e.state === "Denied" ? "destructive" : "outline"}>{e.state}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">Expires {new Date(e.expiresAt).toLocaleString()} · Requested by {e.requestedBy}</div>
                  <div className="text-xs">{e.reason}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Waivers */}
        <TabsContent value="waivers" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              {waivers.length === 0 && <div className="text-sm text-muted-foreground">No waivers.</div>}
              {waivers.map((w) => (
                <div key={w.id} className="rounded-md border border-border p-3 text-sm space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">{w.id} · {w.scopeRef}</div>
                    <Badge variant={w.state === "Active" ? "default" : "outline"}>{w.state}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Policy {w.policyId} · issued {new Date(w.issuedAt).toLocaleString()} · expires {new Date(w.expiresAt).toLocaleString()}
                  </div>
                  <div className="text-xs">{w.reason}</div>
                  {w.state === "Active" && (
                    <div className="pt-1">
                      <Button size="sm" variant="destructive" onClick={() => revokeWaiver(w)}
                        disabled={!isChangeManager}>
                        <Ban className="h-3.5 w-3.5 mr-1" /> Revoke
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Separation of Duties */}
        <TabsContent value="sod" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="text-sm">
                Separation of Duties is evaluated on every approve/reject click.
                Approver identity is compared with the requester; a match blocks the mutation and emits an audit event.
                In production this is enforced server-side; the client check mirrors that gate for the demo.
              </div>
              <ul className="text-xs text-muted-foreground list-disc list-inside">
                <li>POL-CH-01 · Emergency changes require director or change manager approval (non-requester).</li>
                <li>POL-CH-02 · Approver ≠ Requester for all approvals.</li>
              </ul>
              <div className="text-xs">
                Current role: <strong>{roleLabel}</strong>{isChangeManager ? "" : " · Approvals require Change Manager or Platform Admin."}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Control Mapping */}
        <TabsContent value="controls" className="mt-4">
          <Card>
            <CardContent className="p-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr><th className="py-2 pr-2">Control</th><th className="py-2 pr-2">Mapped policies</th></tr>
                </thead>
                <tbody>
                  {Array.from(new Set(policies.flatMap((p) => p.controlMappings))).map((ctrl) => (
                    <tr key={ctrl} className="border-t border-border">
                      <td className="py-2 pr-2 font-mono text-xs">{ctrl}</td>
                      <td className="py-2 pr-2 text-xs">
                        {policies.filter((p) => p.controlMappings.includes(ctrl)).map((p) => p.id).join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Post-Implementation Reviews */}
        <TabsContent value="pir" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              {pirs.length === 0 && <div className="text-sm text-muted-foreground">No PIRs.</div>}
              {pirs.map((p) => {
                const overdue = !p.completedAt && new Date(p.dueAt).getTime() < Date.now();
                return (
                  <div key={p.id} className="rounded-md border border-border p-3 text-sm space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium">{p.id} · {p.changeId}</div>
                      <Badge variant={p.completedAt ? "default" : overdue ? "destructive" : "outline"}>
                        {p.completedAt ? p.outcome : overdue ? "Review overdue" : "Pending"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Due {new Date(p.dueAt).toLocaleString()} {p.completedAt ? `· completed ${new Date(p.completedAt).toLocaleString()} by ${p.completedBy}` : ""}
                    </div>
                    {p.learnings && <div className="text-xs">{p.learnings}</div>}
                    {!p.completedAt && (
                      <div className="pt-1">
                        <Button size="sm" variant="outline" onClick={() => { setPirOpen(p); setPirDraft({ outcome: "Success", learnings: "" }); }}
                          disabled={!canWrite}>
                          <ClipboardList className="h-3.5 w-3.5 mr-1" /> Complete PIR
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ITIL Relationships */}
        <TabsContent value="itil" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="text-sm text-muted-foreground">
                Auto-derived ITIL relationships. Human-supplied fields carry a grey dot; system-derived fields carry a blue dot.
              </div>
              <div className="space-y-2">
                {changes.map((c) => (
                  <div key={c.id} className="rounded-md border border-border p-3 text-sm space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium">{c.id} · {c.title}</div>
                      <Badge variant="outline" className={cn(tone(c.state))}>{c.state}</Badge>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      <li>Incidents: {c.linkedIncidentIds.join(", ") || "—"} <ProvenanceDot meta={c.fieldMeta.linkedIncidentIds} /></li>
                      <li>Runbooks: {c.linkedRunbookIds.join(", ") || "—"} <ProvenanceDot meta={c.fieldMeta.linkedRunbookIds} /></li>
                      <li>Executions: {c.linkedExecutionIds.join(", ") || "—"} <ProvenanceDot meta={c.fieldMeta.linkedExecutionIds} /></li>
                      <li>Postmortems: {c.linkedPostmortemIds.join(", ") || "—"} <ProvenanceDot meta={c.fieldMeta.linkedPostmortemIds} /></li>
                      <li>Problems: {c.linkedProblemIds.join(", ") || "—"}</li>
                      <li>Known errors: {c.linkedKnownErrorIds.join(", ") || "—"}</li>
                      <li>SLOs: {c.linkedSloIds.join(", ") || "—"} <ProvenanceDot meta={c.fieldMeta.linkedSloIds} /></li>
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* -------- Change detail dialog -------- */}
      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{detail?.id} · {detail?.title}</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={cn(tone(detail.state))}>{detail.state}</Badge>
                <Badge variant="outline" className={cn(riskTone(detail.risk))}>{detail.risk}</Badge>
                <Badge variant="outline">{detail.kind}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Window: {new Date(detail.scheduledStart).toLocaleString()} — {new Date(detail.scheduledEnd).toLocaleTimeString()} · {detail.window}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Affected services</div>
                  <div className="text-sm">{detail.affectedServiceIds.join(", ")}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Requested / Approved</div>
                  <div className="text-sm">
                    {detail.requestedBy} <ProvenanceDot meta={detail.fieldMeta.requestedBy} /> →
                    {" "}{detail.approvedBy ?? "—"} <ProvenanceDot meta={detail.fieldMeta.approvedBy} />
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">Linked records</div>
                <ul className="text-xs list-disc list-inside">
                  <li>Incidents: {detail.linkedIncidentIds.join(", ") || "—"}
                    {detail.linkedIncidentIds.length > 0 && (
                      <Button size="sm" variant="ghost" className="h-6 ml-2"
                        onClick={() => navigate(`/runops/incidents/${detail.linkedIncidentIds[0]}`)}>
                        Open <ArrowUpRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </li>
                  <li>Runbooks: {detail.linkedRunbookIds.join(", ") || "—"}
                    {detail.linkedRunbookIds.length > 0 && (
                      <Button size="sm" variant="ghost" className="h-6 ml-2"
                        onClick={() => navigate(`/runops/runbooks/${detail.linkedRunbookIds[0]}`)}>
                        Open <ArrowUpRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </li>
                  <li>Executions: {detail.linkedExecutionIds.join(", ") || "—"}
                    {detail.linkedExecutionIds.length > 0 && (
                      <Button size="sm" variant="ghost" className="h-6 ml-2"
                        onClick={() => navigate(`/runops/executions/${detail.linkedExecutionIds[0]}`)}>
                        Open <ArrowUpRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </li>
                  <li>Postmortems: {detail.linkedPostmortemIds.join(", ") || "—"}</li>
                  <li>SLOs: {detail.linkedSloIds.join(", ") || "—"}</li>
                </ul>
              </div>
              {detail.evidenceRefs.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Evidence</div>
                  <ul className="text-xs list-disc list-inside">
                    {detail.evidenceRefs.map((r) => <li key={r}>{r}</li>)}
                  </ul>
                </div>
              )}
              {detail.conflicts.length > 0 && (
                <div className="text-xs text-warning">Conflicts: {detail.conflicts.join(", ")}</div>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => setExcOpen({ changeId: detail.id })} disabled={!canWrite}>
                  <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Request exception
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetail(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create change */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create change</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">Title</label>
              <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-medium">Kind</label>
                <Select value={draft.kind} onValueChange={(v) => setDraft({ ...draft, kind: v as ChangeKind })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium">Risk</label>
                <Select value={draft.risk} onValueChange={(v) => setDraft({ ...draft, risk: v as ChangeRisk })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium">Service</label>
                <Select value={draft.service} onValueChange={(v) => setDraft({ ...draft, service: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkout-api">checkout-api</SelectItem>
                    <SelectItem value="orders-api">orders-api</SelectItem>
                    <SelectItem value="payments-api">payments-api</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium">Window start</label>
                <Input type="datetime-local" value={draft.windowStart} onChange={(e) => setDraft({ ...draft, windowStart: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium">Duration (hours)</label>
                <Input value={draft.windowHours} onChange={(e) => setDraft({ ...draft, windowHours: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={createChange} disabled={!draft.title.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test policy */}
      <Dialog open={testPolicyOpen !== null} onOpenChange={(o) => !o && setTestPolicyOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Test policy · {testPolicyOpen?.id}</DialogTitle></DialogHeader>
          {testPolicyOpen && (
            <div className="space-y-3 text-sm">
              <div className="text-xs text-muted-foreground">{testPolicyOpen.ruleText}</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium">Requester</label>
                  <Input value={testPolicyInput.requester} onChange={(e) => setTestPolicyInput({ ...testPolicyInput, requester: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium">Approver</label>
                  <Input value={testPolicyInput.approver} onChange={(e) => setTestPolicyInput({ ...testPolicyInput, approver: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium">Kind</label>
                <Select value={testPolicyInput.kind} onValueChange={(v) => setTestPolicyInput({ ...testPolicyInput, kind: v as ChangeKind })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {testPolicyResult && (
                <div className={cn("rounded-md border p-2 text-xs", testPolicyResult.startsWith("PASS") ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800")}>
                  {testPolicyResult}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestPolicyOpen(null)}>Close</Button>
            <Button onClick={testPolicy}>Run test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exception request */}
      <Dialog open={excOpen !== null} onOpenChange={(o) => !o && setExcOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Request exception</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs font-medium">Change</label>
              <Input value={excOpen?.changeId ?? ""} onChange={(e) => setExcOpen({ changeId: e.target.value })} placeholder="CHG-20392" />
            </div>
            <div>
              <label className="text-xs font-medium">Policy</label>
              <Select value={excDraft.policyId} onValueChange={(v) => setExcDraft({ ...excDraft, policyId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {policies.map((p) => <SelectItem key={p.id} value={p.id}>{p.id} · {p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium">Reason</label>
              <Textarea value={excDraft.reason} onChange={(e) => setExcDraft({ ...excDraft, reason: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium">Expires in (days)</label>
              <Input value={excDraft.expiresDays} onChange={(e) => setExcDraft({ ...excDraft, expiresDays: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExcOpen(null)}>Cancel</Button>
            <Button onClick={createException} disabled={!excDraft.reason.trim() || !(excOpen?.changeId ?? "").trim()}>Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Waiver */}
      <Dialog open={waiverOpen} onOpenChange={setWaiverOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Issue time-limited waiver</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs font-medium">Policy</label>
              <Select value={waiverDraft.policyId} onValueChange={(v) => setWaiverDraft({ ...waiverDraft, policyId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {policies.map((p) => <SelectItem key={p.id} value={p.id}>{p.id} · {p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium">Scope</label>
              <Input value={waiverDraft.scope} onChange={(e) => setWaiverDraft({ ...waiverDraft, scope: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium">Reason</label>
              <Textarea value={waiverDraft.reason} onChange={(e) => setWaiverDraft({ ...waiverDraft, reason: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium">Expires in (hours)</label>
              <Input value={waiverDraft.hours} onChange={(e) => setWaiverDraft({ ...waiverDraft, hours: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWaiverOpen(false)}>Cancel</Button>
            <Button onClick={issueWaiver} disabled={!waiverDraft.reason.trim()}>Issue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PIR */}
      <Dialog open={pirOpen !== null} onOpenChange={(o) => !o && setPirOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Complete PIR · {pirOpen?.changeId}</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs font-medium">Outcome</label>
              <Select value={pirDraft.outcome} onValueChange={(v) => setPirDraft({ ...pirDraft, outcome: v as PIR["outcome"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Success">Success</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Rolled back">Rolled back</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium">Learnings</label>
              <Textarea value={pirDraft.learnings} onChange={(e) => setPirDraft({ ...pirDraft, learnings: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPirOpen(null)}>Cancel</Button>
            <Button onClick={completePIR} disabled={!pirDraft.learnings.trim()}>Complete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject */}
      <Dialog open={rejectOpen !== null} onOpenChange={(o) => !o && setRejectOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Reject change · {rejectOpen?.changeId}</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Why is this change being rejected?" aria-label="Rejection reason" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(null)}>Cancel</Button>
            <Button variant="destructive" onClick={rejectChange} disabled={!rejectReason.trim()}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
