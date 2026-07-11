/**
 * Page 33 · Corrective Actions and Known Errors
 * Route: /runops/problems/actions
 *
 * Post-incident improvements, problem records, known errors, and
 * effectiveness verification. This page is the single register for
 * "learning that got assigned" — every action stays traceable to its
 * source incident, problem, evidence, and verified outcome.
 *
 * Persistence (localStorage):
 *   runops.problem_actions.v1     → ActionRecord[]  (canonical for this page)
 *   runops.correctiveactions.v1   → CorrectiveAction[] (Postmortem source; imported)
 *   runops.problems.v1            → ProblemRecord[]
 *   runops.knownerrors.v1         → KnownErrorRecord[]
 *   runops.runbookproposals.v1    → append on Convert-to-Runbook
 *   runops.automationcandidates.v1→ append on Create Automation Candidate
 *   runops.monitoringproposals.v1 → append on Create Monitoring Requirement
 *   runops.engwork.v1             → append on Link Engineering Work
 *   runops.postmortemdocs.v1      → effectiveness verification mirror
 *   runops.servicereadiness.v1    → mark reliability impact on completion
 *   runops.analytics.v1           → effectiveness signal append
 *   runops.incidents.v1           → timeline mirror per mutation
 *
 * Every mutation emits an audit + domain event via ops.pushNotification.
 * No fixture-array imports. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle, ArrowUpRight, BookOpen, Bot, CheckCircle2, ClipboardList,
  ExternalLink, FileSearch, Gauge, GitBranch, Link2, ListChecks, PlusCircle,
  Search, ShieldAlert, ShieldCheck, TimerReset, UserCheck, Wrench, XCircle,
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

type ActionStatus =
  | "Open"
  | "In progress"
  | "Blocked"
  | "Overdue"
  | "Completed"
  | "Awaiting effectiveness review"
  | "Effective"
  | "Ineffective";

type Priority = "P0" | "P1" | "P2" | "P3";
type Category = "Process" | "Code" | "Infra" | "Monitoring" | "Runbook" | "Policy";
type VerificationMethod =
  | "Synthetic re-run"
  | "SLO burn observation"
  | "Chaos exercise"
  | "Manual audit"
  | "Regression suite";

interface EvidenceRef { id: string; label: string; href: string; note: string }

interface RecurrenceEntry { incidentId: string; at: string; note: string }

interface ActionRecord {
  id: string;                    // ACT-####
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: ActionStatus;
  ownerName: string | null;
  ownerRole: string | null;
  service: string;
  incidentId: string;            // INC-####
  problemId: string | null;      // PRB-####
  dueDate: string;               // ISO date
  expectedImpact: string;        // reliability impact statement
  runbookLink: string | null;    // /runops/runbooks/...
  engWorkLink: string | null;    // https://jira.example/...
  verificationMethod: VerificationMethod;
  verificationNote: string;
  recurrence: RecurrenceEntry[];
  evidence: EvidenceRef[];
  blockedReason: string | null;
  effectivenessDecision: null | { by: string; at: string; effective: boolean; note: string };
  createdAt: string;
  updatedAt: string;
}

interface ProblemRecord {
  id: string;                    // PRB-####
  title: string;
  incidentId: string;
  service: string;
  state: "Open" | "Under Investigation" | "Known Error" | "Resolved";
  createdAt: string;
  linkedActionIds: string[];
  summary: string;
  ownerName: string | null;
}

interface KnownErrorRecord {
  id: string;                    // KE-####
  title: string;
  problemId: string | null;
  symptom: string;
  workaround: string;
  triggeringConditions: string;
  matchesQuery: string;          // used by Alert Triage / Investigation matching
  createdAt: string;
}

/* --------------------------- Storage helpers ---------------------------- */

const ACTIONS_KEY   = "runops.problem_actions.v1";
const CORR_KEY      = "runops.correctiveactions.v1";
const PROBLEMS_KEY  = "runops.problems.v1";
const KE_KEY        = "runops.knownerrors.v1";
const RB_PROP_KEY   = "runops.runbookproposals.v1";
const AUTO_KEY      = "runops.automationcandidates.v1";
const MON_PROP_KEY  = "runops.monitoringproposals.v1";
const ENG_KEY       = "runops.engwork.v1";
const PM_DOCS_KEY   = "runops.postmortemdocs.v1";
const READY_KEY     = "runops.servicereadiness.v1";
const ANALYTICS_KEY = "runops.analytics.v1";
const INCIDENTS_KEY = "runops.incidents.v1";

function readList<T>(k: string): T[] {
  try { const v = JSON.parse(localStorage.getItem(k) ?? "[]"); return Array.isArray(v) ? (v as T[]) : []; }
  catch { return []; }
}
function writeList<T>(k: string, v: T[]) { localStorage.setItem(k, JSON.stringify(v)); }
function readMap<T>(k: string): Record<string, T> {
  try { const v = JSON.parse(localStorage.getItem(k) ?? "{}"); return v && typeof v === "object" ? (v as Record<string, T>) : {}; }
  catch { return {}; }
}
function writeMap<T>(k: string, v: Record<string, T>) { localStorage.setItem(k, JSON.stringify(v)); }

const nowIso = () => new Date().toISOString();
const rid = (p: string) => `${p}-${(Math.floor(Math.random() * 9000) + 1000).toString()}`;

/* ------------------------- Deterministic seed --------------------------- */

const CANONICAL_INCIDENT = "INC-10482";

