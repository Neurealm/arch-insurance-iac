/**
 * Page 3 · My Operations Queue (route `/runops/operations/queue`)
 *
 * Role-aware, prioritized queue of operational work. All queue rows are
 * derived from the shared OperationsProvider — no page-local fixtures. Queue
 * mutations (accept, delegate, snooze, complete, escalate, approve, bulk
 * actions) are stored in a page-scoped store keyed by task id and persisted
 * across navigation via localStorage so cross-screen behavior holds.
 */

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertOctagon, ArrowUpRight, CheckCircle2, ClipboardList, Download,
  Play, ShieldCheck, TimerReset, UserPlus, Zap,
} from "lucide-react";
import { useOperations } from "@/runops/state/RunOpsProviders";
import {
  DataGrid, ColumnSelector, SearchInput, EmptyState, PermissionDeniedState,
  StaleDataState, ErrorState, StatusIndicator, SeverityIndicator,
  type DataGridColumn,
} from "@/runops/components";
import type { BusinessService, DemoRole } from "@/runops/data/scenario";

/* -------------------------------- Types --------------------------------- */

type TaskType =
  | "approval"
  | "execution"
  | "incident"
  | "corrective_action"
  | "scheduled"
  | "runbook_review"
  | "failed_execution";

type TaskState =
  | "Open" | "In Progress" | "Snoozed" | "Blocked" | "Completed" | "Acknowledged";

type Priority = "P1" | "P2" | "P3" | "P4";
type SloImpact = "None" | "Low" | "Medium" | "High" | "Breach";
type BusinessImpact = "Negligible" | "Low" | "Medium" | "High" | "Critical";

interface QueueTask {
  id: string;
  type: TaskType;
  title: string;
  serviceId: string;
  entityRef: string;                // canonical id (INC-…, APR-…, EXE-…, CHG-…, RB-…)
  state: TaskState;
  owner: string;                    // user or team; "unassigned" until accepted
  createdAt: string;                // ISO
  dueAt: string;                    // ISO
  sloImpact: SloImpact;
  businessImpact: BusinessImpact;
  requiredRole: DemoRole;
  source: string;
  route: string;                    // destination page for Start
  basePriority: Priority;           // seeded severity band
}

interface TaskMutation {
  acceptedBy?: string;
  delegatedTeam?: string;
  delegatedUser?: string;
  snoozedUntil?: string;
  snoozeReason?: string;
  completedAt?: string;
  completionEvidence?: string;
  escalated?: boolean;
  priorityOverride?: Priority;
  acknowledged?: boolean;
}
type MutationMap = Record<string, TaskMutation>;

/* ------------------------------ Persistence ----------------------------- */

const LS_KEY = "runops.queue.mutations.v1";
function loadMutations(): MutationMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as MutationMap) : {};
  } catch { return {}; }
}
function saveMutations(m: MutationMap): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(LS_KEY, JSON.stringify(m)); } catch { /* noop */ }
}

/* -------------------------- Derived queue tasks ------------------------- */

const TABS = ["My Work", "Team Work", "Approvals", "Failed Executions",
              "Scheduled Work", "Corrective Actions", "Recently Completed"] as const;
type Tab = typeof TABS[number];

const CURRENT_USER = "you";

function priorityFromSeverity(sev: string): Priority {
  if (sev === "SEV 1") return "P1";
  if (sev === "SEV 2") return "P2";
  if (sev === "SEV 3") return "P3";
  return "P4";
}

function tierBoost(t: BusinessService["tier"]): number {
  return t === "Tier 1" ? 3 : t === "Tier 2" ? 2 : 1;
}

/** Priority weight: lower = more urgent. */
function priorityWeight(p: Priority): number {
  return { P1: 1, P2: 2, P3: 3, P4: 4 }[p];
}
function impactWeight(i: BusinessImpact): number {
  return { Critical: 5, High: 4, Medium: 3, Low: 2, Negligible: 1 }[i];
}
function sloWeight(i: SloImpact): number {
  return { Breach: 5, High: 4, Medium: 3, Low: 2, None: 1 }[i];
}

/* --------------------------------- Page --------------------------------- */

