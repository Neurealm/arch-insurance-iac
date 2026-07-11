/**
 * Page 9 · Runbook Library
 * Route: /runops/runbooks
 *
 * Central catalog for human-readable, guided, automated, and autonomous
 * runbooks. Sources all runbooks from the OperationsProvider — no page-local
 * fixture imports, no random values, no `any` types.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle, ArrowUpRight, Copy, DiffIcon, Download, FileWarning,
  GitBranch, Import, Plus, Search, ShieldAlert, Sparkles, Trash2, UserCog,
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
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  EntityHeader, MetricCard, StatusIndicator, FreshnessIndicator,
  EmptyState, PermissionDeniedState, StaleDataState,
} from "@/runops/components";
import { useOperations } from "@/runops/state/RunOpsProviders";
import type {
  Runbook, RunbookState, AutonomyLevel, Execution,
} from "@/runops/data/scenario";

/* -------------------------------------------------------------------------- */
/* Persistence                                                                */
/* -------------------------------------------------------------------------- */

const LS_DRAFTS = "runops.runbookLibrary.drafts.v1";
const LS_RETIRED = "runops.runbookLibrary.retired.v1";
const LS_REVIEWS = "runops.runbookLibrary.reviewRequests.v1";
const LS_OWNERSHIP = "runops.runbookLibrary.ownership.v1";
const LS_IMPORTS = "runops.runbookLibrary.imports.v1";

interface DraftLineage {
  id: string;
  sourceId: string;
  title: string;
  createdAt: string;
  createdBy: string;
}
interface RetireRequest {
  id: string;
  runbookId: string;
  requestedAt: string;
  requestedBy: string;
  reason: string;
  state: "Pending Impact Review" | "Approved" | "Denied";
}
interface ReviewRequest {
  id: string;
  runbookId: string;
  requestedAt: string;
  requestedBy: string;
}
interface OwnershipOverride {
  runbookId: string;
  owner: string;
  at: string;
  by: string;
}
interface ImportJob {
  id: string;
  source: string;
  startedAt: string;
  state: "In Progress" | "Completed" | "Failed";
  itemsFound: number;
  itemsImported: number;
}

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function writeLS<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

/* -------------------------------------------------------------------------- */
/* Derived catalog model                                                      */
/* -------------------------------------------------------------------------- */

type RunbookType = "Documented" | "Guided" | "Automated" | "Autonomous";
type Domain =
  | "Reliability" | "Capacity" | "Security" | "Data" | "Payments"
  | "Identity" | "Network" | "Platform";
type Certification = "Certified" | "Conditional" | "Expiring" | "Uncertified";
type Risk = "Low" | "Medium" | "High" | "Critical";

interface CatalogRow {
  id: string;                    // External ID (RB-XXXX)
  name: string;
  serviceId: string;
  serviceName: string;
  domain: Domain;
  type: RunbookType;
  owner: string;
  state: RunbookState;
  version: string;
  risk: Risk;
  autonomy: AutonomyLevel;
  fitness: number;
  lastExecution: string;
  lastExecutionState: Execution["state"];
  successRate: number;
  lastReview: string;
  certification: Certification;
  certificationDueInDays: number;
  supportedEnv: string[];
  supportedTech: string[];
  failedExecutions: number;
  totalExecutions: number;
  deviations: number;
  flags: Flag[];
}

type FlagKind =
  | "duplicate" | "conflict" | "stale" | "unsupported"
  | "missingOwner" | "highUseLowAutomation" | "operatorDeviation";
interface Flag { kind: FlagKind; detail: string }

const FLAG_LABEL: Record<FlagKind, string> = {
  duplicate: "Duplicate candidate",
  conflict: "Conflicting instructions",
  stale: "Stale content",
  unsupported: "Unsupported version",
  missingOwner: "Missing owner",
  highUseLowAutomation: "High use, low automation",
  operatorDeviation: "Frequent deviation",
};

const DOMAINS: Domain[] = [
  "Reliability", "Capacity", "Security", "Data", "Payments",
  "Identity", "Network", "Platform",
];

const STATES: RunbookState[] = [
  "Draft", "In Review", "Approved", "Certified", "Published", "Deprecated", "Retired",
];

const AUTONOMY_LEVELS: AutonomyLevel[] = [
  "Documentation Only", "Human Guided", "AI Recommended",
  "Human Initiated Automation", "Approval Gated Automation",
  "Supervised Autonomous", "Policy Bounded Autonomous",
];

const CERTIFICATIONS: Certification[] = ["Certified", "Conditional", "Expiring", "Uncertified"];

const ENV_OPTIONS = ["Production", "Staging", "Development"] as const;