function seedActions(): ActionRecord[] {
  const now = nowIso();
  const daysFromNow = (d: number) => {
    const t = new Date(); t.setDate(t.getDate() + d); return t.toISOString();
  };
  const ev = (id: string, label: string, href: string, note: string): EvidenceRef => ({ id, label, href, note });

  return [
    {
      id: "ACT-1091",
      title: "Add prod canary phase to change policy CP-207",
      description:
        "Require ≥ 5-minute prod canary on 5% traffic for any query-plan-affecting change before general rollout.",
      category: "Policy",
      priority: "P0",
      status: "In progress",
      ownerName: "Priya S.",
      ownerRole: "Change Manager",
      service: "checkout-api",
      incidentId: CANONICAL_INCIDENT,
      problemId: "PRB-1082",
      dueDate: daysFromNow(3),
      expectedImpact: "Prevents same class of regression; reduces change-related SEV1s by ~35% based on prior 12mo.",
      runbookLink: null,
      engWorkLink: "https://jira.example/CHG-POLICY-2201",
      verificationMethod: "Manual audit",
      verificationNote: "Verify next 3 index-shape changes ran a prod canary before general rollout.",
      recurrence: [
        { incidentId: "INC-10221", at: "2025-11-04", note: "Similar regression class." },
      ],
      evidence: [ev("EV-CHG", "CHG-20391 change record", "https://changes.example/CHG-20391", "Rollout plan skipped canary.")],
      blockedReason: null,
      effectivenessDecision: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "ACT-1092",
      title: "Add leading indicator for connection-pool waiters on checkout-db-01",
      description:
        "Introduce a p95 waiters SLI with a warn threshold that fires before customer-visible impact.",
      category: "Monitoring",
      priority: "P1",
      status: "Open",
      ownerName: "Dana K.",
      ownerRole: "SRE",
      service: "checkout-api",
      incidentId: CANONICAL_INCIDENT,
      problemId: "PRB-1082",
      dueDate: daysFromNow(7),
      expectedImpact: "Cuts MTTD for pool saturation from ~5m to <60s.",
      runbookLink: null,
      engWorkLink: null,
      verificationMethod: "SLO burn observation",
      verificationNote: "Observe next pool-pressure event; new SLI must fire first.",
      recurrence: [],
      evidence: [ev("EV-ALT", "Alert routing history", "https://alerting.example/checkout", "Order of fires recorded.")],
      blockedReason: null,
      effectivenessDecision: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "ACT-1093",
      title: "Convert checkout DB-recovery to certified runbook RB-CO-014",
      description:
        "Promote the ad-hoc mitigation steps from INC-10482 to a certified runbook with step-level policies.",
      category: "Runbook",
      priority: "P1",
      status: "Awaiting effectiveness review",
      ownerName: "Marco T.",
      ownerRole: "Platform Engineer",
      service: "checkout-api",
      incidentId: CANONICAL_INCIDENT,
      problemId: "PRB-1082",
      dueDate: daysFromNow(-1),
      expectedImpact: "Reduces mitigation MTTR to <2 min via one-click execution.",
      runbookLink: "/runops/runbooks/RB-CO-014",
      engWorkLink: "https://jira.example/RB-CO-014",
      verificationMethod: "Chaos exercise",
      verificationNote: "GameDay 2026-07-18 will exercise the certified path end-to-end.",
      recurrence: [],
      evidence: [ev("EV-RB", "Runbook draft RB-CO-014", "/runops/runbooks/RB-CO-014", "Draft ready for certification.")],
      blockedReason: null,
      effectivenessDecision: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "ACT-1094",
      title: "Automate rollback of index-shape changes on p95 breach",
      description:
        "Autonomy L2 automation candidate: on sustained p95 breach after an index-shape deploy, auto-revert.",
      category: "Code",
      priority: "P2",
      status: "Blocked",
      ownerName: null,
      ownerRole: null,
      service: "checkout-api",
      incidentId: CANONICAL_INCIDENT,
      problemId: "PRB-1082",
      dueDate: daysFromNow(21),
      expectedImpact: "Removes human from rollback loop for a well-scoped class.",
      runbookLink: null,
      engWorkLink: null,
      verificationMethod: "Chaos exercise",
      verificationNote: "Requires L2 autonomy approval in AI Governance first.",
      recurrence: [],
      evidence: [],
      blockedReason: "Requires L2 autonomy approval in AI Governance before implementation.",
      effectivenessDecision: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "ACT-1088",
      title: "Document workaround: raise pool_max_size to 40 under peak",
      description:
        "Publish the temporary mitigation used during INC-10482 as a known-error workaround for on-call.",
      category: "Process",
      priority: "P1",
      status: "Effective",
      ownerName: "Priya S.",
      ownerRole: "SRE",
      service: "checkout-api",
      incidentId: "INC-10221",
      problemId: "PRB-1082",
      dueDate: daysFromNow(-14),
      expectedImpact: "Cuts recovery time for pool-saturation events pending root fix.",
      runbookLink: "/runops/runbooks/RB-CO-014",
      engWorkLink: null,
      verificationMethod: "Synthetic re-run",
      verificationNote: "Re-run of synthetic checkout journey after tuning showed p95 recovery within 90s.",
      recurrence: [
        { incidentId: "INC-10482", at: "2026-07-11", note: "Workaround re-applied successfully." },
      ],
      evidence: [ev("EV-VRF", "Synthetic run 2026-07-11", "https://synth.example/checkout/run-9821", "p95 within SLO after workaround.")],
      blockedReason: null,
      effectivenessDecision: { by: "Change Manager", at: nowIso(), effective: true, note: "Verified via synthetic re-run and SLO observation." },
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function seedProblems(): ProblemRecord[] {
  return [
    {
      id: "PRB-1082",
      title: "Checkout query-plan regression under peak concurrency",
      incidentId: CANONICAL_INCIDENT,
      service: "checkout-api",
      state: "Known Error",
      createdAt: nowIso(),
      linkedActionIds: ["ACT-1091", "ACT-1092", "ACT-1093", "ACT-1094", "ACT-1088"],
      summary:
        "Compound index deployed by CHG-20391 shifts checkout join plan under peak concurrency, saturating the connection pool.",
      ownerName: "Marco T.",
    },
  ];
}

function seedKnownErrors(): KnownErrorRecord[] {
  return [
    {
      id: "KE-2044",
      title: "checkout-db-01 pool saturation after index-shape change",
      problemId: "PRB-1082",
      symptom: "checkout-api 502 rate rises with p95 > 900ms; DB waiters > 0 sustained.",
      workaround: "Raise pool_max_size to 40 (temporary) and revert the offending index change.",
      triggeringConditions: "Peak traffic (> 18 concurrent sessions) after any query-plan-affecting change.",
      matchesQuery: "service:checkout-api symptom:502 db:waiters>0",
      createdAt: nowIso(),
    },
  ];
}

/* ------------------------- Derived helpers ------------------------------ */

function isOverdue(a: ActionRecord): boolean {
  if (a.status === "Completed" || a.status === "Effective") return false;
  return new Date(a.dueDate).getTime() < Date.now();
}

function statusTone(s: ActionStatus): string {
  switch (s) {
    case "Open":                          return "bg-slate-100 text-slate-700 border-slate-200";
    case "In progress":                   return "bg-blue-50 text-blue-800 border-blue-200";
    case "Blocked":                       return "bg-amber-50 text-amber-800 border-amber-200";
    case "Overdue":                       return "bg-red-50 text-red-800 border-red-200";
    case "Completed":                     return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "Awaiting effectiveness review": return "bg-purple-50 text-purple-800 border-purple-200";
    case "Effective":                     return "bg-emerald-100 text-emerald-900 border-emerald-300";
    case "Ineffective":                   return "bg-rose-50 text-rose-800 border-rose-200";
  }
}
function priorityTone(p: Priority): string {
  switch (p) {
    case "P0": return "bg-red-50 text-red-800 border-red-200";
    case "P1": return "bg-orange-50 text-orange-800 border-orange-200";
    case "P2": return "bg-blue-50 text-blue-800 border-blue-200";
    case "P3": return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

/* -------------------------------- Page ---------------------------------- */

type TabKey = "actions" | "problems" | "known" | "overdue" | "reviews" | "completed";

type DialogKey =
  | null
  | "create"
  | "assign"
  | "prioritize"
  | "runbook"
  | "automation"
  | "monitoring"
  | "engwork"
  | "complete"
  | "request-review"
  | "verify"
  | "reject"
  | "escalate"
  | "workaround"
  | "unblock";

export default function ProblemActions() {
  const ops = useOperations();
  const navigate = useNavigate();
  const canWrite = !(ops.role === "Read Only User" || ops.role === "Auditor");

  const [actions, setActions] = useState<ActionRecord[]>([]);
  const [problems, setProblems] = useState<ProblemRecord[]>([]);
  const [knownErrors, setKnownErrors] = useState<KnownErrorRecord[]>([]);
  const [tab, setTab] = useState<TabKey>("actions");
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | Priority>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ActionStatus>("all");
  const [sortKey, setSortKey] = useState<"due" | "priority" | "status" | "updated">("due");
  const [page, setPage] = useState(0);
  const [dialog, setDialog] = useState<DialogKey>(null);
  const [target, setTarget] = useState<string>(""); // action id
  const [inp, setInp] = useState<Record<string, string>>({});
  const pageSize = 8;

  /* ---------------------------- Load / seed --------------------------- */
  useEffect(() => {
    // Actions
    let existing = readList<ActionRecord>(ACTIONS_KEY);
    // Import any Corrective Actions appended by Postmortem that we haven't imported yet.
    interface CorrShape {
      id: string; title: string; description: string; category: Category;
      priority: string; state?: string; owner?: { ownerName: string; ownerRole: string; dueAt: string } | null;
      linkedFindingId?: string; updatedAt?: string; incidentId?: string; problemId?: string | null;
    }
    const imported = readList<CorrShape>(CORR_KEY);
    const knownIds = new Set(existing.map((a) => a.id));
    const promoted: ActionRecord[] = imported
      .filter((c) => !knownIds.has(c.id))
      .map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description ?? "",
        category: c.category ?? "Process",
        priority: (["P0", "P1", "P2", "P3"].includes(c.priority) ? c.priority : "P2") as Priority,
        status: (c.state === "Completed" ? "Completed" : c.state === "Accepted" ? "In progress" : "Open") as ActionStatus,
        ownerName: c.owner?.ownerName ?? null,
        ownerRole: c.owner?.ownerRole ?? null,
        service: "checkout-api",
        incidentId: c.incidentId ?? CANONICAL_INCIDENT,
        problemId: c.problemId ?? "PRB-1082",
        dueDate: c.owner?.dueAt ?? nowIso(),
        expectedImpact: "Imported from Postmortem — reliability impact pending assessment.",
        runbookLink: null,
        engWorkLink: null,
        verificationMethod: "Manual audit",
        verificationNote: "",
        recurrence: [],
        evidence: [],
        blockedReason: null,
        effectivenessDecision: null,
        createdAt: c.updatedAt ?? nowIso(),
        updatedAt: c.updatedAt ?? nowIso(),
      }));
    if (existing.length === 0 && promoted.length === 0) existing = seedActions();
    const merged = [...promoted, ...existing];
    // Auto-mark Overdue for anything past due that hasn't been terminal-stated.
    const withOverdue = merged.map((a) => (isOverdue(a) && a.status !== "Overdue" && a.status !== "Awaiting effectiveness review" ? { ...a, status: "Overdue" as ActionStatus } : a));
    writeList(ACTIONS_KEY, withOverdue);
    setActions(withOverdue);

    // Problems
    const p = readList<ProblemRecord>(PROBLEMS_KEY);
    if (p.length === 0) { const seeded = seedProblems(); writeList(PROBLEMS_KEY, seeded); setProblems(seeded); }
    else setProblems(p);

    // Known errors
    const ke = readList<KnownErrorRecord>(KE_KEY);
    if (ke.length === 0) { const seeded = seedKnownErrors(); writeList(KE_KEY, seeded); setKnownErrors(seeded); }
    else setKnownErrors(ke);
  }, []);

  /* ----------------------------- Helpers ------------------------------ */

  const audit = useCallback((title: string, detail: string, kind: "info" | "warning" | "critical" = "info", entityRef?: string) => {
    ops.pushNotification({
      kind, title, detail,
      entityRef: entityRef ?? "problems.actions",
      route: "/runops/problems/actions",
    });
  }, [ops]);

  const mirrorIncident = useCallback((incidentId: string, label: string, detail?: string) => {
    const map = readMap<{ timeline?: { at: string; label: string; detail?: string }[] }>(INCIDENTS_KEY);
    const inc = map[incidentId] ?? {};
    const timeline = Array.isArray(inc.timeline) ? [...inc.timeline] : [];
    timeline.push({ at: nowIso(), label, detail });
    map[incidentId] = { ...inc, timeline };
    writeMap(INCIDENTS_KEY, map);
  }, []);

  const persistActions = useCallback((next: ActionRecord[]) => {
    writeList(ACTIONS_KEY, next);
    setActions(next);
  }, []);

  const updateAction = useCallback((id: string, patch: Partial<ActionRecord>) => {
    const next = actions.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: nowIso() } : a));
    persistActions(next);
    return next.find((a) => a.id === id) ?? null;
  }, [actions, persistActions]);

  const appendAnalytics = useCallback((kind: string, payload: Record<string, unknown>) => {
    const list = readList<Record<string, unknown>>(ANALYTICS_KEY);
    list.push({ kind, at: nowIso(), ...payload });
    writeList(ANALYTICS_KEY, list);
  }, []);

  /* ---------------------------- Filters ------------------------------- */

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    const base = actions.filter((a) => {
      if (tab === "overdue" && a.status !== "Overdue") return false;
      if (tab === "reviews" && a.status !== "Awaiting effectiveness review") return false;
      if (tab === "completed" && !(a.status === "Completed" || a.status === "Effective" || a.status === "Ineffective")) return false;
      if (priorityFilter !== "all" && a.priority !== priorityFilter) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (q) {
        const hay = `${a.id} ${a.title} ${a.incidentId} ${a.problemId ?? ""} ${a.service} ${a.ownerName ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const pRank: Record<Priority, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
    const sorted = [...base].sort((a, b) => {
      switch (sortKey) {
        case "due":      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "priority": return pRank[a.priority] - pRank[b.priority];
        case "status":   return a.status.localeCompare(b.status);
        case "updated":  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
    return sorted;
  }, [actions, tab, priorityFilter, statusFilter, sortKey, q]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice(page * pageSize, page * pageSize + pageSize);
  useEffect(() => { if (page > pageCount - 1) setPage(0); }, [page, pageCount]);

  const counts = useMemo(() => ({
    actions: actions.filter((a) => !(a.status === "Completed" || a.status === "Effective" || a.status === "Ineffective")).length,
    overdue: actions.filter((a) => a.status === "Overdue").length,
    reviews: actions.filter((a) => a.status === "Awaiting effectiveness review").length,
    completed: actions.filter((a) => a.status === "Completed" || a.status === "Effective" || a.status === "Ineffective").length,
  }), [actions]);

  /* ---------------------------- Mutations ----------------------------- */

  const openDialog = (k: DialogKey, id?: string) => {
    setDialog(k);
    setTarget(id ?? "");
    setInp({});
  };

  const doCreate = () => {
    if (!canWrite) return;
    const title = (inp.title ?? "").trim();
    if (!title) { audit("Create action rejected", "Title is required.", "warning"); return; }
    const rec: ActionRecord = {
      id: rid("ACT"),
      title,
      description: inp.description ?? "",
      category: (inp.category as Category) ?? "Process",
      priority: (inp.priority as Priority) ?? "P2",
      status: "Open",
      ownerName: null,
      ownerRole: null,
      service: inp.service?.trim() || "checkout-api",
      incidentId: inp.incidentId?.trim() || CANONICAL_INCIDENT,
      problemId: inp.problemId?.trim() || null,
      dueDate: inp.dueDate || new Date(Date.now() + 7 * 86400_000).toISOString(),
      expectedImpact: inp.expectedImpact ?? "",
      runbookLink: null,
      engWorkLink: null,
      verificationMethod: (inp.verificationMethod as VerificationMethod) ?? "Manual audit",
      verificationNote: "",
      recurrence: [],
      evidence: [],
      blockedReason: null,
      effectivenessDecision: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    persistActions([rec, ...actions]);
    mirrorIncident(rec.incidentId, `Corrective action ${rec.id} created`, rec.title);
    audit(`Action created · ${rec.id}`, `${rec.title} · linked to ${rec.incidentId}`, "info", rec.id);
    setDialog(null);
  };

  const doAssign = () => {
    if (!canWrite || !target) return;
    const name = (inp.ownerName ?? "").trim();
    if (!name) return;
    const patched = updateAction(target, {
      ownerName: name,
      ownerRole: inp.ownerRole?.trim() || "Engineer",
      status: "In progress",
    });
    if (patched) {
      mirrorIncident(patched.incidentId, `Action ${target} assigned`, `${name} · ${inp.ownerRole ?? "Engineer"}`);
      audit(`Action assigned · ${target}`, `${name} · due ${new Date(patched.dueDate).toLocaleDateString()}`, "info", target);
    }
    setDialog(null);
  };

  const doPrioritize = () => {
    if (!canWrite || !target) return;
    const p = (inp.priority as Priority) || "P2";
    const patched = updateAction(target, { priority: p, dueDate: inp.dueDate || (actions.find((a) => a.id === target)?.dueDate ?? nowIso()) });
    if (patched) audit(`Action reprioritised · ${target}`, `Set to ${p}, due ${new Date(patched.dueDate).toLocaleDateString()}`, "info", target);
    setDialog(null);
  };

  const doRunbook = () => {
    if (!canWrite || !target) return;
    const a = actions.find((x) => x.id === target);
    if (!a) return;
    const runbookId = inp.runbookId?.trim() || "RB-CO-014";
    const proposal = {
      id: rid("RBP"),
      runbookId,
      runbookName: inp.runbookName?.trim() || "Checkout DB recovery",
      change: inp.change?.trim() || "Promote mitigation to certified runbook version.",
      rationale: `Derived from ${a.id} on ${a.incidentId}.`,
      linkedActionId: a.id,
      state: "Proposed",
      updatedAt: nowIso(),
    };
    const list = readList<Record<string, unknown>>(RB_PROP_KEY);
    list.push(proposal);
    writeList(RB_PROP_KEY, list);
    updateAction(target, { runbookLink: `/runops/runbooks/${runbookId}`, category: "Runbook" });
    mirrorIncident(a.incidentId, `Runbook proposal from ${a.id}`, proposal.change);
    audit(`Runbook proposal created · ${runbookId}`, `Appears in Runbook Detail and Fitness.`, "info", target);
    setDialog(null);
  };

  const doAutomation = () => {
    if (!canWrite || !target) return;
    const a = actions.find((x) => x.id === target); if (!a) return;
    const cand = {
      id: rid("AUTO"),
      title: inp.title?.trim() || `Automation for ${a.title}`,
      autonomy: inp.autonomy?.trim() || "L1",
      rationale: inp.rationale?.trim() || "Reduce human toil for recurring mitigation.",
      linkedActionId: a.id,
      linkedIncidentId: a.incidentId,
      state: "Proposed",
      createdAt: nowIso(),
    };
    const list = readList<Record<string, unknown>>(AUTO_KEY);
    list.push(cand);
    writeList(AUTO_KEY, list);
    audit(`Automation candidate created · ${cand.id}`, "Appears on /runops/automation.", "info", target);
    setDialog(null);
  };

  const doMonitoring = () => {
    if (!canWrite || !target) return;
    const a = actions.find((x) => x.id === target); if (!a) return;
    const req = {
      id: rid("MON"),
      kind: inp.kind?.trim() || "SLO",
      target: inp.monTarget?.trim() || "checkout-db-01 pool waiters p95",
      change: inp.change?.trim() || "Add leading indicator SLI.",
      rationale: `Recorded via ${a.id}.`,
      linkedActionId: a.id,
      state: "Proposed",
      updatedAt: nowIso(),
    };
    const list = readList<Record<string, unknown>>(MON_PROP_KEY);
    list.push(req);
    writeList(MON_PROP_KEY, list);
    audit(`Monitoring requirement created · ${req.id}`, `${req.kind} · ${req.target}`, "info", target);
    setDialog(null);
  };

  const doEngWork = () => {
    if (!canWrite || !target) return;
    const url = (inp.url ?? "").trim();
    if (!url) return;
    const a = actions.find((x) => x.id === target); if (!a) return;
    const entry = {
      id: rid("ENG"),
      actionId: a.id,
      url,
      label: inp.label?.trim() || url,
      createdAt: nowIso(),
    };
    const list = readList<Record<string, unknown>>(ENG_KEY);
    list.push(entry);
    writeList(ENG_KEY, list);
    updateAction(target, { engWorkLink: url });
    audit(`Engineering work linked · ${a.id}`, url, "info", target);
    setDialog(null);
  };

  const doComplete = () => {
    if (!canWrite || !target) return;
    const a = actions.find((x) => x.id === target); if (!a) return;
    updateAction(target, { status: "Completed" });
    mirrorIncident(a.incidentId, `Action ${a.id} marked completed`, a.title);
    // Update Service Readiness signal.
    const ready = readMap<Record<string, unknown>>(READY_KEY);
    const svc = (ready[a.service] as Record<string, unknown>) ?? {};
    const closed = Array.isArray(svc.closedActions) ? [...(svc.closedActions as unknown[])] : [];
    closed.push({ id: a.id, at: nowIso(), impact: a.expectedImpact });
    ready[a.service] = { ...svc, closedActions: closed, updatedAt: nowIso() };
    writeMap(READY_KEY, ready);
    audit(`Action completed · ${a.id}`, "Service Readiness updated.", "info", target);
    setDialog(null);
  };

  const doRequestReview = () => {
    if (!canWrite || !target) return;
    const a = actions.find((x) => x.id === target); if (!a) return;
    updateAction(target, { status: "Awaiting effectiveness review", verificationMethod: (inp.verificationMethod as VerificationMethod) ?? a.verificationMethod, verificationNote: inp.verificationNote ?? a.verificationNote });
    audit(`Effectiveness review requested · ${a.id}`, `Method: ${inp.verificationMethod ?? a.verificationMethod}`, "info", target);
    setDialog(null);
  };

  const doVerify = () => {
    if (!canWrite || !target) return;
    const a = actions.find((x) => x.id === target); if (!a) return;
    const decision = { by: ops.role, at: nowIso(), effective: true, note: inp.note ?? "" };
    updateAction(target, { status: "Effective", effectivenessDecision: decision });
    mirrorIncident(a.incidentId, `Action ${a.id} verified effective`, decision.note);
    // Postmortem mirror
    if (a.problemId) {
      const docs = readMap<Record<string, unknown>>(PM_DOCS_KEY);
      Object.keys(docs).forEach((k) => {
        const doc = docs[k] as Record<string, unknown>;
        const cas = Array.isArray(doc.correctiveActions) ? [...(doc.correctiveActions as Record<string, unknown>[])] : [];
        docs[k] = { ...doc, correctiveActions: cas.map((c) => (c.id === a.id ? { ...c, state: "Completed", effectiveness: decision } : c)) };
      });
      writeMap(PM_DOCS_KEY, docs);
    }
    appendAnalytics("action.effective", { actionId: a.id, service: a.service, incidentId: a.incidentId, expectedImpact: a.expectedImpact });
    audit(`Action verified effective · ${a.id}`, decision.note || "Verified.", "info", target);
    setDialog(null);
  };

  const doReject = () => {
    if (!canWrite || !target) return;
    const a = actions.find((x) => x.id === target); if (!a) return;
    const decision = { by: ops.role, at: nowIso(), effective: false, note: inp.note ?? "" };
    updateAction(target, { status: "Ineffective", effectivenessDecision: decision });
    appendAnalytics("action.ineffective", { actionId: a.id, service: a.service, note: decision.note });
    audit(`Action rejected as ineffective · ${a.id}`, decision.note || "Rejected.", "warning", target);
    setDialog(null);
  };

  const doEscalate = () => {
    if (!canWrite || !target) return;
    const a = actions.find((x) => x.id === target); if (!a) return;
    const note = inp.note?.trim() || `Escalated by ${ops.role}.`;
    audit(`Overdue action escalated · ${a.id}`, note, "critical", target);
    mirrorIncident(a.incidentId, `Action ${a.id} escalated`, note);
    setDialog(null);
  };

  const doWorkaround = () => {
    if (!canWrite || !target) return;
    const a = actions.find((x) => x.id === target); if (!a) return;
    const workaround: KnownErrorRecord = {
      id: rid("KE"),
      title: inp.title?.trim() || `Workaround from ${a.id}`,
      problemId: a.problemId,
      symptom: inp.symptom?.trim() || "As observed in linked incident.",
      workaround: inp.workaround?.trim() || "See action description.",
      triggeringConditions: inp.triggering?.trim() || "See action description.",
      matchesQuery: `service:${a.service}`,
      createdAt: nowIso(),
    };
    const next = [workaround, ...knownErrors];
    writeList(KE_KEY, next);
    setKnownErrors(next);
    audit(`Known error workaround opened · ${workaround.id}`, "Appears in Alert Triage and Investigation matching.", "info", target);
    setDialog(null);
  };

  const doUnblock = () => {
    if (!canWrite || !target) return;
    updateAction(target, { status: "In progress", blockedReason: null });
    audit(`Action unblocked · ${target}`, inp.note ?? "Unblocked and returned to progress.", "info", target);
    setDialog(null);
  };

  /* ------------------------------ Render ------------------------------ */

  if (actions.length === 0 && problems.length === 0 && knownErrors.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <EntityHeader title="Corrective Actions and Known Errors" subtitle="Loading register…" />
      </div>
    );
  }

  const readOnlyBadge = !canWrite && (
    <Badge className="border-amber-200 bg-amber-50 text-amber-800" variant="outline">Read-only role</Badge>
  );

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <EntityHeader
        eyebrow="Incidents · Post-incident learning"
        title="Corrective Actions and Known Errors"
        subtitle="Track improvements, problems, and effectiveness — traceable to incidents, evidence, and outcomes."
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-slate-200 bg-white">Tenant: {ops.tenant.name}</Badge>
            <Badge variant="outline" className="border-slate-200 bg-white">Service: {ops.service.name}</Badge>
            <Badge variant="outline" className="border-slate-200 bg-white">Env: {ops.environment}</Badge>
            <Badge variant="outline" className="border-slate-200 bg-white">Role: {ops.role}</Badge>
            <Badge variant="outline" className="border-slate-200 bg-white">Scenario stage: {ops.stageIndex}</Badge>
            {readOnlyBadge}
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/runops/incidents/${CANONICAL_INCIDENT}/postmortem`)}
              aria-label="Open source postmortem"
            >
              <FileSearch className="mr-1 h-4 w-4" /> Open postmortem
            </Button>
            <Button
              size="sm"
              onClick={() => openDialog("create")}
              disabled={!canWrite}
              aria-label="Create corrective action"
            >
              <PlusCircle className="mr-1 h-4 w-4" /> Create action
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto px-4 py-3">
        <Tabs value={tab} onValueChange={(v) => { setTab(v as TabKey); setPage(0); }}>
          <TabsList className="mb-3 flex flex-wrap">
            <TabsTrigger value="actions" aria-label="Corrective actions tab">
              Corrective Actions <Badge variant="secondary" className="ml-2">{counts.actions}</Badge>
            </TabsTrigger>
            <TabsTrigger value="problems" aria-label="Problems tab">
              Problems <Badge variant="secondary" className="ml-2">{problems.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="known" aria-label="Known errors tab">
              Known Errors <Badge variant="secondary" className="ml-2">{knownErrors.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="overdue" aria-label="Overdue tab">
              Overdue <Badge variant="secondary" className="ml-2">{counts.overdue}</Badge>
            </TabsTrigger>
            <TabsTrigger value="reviews" aria-label="Effectiveness reviews tab">
              Effectiveness Reviews <Badge variant="secondary" className="ml-2">{counts.reviews}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" aria-label="Completed tab">
              Completed <Badge variant="secondary" className="ml-2">{counts.completed}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* --------------------------- Actions-like tabs --------------------------- */}
          {(["actions", "overdue", "reviews", "completed"] as TabKey[]).map((t) => (
            <TabsContent value={t} key={t}>
              <Card>
                <CardContent className="p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setPage(0); }}
                        className="w-64 pl-8"
                        placeholder="Search id, title, incident, owner…"
                        aria-label="Search actions"
                      />
                    </div>
                    <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v as "all" | Priority); setPage(0); }}>
                      <SelectTrigger className="w-32" aria-label="Filter by priority"><SelectValue placeholder="Priority" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All priorities</SelectItem>
                        <SelectItem value="P0">P0</SelectItem>
                        <SelectItem value="P1">P1</SelectItem>
                        <SelectItem value="P2">P2</SelectItem>
                        <SelectItem value="P3">P3</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as "all" | ActionStatus); setPage(0); }}>
                      <SelectTrigger className="w-56" aria-label="Filter by status"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In progress">In progress</SelectItem>
                        <SelectItem value="Blocked">Blocked</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                        <SelectItem value="Awaiting effectiveness review">Awaiting effectiveness review</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Effective">Effective</SelectItem>
                        <SelectItem value="Ineffective">Ineffective</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortKey} onValueChange={(v) => setSortKey(v as typeof sortKey)}>
                      <SelectTrigger className="w-40" aria-label="Sort by"><SelectValue placeholder="Sort" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="due">Sort: Due date</SelectItem>
                        <SelectItem value="priority">Sort: Priority</SelectItem>
                        <SelectItem value="status">Sort: Status</SelectItem>
                        <SelectItem value="updated">Sort: Updated</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="ml-auto text-xs text-slate-500">
                      {filtered.length} results · page {page + 1} / {pageCount}
                    </div>
                  </div>

                  {visible.length === 0 ? (
                    <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                      No actions match the current filters. Adjust filters or create a new action.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[900px] text-sm">
                        <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="py-2 pr-3">ID</th>
                            <th className="py-2 pr-3">Title</th>
                            <th className="py-2 pr-3">Source</th>
                            <th className="py-2 pr-3">Owner</th>
                            <th className="py-2 pr-3">Priority</th>
                            <th className="py-2 pr-3">Status</th>
                            <th className="py-2 pr-3">Due</th>
                            <th className="py-2 pr-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visible.map((a) => (
                            <tr key={a.id} className="border-b border-slate-100 align-top">
                              <td className="py-2 pr-3 font-mono text-xs text-slate-700">{a.id}</td>
                              <td className="py-2 pr-3">
                                <div className="font-medium text-slate-900">{a.title}</div>
                                <div className="text-xs text-slate-500">{a.description}</div>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  <Badge variant="outline" className="text-[10px]">{a.category}</Badge>
                                  <Badge variant="outline" className="text-[10px]">{a.service}</Badge>
                                  <Badge variant="outline" className="text-[10px]">Verif: {a.verificationMethod}</Badge>
                                  {a.evidence.length > 0 && (
                                    <Badge variant="outline" className="text-[10px]">Evidence: {a.evidence.length}</Badge>
                                  )}
                                  {a.recurrence.length > 0 && (
                                    <Badge variant="outline" className="text-[10px] border-orange-200 bg-orange-50 text-orange-800">
                                      Recurred: {a.recurrence.length}
                                    </Badge>
                                  )}
                                </div>
                                {a.expectedImpact && (
                                  <div className="mt-1 text-[11px] text-slate-500">
                                    <span className="font-medium text-slate-600">Impact:</span> {a.expectedImpact}
                                  </div>
                                )}
                                {a.blockedReason && (
                                  <div className="mt-1 text-[11px] text-amber-700">
                                    <AlertTriangle className="mr-1 inline h-3 w-3" /> {a.blockedReason}
                                  </div>
                                )}
                              </td>
                              <td className="py-2 pr-3 text-xs">
                                <div>
                                  <button
                                    className="text-blue-700 underline-offset-2 hover:underline"
                                    onClick={() => navigate(`/runops/incidents/${a.incidentId}/postmortem`)}
                                    aria-label={`Open incident ${a.incidentId}`}
                                  >
                                    {a.incidentId}
                                  </button>
                                </div>
                                {a.problemId && <div className="text-slate-600">{a.problemId}</div>}
                                {a.runbookLink && (
                                  <button
                                    className="mt-1 flex items-center gap-1 text-blue-700 underline-offset-2 hover:underline"
                                    onClick={() => navigate(a.runbookLink!)}
                                    aria-label="Open linked runbook"
                                  >
                                    <BookOpen className="h-3 w-3" /> Runbook
                                  </button>
                                )}
                                {a.engWorkLink && (
                                  <a
                                    className="mt-1 flex items-center gap-1 text-blue-700 underline-offset-2 hover:underline"
                                    href={a.engWorkLink}
                                    target="_blank" rel="noreferrer"
                                    aria-label="Open linked engineering work"
                                  >
                                    <ExternalLink className="h-3 w-3" /> Eng work
                                  </a>
                                )}
                              </td>
                              <td className="py-2 pr-3 text-xs">
                                {a.ownerName ? (
                                  <>
                                    <div className="font-medium text-slate-800">{a.ownerName}</div>
                                    <div className="text-slate-500">{a.ownerRole}</div>
                                  </>
                                ) : (
                                  <span className="text-slate-400">Unassigned</span>
                                )}
                              </td>
                              <td className="py-2 pr-3">
                                <Badge variant="outline" className={cn("text-[11px]", priorityTone(a.priority))}>{a.priority}</Badge>
                              </td>
                              <td className="py-2 pr-3">
                                <Badge variant="outline" className={cn("text-[11px]", statusTone(a.status))}>{a.status}</Badge>
                              </td>
                              <td className="py-2 pr-3 text-xs">
                                <div className={cn(isOverdue(a) ? "text-red-700 font-medium" : "text-slate-700")}>
                                  {new Date(a.dueDate).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="py-2 pr-3">
                                <div className="flex flex-wrap justify-end gap-1">
                                  <Button size="sm" variant="ghost" onClick={() => openDialog("assign", a.id)} disabled={!canWrite} aria-label="Assign owner">
                                    <UserCheck className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => openDialog("prioritize", a.id)} disabled={!canWrite} aria-label="Reprioritise">
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => openDialog("runbook", a.id)} disabled={!canWrite} aria-label="Convert to runbook update">
                                    <BookOpen className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => openDialog("automation", a.id)} disabled={!canWrite} aria-label="Create automation candidate">
                                    <Bot className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => openDialog("monitoring", a.id)} disabled={!canWrite} aria-label="Create monitoring requirement">
                                    <Gauge className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => openDialog("engwork", a.id)} disabled={!canWrite} aria-label="Link engineering work">
                                    <Link2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => openDialog("workaround", a.id)} disabled={!canWrite} aria-label="Open known error workaround">
                                    <ShieldAlert className="h-3.5 w-3.5" />
                                  </Button>
                                  {a.status === "Blocked" && (
                                    <Button size="sm" variant="ghost" onClick={() => openDialog("unblock", a.id)} disabled={!canWrite} aria-label="Unblock">
                                      <Wrench className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                  {a.status === "Overdue" && (
                                    <Button size="sm" variant="ghost" onClick={() => openDialog("escalate", a.id)} disabled={!canWrite} aria-label="Escalate overdue">
                                      <AlertTriangle className="h-3.5 w-3.5 text-red-700" />
                                    </Button>
                                  )}
                                  {a.status !== "Completed" && a.status !== "Effective" && a.status !== "Awaiting effectiveness review" && (
                                    <Button size="sm" variant="ghost" onClick={() => openDialog("complete", a.id)} disabled={!canWrite} aria-label="Mark complete">
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                  {a.status === "Completed" && (
                                    <Button size="sm" variant="ghost" onClick={() => openDialog("request-review", a.id)} disabled={!canWrite} aria-label="Request effectiveness review">
                                      <ListChecks className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                  {a.status === "Awaiting effectiveness review" && (
                                    <>
                                      <Button size="sm" variant="ghost" onClick={() => openDialog("verify", a.id)} disabled={!canWrite} aria-label="Verify effective">
                                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                                      </Button>
                                      <Button size="sm" variant="ghost" onClick={() => openDialog("reject", a.id)} disabled={!canWrite} aria-label="Reject as ineffective">
                                        <XCircle className="h-3.5 w-3.5 text-rose-700" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {pageCount > 1 && (
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} aria-label="Previous page">
                        Prev
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1} aria-label="Next page">
                        Next
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}

          {/* --------------------------- Problems tab --------------------------- */}
          <TabsContent value="problems">
            <Card>
              <CardContent className="p-4">
                {problems.length === 0 ? (
                  <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                    No problem records yet. Problems are created from postmortems or manually.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {problems.map((p) => (
                      <div key={p.id} className="rounded-md border border-slate-200 bg-white p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="font-mono text-xs text-slate-600">{p.id}</div>
                            <div className="text-sm font-semibold text-slate-900">{p.title}</div>
                            <div className="mt-0.5 text-xs text-slate-600">{p.summary}</div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">Service: {p.service}</Badge>
                            <Badge variant="outline">State: {p.state}</Badge>
                            <Badge variant="outline">Owner: {p.ownerName ?? "Unassigned"}</Badge>
                            <Button size="sm" variant="ghost" onClick={() => navigate(`/runops/incidents/${p.incidentId}/postmortem`)} aria-label="Open source postmortem">
                              <FileSearch className="mr-1 h-3.5 w-3.5" /> Postmortem
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {p.linkedActionIds.map((id) => (
                            <Badge key={id} variant="outline" className="text-[10px]">{id}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* --------------------------- Known errors tab --------------------------- */}
          <TabsContent value="known">
            <Card>
              <CardContent className="p-4">
                {knownErrors.length === 0 ? (
                  <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                    No known errors. Open a workaround from any corrective action.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {knownErrors.map((ke) => (
                      <div key={ke.id} className="rounded-md border border-slate-200 bg-white p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="font-mono text-xs text-slate-600">{ke.id}</div>
                            <div className="text-sm font-semibold text-slate-900">{ke.title}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {ke.problemId && <Badge variant="outline">Problem: {ke.problemId}</Badge>}
                            <Badge variant="outline" className="text-[10px]">Alert match: {ke.matchesQuery}</Badge>
                          </div>
                        </div>
                        <div className="mt-2 grid gap-2 text-xs text-slate-700 md:grid-cols-3">
                          <div><div className="font-medium text-slate-600">Symptom</div><div>{ke.symptom}</div></div>
                          <div><div className="font-medium text-slate-600">Workaround</div><div>{ke.workaround}</div></div>
                          <div><div className="font-medium text-slate-600">Triggering conditions</div><div>{ke.triggeringConditions}</div></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* -------------------------------- Dialogs -------------------------------- */}
      <Dialog open={dialog === "create"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create corrective action</DialogTitle></DialogHeader>
          <div className="grid gap-2">
            <Input placeholder="Title" onChange={(e) => setInp((s) => ({ ...s, title: e.target.value }))} aria-label="Title" />
            <Textarea placeholder="Description" onChange={(e) => setInp((s) => ({ ...s, description: e.target.value }))} aria-label="Description" />
            <div className="grid grid-cols-2 gap-2">
              <Select onValueChange={(v) => setInp((s) => ({ ...s, category: v }))}>
                <SelectTrigger aria-label="Category"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {(["Process", "Code", "Infra", "Monitoring", "Runbook", "Policy"] as Category[]).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select onValueChange={(v) => setInp((s) => ({ ...s, priority: v }))}>
                <SelectTrigger aria-label="Priority"><SelectValue placeholder="Priority (P0-P3)" /></SelectTrigger>
                <SelectContent>
                  {(["P0", "P1", "P2", "P3"] as Priority[]).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Source incident (INC-####)" defaultValue={CANONICAL_INCIDENT} onChange={(e) => setInp((s) => ({ ...s, incidentId: e.target.value }))} aria-label="Source incident" />
              <Input placeholder="Problem (PRB-####)" defaultValue="PRB-1082" onChange={(e) => setInp((s) => ({ ...s, problemId: e.target.value }))} aria-label="Problem id" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Service" defaultValue="checkout-api" onChange={(e) => setInp((s) => ({ ...s, service: e.target.value }))} aria-label="Service" />
              <Input type="date" onChange={(e) => setInp((s) => ({ ...s, dueDate: e.target.value ? new Date(e.target.value).toISOString() : "" }))} aria-label="Due date" />
            </div>
            <Textarea placeholder="Expected reliability impact" onChange={(e) => setInp((s) => ({ ...s, expectedImpact: e.target.value }))} aria-label="Expected reliability impact" />
            <Select onValueChange={(v) => setInp((s) => ({ ...s, verificationMethod: v }))}>
              <SelectTrigger aria-label="Verification method"><SelectValue placeholder="Verification method" /></SelectTrigger>
              <SelectContent>
                {(["Synthetic re-run", "SLO burn observation", "Chaos exercise", "Manual audit", "Regression suite"] as VerificationMethod[]).map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={doCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "assign"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign owner</DialogTitle></DialogHeader>
          <div className="grid gap-2">
            <Input placeholder="Owner name" onChange={(e) => setInp((s) => ({ ...s, ownerName: e.target.value }))} aria-label="Owner name" />
            <Input placeholder="Role (e.g. SRE, Platform Engineer)" onChange={(e) => setInp((s) => ({ ...s, ownerRole: e.target.value }))} aria-label="Owner role" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={doAssign}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "prioritize"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reprioritise action</DialogTitle></DialogHeader>
          <div className="grid gap-2">
            <Select onValueChange={(v) => setInp((s) => ({ ...s, priority: v }))}>
              <SelectTrigger aria-label="New priority"><SelectValue placeholder="New priority" /></SelectTrigger>
              <SelectContent>
                {(["P0", "P1", "P2", "P3"] as Priority[]).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" onChange={(e) => setInp((s) => ({ ...s, dueDate: e.target.value ? new Date(e.target.value).toISOString() : "" }))} aria-label="New due date" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={doPrioritize}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "runbook"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Convert to runbook update</DialogTitle></DialogHeader>
          <div className="grid gap-2">
            <Input placeholder="Runbook id (e.g. RB-CO-014)" onChange={(e) => setInp((s) => ({ ...s, runbookId: e.target.value }))} aria-label="Runbook id" />
            <Input placeholder="Runbook name" onChange={(e) => setInp((s) => ({ ...s, runbookName: e.target.value }))} aria-label="Runbook name" />
            <Textarea placeholder="Proposed change" onChange={(e) => setInp((s) => ({ ...s, change: e.target.value }))} aria-label="Proposed change" />
            <div className="text-xs text-slate-500">Appears in Runbook Detail and Fitness once saved.</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={doRunbook}>Propose</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "automation"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create automation candidate</DialogTitle></DialogHeader>
          <div className="grid gap-2">
            <Input placeholder="Title" onChange={(e) => setInp((s) => ({ ...s, title: e.target.value }))} aria-label="Title" />
            <Select onValueChange={(v) => setInp((s) => ({ ...s, autonomy: v }))}>
              <SelectTrigger aria-label="Autonomy target"><SelectValue placeholder="Autonomy target (L0-L4)" /></SelectTrigger>
              <SelectContent>
                {["L0", "L1", "L2", "L3", "L4"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea placeholder="Rationale" onChange={(e) => setInp((s) => ({ ...s, rationale: e.target.value }))} aria-label="Rationale" />
            <div className="text-xs text-slate-500">Appears in /runops/automation for autonomy review.</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={doAutomation}>Propose</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "monitoring"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create monitoring requirement</DialogTitle></DialogHeader>
          <div className="grid gap-2">
            <Select onValueChange={(v) => setInp((s) => ({ ...s, kind: v }))}>
              <SelectTrigger aria-label="Monitor kind"><SelectValue placeholder="Kind" /></SelectTrigger>
              <SelectContent>
                {["SLO", "Alert", "Dashboard", "Synthetic"].map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Target (metric or asset)" onChange={(e) => setInp((s) => ({ ...s, monTarget: e.target.value }))} aria-label="Target" />
            <Textarea placeholder="Change requested" onChange={(e) => setInp((s) => ({ ...s, change: e.target.value }))} aria-label="Change requested" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={doMonitoring}>Propose</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "engwork"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Link engineering work</DialogTitle></DialogHeader>
          <div className="grid gap-2">
            <Input placeholder="URL (Jira, GitHub, etc.)" onChange={(e) => setInp((s) => ({ ...s, url: e.target.value }))} aria-label="Engineering work URL" />
            <Input placeholder="Label" onChange={(e) => setInp((s) => ({ ...s, label: e.target.value }))} aria-label="Label" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={doEngWork}>Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "complete"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Mark complete</DialogTitle></DialogHeader>
          <div className="text-sm text-slate-600">
            Marking complete records the closure and updates Service Readiness. Follow up with an effectiveness review to move to Effective.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={doComplete}>Mark complete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "request-review"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request effectiveness review</DialogTitle></DialogHeader>
          <div className="grid gap-2">
            <Select onValueChange={(v) => setInp((s) => ({ ...s, verificationMethod: v }))}>
              <SelectTrigger aria-label="Verification method"><SelectValue placeholder="Verification method" /></SelectTrigger>
              <SelectContent>
                {(["Synthetic re-run", "SLO burn observation", "Chaos exercise", "Manual audit", "Regression suite"] as VerificationMethod[]).map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea placeholder="Verification note" onChange={(e) => setInp((s) => ({ ...s, verificationNote: e.target.value }))} aria-label="Verification note" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={doRequestReview}>Request review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "verify"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Verify effective</DialogTitle></DialogHeader>
          <Textarea placeholder="Evidence and observations" onChange={(e) => setInp((s) => ({ ...s, note: e.target.value }))} aria-label="Verification evidence" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={doVerify}>Mark effective</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "reject"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject as ineffective</DialogTitle></DialogHeader>
          <Textarea placeholder="Reason and what to try next" onChange={(e) => setInp((s) => ({ ...s, note: e.target.value }))} aria-label="Rejection reason" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={doReject}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "escalate"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Escalate overdue action</DialogTitle></DialogHeader>
          <Textarea placeholder="Escalation note (routed to change management)" onChange={(e) => setInp((s) => ({ ...s, note: e.target.value }))} aria-label="Escalation note" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={doEscalate}>Escalate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "workaround"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Open known error workaround</DialogTitle></DialogHeader>
          <div className="grid gap-2">
            <Input placeholder="Title" onChange={(e) => setInp((s) => ({ ...s, title: e.target.value }))} aria-label="Workaround title" />
            <Textarea placeholder="Symptom" onChange={(e) => setInp((s) => ({ ...s, symptom: e.target.value }))} aria-label="Symptom" />
            <Textarea placeholder="Workaround steps" onChange={(e) => setInp((s) => ({ ...s, workaround: e.target.value }))} aria-label="Workaround" />
            <Textarea placeholder="Triggering conditions" onChange={(e) => setInp((s) => ({ ...s, triggering: e.target.value }))} aria-label="Triggering conditions" />
            <div className="text-xs text-slate-500">Appears in Alert Triage and Investigation matching.</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={doWorkaround}>Publish workaround</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "unblock"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Unblock action</DialogTitle></DialogHeader>
          <Textarea placeholder="Resolution note" onChange={(e) => setInp((s) => ({ ...s, note: e.target.value }))} aria-label="Unblock note" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={doUnblock}>Unblock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