export default function OperationsQueue() {
  const ops = useOperations();
  const navigate = useNavigate();

  const [mutations, setMutations] = useState<MutationMap>(() => loadMutations());
  useEffect(() => saveMutations(mutations), [mutations]);

  const [tab, setTab] = useState<Tab>("My Work");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailId, setDetailId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | { kind: "delegate" | "snooze" | "complete" | "escalate"; taskId: string }>(null);
  const [error, setError] = useState<string | null>(null);

  /* ----- Role-based permission gate ----- */
  const readOnly = ops.role === "Read Only User" || ops.role === "Auditor";

  /* ----- Derive queue rows from OperationsProvider ----- */

  const tasks = useMemo<QueueTask[]>(() => {
    const svcName = (id: string): string =>
      ops.services.find((s) => s.id === id)?.name ?? id;
    const svcTier = (id: string): BusinessService["tier"] | undefined =>
      ops.services.find((s) => s.id === id)?.tier;

    const list: QueueTask[] = [];
    const now = new Date();
    const iso = (offsetMin: number): string =>
      new Date(now.getTime() + offsetMin * 60_000).toISOString();

    // Approval (from primary approval)
    if (ops.approval.state === "Pending") {
      list.push({
        id: `T-APR-${ops.approval.id}`,
        type: "approval",
        title: `Approve ${ops.runbook.title} (${ops.runbook.id})`,
        serviceId: ops.runbook.serviceId,
        entityRef: ops.approval.id,
        state: "Open",
        owner: "unassigned",
        createdAt: iso(-15),
        dueAt: iso(20),
        sloImpact: "Breach",
        businessImpact: "Critical",
        requiredRole: "Incident Commander",
        source: "Approval gateway",
        route: "/runops/approvals",
        basePriority: "P1",
      });
    }

    // Active incident work item
    if (ops.incident.state !== "Resolved" && ops.incident.state !== "Closed") {
      list.push({
        id: `T-INC-${ops.incident.id}`,
        type: "incident",
        title: `Lead incident: ${ops.incident.title}`,
        serviceId: ops.incident.serviceId,
        entityRef: ops.incident.id,
        state: "In Progress",
        owner: ops.incident.commander,
        createdAt: iso(-45),
        dueAt: iso(60),
        sloImpact: "Breach",
        businessImpact: "Critical",
        requiredRole: "Incident Commander",
        source: "Incident Command",
        route: `/runops/incidents/${ops.incident.id}`,
        basePriority: priorityFromSeverity(ops.incident.severity),
      });
    }

    // Executions — surface running + failed + completed
    for (const exe of ops.executions) {
      const failed = exe.state === "Failed" || exe.state === "Cancelled";
      const running = exe.state === "Running" || exe.state === "Validating"
        || exe.state === "Paused" || exe.state === "Rolling Back" || exe.state === "Queued";
      const completed = exe.state === "Completed";
      if (!failed && !running && !completed) continue;
      list.push({
        id: `T-EXE-${exe.id}`,
        type: failed ? "failed_execution" : "execution",
        title: exe.title,
        serviceId: ops.runbook.serviceId,
        entityRef: exe.id,
        state: failed ? "Blocked" : completed ? "Completed" : "In Progress",
        owner: failed ? "unassigned" : "DW-VALIDATE-10",
        createdAt: iso(-90),
        dueAt: iso(failed ? -10 : 30),
        sloImpact: failed ? "High" : "Medium",
        businessImpact: failed ? "High" : "Medium",
        requiredRole: "SRE Engineer",
        source: "Runbook engine",
        route: `/runops/executions/${exe.id}`,
        basePriority: failed ? "P1" : "P2",
      });
    }

    // Corrective actions from changes tied to the incident
    for (const chg of ops.changes) {
      if (!chg.linkedIncidentId) continue;
      list.push({
        id: `T-CA-${chg.id}`,
        type: "corrective_action",
        title: `Corrective action: post-review ${chg.title}`,
        serviceId: chg.serviceId,
        entityRef: chg.id,
        state: "Open",
        owner: "Change Squad",
        createdAt: iso(-30),
        dueAt: iso(60 * 24),
        sloImpact: "Medium",
        businessImpact: "Medium",
        requiredRole: "Change Manager",
        source: "Problem management",
        route: "/runops/problems/actions",
        basePriority: chg.risk === "High" ? "P2" : "P3",
      });
    }

    // Scheduled work — synthesize from services requiring reviews
    for (const svc of ops.services.slice(0, 2)) {
      list.push({
        id: `T-SCH-${svc.id}`,
        type: "scheduled",
        title: `Weekly readiness review — ${svc.name}`,
        serviceId: svc.id,
        entityRef: svc.id,
        state: "Open",
        owner: "Service Owner",
        createdAt: iso(-60 * 24),
        dueAt: iso(60 * 8),
        sloImpact: "Low",
        businessImpact: "Low",
        requiredRole: "Service Owner",
        source: "Schedule",
        route: `/runops/services/${svc.id}/readiness`,
        basePriority: "P4",
      });
    }

    // Runbook review — the primary runbook
    list.push({
      id: `T-RBR-${ops.runbook.id}`,
      type: "runbook_review",
      title: `Review runbook ${ops.runbook.id} ${ops.runbook.version}`,
      serviceId: ops.runbook.serviceId,
      entityRef: ops.runbook.id,
      state: "Open",
      owner: "Runbook Author",
      createdAt: iso(-60 * 6),
      dueAt: iso(60 * 24 * 2),
      sloImpact: "None",
      businessImpact: "Low",
      requiredRole: "Runbook Author",
      source: "Governance",
      route: `/runops/runbooks/${ops.runbook.id}`,
      basePriority: "P3",
    });

    // Apply tier boosts + assignment-derived owner label
    return list.map((t): QueueTask => {
      const m = mutations[t.id] ?? {};
      const owner = m.completedAt ? t.owner
        : m.acceptedBy ? m.acceptedBy
        : m.delegatedUser ?? m.delegatedTeam ?? t.owner;
      const priority = m.priorityOverride ?? t.basePriority;
      const state: TaskState = m.completedAt ? "Completed"
        : m.snoozedUntil && new Date(m.snoozedUntil) > new Date() ? "Snoozed"
        : m.acknowledged ? "Acknowledged"
        : m.acceptedBy ? "In Progress"
        : t.state;
      // apply tier boost by re-weighting priority if tier is 1
      const tier = svcTier(t.serviceId);
      const boosted: Priority = tier === "Tier 1" && priority !== "P1" ? "P2" : priority;
      return { ...t, owner, basePriority: boosted, state, title: t.title, serviceId: t.serviceId,
               // enrich display of related service later via lookup
               source: t.source, route: t.route,
              };
    });
  }, [ops.approval, ops.incident, ops.executions, ops.changes, ops.services, ops.runbook, mutations]);

  const serviceName = (id: string): string =>
    ops.services.find((s) => s.id === id)?.name ?? id;

  /* ----- Prioritized ranking ----- */

  const ranked = useMemo(() => {
    const now = Date.now();
    return [...tasks].sort((a, b) => {
      // 1. priority (severity band)
      const p = priorityWeight(a.basePriority) - priorityWeight(b.basePriority);
      if (p !== 0) return p;
      // 2. business impact
      const bi = impactWeight(b.businessImpact) - impactWeight(a.businessImpact);
      if (bi !== 0) return bi;
      // 3. slo burn
      const sl = sloWeight(b.sloImpact) - sloWeight(a.sloImpact);
      if (sl !== 0) return sl;
      // 4. tier
      const ta = tierBoost(ops.services.find((s) => s.id === a.serviceId)?.tier ?? "Tier 3");
      const tb = tierBoost(ops.services.find((s) => s.id === b.serviceId)?.tier ?? "Tier 3");
      if (tb !== ta) return tb - ta;
      // 5. deadline
      const da = new Date(a.dueAt).getTime() - now;
      const db = new Date(b.dueAt).getTime() - now;
      return da - db;
    });
  }, [tasks, ops.services]);

  /* ----- Tab filter ----- */

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const byTab = ranked.filter((t) => {
      switch (tab) {
        case "My Work":              return t.owner === CURRENT_USER || t.requiredRole === ops.role;
        case "Team Work":            return t.owner !== CURRENT_USER && t.state !== "Completed";
        case "Approvals":            return t.type === "approval";
        case "Failed Executions":    return t.type === "failed_execution";
        case "Scheduled Work":       return t.type === "scheduled";
        case "Corrective Actions":   return t.type === "corrective_action";
        case "Recently Completed":   return t.state === "Completed";
      }
    });
    return q
      ? byTab.filter((t) => `${t.title} ${t.entityRef} ${serviceName(t.serviceId)}`.toLowerCase().includes(q))
      : byTab;
  }, [ranked, tab, search, ops.role]);

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === detailId) ?? filtered[0] ?? null,
    [tasks, detailId, filtered],
  );

  /* ----- Mutations ----- */

  const mutate = (id: string, patch: TaskMutation) =>
    setMutations((prev) => ({ ...prev, [id]: { ...(prev[id] ?? {}), ...patch } }));

  const runGuarded = (fn: () => void) => {
    if (readOnly) { setError("Your role has read-only access to the operations queue."); return; }
    try { fn(); setError(null); } catch (e) { setError(e instanceof Error ? e.message : "Mutation failed"); }
  };

  const accept = (t: QueueTask) => runGuarded(() => {
    mutate(t.id, { acceptedBy: CURRENT_USER });
    ops.pushNotification({ kind: "info", title: `Accepted ${t.entityRef}`, detail: t.title, entityRef: t.entityRef, route: t.route });
  });

  const start = (t: QueueTask) => { navigate(t.route); };

  const approve = (t: QueueTask) => runGuarded(() => {
    if (t.type !== "approval") { navigate(t.route); return; }
    ops.approveExecution(CURRENT_USER);
    mutate(t.id, { completedAt: new Date().toISOString(), completionEvidence: "Approved via operations queue" });
  });

  const escalate = (t: QueueTask, note: string) => runGuarded(() => {
    const nextPriority: Priority = t.basePriority === "P1" ? "P1"
      : t.basePriority === "P2" ? "P1" : t.basePriority === "P3" ? "P2" : "P3";
    mutate(t.id, { escalated: true, priorityOverride: nextPriority });
    ops.pushNotification({ kind: "warning", title: `Escalated ${t.entityRef}`, detail: note || "Escalation requested from queue", entityRef: t.entityRef, route: t.route });
  });

  const snooze = (t: QueueTask, minutes: number, reason: string) => runGuarded(() => {
    if (!reason.trim()) throw new Error("Snooze requires a reason.");
    mutate(t.id, { snoozedUntil: new Date(Date.now() + minutes * 60_000).toISOString(), snoozeReason: reason });
  });

  const complete = (t: QueueTask, evidence: string) => runGuarded(() => {
    if (!evidence.trim()) throw new Error("Completion requires evidence or a completion note.");
    mutate(t.id, { completedAt: new Date().toISOString(), completionEvidence: evidence });
    ops.pushNotification({ kind: "info", title: `Completed ${t.entityRef}`, detail: t.title, entityRef: t.entityRef, route: t.route });
  });

  const delegate = (t: QueueTask, team: string, user: string) => runGuarded(() => {
    mutate(t.id, { delegatedTeam: team, delegatedUser: user });
  });

  /* ----- Bulk actions ----- */

  const bulkAssignSelf = () => runGuarded(() => {
    selected.forEach((id) => mutate(id, { acceptedBy: CURRENT_USER }));
    setSelected(new Set());
  });
  const bulkAck = () => runGuarded(() => {
    selected.forEach((id) => mutate(id, { acknowledged: true }));
    setSelected(new Set());
  });
  const bulkRaisePriority = () => runGuarded(() => {
    selected.forEach((id) => {
      const t = tasks.find((x) => x.id === id);
      if (!t) return;
      const p: Priority = t.basePriority === "P1" ? "P1" : t.basePriority === "P2" ? "P1"
        : t.basePriority === "P3" ? "P2" : "P3";
      mutate(id, { priorityOverride: p });
    });
    setSelected(new Set());
  });
  const bulkExport = () => {
    const rows = filtered.filter((t) => selected.has(t.id));
    const headers = ["id","priority","title","service","state","owner","dueAt","sloImpact","businessImpact","requiredRole","source","createdAt"];
    const csv = [headers.join(",")].concat(
      rows.map((t) => [
        t.id, t.basePriority, JSON.stringify(t.title), serviceName(t.serviceId), t.state,
        t.owner, t.dueAt, t.sloImpact, t.businessImpact, t.requiredRole, t.source, t.createdAt,
      ].join(",")),
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "operations-queue.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  /* ----- Grid columns ----- */

  const columns: DataGridColumn<QueueTask>[] = [
    { key: "priority", header: "Priority", width: "70px",
      sort: (r) => priorityWeight(r.basePriority),
      accessor: (r) => <PriorityBadge value={r.basePriority} escalated={mutations[r.id]?.escalated} /> },
    { key: "task", header: "Task",
      sort: (r) => r.title,
      accessor: (r) => (
        <button className="text-left font-medium text-slate-900 hover:underline"
          onClick={() => setDetailId(r.id)}>{r.title}
          <div className="text-[10.5px] font-normal text-slate-500">{r.entityRef}</div>
        </button>
      ) },
    { key: "service", header: "Service", sort: (r) => serviceName(r.serviceId),
      accessor: (r) => <span className="text-slate-700">{serviceName(r.serviceId)}</span> },
    { key: "type", header: "Entity", sort: (r) => r.type,
      accessor: (r) => <span className="capitalize text-slate-600">{r.type.replace(/_/g, " ")}</span> },
    { key: "state", header: "State", sort: (r) => r.state,
      accessor: (r) => <StateChip value={r.state} /> },
    { key: "owner", header: "Owner", sort: (r) => r.owner,
      accessor: (r) => <span className="text-slate-700">{r.owner}</span> },
    { key: "due", header: "Due", width: "110px", sort: (r) => r.dueAt,
      accessor: (r) => <DueCell iso={r.dueAt} /> },
    { key: "slo", header: "SLO", width: "90px", sort: (r) => sloWeight(r.sloImpact),
      accessor: (r) => <ImpactChip label={r.sloImpact} tone={sloTone(r.sloImpact)} /> },
    { key: "bi", header: "Business", width: "100px", sort: (r) => impactWeight(r.businessImpact),
      accessor: (r) => <ImpactChip label={r.businessImpact} tone={biTone(r.businessImpact)} /> },
    { key: "role", header: "Role", sort: (r) => r.requiredRole,
      accessor: (r) => <span className="text-slate-600">{r.requiredRole}</span> },
    { key: "source", header: "Source", sort: (r) => r.source,
      accessor: (r) => <span className="text-slate-600">{r.source}</span> },
    { key: "created", header: "Created", width: "110px", sort: (r) => r.createdAt,
      accessor: (r) => <span className="text-slate-500">{formatRel(r.createdAt)}</span> },
  ];
  const [visibleCols, setVisibleCols] = useState<Set<string>>(
    () => new Set(columns.map((c) => c.key).filter((k) => k !== "role" && k !== "source" && k !== "created")),
  );

  /* ----- Stale queue detection ----- */
  const staleQueue = useMemo(() => {
    const ageMs = Date.now() - new Date(ops.dataFreshnessAt).getTime();
    return ageMs > 5 * 60_000;
  }, [ops.dataFreshnessAt]);

  /* ----- Overdue count for banner ----- */
  const overdueCount = filtered.filter((t) => new Date(t.dueAt) < new Date() && t.state !== "Completed").length;

  /* ------------------------------- Render ------------------------------- */

  return (
    <div className="mx-auto max-w-[1600px] p-5">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-500">Operations</div>
          <h1 className="mt-0.5 text-[22px] font-semibold text-slate-900">My Operations Queue</h1>
          <p className="mt-1 max-w-3xl text-[12.5px] text-slate-600">
            Role-aware, prioritized queue of operational work. Ranking blends severity, service tier,
            customer impact, SLO burn, response deadline, and whether the item depends on you.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-[11px]">Role: {ops.role}</Badge>
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={ops.refreshData}>
            <TimerReset className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Banners */}
      {staleQueue && (
        <div className="mb-3">
          <StaleDataState title="Queue may be stale" description="Refresh to pull the latest snapshot from OperationsProvider."
            action={{ label: "Refresh", onClick: ops.refreshData }} />
        </div>
      )}
      {overdueCount > 0 && (
        <div className="mb-3 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-[12px] text-amber-900">
          <AlertOctagon className="h-3.5 w-3.5 text-amber-700" />
          {overdueCount} overdue item{overdueCount === 1 ? "" : "s"} in the current view.
        </div>
      )}
      {readOnly && (
        <div className="mb-3">
          <PermissionDeniedState title={`Role ${ops.role} is read-only`}
            description="Switch to an operator role via the top bar to accept, delegate, approve, or complete work." />
        </div>
      )}
      {error && (
        <div className="mb-3">
          <ErrorState title="Queue mutation failed" description={error}
            action={{ label: "Dismiss", onClick: () => setError(null) }} />
        </div>
      )}

      {/* Tabs */}
      <div className="mb-3 flex flex-wrap items-center gap-1 border-b border-slate-200">
        {TABS.map((t) => {
          const count = ranked.filter((row) => {
            switch (t) {
              case "My Work": return row.owner === CURRENT_USER || row.requiredRole === ops.role;
              case "Team Work": return row.owner !== CURRENT_USER && row.state !== "Completed";
              case "Approvals": return row.type === "approval";
              case "Failed Executions": return row.type === "failed_execution";
              case "Scheduled Work": return row.type === "scheduled";
              case "Corrective Actions": return row.type === "corrective_action";
              case "Recently Completed": return row.state === "Completed";
            }
          }).length;
          const active = t === tab;
          return (
            <button key={t} onClick={() => setTab(t)}
              className={`relative -mb-px border-b-2 px-3 py-2 text-[12.5px] transition ${
                active ? "border-slate-900 font-semibold text-slate-900" : "border-transparent text-slate-600 hover:text-slate-900"
              }`}>
              {t}
              <span className="ml-1.5 rounded bg-slate-100 px-1 text-[10.5px] text-slate-600">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search tasks, entities, services" className="w-64" />
        <ColumnSelector
          columns={columns.map((c) => ({ key: c.key, header: c.header }))}
          visible={visibleCols} onChange={setVisibleCols}
        />
        <div className="ml-auto flex items-center gap-1">
          <span className="text-[11px] text-slate-500">{selected.size} selected</span>
          <Button size="sm" variant="outline" className="h-7 text-[11.5px]" disabled={selected.size === 0} onClick={bulkAssignSelf}>
            <UserPlus className="mr-1 h-3 w-3" /> Assign me
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11.5px]" disabled={selected.size === 0} onClick={bulkRaisePriority}>
            <Zap className="mr-1 h-3 w-3" /> Raise priority
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11.5px]" disabled={selected.size === 0} onClick={bulkAck}>
            <CheckCircle2 className="mr-1 h-3 w-3" /> Acknowledge
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11.5px]" disabled={selected.size === 0 || readOnly} onClick={bulkExport}>
            <Download className="mr-1 h-3 w-3" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Grid + detail */}
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 border-slate-200 xl:col-span-8">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <EmptyState title="No assigned work" description="The queue is clear for this tab." />
            ) : (
              <DataGrid<QueueTask>
                rows={filtered}
                columns={columns}
                visibleColumns={visibleCols}
                getRowId={(r) => r.id}
                selection={{ selected, onChange: setSelected }}
                caption="Prioritized operations queue"
              />
            )}
          </CardContent>
        </Card>

        {/* Detail panel */}
        <Card className="col-span-12 border-slate-200 xl:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-[14px]">Selected Task</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedTask ? (
              <EmptyState title="Select a task" description="Click any task row to view its detail and actions." />
            ) : (
              <TaskDetail
                task={selectedTask}
                mutation={mutations[selectedTask.id]}
                serviceName={serviceName(selectedTask.serviceId)}
                onAccept={() => accept(selectedTask)}
                onStart={() => start(selectedTask)}
                onApprove={() => approve(selectedTask)}
                onDelegate={() => setDialog({ kind: "delegate", taskId: selectedTask.id })}
                onSnooze={() => setDialog({ kind: "snooze", taskId: selectedTask.id })}
                onComplete={() => setDialog({ kind: "complete", taskId: selectedTask.id })}
                onEscalate={() => setDialog({ kind: "escalate", taskId: selectedTask.id })}
                disabled={readOnly}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      {dialog && (() => {
        const t = tasks.find((x) => x.id === dialog.taskId);
        if (!t) return null;
        return (
          <TaskActionDialog kind={dialog.kind} task={t}
            onClose={() => setDialog(null)}
            onDelegate={(team, user) => { delegate(t, team, user); setDialog(null); }}
            onSnooze={(mins, reason) => { snooze(t, mins, reason); setDialog(null); }}
            onComplete={(evidence) => { complete(t, evidence); setDialog(null); }}
            onEscalate={(note) => { escalate(t, note); setDialog(null); }}
          />
        );
      })()}
    </div>
  );
}