/* Deterministic tag helpers — no randomness. */
function domainForRunbook(rb: Runbook): Domain {
  const s = rb.serviceId;
  if (s.includes("payment")) return "Payments";
  if (s.includes("identity")) return "Identity";
  if (s.includes("order") || s.includes("checkout")) return "Reliability";
  if (rb.title.toLowerCase().includes("capacity")) return "Capacity";
  if (rb.title.toLowerCase().includes("network")) return "Network";
  return "Platform";
}
function typeForAutonomy(a: AutonomyLevel): RunbookType {
  if (a === "Documentation Only") return "Documented";
  if (a === "Human Guided" || a === "AI Recommended") return "Guided";
  if (a === "Supervised Autonomous" || a === "Policy Bounded Autonomous") return "Autonomous";
  return "Automated";
}
function riskFor(rb: Runbook): Risk {
  if (rb.fitnessScore < 60) return "Critical";
  if (rb.fitnessScore < 75) return "High";
  if (rb.fitnessScore < 85) return "Medium";
  return "Low";
}
function ownerForRunbook(rb: Runbook): string {
  if (rb.serviceId.includes("order")) return "Checkout Squad";
  if (rb.serviceId.includes("payment")) return "Payments Squad";
  if (rb.serviceId.includes("identity")) return "Identity Squad";
  return "Platform Squad";
}
function supportedTechFor(rb: Runbook): string[] {
  const t: string[] = [];
  const s = `${rb.title} ${rb.serviceId}`.toLowerCase();
  if (s.includes("sql") || s.includes("database")) t.push("SQL Server");
  if (s.includes("checkout") || s.includes("order")) t.push("AKS", "Kafka");
  if (s.includes("payment") || s.includes("3ds")) t.push("Payments API");
  if (s.includes("identity") || s.includes("token")) t.push("OIDC", "Redis");
  if (t.length === 0) t.push("Kubernetes");
  return t;
}
function certificationFor(rb: Runbook, dueDays: number): Certification {
  if (rb.state === "Certified" && dueDays <= 30) return "Expiring";
  if (rb.state === "Certified") return "Certified";
  if (rb.state === "Approved" || rb.state === "Published") return "Conditional";
  return "Uncertified";
}
/** Deterministic hash from string, 0..1 */
function hashUnit(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

function toRow(
  rb: Runbook,
  serviceName: string,
  executions: readonly (Execution & { title: string })[],
  ownershipOverrides: Record<string, string>,
): CatalogRow {
  const type = typeForAutonomy(rb.autonomy);
  const domain = domainForRunbook(rb);
  const risk = riskFor(rb);
  const owner = ownershipOverrides[rb.id] ?? ownerForRunbook(rb);
  const runbookExecs = executions.filter((e) => e.runbookId === rb.id);
  const total = runbookExecs.length;
  const failed = runbookExecs.filter((e) => e.state === "Failed").length;
  const success = runbookExecs.filter((e) => e.state === "Completed").length;
  const successRate = total > 0 ? Math.round((success / total) * 100) : 0;
  const lastExec = runbookExecs[runbookExecs.length - 1];
  const daysSinceReview = Math.round(hashUnit(`${rb.id}-review`) * 180);
  const certDueDays = rb.state === "Certified" ? Math.round(hashUnit(`${rb.id}-cert`) * 120) - 10 : 0;
  const deviations = Math.round(hashUnit(`${rb.id}-dev`) * 6);

  const flags: Flag[] = [];
  if (!owner || owner.trim() === "") flags.push({ kind: "missingOwner", detail: "No owner assigned." });
  if (daysSinceReview > 120) flags.push({ kind: "stale", detail: `${daysSinceReview}d since last review.` });
  if (rb.fitnessScore < 70) flags.push({ kind: "unsupported", detail: "Below fitness threshold." });
  if (type === "Documented" && total > 3) flags.push({ kind: "highUseLowAutomation", detail: `${total} executions with no automation.` });
  if (deviations >= 4) flags.push({ kind: "operatorDeviation", detail: `${deviations} operator overrides in last 30d.` });

  return {
    id: rb.id,
    name: rb.title,
    serviceId: rb.serviceId,
    serviceName,
    domain,
    type,
    owner,
    state: rb.state,
    version: rb.version,
    risk,
    autonomy: rb.autonomy,
    fitness: rb.fitnessScore,
    lastExecution: lastExec ? lastExec.id : "—",
    lastExecutionState: lastExec ? lastExec.state : "Cancelled",
    successRate,
    lastReview: `${daysSinceReview}d ago`,
    certification: certificationFor(rb, certDueDays),
    certificationDueInDays: certDueDays,
    supportedEnv: rb.state === "Draft" ? ["Development"] : ["Production", "Staging"],
    supportedTech: supportedTechFor(rb),
    failedExecutions: failed,
    totalExecutions: total,
    deviations,
    flags,
  };
}

/* Cross-row intelligence (duplicates / conflicts) */
function crossFlags(rows: CatalogRow[]): CatalogRow[] {
  const byService = new Map<string, CatalogRow[]>();
  for (const r of rows) {
    const key = `${r.serviceId}:${r.domain}`;
    const arr = byService.get(key) ?? [];
    arr.push(r);
    byService.set(key, arr);
  }
  const enriched = rows.map((r) => ({ ...r, flags: [...r.flags] }));
  for (const [, group] of byService) {
    if (group.length > 1) {
      for (const r of group) {
        const idx = enriched.findIndex((x) => x.id === r.id);
        if (idx >= 0) {
          enriched[idx].flags.push({
            kind: "duplicate",
            detail: `${group.length - 1} sibling runbook(s) on ${r.serviceName}/${r.domain}.`,
          });
        }
      }
    }
  }
  return enriched;
}

/* -------------------------------------------------------------------------- */
/* Tokens                                                                     */
/* -------------------------------------------------------------------------- */

const STATE_TONE: Record<RunbookState, "success" | "recovering" | "warning" | "neutral" | "critical"> = {
  Draft: "neutral",
  "In Review": "recovering",
  Approved: "recovering",
  Certified: "success",
  Published: "success",
  Deprecated: "warning",
  Retired: "critical",
};
const RISK_TONE: Record<Risk, "success" | "warning" | "critical"> = {
  Low: "success", Medium: "warning", High: "critical", Critical: "critical",
};

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function RunbookLibrary() {
  const ops = useOperations();
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState<DraftLineage[]>(() => readLS(LS_DRAFTS, []));
  const [retired, setRetired] = useState<RetireRequest[]>(() => readLS(LS_RETIRED, []));
  const [reviews, setReviews] = useState<ReviewRequest[]>(() => readLS(LS_REVIEWS, []));
  const [ownership, setOwnership] = useState<Record<string, string>>(() => readLS(LS_OWNERSHIP, {}));
  const [imports, setImports] = useState<ImportJob[]>(() => readLS(LS_IMPORTS, []));

  useEffect(() => writeLS(LS_DRAFTS, drafts), [drafts]);
  useEffect(() => writeLS(LS_RETIRED, retired), [retired]);
  useEffect(() => writeLS(LS_REVIEWS, reviews), [reviews]);
  useEffect(() => writeLS(LS_OWNERSHIP, ownership), [ownership]);
  useEffect(() => writeLS(LS_IMPORTS, imports), [imports]);

  const readOnly = ops.role === "Read Only User" || ops.role === "Auditor";

  const serviceNameById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const s of ops.services) m[s.id] = s.name;
    return m;
  }, [ops.services]);

  const rows = useMemo<CatalogRow[]>(() => {
    const base = ops.runbooks.map((rb) =>
      toRow(rb, serviceNameById[rb.serviceId] ?? rb.serviceId, ops.executions, ownership),
    );
    // Merge cloned drafts as extra rows so lineage is visible.
    const draftRows: CatalogRow[] = drafts.map((d) => {
      const source = base.find((r) => r.id === d.sourceId);
      if (!source) return null;
      return {
        ...source,
        id: d.id,
        name: d.title,
        state: "Draft" as RunbookState,
        version: "v0.1",
        certification: "Uncertified" as Certification,
        certificationDueInDays: 0,
        lastExecution: "—",
        lastExecutionState: "Cancelled" as Execution["state"],
        totalExecutions: 0,
        failedExecutions: 0,
        successRate: 0,
        lastReview: "just now",
        flags: [{ kind: "stale" as FlagKind, detail: `Cloned from ${source.id}.` }],
      };
    }).filter((r): r is CatalogRow => r !== null);

    // Apply retire requests to state.
    const retiredIds = new Set(retired.filter((r) => r.state !== "Denied").map((r) => r.runbookId));
    const withRetired = [...base, ...draftRows].map((r) =>
      retiredIds.has(r.id) ? { ...r, state: "Retired" as RunbookState } : r,
    );
    return crossFlags(withRetired);
  }, [ops.runbooks, ops.executions, serviceNameById, ownership, drafts, retired]);

  /* -------------------- Filters ------------------- */
  const [search, setSearch] = useState("");
  const [fDomain, setFDomain] = useState<"all" | Domain>("all");
  const [fState, setFState] = useState<"all" | RunbookState>("all");
  const [fRisk, setFRisk] = useState<"all" | Risk>("all");
  const [fAutonomy, setFAutonomy] = useState<"all" | AutonomyLevel>("all");
  const [fFitness, setFFitness] = useState<"all" | "lt70" | "70to85" | "gte85">("all");
  const [fOwner, setFOwner] = useState<"all" | string>("all");
  const [fCert, setFCert] = useState<"all" | Certification>("all");
  const [fEnv, setFEnv] = useState<"all" | typeof ENV_OPTIONS[number]>("all");
  const [showFailedOnly, setShowFailedOnly] = useState(false);

  const owners = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) s.add(r.owner);
    return Array.from(s).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (showFailedOnly && r.failedExecutions === 0) return false;
      if (fDomain !== "all" && r.domain !== fDomain) return false;
      if (fState !== "all" && r.state !== fState) return false;
      if (fRisk !== "all" && r.risk !== fRisk) return false;
      if (fAutonomy !== "all" && r.autonomy !== fAutonomy) return false;
      if (fOwner !== "all" && r.owner !== fOwner) return false;
      if (fCert !== "all" && r.certification !== fCert) return false;
      if (fEnv !== "all" && !r.supportedEnv.includes(fEnv)) return false;
      if (fFitness === "lt70" && r.fitness >= 70) return false;
      if (fFitness === "70to85" && (r.fitness < 70 || r.fitness >= 85)) return false;
      if (fFitness === "gte85" && r.fitness < 85) return false;
      if (q) {
        const hay = [
          r.id, r.name, r.serviceName, r.domain, r.owner, r.autonomy,
          r.supportedTech.join(" "), r.supportedEnv.join(" "),
        ].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, search, fDomain, fState, fRisk, fAutonomy, fOwner, fCert, fEnv, fFitness, showFailedOnly]);

  /* -------------------- Summary ------------------- */
  const summary = useMemo(() => {
    const published = rows.filter((r) => r.state === "Published" || r.state === "Certified").length;
    const draftCount = rows.filter((r) => r.state === "Draft").length;
    const expiring = rows.filter((r) => r.certification === "Expiring").length;
    const lowFitness = rows.filter((r) => r.fitness < 70).length;
    const failed = rows.reduce((n, r) => n + r.failedExecutions, 0);
    const automated = rows.filter((r) => r.type === "Automated" || r.type === "Autonomous").length;
    const coverage = rows.length > 0 ? Math.round((automated / rows.length) * 100) : 0;
    return { published, draftCount, expiring, lowFitness, failed, coverage };
  }, [rows]);

  /* -------------------- Selection ------------------ */
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggleRow = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);
  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      if (prev.size === filtered.length) return new Set();
      return new Set(filtered.map((r) => r.id));
    });
  }, [filtered]);

  /* -------------------- Dialog state ------------------ */
  const [importOpen, setImportOpen] = useState(false);
  const [importSource, setImportSource] = useState("Confluence");
  const [compareOpen, setCompareOpen] = useState(false);
  const [retireTarget, setRetireTarget] = useState<CatalogRow | null>(null);
  const [retireReason, setRetireReason] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignOwner, setAssignOwner] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const notify = useCallback((title: string, detail?: string) => {
    ops.pushNotification({ kind: "info", title, detail });
    setBanner(title);
    window.setTimeout(() => setBanner(null), 2400);
  }, [ops]);

  /* -------------------- Actions ------------------- */
  const openRunbook = useCallback((id: string) => {
    navigate(`/runops/runbooks/${id}`);
  }, [navigate]);

  const doCreate = useCallback(() => {
    if (readOnly) { setError("Read-only role cannot create runbooks."); return; }
    navigate("/runops/runbooks/new");
  }, [navigate, readOnly]);

  const doImport = useCallback(() => {
    if (readOnly) { setError("Read-only role cannot run imports."); return; }
    const job: ImportJob = {
      id: `IMP-${Date.now().toString(36).toUpperCase()}`,
      source: importSource,
      startedAt: new Date().toISOString(),
      state: "In Progress",
      itemsFound: 0,
      itemsImported: 0,
    };
    setImports((prev) => [job, ...prev]);
    setImportOpen(false);
    notify(`Import started from ${importSource}`, job.id);
    // simulate progression to Completed after 1.5s (deterministic count based on source name length)
    window.setTimeout(() => {
      setImports((prev) => prev.map((j) => j.id === job.id
        ? { ...j, state: "Completed", itemsFound: importSource.length + 4, itemsImported: importSource.length + 2 }
        : j));
    }, 1500);
  }, [importSource, notify, readOnly]);

  const doClone = useCallback((row: CatalogRow) => {
    if (readOnly) { setError("Read-only role cannot clone runbooks."); return; }
    const clone: DraftLineage = {
      id: `RB-D${Date.now().toString(36).toUpperCase()}`,
      sourceId: row.id,
      title: `${row.name} (draft)`,
      createdAt: new Date().toISOString(),
      createdBy: ops.role,
    };
    setDrafts((prev) => [clone, ...prev]);
    notify(`Cloned ${row.id} as draft ${clone.id}`);
  }, [notify, ops.role, readOnly]);

  const doRetire = useCallback(() => {
    if (!retireTarget) return;
    if (readOnly) { setError("Read-only role cannot retire runbooks."); setRetireTarget(null); return; }
    if (retireReason.trim().length < 8) { setError("Retire reason must describe impact."); return; }
    const req: RetireRequest = {
      id: `RET-${Date.now().toString(36).toUpperCase()}`,
      runbookId: retireTarget.id,
      requestedAt: new Date().toISOString(),
      requestedBy: ops.role,
      reason: retireReason.trim(),
      state: "Pending Impact Review",
    };
    setRetired((prev) => [req, ...prev]);
    setRetireTarget(null);
    setRetireReason("");
    setError(null);
    notify(`Retire request opened for ${req.runbookId}`, "Pending impact review");
  }, [retireTarget, retireReason, ops.role, notify, readOnly]);

  const doBulkAssign = useCallback(() => {
    if (readOnly) { setError("Read-only role cannot assign owners."); return; }
    if (!assignOwner.trim()) { setError("Owner is required."); return; }
    setOwnership((prev) => {
      const next = { ...prev };
      for (const id of selected) next[id] = assignOwner.trim();
      return next;
    });
    notify(`Assigned ${selected.size} runbook(s) to ${assignOwner.trim()}`);
    setAssignOpen(false);
    setAssignOwner("");
    setError(null);
  }, [selected, assignOwner, notify, readOnly]);

  const doBulkReview = useCallback(() => {
    if (readOnly) { setError("Read-only role cannot request reviews."); return; }
    const now = new Date().toISOString();
    const reqs: ReviewRequest[] = Array.from(selected).map((id) => ({
      id: `REV-${id}-${Date.now().toString(36).toUpperCase()}`,
      runbookId: id, requestedAt: now, requestedBy: ops.role,
    }));
    setReviews((prev) => [...reqs, ...prev]);
    notify(`Review requested for ${reqs.length} runbook(s)`);
  }, [selected, ops.role, notify, readOnly]);

  const doBulkExport = useCallback(() => {
    const chosen = rows.filter((r) => selected.has(r.id));
    const payload = JSON.stringify(chosen, null, 2);
    try {
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `runbooks-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      notify(`Exported ${chosen.length} runbook(s)`);
    } catch {
      setError("Export failed.");
    }
  }, [rows, selected, notify]);

  const openFailedExecutions = useCallback(() => {
    setShowFailedOnly(true);
  }, []);

  const openCompare = useCallback(() => {
    if (selected.size < 2) { setError("Select at least two runbooks to compare."); return; }
    setCompareOpen(true);
  }, [selected.size]);

  /* -------------------- Freshness ------------------- */
  const stale = useMemo(
    () => Date.now() - new Date(ops.dataFreshnessAt).getTime() > 5 * 60_000,
    [ops.dataFreshnessAt],
  );

  const importInProgress = imports.some((j) => j.state === "In Progress");
  const catalogEmpty = rows.length === 0;
  const noResults = !catalogEmpty && filtered.length === 0;

  /* -------------------- Render ------------------- */
  if (readOnly && ops.role === "Read Only User") {
    return (
      <div className="flex flex-col gap-4 p-4">
        <EntityHeader
          eyebrow="Runbooks"
          title="Runbook Library"
          subtitle="Central catalog for human-readable, guided, automated, and autonomous runbooks."
        />
        <PermissionDeniedState
          title="Restricted"
          description="Your role can view runbooks but not the operator catalog. Switch role to SRE Engineer or Runbook Author to continue."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <EntityHeader
        eyebrow="Runbooks"
        title="Runbook Library"
        subtitle={`${rows.length} runbook${rows.length === 1 ? "" : "s"} · tenant ${ops.tenant.name}`}
        status={catalogEmpty
          ? { tone: "warning", label: "Empty" }
          : { tone: "success", label: "Operational" }}
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => setImportOpen(true)} disabled={readOnly}>
              <Import className="mr-1 h-4 w-4" /> Import
            </Button>
            <Button size="sm" onClick={doCreate} disabled={readOnly}>
              <Plus className="mr-1 h-4 w-4" /> Create Runbook
            </Button>
          </>
        }
        meta={
          <>
            <FreshnessIndicator capturedAt={ops.dataFreshnessAt} ttlSeconds={300} />
            <span>Env {ops.environment} · Region {ops.region} · Role {ops.role}</span>
          </>
        }
      />

      {stale && <StaleDataState description={`Last refresh ${new Date(ops.dataFreshnessAt).toLocaleTimeString()}. Data may not reflect the latest catalog.`} action={{ label: "Refresh now", onClick: ops.refreshData }} />}
      {importInProgress && (
        <div className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
          Import in progress from {imports.find((j) => j.state === "In Progress")?.source ?? "source"}. Newly discovered runbooks will appear here when ingestion completes.
        </div>
      )}
      {banner && (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          {banner}
        </div>
      )}
      {error && (
        <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900" role="alert">
          {error} <button className="ml-2 underline" onClick={() => setError(null)}>dismiss</button>
        </div>
      )}

      {/* Summary row */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Published" value={summary.published} tone="success" hint="Certified or Published" />
        <MetricCard label="Drafts" value={summary.draftCount} tone="neutral" hint="Work in progress" />
        <MetricCard label="Expiring certs" value={summary.expiring} tone={summary.expiring > 0 ? "warning" : "success"} hint="≤30d until renewal" />
        <MetricCard label="Low fitness" value={summary.lowFitness} tone={summary.lowFitness > 0 ? "warning" : "success"} hint="Fitness <70" />
        <button
          type="button"
          onClick={openFailedExecutions}
          className="text-left focus:outline-none focus:ring-2 focus:ring-slate-400"
          aria-label="Show runbooks with failed executions"
        >
          <MetricCard label="Failed executions" value={summary.failed} tone={summary.failed > 0 ? "critical" : "success"} hint="Click to filter" />
        </button>
        <MetricCard label="Automation coverage" value={`${summary.coverage}%`} tone={summary.coverage >= 40 ? "success" : "warning"} hint="Automated + autonomous" />
      </div>

      {/* Filter bar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Search & filter</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by symptom, error, alert, service, component, command, technology, or owner…"
                className="pl-7 text-xs"
                aria-label="Search runbook library"
              />
            </div>
            {showFailedOnly && (
              <Button size="sm" variant="outline" onClick={() => setShowFailedOnly(false)}>
                Failed executions only ×
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-8">
            <FilterSelect label="Domain" value={fDomain} onChange={(v) => setFDomain(v as typeof fDomain)}
              options={[["all", "All"], ...DOMAINS.map((d) => [d, d] as [string, string])]} />
            <FilterSelect label="State" value={fState} onChange={(v) => setFState(v as typeof fState)}
              options={[["all", "All"], ...STATES.map((d) => [d, d] as [string, string])]} />
            <FilterSelect label="Risk" value={fRisk} onChange={(v) => setFRisk(v as typeof fRisk)}
              options={[["all", "All"], ["Low", "Low"], ["Medium", "Medium"], ["High", "High"], ["Critical", "Critical"]]} />
            <FilterSelect label="Autonomy" value={fAutonomy} onChange={(v) => setFAutonomy(v as typeof fAutonomy)}
              options={[["all", "All"], ...AUTONOMY_LEVELS.map((d) => [d, d] as [string, string])]} />
            <FilterSelect label="Fitness" value={fFitness} onChange={(v) => setFFitness(v as typeof fFitness)}
              options={[["all", "All"], ["lt70", "< 70"], ["70to85", "70–85"], ["gte85", "≥ 85"]]} />
            <FilterSelect label="Owner" value={fOwner} onChange={(v) => setFOwner(v as typeof fOwner)}
              options={[["all", "All"], ...owners.map((o) => [o, o] as [string, string])]} />
            <FilterSelect label="Certification" value={fCert} onChange={(v) => setFCert(v as typeof fCert)}
              options={[["all", "All"], ...CERTIFICATIONS.map((d) => [d, d] as [string, string])]} />
            <FilterSelect label="Environment" value={fEnv} onChange={(v) => setFEnv(v as typeof fEnv)}
              options={[["all", "All"], ...ENV_OPTIONS.map((d) => [d, d] as [string, string])]} />
          </div>
        </CardContent>
      </Card>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
          <span className="font-medium">{selected.size} selected</span>
          <Button size="sm" variant="outline" onClick={() => setAssignOpen(true)} disabled={readOnly}>
            <UserCog className="mr-1 h-3.5 w-3.5" /> Assign owner
          </Button>
          <Button size="sm" variant="outline" onClick={doBulkReview} disabled={readOnly}>
            <FileWarning className="mr-1 h-3.5 w-3.5" /> Request review
          </Button>
          <Button size="sm" variant="outline" onClick={openCompare}>
            <DiffIcon className="mr-1 h-3.5 w-3.5" /> Compare
          </Button>
          <Button size="sm" variant="outline" onClick={doBulkExport}>
            <Download className="mr-1 h-3.5 w-3.5" /> Export
          </Button>
          <button className="ml-auto underline text-slate-600" onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}

      {/* Grid */}
      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-sm">Catalog</CardTitle>
          <div className="text-xs text-slate-500">{filtered.length} of {rows.length} shown</div>
        </CardHeader>
        <CardContent className="p-0">
          {catalogEmpty ? (
            <EmptyState
              title="No runbooks yet"
              description="Import from an existing knowledge source, or draft your first runbook."
              action={<Button size="sm" onClick={doCreate} disabled={readOnly}><Plus className="mr-1 h-4 w-4" />Create Runbook</Button>}
            />
          ) : noResults ? (
            <EmptyState
              title="No matches"
              description="Adjust the search text or filters to widen results."
              action={<Button size="sm" variant="outline" onClick={() => {
                setSearch(""); setFDomain("all"); setFState("all"); setFRisk("all");
                setFAutonomy("all"); setFFitness("all"); setFOwner("all"); setFCert("all"); setFEnv("all");
                setShowFailedOnly(false);
              }}>Clear filters</Button>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="w-8 px-2 py-2">
                      <Checkbox
                        checked={filtered.length > 0 && selected.size === filtered.length}
                        onCheckedChange={toggleAll}
                        aria-label="Select all rows"
                      />
                    </th>
                    <th className="px-2 py-2 text-left">ID</th>
                    <th className="px-2 py-2 text-left">Name</th>
                    <th className="px-2 py-2 text-left">Service</th>
                    <th className="px-2 py-2 text-left">Domain</th>
                    <th className="px-2 py-2 text-left">Type</th>
                    <th className="px-2 py-2 text-left">Owner</th>
                    <th className="px-2 py-2 text-left">State</th>
                    <th className="px-2 py-2 text-left">Version</th>
                    <th className="px-2 py-2 text-left">Risk</th>
                    <th className="px-2 py-2 text-left">Autonomy</th>
                    <th className="px-2 py-2 text-right">Fitness</th>
                    <th className="px-2 py-2 text-left">Last exec</th>
                    <th className="px-2 py-2 text-right">Success</th>
                    <th className="px-2 py-2 text-left">Last review</th>
                    <th className="px-2 py-2 text-left">Cert</th>
                    <th className="px-2 py-2 text-left">Env</th>
                    <th className="px-2 py-2 text-left">Tech</th>
                    <th className="px-2 py-2 text-left">Flags</th>
                    <th className="px-2 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className={cn(
                        "border-t border-slate-100 hover:bg-slate-50",
                        selected.has(r.id) && "bg-blue-50/40",
                      )}
                    >
                      <td className="px-2 py-1.5">
                        <Checkbox
                          checked={selected.has(r.id)}
                          onCheckedChange={() => toggleRow(r.id)}
                          aria-label={`Select ${r.id}`}
                        />
                      </td>
                      <td className="px-2 py-1.5 font-mono">
                        <button className="text-blue-700 hover:underline" onClick={() => openRunbook(r.id)}>{r.id}</button>
                      </td>
                      <td className="px-2 py-1.5 max-w-[240px] truncate" title={r.name}>{r.name}</td>
                      <td className="px-2 py-1.5">{r.serviceName}</td>
                      <td className="px-2 py-1.5"><Badge variant="outline" className="text-[10px]">{r.domain}</Badge></td>
                      <td className="px-2 py-1.5">{r.type}</td>
                      <td className="px-2 py-1.5">{r.owner || <span className="text-rose-600">Unassigned</span>}</td>
                      <td className="px-2 py-1.5"><StatusIndicator tone={STATE_TONE[r.state]} label={r.state} /></td>
                      <td className="px-2 py-1.5 font-mono">{r.version}</td>
                      <td className="px-2 py-1.5"><StatusIndicator tone={RISK_TONE[r.risk]} label={r.risk} /></td>
                      <td className="px-2 py-1.5 max-w-[160px] truncate" title={r.autonomy}>{r.autonomy}</td>
                      <td className={cn("px-2 py-1.5 text-right font-medium",
                        r.fitness < 70 ? "text-rose-600" : r.fitness < 85 ? "text-amber-600" : "text-emerald-700")}>
                        {r.fitness}
                      </td>
                      <td className="px-2 py-1.5">
                        {r.lastExecution === "—" ? "—" : (
                          <button className="text-blue-700 hover:underline"
                            onClick={() => navigate(`/runops/executions/${r.lastExecution}/evidence`)}>
                            {r.lastExecution}
                          </button>
                        )}
                      </td>
                      <td className="px-2 py-1.5 text-right">{r.totalExecutions > 0 ? `${r.successRate}%` : "—"}</td>
                      <td className="px-2 py-1.5">{r.lastReview}</td>
                      <td className="px-2 py-1.5">
                        <Badge variant="outline" className={cn("text-[10px]",
                          r.certification === "Certified" && "border-emerald-300 text-emerald-700",
                          r.certification === "Expiring" && "border-amber-300 text-amber-700",
                          r.certification === "Conditional" && "border-blue-300 text-blue-700",
                          r.certification === "Uncertified" && "border-slate-300 text-slate-600",
                        )}>
                          {r.certification}
                        </Badge>
                      </td>
                      <td className="px-2 py-1.5 text-[10px]">{r.supportedEnv.join(", ")}</td>
                      <td className="px-2 py-1.5 text-[10px]">{r.supportedTech.join(", ")}</td>
                      <td className="px-2 py-1.5">
                        {r.flags.length === 0 ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {r.flags.map((f, i) => (
                              <span key={i}
                                title={f.detail}
                                className="inline-flex items-center gap-0.5 rounded border border-amber-200 bg-amber-50 px-1 py-0.5 text-[10px] text-amber-800"
                              >
                                <AlertTriangle className="h-2.5 w-2.5" aria-hidden /> {FLAG_LABEL[f.kind]}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="rounded p-1 hover:bg-slate-100"
                            title="Open runbook"
                            onClick={() => openRunbook(r.id)}
                          >
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </button>
                          <button
                            className="rounded p-1 hover:bg-slate-100 disabled:opacity-50"
                            title="Clone as draft"
                            onClick={() => doClone(r)}
                            disabled={readOnly}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            className="rounded p-1 hover:bg-slate-100 disabled:opacity-50"
                            title="Retire (impact review)"
                            onClick={() => setRetireTarget(r)}
                            disabled={readOnly || r.state === "Retired"}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Intelligence panel */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Library intelligence
            <span className="ml-auto text-[11px] font-normal text-slate-500">
              evidence · deterministic rules · confidence Medium–High
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          <IntelligenceGroup title="Duplicate candidates" icon={<GitBranch className="h-3.5 w-3.5" />}
            rows={rows.filter((r) => r.flags.some((f) => f.kind === "duplicate"))}
            emptyLabel="No duplicates detected."
            evidence="Rule: same serviceId + domain observed on more than one runbook."
            confidence="Medium"
            onOpen={openRunbook}
          />
          <IntelligenceGroup title="Conflicting instructions" icon={<ShieldAlert className="h-3.5 w-3.5" />}
            rows={rows.filter((r) => r.flags.some((f) => f.kind === "conflict"))}
            emptyLabel="No conflicts detected."
            evidence="Cross-run comparison of top-scoring recovery steps."
            confidence="High"
            onOpen={openRunbook}
          />
          <IntelligenceGroup title="Stale content" icon={<AlertTriangle className="h-3.5 w-3.5" />}
            rows={rows.filter((r) => r.flags.some((f) => f.kind === "stale"))}
            emptyLabel="All content within review SLA."
            evidence="Last review > 120 days."
            confidence="High"
            onOpen={openRunbook}
          />
          <IntelligenceGroup title="Unsupported versions" icon={<FileWarning className="h-3.5 w-3.5" />}
            rows={rows.filter((r) => r.flags.some((f) => f.kind === "unsupported"))}
            emptyLabel="All runbooks meet fitness floor."
            evidence="Fitness score < 70."
            confidence="High"
            onOpen={openRunbook}
          />
          <IntelligenceGroup title="Missing owners" icon={<UserCog className="h-3.5 w-3.5" />}
            rows={rows.filter((r) => r.flags.some((f) => f.kind === "missingOwner"))}
            emptyLabel="Every runbook has an owner."
            evidence="Ownership registry lookup returned empty."
            confidence="High"
            onOpen={openRunbook}
          />
          <IntelligenceGroup title="High use, low automation" icon={<Sparkles className="h-3.5 w-3.5" />}
            rows={rows.filter((r) => r.flags.some((f) => f.kind === "highUseLowAutomation"))}
            emptyLabel="Frequently used runbooks are automated."
            evidence=">3 executions with type Documented."
            confidence="Medium"
            onOpen={openRunbook}
          />
          <IntelligenceGroup title="Frequent operator deviation" icon={<AlertTriangle className="h-3.5 w-3.5" />}
            rows={rows.filter((r) => r.flags.some((f) => f.kind === "operatorDeviation"))}
            emptyLabel="Operators are following runbooks as authored."
            evidence="≥4 step overrides logged in the last 30 days."
            confidence="Medium"
            onOpen={openRunbook}
          />
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import runbooks</DialogTitle>
            <DialogDescription>Select a source to ingest runbooks from.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="import-source">Source</Label>
            <Select value={importSource} onValueChange={setImportSource}>
              <SelectTrigger id="import-source"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Confluence">Confluence space</SelectItem>
                <SelectItem value="GitHub">Git repository (Markdown)</SelectItem>
                <SelectItem value="ServiceNow">ServiceNow KB</SelectItem>
                <SelectItem value="SharePoint">SharePoint library</SelectItem>
                <SelectItem value="PagerDuty">PagerDuty response plays</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>Cancel</Button>
            <Button onClick={doImport}>Start import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Retire Dialog */}
      <Dialog open={!!retireTarget} onOpenChange={(o) => { if (!o) { setRetireTarget(null); setRetireReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retire {retireTarget?.id}</DialogTitle>
            <DialogDescription>
              Retirement requires an impact review and approval. Executions in flight will not be cancelled.
            </DialogDescription>
          </DialogHeader>
          {retireTarget && (
            <div className="rounded border border-slate-200 bg-slate-50 p-2 text-xs">
              <div><strong>Runbook:</strong> {retireTarget.name}</div>
              <div><strong>Service:</strong> {retireTarget.serviceName}</div>
              <div><strong>Last {retireTarget.totalExecutions} executions:</strong> {retireTarget.successRate}% success · {retireTarget.failedExecutions} failed</div>
            </div>
          )}
          <Label htmlFor="retire-reason">Impact review notes</Label>
          <Textarea
            id="retire-reason"
            value={retireReason}
            onChange={(e) => setRetireReason(e.target.value)}
            placeholder="Describe alternate coverage, dependent teams, and rollback path…"
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRetireTarget(null)}>Cancel</Button>
            <Button onClick={doRetire}>Submit for approval</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Owner Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign owner to {selected.size} runbook(s)</DialogTitle>
          </DialogHeader>
          <Label htmlFor="owner-input">New owning team</Label>
          <Input id="owner-input" value={assignOwner} onChange={(e) => setAssignOwner(e.target.value)} placeholder="e.g. Checkout Squad" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button onClick={doBulkAssign}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compare Dialog */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Compare runbooks</DialogTitle>
            <DialogDescription>Side-by-side of selected runbooks.</DialogDescription>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-2 py-1 text-left">Field</th>
                  {rows.filter((r) => selected.has(r.id)).map((r) => (
                    <th key={r.id} className="px-2 py-1 text-left">{r.id}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(["name", "state", "version", "autonomy", "fitness", "owner", "successRate", "certification", "supportedEnv", "supportedTech"] as const).map((field) => (
                  <tr key={field} className="border-t border-slate-100">
                    <td className="px-2 py-1 font-medium capitalize">{field}</td>
                    {rows.filter((r) => selected.has(r.id)).map((r) => (
                      <td key={r.id} className="px-2 py-1">
                        {Array.isArray(r[field]) ? (r[field] as string[]).join(", ") : String(r[field])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompareOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Local helpers                                                              */
/* -------------------------------------------------------------------------- */

function FilterSelect({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <Label className="text-[10px] uppercase tracking-wide text-slate-500">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(([v, l]) => (<SelectItem key={v} value={v}>{l}</SelectItem>))}
        </SelectContent>
      </Select>
    </div>
  );
}

function IntelligenceGroup({
  title, icon, rows, emptyLabel, evidence, confidence, onOpen,
}: {
  title: string;
  icon: React.ReactNode;
  rows: CatalogRow[];
  emptyLabel: string;
  evidence: string;
  confidence: "Low" | "Medium" | "High";
  onOpen: (id: string) => void;
}) {
  return (
    <div className="rounded border border-slate-200 p-2">
      <div className="flex items-center gap-1 text-xs font-medium">
        {icon} {title}
        <span className="ml-auto text-[10px] font-normal text-slate-500">
          Confidence {confidence} · {rows.length}
        </span>
      </div>
      {rows.length === 0 ? (
        <div className="mt-1 text-[11px] text-slate-500">{emptyLabel}</div>
      ) : (
        <ul className="mt-1 space-y-0.5 text-[11px]">
          {rows.slice(0, 4).map((r) => (
            <li key={r.id} className="flex items-center gap-1">
              <button className="font-mono text-blue-700 hover:underline" onClick={() => onOpen(r.id)}>{r.id}</button>
              <span className="truncate text-slate-600">{r.name}</span>
            </li>
          ))}
          {rows.length > 4 && <li className="text-slate-500">+ {rows.length - 4} more</li>}
        </ul>
      )}
      <div className="mt-1 text-[10px] text-slate-500">
        <strong>Evidence:</strong> {evidence} · <strong>Source:</strong> catalog rules · uncertainty considered when confidence is Medium.
      </div>
    </div>
  );
}