/* ------------------------------ Sub-components -------------------------- */

function PriorityBadge({ value, escalated }: { value: Priority; escalated?: boolean }) {
  const tone = value === "P1" ? "bg-red-100 text-red-800 border-red-200"
    : value === "P2" ? "bg-amber-100 text-amber-800 border-amber-200"
    : value === "P3" ? "bg-sky-100 text-sky-800 border-sky-200"
    : "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-semibold ${tone}`}>
      {value}{escalated && <ArrowUpRight className="h-3 w-3" aria-label="escalated" />}
    </span>
  );
}

function StateChip({ value }: { value: TaskState }) {
  const tone = value === "Completed" ? "healthy"
    : value === "In Progress" ? "connected"
    : value === "Blocked" ? "critical"
    : value === "Snoozed" ? "neutral"
    : value === "Acknowledged" ? "at-risk"
    : "warning";
  return <StatusIndicator tone={tone} label={value} />;
}

function sloTone(v: SloImpact): "healthy" | "at-risk" | "warning" | "critical" | "neutral" {
  return v === "Breach" ? "critical" : v === "High" ? "critical" : v === "Medium" ? "warning" : v === "Low" ? "at-risk" : "neutral";
}
function biTone(v: BusinessImpact): "healthy" | "at-risk" | "warning" | "critical" | "neutral" {
  return v === "Critical" ? "critical" : v === "High" ? "warning" : v === "Medium" ? "at-risk" : "neutral";
}
function ImpactChip({ label, tone }: { label: string; tone: "healthy" | "at-risk" | "warning" | "critical" | "neutral" }) {
  return <StatusIndicator tone={tone} label={label} />;
}

function DueCell({ iso }: { iso: string }) {
  const t = new Date(iso).getTime();
  const diff = t - Date.now();
  const overdue = diff < 0;
  return (
    <span className={overdue ? "font-medium text-red-700" : "text-slate-700"}>
      {formatRel(iso)}{overdue ? " overdue" : ""}
    </span>
  );
}

function formatRel(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diff);
  const m = Math.round(abs / 60_000);
  if (m < 60) return `${diff < 0 ? "-" : "in "}${m}m`;
  const h = Math.round(m / 60);
  if (h < 48) return `${diff < 0 ? "-" : "in "}${h}h`;
  const d = Math.round(h / 24);
  return `${diff < 0 ? "-" : "in "}${d}d`;
}

/* ------------------------------- Detail --------------------------------- */

function TaskDetail(props: {
  task: QueueTask;
  mutation?: TaskMutation;
  serviceName: string;
  disabled: boolean;
  onAccept: () => void;
  onStart: () => void;
  onApprove: () => void;
  onDelegate: () => void;
  onSnooze: () => void;
  onComplete: () => void;
  onEscalate: () => void;
}) {
  const { task, mutation, serviceName, disabled } = props;
  const rows: Array<[string, ReactNode]> = [
    ["Entity", <span key="e" className="font-mono text-[11.5px]">{task.entityRef}</span>],
    ["Type", <span key="t" className="capitalize">{task.type.replace(/_/g, " ")}</span>],
    ["State", <StateChip key="st" value={task.state} />],
    ["Service", serviceName],
    ["Owner", task.owner],
    ["Required role", task.requiredRole],
    ["Priority", <PriorityBadge key="p" value={task.basePriority} escalated={mutation?.escalated} />],
    ["SLO impact", task.sloImpact],
    ["Business impact", task.businessImpact],
    ["Due", formatRel(task.dueAt)],
    ["Created", formatRel(task.createdAt)],
    ["Source", task.source],
  ];
  const isApproval = task.type === "approval";
  const done = task.state === "Completed";
  return (
    <div className="space-y-3">
      <div>
        <div className="text-[10.5px] uppercase tracking-wider text-slate-500">Task</div>
        <div className="text-[13.5px] font-semibold text-slate-900">{task.title}</div>
      </div>
      <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1.5 text-[12px]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-[10.5px] uppercase tracking-wider text-slate-500">{k}</dt>
            <dd className="text-slate-800">{v}</dd>
          </div>
        ))}
      </dl>
      {mutation?.snoozedUntil && (
        <div className="rounded border border-slate-200 bg-slate-50 p-2 text-[11.5px] text-slate-700">
          Snoozed until {new Date(mutation.snoozedUntil).toLocaleString()} — {mutation.snoozeReason}
        </div>
      )}
      {mutation?.completionEvidence && (
        <div className="rounded border border-emerald-200 bg-emerald-50 p-2 text-[11.5px] text-emerald-900">
          Completed: {mutation.completionEvidence}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" className="h-8 text-[12px]" onClick={props.onAccept} disabled={disabled || done}>
          <UserPlus className="mr-1 h-3.5 w-3.5" /> Accept
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={props.onDelegate} disabled={disabled || done}>
          Delegate
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={props.onStart}>
          <Play className="mr-1 h-3.5 w-3.5" /> Start
        </Button>
        {isApproval ? (
          <Button size="sm" className="h-8 bg-emerald-700 text-[12px] hover:bg-emerald-800" onClick={props.onApprove} disabled={disabled || done}>
            <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Approve
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={props.onEscalate} disabled={disabled || done}>
            <Zap className="mr-1 h-3.5 w-3.5" /> Escalate
          </Button>
        )}
        <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={props.onSnooze} disabled={disabled || done}>
          Snooze
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={props.onComplete} disabled={disabled || done}>
          <ClipboardList className="mr-1 h-3.5 w-3.5" /> Complete
        </Button>
      </div>
      <div className="text-[11px]">
        <Link to={task.route} className="text-sky-700 underline">Open full view →</Link>
      </div>
    </div>
  );
}

/* ------------------------------- Dialogs -------------------------------- */

function TaskActionDialog(props: {
  kind: "delegate" | "snooze" | "complete" | "escalate";
  task: QueueTask;
  onClose: () => void;
  onDelegate: (team: string, user: string) => void;
  onSnooze: (minutes: number, reason: string) => void;
  onComplete: (evidence: string) => void;
  onEscalate: (note: string) => void;
}) {
  const { kind, task, onClose } = props;
  const [team, setTeam] = useState("Checkout Squad");
  const [user, setUser] = useState("");
  const [reason, setReason] = useState("");
  const [minutes, setMinutes] = useState<number>(30);
  const [evidence, setEvidence] = useState("");
  const [note, setNote] = useState("");
  return (
    <Dialog open onOpenChange={(v) => (v ? undefined : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[15px]">
            {kind === "delegate" ? "Delegate task"
              : kind === "snooze" ? "Snooze task"
              : kind === "complete" ? "Complete task"
              : "Escalate task"}
          </DialogTitle>
          <DialogDescription className="text-[12px]">{task.title} · {task.entityRef}</DialogDescription>
        </DialogHeader>

        {kind === "delegate" && (
          <div className="space-y-2">
            <div>
              <Label className="text-[11px]">Team</Label>
              <Select value={team} onValueChange={setTeam}>
                <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Checkout Squad">Checkout Squad</SelectItem>
                  <SelectItem value="Payments Squad">Payments Squad</SelectItem>
                  <SelectItem value="Identity Squad">Identity Squad</SelectItem>
                  <SelectItem value="Platform Squad">Platform Squad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px]">User (optional)</Label>
              <Input value={user} onChange={(e) => setUser(e.target.value)} placeholder="jane.doe" className="h-8 text-[12px]" />
            </div>
          </div>
        )}

        {kind === "snooze" && (
          <div className="space-y-2">
            <div>
              <Label className="text-[11px]">Duration (minutes)</Label>
              <Input type="number" min={5} value={minutes} onChange={(e) => setMinutes(Number(e.target.value) || 0)} className="h-8 text-[12px]" />
            </div>
            <div>
              <Label className="text-[11px]">Reason (required)</Label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="text-[12px]" />
            </div>
          </div>
        )}

        {kind === "complete" && (
          <div>
            <Label className="text-[11px]">Evidence or completion criteria (required)</Label>
            <Textarea value={evidence} onChange={(e) => setEvidence(e.target.value)} rows={4} className="text-[12px]"
              placeholder="Link to run, validation output, or note on completion." />
          </div>
        )}

        {kind === "escalate" && (
          <div>
            <Label className="text-[11px]">Escalation note</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="text-[12px]" />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={() => {
            if (kind === "delegate") props.onDelegate(team, user);
            else if (kind === "snooze") props.onSnooze(minutes, reason);
            else if (kind === "complete") props.onComplete(evidence);
            else props.onEscalate(note);
          }}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
