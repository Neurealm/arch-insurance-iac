/**
 * Human Approval and Action Center — Agentic SRE NOC.
 *
 * A governed operational decision environment for the synthetic Chennai
 * situation SIT-2026-0417. All data is synthetic and lives in
 * ./data/approvalFixtures.ts, which reuses the shared GOOC / CSH / topology /
 * PLR / situation / investigation identifiers. Every interaction is local and
 * deterministic; the page never navigates away for essential approval detail
 * and never performs a real operational action.
 */

import { Fragment, useCallback, useMemo, useState } from "react";
import {
  AlertTriangle, ArrowRightLeft, Bot, CheckCircle2, ChevronRight, CircleSlash,
  Clock, Download, Gauge, Lock, Maximize2, Minimize2, Pause, Play, Plus,
  RefreshCw, RotateCcw, Scale, ShieldAlert, ShieldCheck, SkipForward, Undo2,
  User, X,
} from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Field, Panel, Select, ToolbarButton } from "./components/NocPrimitives";
import { ServiceRouteGraph } from "./components/ServiceRouteGraph";
import { situationRoute } from "./data/situationFixtures";
import {
  affectedInventory, APPROVAL_ID, APPROVAL_STATES, approvalEvidence,
  approvalHeader, approvalKpis, approvalScenario, approvalStateStages,
  approverUnavailableEvent, approvers as approverFixtures, assignableApprovers,
  auditEvents, AUDIT_EVENT_TYPES, autonomyDimensions, autonomyLevels,
  autonomyMatrix, AUTONOMY_MATRIX_COLUMNS, autonomyReadiness, availableConditions,
  blastRadius, comparisonDisclaimer, decisionOptions, decisionRationale,
  DEFAULT_QUEUE_COLUMNS, emergencyControls, EVIDENCE_CATEGORIES, expectedOutcomes,
  governanceComparison, GUARDRAIL_GROUPS, guardrails as guardrailFixtures,
  maturityStages, measuredOutcomes, pendingActions, policyBlockEvent,
  policyEvaluation, policyResult, policyRules, QUEUE_COLUMNS, QUEUE_GROUPINGS,
  RECOMMENDATION_STATEMENT, RECOMMENDATION_TABS, RISK_MATRIX_AXES,
  riskComparisonNote, rollbackFailureEvent, rollbackPlan, rollbackSteps,
  savedQueueViews, selectedRecommendation, separationOfDutiesRules,
  SYNTHETIC_NOTE, topologyImpactRoles, trafficPaths, validationCriteria,
  actionOptions,
  type ActionOption, type ApprovalEvidence, type Approver, type ApprovalState,
  type AuditEvent, type AuditEventType, type Guardrail, type GuardrailGroup,
  type PendingAction, type QueueColumnKey, type QueueGrouping,
  type RecommendationTab, type RollbackStep, type ValidationCriterion,
} from "./data/approvalFixtures";

/* ------------------------------ primitives ------------------------------- */

const ALL = "All";

function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium", className)}>
      {children}
    </span>
  );
}

const toneChip = (tone: "good" | "watch" | "risk" | "neutral" | "info") =>
  tone === "good"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : tone === "watch"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : tone === "risk"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : tone === "info"
          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
          : "border-slate-200 bg-slate-50 text-slate-600";

const riskChip = (r: string) =>
  r === "Low" ? toneChip("good") : r === "Moderate" ? toneChip("watch") : r === "High" ? toneChip("risk") : toneChip("neutral");

const statusChip = (s: string) =>
  ["Passed", "Approved", "Approved with conditions", "Complete", "Completed", "Ready to Approve", "Satisfied", "Within policy", "Reviewed", "Optional Review Complete", "Execution authorized"].includes(s)
    ? toneChip("good")
    : ["Warning", "Pending", "Ready", "In progress", "Deferred", "Approval required", "Partially approved", "Awaiting required approver", "Awaiting additional evidence"].includes(s)
      ? toneChip("watch")
      : ["Blocked", "Failed", "Rejected", "Policy exception", "Escalated", "Unavailable", "Rolled back", "Expired", "Cancelled"].includes(s)
        ? toneChip("risk")
        : toneChip("neutral");

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-2.5 py-2 text-left font-medium text-slate-500">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-2.5 py-2 align-top text-slate-700", className)}>{children}</td>;
}

function Meter({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100">
      <div className="h-1.5 rounded-full" style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }} />
    </div>
  );
}

function SectionNote({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-[10.5px] text-slate-400">{children}</p>;
}

function KpiCard({
  kpi, active, onClick,
}: { kpi: (typeof approvalKpis)[number]; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={kpi.explain}
      aria-pressed={active}
      className={cn(
        "flex flex-col rounded-xl border bg-white p-3 text-left shadow-sm transition hover:border-indigo-300",
        active ? "border-indigo-500 ring-2 ring-indigo-100" : "border-slate-200",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-medium text-slate-600">{kpi.title}</span>
        <Chip className={toneChip(kpi.status)}>{kpi.trend}</Chip>
      </div>
      <span className="mt-1 text-xl font-semibold text-slate-900">{kpi.value}</span>
      <span className="text-[11px] text-slate-500">{kpi.sub}</span>
      <span className="mt-2 text-[10px] text-slate-400">Target {kpi.target} · Previous {kpi.previous} · {kpi.at}</span>
    </button>
  );
}

/* -------------------------------- page ----------------------------------- */

export default function HumanApprovalActionCenter() {
  /* selection and header */
  const [selectedId, setSelectedId] = useState<string>(APPROVAL_ID);
  const [state, setState] = useState<ApprovalState>(approvalHeader.state);
  const [notes, setNotes] = useState<string[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [reviewers, setReviewers] = useState<string[]>([]);
  const [fullScreen, setFullScreen] = useState(false);
  const [brief, setBrief] = useState<string | null>(null);
  const [evidenceRequested, setEvidenceRequested] = useState(false);
  const [emergencyStopped, setEmergencyStopped] = useState(false);

  /* queue */
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<QueueColumnKey>("priority");
  const [sortAsc, setSortAsc] = useState(true);
  const [grouping, setGrouping] = useState<QueueGrouping>("No grouping");
  const [columns, setColumns] = useState<QueueColumnKey[]>(DEFAULT_QUEUE_COLUMNS);
  const [wideColumns, setWideColumns] = useState(false);
  const [pinFirst, setPinFirst] = useState(true);
  const [accessibleTable, setAccessibleTable] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<string>(ALL);
  const [stateFilter, setStateFilter] = useState<string>(ALL);
  const [queueExport, setQueueExport] = useState<string | null>(null);
  const [savedView, setSavedView] = useState<string>(savedQueueViews[0].name);

  /* recommendation tabs */
  const [tab, setTab] = useState<RecommendationTab>("Summary");

  /* outcome */
  const [optionId, setOptionId] = useState("opt-approve");

  /* alternatives */
  const [altId, setAltId] = useState("act-recommended");
  const [compareIds, setCompareIds] = useState<string[]>(["act-recommended", "act-return-now"]);
  const [promoted, setPromoted] = useState<string | null>(null);
  const [rejectedAlts, setRejectedAlts] = useState<string[]>([]);
  const [altNotes, setAltNotes] = useState<Record<string, string[]>>({});
  const [simulated, setSimulated] = useState<Record<string, string>>({});
  const [matrixCell, setMatrixCell] = useState<string | null>(null);

  /* topology */
  const [nodeId, setNodeId] = useState<string | null>("n-terminal-a");
  const [edgeId, setEdgeId] = useState<string | null>("e-rf");

  /* rollback */
  const [rollbackResults, setRollbackResults] = useState<Record<string, RollbackStep["status"]>>({});
  const [rollbackFailed, setRollbackFailed] = useState(false);
  const [rollbackTriggered, setRollbackTriggered] = useState(false);

  /* validation */
  const [validationOverrides, setValidationOverrides] = useState<Record<string, ValidationCriterion["status"]>>({});

  /* evidence */
  const [evCategory, setEvCategory] = useState<string>(ALL);
  const [evId, setEvId] = useState<string | null>("ae-conclusion");
  const [extraEvidence, setExtraEvidence] = useState(false);

  /* policy */
  const [ruleId, setRuleId] = useState<string | null>(null);
  const [policyBlocked, setPolicyBlocked] = useState(false);
  const [autonomyInspect, setAutonomyInspect] = useState(3);

  /* guardrails */
  const [guardGroup, setGuardGroup] = useState<string>(ALL);

  /* approvers */
  const [approvers, setApprovers] = useState<Approver[]>(approverFixtures);
  const [conditions, setConditions] = useState<string[]>([]);
  const [approverNoteDraft, setApproverNoteDraft] = useState("");
  const [activeApproverId, setActiveApproverId] = useState<string>(approverFixtures[0].id);

  /* audit */
  const [events, setEvents] = useState<AuditEvent[]>(auditEvents);
  const [tlActor, setTlActor] = useState<string>(ALL);
  const [tlType, setTlType] = useState<string>(ALL);
  const [tlState, setTlState] = useState<string>(ALL);
  const [pinnedEvents, setPinnedEvents] = useState<string[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [auditExport, setAuditExport] = useState<string | null>(null);

  /* autonomy */
  const [autonomyDimension, setAutonomyDimension] = useState(autonomyDimensions[0]);

  /* emergency */
  const [pendingControl, setPendingControl] = useState<(typeof emergencyControls)[number] | null>(null);
  const [controlReason, setControlReason] = useState("");
  const [appliedControls, setAppliedControls] = useState<string[]>([]);

  /* scenario */
  const [stageIdx, setStageIdx] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [injections, setInjections] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  /* drawer */
  const [drawer, setDrawer] = useState<{ title: string; rows: [string, string][]; body?: string } | null>(null);
  const [activeKpi, setActiveKpi] = useState<string | null>(null);

  const stage = stageIdx === null ? null : approvalScenario[stageIdx];

  /* --------------------------- derived values --------------------------- */

  const selectedRow = pendingActions.find((a) => a.id === selectedId) ?? pendingActions[0];
  const isDefaultRequest = selectedRow.id === APPROVAL_ID;

  const effectiveState: ApprovalState = emergencyStopped
    ? "Cancelled"
    : policyBlocked
      ? "Escalated"
      : stage
        ? stage.state
        : isDefaultRequest
          ? state
          : selectedRow.state;

  const approversCompleted = stage
    ? stage.approversCompleted
    : approvers.filter((a) => a.kind === "Required" && (a.status === "Approved" || a.status === "Approved with conditions")).length;

  const evidenceCompleteness = stage
    ? stage.evidenceCompleteness
    : extraEvidence
      ? 98
      : selectedRecommendation.evidenceCompleteness;

  const rollbackReadiness = rollbackFailed
    ? 40
    : stage
      ? stage.rollbackReadiness
      : Object.keys(rollbackResults).length
        ? Math.round((Object.values(rollbackResults).filter((s) => s === "Passed").length / rollbackSteps.length) * 100)
        : 100;

  const criteria = useMemo<ValidationCriterion[]>(() => {
    const passTarget = stage ? stage.validationPassed : null;
    return validationCriteria.map((c, i) => {
      if (validationOverrides[c.id]) return { ...c, status: validationOverrides[c.id] };
      if (passTarget !== null) return { ...c, status: i < passTarget ? "Passed" : c.status };
      return c;
    });
  }, [stage, validationOverrides]);
  const validationPassed = criteria.filter((c) => c.status === "Passed").length;

  const kpis = useMemo(
    () =>
      approvalKpis.map((k) => {
        if (k.id === "kpi-rollback") return { ...k, value: `${rollbackReadiness}%`, status: rollbackReadiness >= 100 ? ("good" as const) : ("risk" as const) };
        if (k.id === "kpi-ready") return { ...k, value: String(evidenceCompleteness >= 96 ? 5 : 4) };
        if (k.id === "kpi-policy" && policyBlocked) return { ...k, value: "96.2%", status: "risk" as const, sub: "Guardrail exception raised on the selected action" };
        if (k.id === "kpi-pending" && effectiveState === "Completed") return { ...k, value: "6", sub: "Two high priority, four standard" };
        return k;
      }),
    [rollbackReadiness, evidenceCompleteness, policyBlocked, effectiveState],
  );

  const guardrails = useMemo<Guardrail[]>(
    () =>
      guardrailFixtures.map((g) => {
        if (policyBlocked && g.id === "gr-headroom") {
          return { ...g, status: "Blocked", current: "18 percent (simulated exception)" };
        }
        if (g.id === "gr-approvers") {
          return approversCompleted >= 2 ? { ...g, status: "Passed", current: "2 of 2 approvers decided" } : g;
        }
        if (rollbackFailed && g.id === "gr-rollback") {
          return { ...g, status: "Blocked", current: "Rollback step 4 failed in simulation" };
        }
        return g;
      }),
    [policyBlocked, approversCompleted, rollbackFailed],
  );
  const blockingGuardrails = guardrails.filter((g) => g.status === "Blocked");
  const filteredGuardrails = guardrails.filter((g) => guardGroup === ALL || g.group === guardGroup);

  const queueRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = pendingActions.filter(
      (a) =>
        (!q ||
          [a.id, a.action, a.customer, a.serviceName, a.region, a.product, a.requiredApprover, a.state]
            .join(" ")
            .toLowerCase()
            .includes(q)) &&
        (riskFilter === ALL || a.actionRisk === riskFilter) &&
        (stateFilter === ALL || a.state === stateFilter),
    );
    rows = [...rows].sort((a, b) => {
      const av = String(a[sortKey as keyof PendingAction] ?? "");
      const bv = String(b[sortKey as keyof PendingAction] ?? "");
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    if (pinFirst) {
      rows = [...rows.filter((r) => r.id === selectedId), ...rows.filter((r) => r.id !== selectedId)];
    }
    return rows;
  }, [query, riskFilter, stateFilter, sortKey, sortAsc, pinFirst, selectedId]);

  const groupedQueue = useMemo(() => {
    if (grouping === "No grouping") return [{ key: "All pending agentic actions", rows: queueRows }];
    const keyOf = (a: PendingAction) =>
      grouping === "Risk" ? `${a.actionRisk} risk`
        : grouping === "Approver" ? a.requiredApprover
          : grouping === "Autonomy level" ? `Autonomy level ${a.autonomyLevel}`
            : grouping === "Customer" ? a.customer
              : grouping === "Region" ? a.region
                : a.actionType;
    const map = new Map<string, PendingAction[]>();
    queueRows.forEach((r) => {
      const k = keyOf(r);
      map.set(k, [...(map.get(k) ?? []), r]);
    });
    return [...map.entries()].map(([key, rows]) => ({ key, rows }));
  }, [queueRows, grouping]);

  const visibleColumns = QUEUE_COLUMNS.filter((c) => columns.includes(c.key));

  const selectedAlt = actionOptions.find((a) => a.id === altId) ?? actionOptions[0];
  const comparedAlts = actionOptions.filter((a) => compareIds.includes(a.id));

  const evidence = useMemo(
    () => approvalEvidence.filter((e) => evCategory === ALL || e.category === evCategory),
    [evCategory],
  );
  const selectedEvidence = approvalEvidence.find((e) => e.id === evId) ?? null;

  const filteredEvents = useMemo(
    () =>
      events.filter(
        (e) =>
          (tlActor === ALL || e.actor === tlActor) &&
          (tlType === ALL || e.type === tlType) &&
          (tlState === ALL || e.state === tlState),
      ),
    [events, tlActor, tlType, tlState],
  );
  const eventActors = useMemo(() => [ALL, ...new Set(events.map((e) => e.actor))], [events]);

  const selectedNode = situationRoute.nodes.find((n) => n.id === nodeId) ?? null;
  const selectedEdge = situationRoute.edges.find((e) => e.id === edgeId) ?? null;

  const readyForAuthorization =
    approversCompleted >= 2 && !blockingGuardrails.length && !emergencyStopped && rollbackReadiness >= 100;

  /* ------------------------------ actions ------------------------------- */

  const logEvent = useCallback(
    (e: Omit<AuditEvent, "id">) => setEvents((prev) => [...prev, { ...e, id: `aud-local-${prev.length + 1}` }]),
    [],
  );

  const record = useCallback(
    (event: string, actor: string, decision: string, type: AuditEventType, nextState: ApprovalState, outcome: string) => {
      logEvent({
        at: "Live", event, type, actor, decision,
        evidence: "Recorded in session", policy: "Service governance policy 2.1",
        state: nextState, outcome, status: "Complete",
      });
    },
    [logEvent],
  );

  const decide = useCallback(
    (id: string, status: Approver["status"], note?: string) => {
      setApprovers((prev) => prev.map((a) => (a.id === id ? { ...a, status, note: note ?? a.note } : a)));
      const who = approvers.find((a) => a.id === id)?.name ?? id;
      const nextState: ApprovalState =
        status === "Rejected" ? "Rejected"
          : status === "Deferred" ? "Deferred"
            : status === "Unavailable" ? "Escalated"
              : "Partially approved";
      setState(nextState);
      record(`Approver decision recorded: ${status}`, who, status, "Decision", nextState, `${who} recorded ${status}`);
    },
    [approvers, record],
  );

  const runRollbackTest = useCallback(
    (fail = false) => {
      const results: Record<string, RollbackStep["status"]> = {};
      rollbackSteps.forEach((s, i) => {
        results[s.id] = fail && i === 3 ? "Failed" : fail && i > 3 ? "Pending" : "Passed";
      });
      setRollbackResults(results);
      setRollbackFailed(fail);
      record(
        fail ? "Rollback test failed" : "Rollback plan validated",
        "N. Iyer, Network Operations",
        fail ? "Withhold authorization" : "Accept rollback plan",
        "Rollback",
        fail ? "Escalated" : effectiveState,
        fail ? rollbackFailureEvent.detail : "10 of 10 rollback steps passed",
      );
    },
    [record, effectiveState],
  );

  const resetPage = useCallback(() => {
    setSelectedId(APPROVAL_ID);
    setState(approvalHeader.state);
    setNotes([]); setNoteDraft(""); setReviewers([]); setBrief(null);
    setEvidenceRequested(false); setEmergencyStopped(false);
    setQuery(""); setRiskFilter(ALL); setStateFilter(ALL); setGrouping("No grouping");
    setColumns(DEFAULT_QUEUE_COLUMNS); setExpandedRow(null); setQueueExport(null);
    setSavedView(savedQueueViews[0].name); setTab("Summary"); setOptionId("opt-approve");
    setAltId("act-recommended"); setCompareIds(["act-recommended", "act-return-now"]);
    setPromoted(null); setRejectedAlts([]); setAltNotes({}); setSimulated({}); setMatrixCell(null);
    setNodeId("n-terminal-a"); setEdgeId("e-rf");
    setRollbackResults({}); setRollbackFailed(false); setRollbackTriggered(false);
    setValidationOverrides({}); setEvCategory(ALL); setEvId("ae-conclusion"); setExtraEvidence(false);
    setRuleId(null); setPolicyBlocked(false); setAutonomyInspect(3); setGuardGroup(ALL);
    setApprovers(approverFixtures); setConditions([]); setApproverNoteDraft("");
    setEvents(auditEvents); setTlActor(ALL); setTlType(ALL); setTlState(ALL);
    setPinnedEvents([]); setSelectedEventId(null); setAuditExport(null);
    setPendingControl(null); setControlReason(""); setAppliedControls([]);
    setStageIdx(null); setRunning(false); setInjections([]); setShowComparison(false);
    setDrawer(null); setActiveKpi(null);
  }, []);

  const advance = useCallback(() => {
    setStageIdx((i) => {
      const next = i === null ? 0 : Math.min(i + 1, approvalScenario.length - 1);
      const s = approvalScenario[next];
      logEvent({
        at: `Stage ${s.index}`, event: s.auditEvent, type: "Decision", actor: s.actor,
        decision: s.title, evidence: `${s.evidenceCompleteness}% complete`, policy: s.policyResult,
        state: s.state, outcome: s.narrative, status: "Complete",
      });
      if (next === approvalScenario.length - 1) setRunning(false);
      return next;
    });
  }, [logEvent]);

  /* -------------------------------- render ------------------------------- */

  return (
    <div className={cn("space-y-4", fullScreen && "fixed inset-0 z-50 overflow-y-auto bg-slate-50 p-4")}>
      {/* ---------------------------- page header --------------------------- */}
      <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <nav aria-label="Breadcrumb" className="text-[11px] text-slate-500">
          SRE / Agentic SRE NOC / <span className="text-slate-700">Human Approval and Action Center</span>
        </nav>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Human Approval and Action Center</h1>
        <p className="mt-1 text-[13px] text-slate-600">
          Review recommendations, evaluate risk, confirm guardrails, and authorize agentic operational actions
        </p>
        <Chip className="mt-2 border-indigo-200 bg-indigo-50 text-indigo-700">
          <ShieldCheck className="h-3 w-3" aria-hidden /> {SYNTHETIC_NOTE}
        </Chip>
      </header>

      {/* ------------------------- approval command ------------------------- */}
      <Panel
        title={`${selectedRow.id} · ${selectedRow.action}`}
        subtitle={`${selectedRow.situationId} · ${approvalHeader.situationTitle}`}
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <Select
              label="Approval request"
              value={selectedId}
              options={pendingActions.map((a) => a.id)}
              onChange={(v) => { setSelectedId(v); setExpandedRow(null); }}
            />
            <ToolbarButton onClick={() => setEvidenceRequested(true)} active={evidenceRequested}>
              <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Request additional evidence
            </ToolbarButton>
            <ToolbarButton onClick={() => setFullScreen((v) => !v)} active={fullScreen}>
              {fullScreen ? <Minimize2 className="h-3.5 w-3.5" aria-hidden /> : <Maximize2 className="h-3.5 w-3.5" aria-hidden />} Full screen
            </ToolbarButton>
            <ToolbarButton onClick={() => setBrief(`Approval brief for ${selectedRow.id} exported with ${evidence.length} evidence items, ${guardrails.length} guardrails and ${events.length} audit events. Synthetic demonstration export.`)}>
              <Download className="h-3.5 w-3.5" aria-hidden /> Export approval brief
            </ToolbarButton>
            <ToolbarButton onClick={resetPage}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset demonstration state
            </ToolbarButton>
          </div>
        }
      >
        <p className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-3 text-[13px] font-medium text-slate-800">
          {isDefaultRequest ? RECOMMENDATION_STATEMENT : selectedRow.expectedResult}
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <Field label="Approval request" value={selectedRow.id} />
          <Field label="Situation" value={selectedRow.situationId} />
          <Field label="Customer" value={selectedRow.customer} />
          <Field label="Customer service" value={selectedRow.serviceName} />
          <Field label="Region" value={selectedRow.region} />
          <Field label="Product" value={selectedRow.product} />
          <Field label="Approval state" value={effectiveState} />
          <Field label="Action risk" value={selectedRow.actionRisk} />
          <Field label="Recommendation confidence" value={`${stage ? approvalHeader.confidence : selectedRow.confidence}%`} />
          <Field label="Current autonomy level" value={`Level ${selectedRow.autonomyLevel}, ${autonomyLevels[selectedRow.autonomyLevel - 1].name}`} />
          <Field label="Required approvers" value={String(approvers.filter((a) => a.kind === "Required").length)} />
          <Field label="Approvers completed" value={`${approversCompleted} of ${approvers.filter((a) => a.kind === "Required").length}`} />
          <Field label="Time awaiting approval" value={approvalHeader.awaitingFor} />
          <Field label="Recommended execution window" value={approvalHeader.executionWindow} />
          <Field label="Latest safe decision time" value={selectedRow.latestSafeDecision} />
          <Field label="Data confidence" value={`${evidenceCompleteness}% evidence completeness`} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <ToolbarButton onClick={() => { decide(activeApproverId, "Approved"); setState("Approved"); }}>
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Approve
          </ToolbarButton>
          <ToolbarButton onClick={() => decide(activeApproverId, "Rejected")}>
            <CircleSlash className="h-3.5 w-3.5" aria-hidden /> Reject
          </ToolbarButton>
          <ToolbarButton onClick={() => decide(activeApproverId, "Deferred")}>
            <Clock className="h-3.5 w-3.5" aria-hidden /> Defer
          </ToolbarButton>
          <ToolbarButton onClick={() => { setState("Escalated"); record("Approval escalated", "R. Venkatesan, Duty Incident Commander", "Escalate", "Approver", "Escalated", "Escalated to the duty incident commander"); }}>
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden /> Escalate
          </ToolbarButton>
          <ToolbarButton onClick={() => setSimulated((p) => ({ ...p, [selectedAlt.id]: `Simulated customer impact probability ${selectedAlt.id === "act-recommended" ? "4" : "31"} percent` }))}>
            <Gauge className="h-3.5 w-3.5" aria-hidden /> Simulate action
          </ToolbarButton>
          <Select
            label="Assign approver"
            value={activeApproverId}
            options={approvers.map((a) => a.name)}
            onChange={(v) => setActiveApproverId(approvers.find((a) => a.name === v)?.id ?? activeApproverId)}
          />
          <Select
            label="Add reviewer"
            value={reviewers[reviewers.length - 1] ?? assignableApprovers[0]}
            options={assignableApprovers}
            onChange={(v) => { setReviewers((p) => [...p, v]); record("Reviewer added", v, "Review requested", "Approver", effectiveState, `${v} added as an optional reviewer`); }}
          />
          <ToolbarButton
            onClick={() => { setEmergencyStopped(true); record("Emergency stop engaged", "R. Venkatesan, Duty Incident Commander", "Emergency stop", "Emergency", "Cancelled", "All execution halted for this request"); }}
            active={emergencyStopped}
          >
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden /> Emergency stop
          </ToolbarButton>
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="flex-1 min-w-[220px] text-[11px] text-slate-500">
            <span className="sr-only">Approval note</span>
            <input
              aria-label="Approval note"
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Add an approval note"
              className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-[11.5px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
          <ToolbarButton
            onClick={() => {
              if (!noteDraft.trim()) return;
              setNotes((p) => [...p, noteDraft.trim()]);
              record("Approval note added", "P. Nandakumar, Service Reliability Owner", noteDraft.trim(), "Approver", effectiveState, "Note attached to the approval record");
              setNoteDraft("");
            }}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden /> Add approval note
          </ToolbarButton>
        </div>
        {notes.length > 0 && (
          <ul className="mt-2 space-y-1">
            {notes.map((n) => <li key={n} className="text-[11.5px] text-slate-600">· {n}</li>)}
          </ul>
        )}
        {reviewers.length > 0 && (
          <p className="mt-2 text-[11.5px] text-slate-600">Reviewers added: {reviewers.join(", ")}</p>
        )}
        {evidenceRequested && (
          <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-[11.5px] text-amber-800">
            Additional evidence requested. The request is held in the Awaiting additional evidence state until the named item arrives.
          </p>
        )}
        {brief && <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-[11.5px] text-slate-700">{brief}</p>}
        {emergencyStopped && (
          <p className="mt-2 rounded-md border border-rose-200 bg-rose-50 p-2 text-[11.5px] text-rose-800">
            Emergency stop engaged. No execution is possible for this request until a named human authority releases it.
          </p>
        )}

        {/* state progression */}
        <h3 className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Approval state progression</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {APPROVAL_STATES.map((s) => {
            const meta = approvalStateStages.find((x) => x.state === s)!;
            const isCurrent = s === effectiveState;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={isCurrent}
                onClick={() =>
                  setDrawer({
                    title: s,
                    rows: [
                      ["Status", isCurrent ? "Active" : meta.status],
                      ["Time entered", meta.enteredAt],
                      ["Owner", meta.owner],
                      ["Required condition", meta.requiredCondition],
                      ["Evidence requirement", meta.evidenceRequirement],
                      ["Decision requirement", meta.decisionRequirement],
                      ["Exit criteria", meta.exitCriteria],
                      ["Blockers", meta.blockers],
                    ],
                  })
                }
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10.5px]",
                  isCurrent
                    ? "border-indigo-500 bg-indigo-50 font-medium text-indigo-700"
                    : meta.status === "Complete"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-500",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
        <SectionNote>All approval values are synthetic demonstration data.</SectionNote>
      </Panel>

      {/* ---------------------------- scorecard ----------------------------- */}
      <section aria-label="Approval and autonomy scorecard" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        {kpis.map((k) => (
          <KpiCard key={k.id} kpi={k} active={activeKpi === k.id} onClick={() => setActiveKpi(activeKpi === k.id ? null : k.id)} />
        ))}
      </section>
      {activeKpi && (
        <p className="rounded-md border border-slate-200 bg-white p-2 text-[11.5px] text-slate-600">
          {kpis.find((k) => k.id === activeKpi)?.explain}
        </p>
      )}

      {/* -------------------------- pending queue --------------------------- */}
      <Panel
        title="Pending Agentic Actions"
        subtitle="Governed action queue. Selecting a row updates every compatible panel on this page."
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <label className="text-[11px] text-slate-500">
              <span className="sr-only">Search pending actions</span>
              <input
                aria-label="Search pending actions"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="rounded-md border border-slate-200 px-2 py-1.5 text-[11.5px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
            <Select label="Group by" value={grouping} options={QUEUE_GROUPINGS} onChange={(v) => setGrouping(v as QueueGrouping)} />
            <Select label="Risk" value={riskFilter} options={[ALL, "Low", "Moderate", "High"]} onChange={setRiskFilter} />
            <Select label="Approval state" value={stateFilter} options={[ALL, ...new Set(pendingActions.map((a) => a.state))]} onChange={setStateFilter} />
            <Select
              label="Saved view"
              value={savedView}
              options={savedQueueViews.map((v) => v.name)}
              onChange={(v) => {
                const view = savedQueueViews.find((x) => x.name === v)!;
                setSavedView(v); setColumns(view.columns); setGrouping(view.grouping);
              }}
            />
            <ToolbarButton onClick={() => setWideColumns((v) => !v)} active={wideColumns} title="Column resizing">
              <ArrowRightLeft className="h-3.5 w-3.5" aria-hidden /> Wide columns
            </ToolbarButton>
            <ToolbarButton onClick={() => setPinFirst((v) => !v)} active={pinFirst} title="Pin the selected request to the top">
              <Lock className="h-3.5 w-3.5" aria-hidden /> Pin selected
            </ToolbarButton>
            <ToolbarButton onClick={() => setAccessibleTable((v) => !v)} active={accessibleTable}>
              <User className="h-3.5 w-3.5" aria-hidden /> Accessible table mode
            </ToolbarButton>
            <ToolbarButton onClick={() => setQueueExport(`Exported ${queueRows.length} visible rows and ${visibleColumns.length} columns. Synthetic demonstration export.`)}>
              <Download className="h-3.5 w-3.5" aria-hidden /> Export visible rows
            </ToolbarButton>
          </div>
        }
      >
        <div className="mb-2 flex flex-wrap gap-1">
          {QUEUE_COLUMNS.map((c, i) => (
            <div key={c.key} className="flex items-center">
              <button
                type="button"
                aria-pressed={columns.includes(c.key)}
                onClick={() => setColumns((p) => (p.includes(c.key) ? p.filter((k) => k !== c.key) : [...p, c.key]))}
                className={cn(
                  "rounded-l border px-1.5 py-0.5 text-[10px]",
                  columns.includes(c.key) ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-500",
                )}
              >
                {c.label}
              </button>
              <button
                type="button"
                aria-label={`Move ${c.label} column earlier`}
                disabled={i === 0}
                onClick={() =>
                  setColumns((p) => {
                    const order = QUEUE_COLUMNS.map((x) => x.key);
                    const idx = order.indexOf(c.key);
                    if (idx <= 0) return p;
                    const swapped = [...order];
                    [swapped[idx - 1], swapped[idx]] = [swapped[idx], swapped[idx - 1]];
                    return swapped.filter((k) => p.includes(k));
                  })
                }
                className="rounded-r border border-l-0 border-slate-200 bg-white px-1 py-0.5 text-[10px] text-slate-400 disabled:opacity-40"
              >
                ‹
              </button>
            </div>
          ))}
        </div>

        {queueExport && <p className="mb-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-[11.5px] text-slate-700">{queueExport}</p>}

        {queueRows.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-200 p-6 text-center text-[12px] text-slate-500">
            No pending actions match the current search and filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className={cn("w-full text-[11.5px]", accessibleTable && "text-[13px]")}>
              <caption className="sr-only">Pending agentic actions awaiting governed human decisions</caption>
              <thead className="border-b border-slate-200">
                <tr>
                  <Th>Select</Th>
                  {visibleColumns.map((c) => (
                    <th key={c.key} className={cn("whitespace-nowrap px-2.5 py-2 text-left font-medium text-slate-500", wideColumns && "min-w-[170px]")}>
                      <button
                        type="button"
                        onClick={() => { setSortKey(c.key); setSortAsc(sortKey === c.key ? !sortAsc : true); }}
                        className="hover:text-indigo-700"
                      >
                        {c.label}{sortKey === c.key ? (sortAsc ? " ▲" : " ▼") : ""}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              {groupedQueue.map((group) => (
                <tbody key={group.key} className="divide-y divide-slate-100">
                  {grouping !== "No grouping" && (
                    <tr className="bg-slate-50">
                      <td colSpan={visibleColumns.length + 1} className="px-2.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">
                        {group.key} · {group.rows.length}
                      </td>
                    </tr>
                  )}
                  {group.rows.map((r) => (
                    <Fragment key={r.id}>
                      <tr
                        key={r.id}
                        className={cn("cursor-pointer hover:bg-slate-50", r.id === selectedId && "bg-indigo-50/50")}
                        onClick={() => setSelectedId(r.id)}
                      >
                        <Td>
                          <button
                            type="button"
                            aria-label={`Expand ${r.id}`}
                            aria-expanded={expandedRow === r.id}
                            onClick={(e) => { e.stopPropagation(); setExpandedRow(expandedRow === r.id ? null : r.id); }}
                            className="rounded border border-slate-200 px-1 text-[10px] text-slate-500"
                          >
                            {expandedRow === r.id ? "−" : "+"}
                          </button>
                        </Td>
                        {visibleColumns.map((c) => {
                          const v = String(r[c.key as keyof PendingAction]);
                          const isChip = ["actionRisk", "customerRisk", "policyStatus", "state"].includes(c.key);
                          return (
                            <Td key={c.key} className={c.key === "id" ? "font-medium text-slate-900" : undefined}>
                              {isChip ? (
                                <Chip className={c.key.includes("Risk") ? riskChip(v) : statusChip(v)}>{v}</Chip>
                              ) : c.key === "confidence" ? `${v}%` : v}
                            </Td>
                          );
                        })}
                      </tr>
                      {expandedRow === r.id && (
                        <tr key={`${r.id}-detail`} className="bg-slate-50/70">
                          <td colSpan={visibleColumns.length + 1} className="px-3 py-2">
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                              <Field label="Action type" value={r.actionType} />
                              <Field label="Expected result" value={r.expectedResult} />
                              <Field label="SLO impact" value={r.sloImpact} />
                              <Field label="Capacity affected" value={r.capacityAffected} />
                              <Field label="Reversibility" value={r.reversibility} />
                              <Field label="Rollback readiness" value={r.rollbackReadiness} />
                              <Field label="Assigned agent" value={r.agent} />
                              <Field label="Last update" value={r.lastUpdate} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        )}
        <SectionNote>All queue values are synthetic demonstration data.</SectionNote>
      </Panel>

      {/* --------------------- selected recommendation ---------------------- */}
      <Panel
        title="Selected Recommendation"
        subtitle={`${selectedRow.id} · ${selectedRow.actionType}`}
        action={
          <div className="flex flex-wrap gap-1">
            {RECOMMENDATION_TABS.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tab === t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-md border px-2 py-1 text-[11px]",
                  tab === t ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        }
      >
        <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-[13px] font-medium text-slate-900">
          {RECOMMENDATION_STATEMENT}
        </p>

        {tab === "Summary" && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Approval request" value={selectedRow.id} />
            <Field label="Situation" value={selectedRow.situationId} />
            <Field label="Customer" value={selectedRow.customer} />
            <Field label="Customer service" value={selectedRow.serviceName} />
            <Field label="Action type" value={selectedRow.actionType} />
            <Field label="Reason" value={selectedRecommendation.reason} />
            <Field label="Expected result" value={selectedRecommendation.expectedResult} />
            <Field label="Action risk" value={selectedRow.actionRisk} />
            <Field label="Customer impact risk" value={approvalHeader.customerRisk} />
            <Field label="Recommendation confidence" value={`${approvalHeader.confidence}%`} />
            <Field label="Evidence completeness" value={`${evidenceCompleteness}%`} />
            <Field label="Policy status" value={policyBlocked ? "Blocked" : selectedRow.policyStatus} />
            <Field label="Required approvers" value={approvers.filter((a) => a.kind === "Required").map((a) => a.role).join(", ")} />
            <Field label="Latest safe decision time" value={selectedRow.latestSafeDecision} />
            <Field label="Recommended execution window" value={approvalHeader.executionWindow} />
            <Field label="Estimated action duration" value={selectedRecommendation.estimatedDuration} />
            <Field label="Reversibility" value={selectedRow.reversibility} />
            <Field label="Rollback readiness" value={`${rollbackReadiness}%`} />
            <Field label="Validation readiness" value={`${validationPassed} of ${criteria.length} criteria passing`} />
            <Field label="Investigation reference" value={approvalHeader.investigationId} />
          </div>
        )}

        {tab === "Expected Outcome" && (
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {expectedOutcomes.map((o) => (
              <li key={o} className="flex gap-1.5 text-[11.5px] text-slate-700">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden /> {o}
              </li>
            ))}
          </ul>
        )}

        {tab === "Risk" && (
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Field label="Action risk" value={selectedRow.actionRisk} />
            <Field label="Customer impact risk" value={approvalHeader.customerRisk} />
            <Field label="Reversibility" value={selectedRow.reversibility} />
            <Field label="Rollback complexity" value={selectedAlt.rollbackComplexity} />
            <Field label="Operational complexity" value={selectedAlt.complexity} />
            <Field label="Blocking guardrails" value={String(blockingGuardrails.length)} />
          </div>
        )}

        {tab === "Affected Services" && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {blastRadius.map((b) => <Field key={b.label} label={b.label} value={b.value} />)}
          </div>
        )}

        {tab === "Alternatives" && (
          <ul className="mt-3 space-y-1">
            {[...actionOptions].sort((a, b) => a.rank - b.rank).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 text-[11.5px]">
                <span className="text-slate-700">Rank {a.rank} · {a.name}</span>
                <Chip className={riskChip(a.actionRisk)}>{a.actionRisk}</Chip>
              </li>
            ))}
          </ul>
        )}

        {tab === "Rollback" && (
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Field label="Rollback trigger" value={rollbackPlan.trigger} />
            <Field label="Rollback owner" value={rollbackPlan.owner} />
            <Field label="Expected rollback duration" value={rollbackPlan.duration} />
            <Field label="Rollback readiness" value={`${rollbackReadiness}%`} />
            <Field label="Last tested" value={rollbackPlan.lastTested} />
            <Field label="Rollback confidence" value={rollbackPlan.confidence} />
          </div>
        )}

        {tab === "Evidence" && (
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Field label="Evidence completeness" value={`${evidenceCompleteness}%`} />
            <Field label="Evidence items" value={String(approvalEvidence.length)} />
            <Field label="Decisive evidence" value={String(approvalEvidence.filter((e) => e.relevance === "Decisive").length)} />
          </div>
        )}

        {tab === "Policy" && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {policyEvaluation.slice(0, 6).map((p) => <Field key={p.label} label={p.label} value={p.value} />)}
          </div>
        )}

        {tab === "Approvers" && (
          <ul className="mt-3 space-y-1">
            {approvers.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 text-[11.5px]">
                <span className="text-slate-700">{a.name} · {a.kind}</span>
                <Chip className={statusChip(a.status)}>{a.status}</Chip>
              </li>
            ))}
          </ul>
        )}

        {tab === "History" && (
          <ul className="mt-3 space-y-1">
            {events.slice(-6).map((e) => (
              <li key={e.id} className="text-[11.5px] text-slate-600">{e.at} · {e.event} · {e.actor}</li>
            ))}
          </ul>
        )}
        <SectionNote>All recommendation values are synthetic demonstration data.</SectionNote>
      </Panel>

      {/* ---------------------- expected operational result ------------------ */}
      <Panel title="Expected Operational Result" subtitle="Modelled customer and reliability outcome if the action is approved">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {measuredOutcomes.map((m) => (
            <button
              key={m.label}
              type="button"
              onClick={() => setDrawer({ title: m.label, rows: [["Value", m.value], ["Note", m.note], ["Data basis", "Synthetic demonstration data"]] })}
              className="rounded-lg border border-slate-200 bg-white p-2.5 text-left hover:border-indigo-300"
            >
              <div className="text-[10px] uppercase tracking-wide text-slate-500">{m.label}</div>
              <div className="text-[15px] font-semibold text-slate-900">{m.value}</div>
              <div className="text-[10.5px] text-slate-500">{m.note}</div>
            </button>
          ))}
        </div>

        <h3 className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Decision option comparison</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-[11.5px]">
            <caption className="sr-only">Projected customer and SRE outcome for each decision option</caption>
            <thead className="border-b border-slate-200">
              <tr><Th>Option</Th><Th>Customer outcome</Th><Th>SRE outcome</Th><Th>Impact probability</Th><Th>Error budget</Th><Th>Risk</Th><Th>Select</Th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {decisionOptions.map((o) => (
                <tr key={o.id} className={cn(optionId === o.id && "bg-indigo-50/50")}>
                  <Td className="font-medium text-slate-900">
                    {o.option}{o.recommended && <Chip className={cn("ml-1", toneChip("info"))}>Recommended</Chip>}
                  </Td>
                  <Td>{o.customerOutcome}</Td>
                  <Td>{o.sreOutcome}</Td>
                  <Td>{o.impactProbability}</Td>
                  <Td>{o.errorBudget}</Td>
                  <Td><Chip className={riskChip(o.risk)}>{o.risk}</Chip></Td>
                  <Td>
                    <button type="button" onClick={() => setOptionId(o.id)} aria-pressed={optionId === o.id} className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50">
                      Select
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SectionNote>All outcome values are synthetic demonstration data and are not measured Taara results.</SectionNote>
      </Panel>

      {/* ---------------------- risk and alternatives ----------------------- */}
      <Panel
        title="Action Risk and Alternatives"
        subtitle="The recommended action compared with six alternatives"
        action={
          <div className="flex flex-wrap gap-1.5">
            <ToolbarButton onClick={() => setCompareIds(actionOptions.map((a) => a.id))}>
              <Scale className="h-3.5 w-3.5" aria-hidden /> Compare actions
            </ToolbarButton>
            <ToolbarButton onClick={() => setSimulated((p) => ({ ...p, [selectedAlt.id]: `Simulated outcome for ${selectedAlt.name}: customer impact probability ${selectedAlt.recommended ? "4" : String(100 - selectedAlt.confidence)} percent.` }))}>
              <Gauge className="h-3.5 w-3.5" aria-hidden /> Simulate outcome
            </ToolbarButton>
            <ToolbarButton onClick={() => setEvidenceRequested(true)}>
              <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Request additional evidence
            </ToolbarButton>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[11.5px]">
            <caption className="sr-only">Recommended action compared with alternative actions</caption>
            <thead className="border-b border-slate-200">
              <tr>
                <Th>Compare</Th><Th>Rank</Th><Th>Action</Th><Th>Expected customer outcome</Th><Th>Action risk</Th>
                <Th>Customer risk</Th><Th>SLO impact</Th><Th>Capacity</Th><Th>Latency</Th><Th>Complexity</Th>
                <Th>Time to execute</Th><Th>Reversibility</Th><Th>Rollback complexity</Th><Th>Policy</Th>
                <Th>Required approver</Th><Th>Confidence</Th><Th>Evidence</Th><Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...actionOptions].sort((a, b) => a.rank - b.rank).map((a: ActionOption) => (
                <tr
                  key={a.id}
                  className={cn(
                    altId === a.id && "bg-indigo-50/50",
                    a.recommended && "border-l-2 border-l-indigo-500",
                    rejectedAlts.includes(a.id) && "opacity-50",
                  )}
                >
                  <Td>
                    <input
                      type="checkbox"
                      aria-label={`Compare ${a.name}`}
                      checked={compareIds.includes(a.id)}
                      onChange={() => setCompareIds((p) => (p.includes(a.id) ? p.filter((x) => x !== a.id) : [...p, a.id]))}
                    />
                  </Td>
                  <Td>{a.rank}</Td>
                  <Td className="font-medium text-slate-900">
                    {a.name}
                    {a.recommended && <Chip className={cn("ml-1", toneChip("info"))}>Recommended</Chip>}
                    {promoted === a.id && <Chip className={cn("ml-1", toneChip("watch"))}>Promoted</Chip>}
                  </Td>
                  <Td>{a.customerOutcome}</Td>
                  <Td><Chip className={riskChip(a.actionRisk)}>{a.actionRisk}</Chip></Td>
                  <Td><Chip className={riskChip(a.customerRisk)}>{a.customerRisk}</Chip></Td>
                  <Td>{a.sloImpact}</Td>
                  <Td>{a.capacityEffect}</Td>
                  <Td>{a.latencyEffect}</Td>
                  <Td>{a.complexity}</Td>
                  <Td>{a.timeToExecute}</Td>
                  <Td>{a.reversibility}</Td>
                  <Td>{a.rollbackComplexity}</Td>
                  <Td><Chip className={statusChip(a.policyStatus)}>{a.policyStatus}</Chip></Td>
                  <Td>{a.requiredApprover}</Td>
                  <Td>{a.confidence}%</Td>
                  <Td>{a.evidenceSupport}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      <button type="button" onClick={() => setAltId(a.id)} className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50">Select alternative</button>
                      <button type="button" onClick={() => setPromoted(a.id)} className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50">Promote alternative</button>
                      <button type="button" onClick={() => setRejectedAlts((p) => (p.includes(a.id) ? p.filter((x) => x !== a.id) : [...p, a.id]))} className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50">Reject alternative</button>
                      <button type="button" onClick={() => setDrawer({ title: `${a.name} — policy impact`, rows: [["Policy status", a.policyStatus], ["Required approver", a.requiredApprover], ["Reversibility", a.reversibility], ["Rollback complexity", a.rollbackComplexity], ["Operational effect", a.operationalEffect]] })} className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50">View policy impact</button>
                      <button
                        type="button"
                        onClick={() => setAltNotes((p) => ({ ...p, [a.id]: [...(p[a.id] ?? []), `Reviewer note recorded for ${a.name}`] }))}
                        className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50"
                      >
                        Add reviewer note
                      </button>
                    </div>
                    {simulated[a.id] && <p className="mt-1 text-[10.5px] text-indigo-700">{simulated[a.id]}</p>}
                    {(altNotes[a.id] ?? []).map((n) => <p key={n} className="mt-1 text-[10.5px] text-slate-500">{n}</p>)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {comparedAlts.length > 1 && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {comparedAlts.map((a) => (
              <div key={a.id} className="rounded-lg border border-slate-200 p-2.5">
                <div className="text-[11.5px] font-medium text-slate-900">{a.name}</div>
                <div className="mt-1 text-[10.5px] text-slate-500">Confidence {a.confidence}% · {a.reversibility}</div>
                <Meter value={a.confidence} color={a.recommended ? "#4f46e5" : "#94a3b8"} />
              </div>
            ))}
          </div>
        )}

        <h3 className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Risk matrix</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="text-[11px]">
            <caption className="sr-only">Likelihood against impact for each candidate action</caption>
            <thead>
              <tr>
                <Th>Likelihood \ Impact</Th>
                {RISK_MATRIX_AXES.impact.map((i) => <Th key={i}>{i}</Th>)}
              </tr>
            </thead>
            <tbody>
              {RISK_MATRIX_AXES.likelihood.map((l, li) => (
                <tr key={l}>
                  <Td className="font-medium text-slate-600">{l}</Td>
                  {RISK_MATRIX_AXES.impact.map((im, ii) => {
                    const cellId = `${li + 1}-${ii + 1}`;
                    const here = actionOptions.filter((a) => a.likelihood === li + 1 && a.impact === ii + 1);
                    const severity = (li + 1) * (ii + 1);
                    return (
                      <td key={im} className="p-0.5">
                        <button
                          type="button"
                          aria-label={`Likelihood ${l}, impact ${im}, ${here.length} actions`}
                          aria-pressed={matrixCell === cellId}
                          onClick={() => { setMatrixCell(cellId); if (here[0]) setAltId(here[0].id); }}
                          className={cn(
                            "h-12 w-28 rounded border p-1 text-left text-[10px]",
                            severity >= 15 ? "border-rose-200 bg-rose-50 text-rose-700"
                              : severity >= 8 ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700",
                            matrixCell === cellId && "ring-2 ring-indigo-400",
                          )}
                        >
                          {here.length ? here.map((a) => <div key={a.id} className="truncate">{a.name}</div>) : <span className="text-slate-400">—</span>}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          <Field label="Selected action" value={selectedAlt.name} />
          <Field label="Customer effect" value={selectedAlt.customerOutcome} />
          <Field label="Operational effect" value={selectedAlt.operationalEffect} />
        </div>
        <p className="mt-2 rounded-md border border-indigo-100 bg-indigo-50/60 p-2 text-[11.5px] text-slate-700">{riskComparisonNote}</p>
      </Panel>

      {/* ------------------ affected services and topology ------------------ */}
      <Panel title="Affected Services and Infrastructure" subtitle="Objects directly changed, indirectly affected and protected by this action">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {blastRadius.map((b) => <Field key={b.label} label={b.label} value={b.value} />)}
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <Field label="Current traffic path" value={trafficPaths.current} />
          <Field label="Proposed traffic path" value={trafficPaths.proposed} />
          <Field label="Rollback traffic path" value={trafficPaths.rollback} />
        </div>

        <div className="mt-3 rounded-lg border border-slate-200">
          <ServiceRouteGraph
            route={situationRoute}
            selectedNodeId={nodeId}
            selectedEdgeId={edgeId}
            onSelectNode={(id) => {
              setNodeId(id); setEdgeId(null);
              const n = situationRoute.nodes.find((x) => x.id === id)!;
              setDrawer({
                title: n.name,
                rows: [
                  ["Type", n.type], ["Owner", n.owner], ["Health", n.health],
                  ["Capacity", n.capacity], ["Latency", n.latency], ["Issue", n.issue],
                  ["Role under this action", topologyImpactRoles[n.id] ?? "Not affected"],
                  ["Agent activity", n.agentActivity],
                ],
              });
            }}
            onSelectEdge={(id) => {
              setEdgeId(id); setNodeId(null);
              const e = situationRoute.edges.find((x) => x.id === id)!;
              setDrawer({
                title: `${e.transport} path`,
                rows: [
                  ["State", e.state], ["Throughput", e.throughput], ["Maximum capacity", e.maxCapacity],
                  ["Latency", e.latency], ["Availability", e.availability],
                  ["Fallback eligible", e.fallbackEligible],
                  ["Role under this action", topologyImpactRoles[e.id] ?? "Not affected"],
                ],
              });
            }}
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(["Directly changed", "Indirectly affected", "Protected", "At risk", "Rollback path"] as const).map((role) => (
            <Chip key={role} className={role === "Directly changed" ? toneChip("info") : role === "At risk" ? toneChip("risk") : role === "Protected" ? toneChip("good") : toneChip("neutral")}>
              {role}
            </Chip>
          ))}
        </div>
        {(selectedNode || selectedEdge) && (
          <p className="mt-2 text-[11.5px] text-slate-600">
            Selected object: {selectedNode?.name ?? `${selectedEdge?.transport} path`} · Role {topologyImpactRoles[(selectedNode?.id ?? selectedEdge?.id) as string] ?? "Not affected"}
          </p>
        )}

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-[11.5px]">
            <caption className="sr-only">Inventory of affected services and infrastructure</caption>
            <thead className="border-b border-slate-200"><tr><Th>Object</Th><Th>Value</Th><Th>Owner</Th><Th>Role</Th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {affectedInventory.map((i) => (
                <tr key={i.label}>
                  <Td className="font-medium text-slate-900">{i.label}</Td>
                  <Td>{i.value}</Td>
                  <Td>{i.owner}</Td>
                  <Td><Chip className={i.role === "At risk" ? toneChip("risk") : i.role === "Protected" ? toneChip("good") : toneChip("neutral")}>{i.role}</Chip></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SectionNote>All impact values are synthetic demonstration data.</SectionNote>
      </Panel>

      {/* ---------------------------- rollback ------------------------------ */}
      <Panel
        title="Rollback Plan"
        subtitle="Every governed action is reversible before it is authorized"
        action={
          <div className="flex flex-wrap gap-1.5">
            <ToolbarButton onClick={() => runRollbackTest(false)}>
              <Undo2 className="h-3.5 w-3.5" aria-hidden /> Test Rollback Plan
            </ToolbarButton>
            <ToolbarButton onClick={() => runRollbackTest(true)} active={rollbackFailed}>
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> Simulate rollback failure
            </ToolbarButton>
            <ToolbarButton
              onClick={() => { setRollbackTriggered(true); record("Rollback triggered", rollbackPlan.owner, "Trigger rollback", "Rollback", "Rolled back", "Traffic returned to the safest available route"); }}
              active={rollbackTriggered}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Trigger rollback
            </ToolbarButton>
          </div>
        }
      >
        <p className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-[12.5px] text-slate-800">{rollbackPlan.trigger}</p>

        <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
          <Field label="Rollback owner" value={rollbackPlan.owner} />
          <Field label="Rollback action" value={rollbackPlan.action} />
          <Field label="Expected duration" value={rollbackPlan.duration} />
          <Field label="Preconditions" value={rollbackPlan.preconditions} />
          <Field label="Validation checks" value={rollbackPlan.validationChecks} />
          <Field label="Customer impact during rollback" value={rollbackPlan.customerImpact} />
          <Field label="Data required" value={rollbackPlan.dataRequired} />
          <Field label="Policy status" value={rollbackPlan.policyStatus} />
          <Field label="Last tested" value={rollbackPlan.lastTested} />
          <Field label="Rollback confidence" value={rollbackPlan.confidence} />
          <Field label="Evidence completeness" value={rollbackPlan.evidenceCompleteness} />
          <Field label="Rollback readiness" value={`${rollbackReadiness}%`} />
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-[11.5px]">
            <caption className="sr-only">Rollback steps with owners, evidence and failure handling</caption>
            <thead className="border-b border-slate-200">
              <tr><Th>Step</Th><Th>Owner</Th><Th>Agent or human</Th><Th>Status</Th><Th>Required evidence</Th><Th>Expected duration</Th><Th>Failure handling</Th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rollbackSteps.map((s) => {
                const status = rollbackResults[s.id] ?? s.status;
                return (
                  <tr key={s.id}>
                    <Td className="font-medium text-slate-900">{s.step}</Td>
                    <Td>{s.owner}</Td>
                    <Td>{s.actor === "Agent" ? <Chip className={toneChip("info")}><Bot className="h-3 w-3" aria-hidden /> Agent</Chip> : <Chip className={toneChip("neutral")}><User className="h-3 w-3" aria-hidden /> Human</Chip>}</Td>
                    <Td><Chip className={statusChip(status)}>{status}</Chip></Td>
                    <Td>{s.evidence}</Td>
                    <Td>{s.duration}</Td>
                    <Td>{s.failureHandling}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {rollbackFailed && (
          <p className="mt-2 rounded-md border border-rose-200 bg-rose-50 p-2 text-[11.5px] text-rose-800">{rollbackFailureEvent.detail}</p>
        )}
        {rollbackTriggered && (
          <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-[11.5px] text-slate-700">
            Rollback simulated in this page only. No real operational change is performed.
          </p>
        )}
        <SectionNote>Rollback testing runs a deterministic simulation. No real changes are executed.</SectionNote>
      </Panel>

      {/* --------------------------- validation ----------------------------- */}
      <Panel title="Action Validation Criteria" subtitle={`${validationPassed} of ${criteria.length} criteria currently passing`}>
        <div className="overflow-x-auto">
          <table className="w-full text-[11.5px]">
            <caption className="sr-only">Validation criteria that must pass for the action to be considered successful</caption>
            <thead className="border-b border-slate-200">
              <tr><Th>Criterion</Th><Th>Status</Th><Th>Current value</Th><Th>Required value</Th><Th>Owner</Th><Th>Evidence</Th><Th>Failure response</Th><Th>Inspect</Th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {criteria.map((c) => (
                <tr key={c.id}>
                  <Td className="font-medium text-slate-900">{c.criterion}</Td>
                  <Td><Chip className={statusChip(c.status)}>{c.status}</Chip></Td>
                  <Td>{c.current}</Td>
                  <Td>{c.required}</Td>
                  <Td>{c.owner}</Td>
                  <Td>{c.evidence}</Td>
                  <Td>{c.failureResponse}</Td>
                  <Td>
                    <button
                      type="button"
                      onClick={() => setDrawer({ title: c.criterion, rows: [["Status", c.status], ["Current", c.current], ["Required", c.required], ["Owner", c.owner], ["Evidence", c.evidence], ["Failure response", c.failureResponse]] })}
                      className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50"
                    >
                      Inspect
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <ToolbarButton onClick={() => setValidationOverrides(Object.fromEntries(validationCriteria.map((c) => [c.id, "Passed" as const])))}>
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Mark all criteria evaluated
          </ToolbarButton>
          <ToolbarButton onClick={() => setValidationOverrides({})}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset validation
          </ToolbarButton>
        </div>
        <SectionNote>All validation values are synthetic demonstration data.</SectionNote>
      </Panel>

      {/* ----------------------------- evidence ----------------------------- */}
      <Panel
        title="Decision Evidence"
        subtitle={`${evidenceCompleteness}% evidence completeness across ${EVIDENCE_CATEGORIES.length} categories`}
        action={
          <div className="flex flex-wrap gap-1.5">
            <Select label="Evidence category" value={evCategory} options={[ALL, ...EVIDENCE_CATEGORIES]} onChange={setEvCategory} />
            <ToolbarButton onClick={() => { setExtraEvidence(true); record("Evidence received", "SLO Guardian", "Attach error budget attribution", "Evidence", effectiveState, "Evidence completeness raised to 98 percent"); }} active={extraEvidence}>
              <Plus className="h-3.5 w-3.5" aria-hidden /> Supply requested evidence
            </ToolbarButton>
          </div>
        }
      >
        <div className="mb-2">
          <Meter value={evidenceCompleteness} color="#4f46e5" />
        </div>
        <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-[12.5px] text-slate-800">{decisionRationale}</p>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          <div className="overflow-x-auto">
            <table className="w-full text-[11.5px]">
              <caption className="sr-only">Evidence supporting the recommended action</caption>
              <thead className="border-b border-slate-200">
                <tr><Th>Evidence</Th><Th>Type</Th><Th>Source</Th><Th>Timestamp</Th><Th>Reliability</Th><Th>Freshness</Th><Th>Relevance</Th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {evidence.map((e: ApprovalEvidence) => (
                  <tr key={e.id} className={cn("cursor-pointer hover:bg-slate-50", evId === e.id && "bg-indigo-50/50")} onClick={() => setEvId(e.id)}>
                    <Td className="font-medium text-slate-900">{e.title}</Td>
                    <Td>{e.category}</Td>
                    <Td>{e.source}</Td>
                    <Td>{e.at}</Td>
                    <Td><Chip className={e.reliability === "High" ? toneChip("good") : toneChip("watch")}>{e.reliability}</Chip></Td>
                    <Td>{e.freshness}</Td>
                    <Td><Chip className={e.relevance === "Decisive" ? toneChip("info") : toneChip("neutral")}>{e.relevance}</Chip></Td>
                  </tr>
                ))}
              </tbody>
            </table>
            {evidence.length === 0 && <p className="p-4 text-center text-[12px] text-slate-500">No evidence in this category.</p>}
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            {selectedEvidence ? (
              <>
                <h3 className="text-[12.5px] font-semibold text-slate-900">{selectedEvidence.title}</h3>
                <p className="mt-1 text-[11.5px] text-slate-600">{selectedEvidence.detail}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <Field label="Hypothesis supported" value={selectedEvidence.hypothesisSupported} />
                  <Field label="Action supported" value={selectedEvidence.actionSupported} />
                  <Field label="Added by" value={selectedEvidence.addedBy} />
                  <Field label="Decision relevance" value={selectedEvidence.relevance} />
                </div>
                <ToolbarButton onClick={() => setDrawer({ title: selectedEvidence.title, rows: [["Category", selectedEvidence.category], ["Source", selectedEvidence.source], ["Timestamp", selectedEvidence.at], ["Reliability", selectedEvidence.reliability], ["Freshness", selectedEvidence.freshness], ["Added by", selectedEvidence.addedBy]], body: selectedEvidence.detail })}>
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden /> View evidence
                </ToolbarButton>
              </>
            ) : (
              <p className="text-[12px] text-slate-500">Select an evidence item to inspect it.</p>
            )}
          </div>
        </div>
        <SectionNote>All evidence is synthetic demonstration data reused from the Agentic Investigation Workspace.</SectionNote>
      </Panel>

      {/* ------------------------ policy and autonomy ----------------------- */}
      <Panel
        title="Autonomy and Policy Evaluation"
        subtitle={`Current autonomy level: Level ${approvalHeader.autonomyLevel}, ${autonomyLevels[2].name}`}
        action={
          <ToolbarButton
            onClick={() => { setPolicyBlocked((v) => !v); record(policyBlockEvent.title, "Policy Guardian Agent", "Block action", "Policy", policyBlockEvent.state, policyBlockEvent.detail); }}
            active={policyBlocked}
          >
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden /> Trigger policy block
          </ToolbarButton>
        }
      >
        <p className={cn("rounded-lg border p-3 text-[12.5px]", policyBlocked ? "border-rose-200 bg-rose-50 text-rose-800" : "border-indigo-100 bg-indigo-50/60 text-slate-800")}>
          {policyBlocked ? policyBlockEvent.detail : policyResult}
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {autonomyLevels.map((l) => (
            <button
              key={l.level}
              type="button"
              aria-pressed={autonomyInspect === l.level}
              onClick={() => setAutonomyInspect(l.level)}
              className={cn(
                "rounded-lg border p-2.5 text-left",
                l.level === approvalHeader.autonomyLevel ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:bg-slate-50",
                autonomyInspect === l.level && "ring-2 ring-indigo-200",
              )}
            >
              <div className="text-[11px] font-semibold text-slate-900">
                Level {l.level} · {l.name}
                {l.level === approvalHeader.autonomyLevel && <Chip className={cn("ml-1", toneChip("info"))}>Current</Chip>}
              </div>
              <p className="mt-1 text-[10.5px] text-slate-600">{l.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {policyEvaluation.map((p) => <Field key={p.label} label={p.label} value={p.value} />)}
        </div>

        <h3 className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Policy rules</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-[11.5px]">
            <caption className="sr-only">Policy rules evaluated for the selected action</caption>
            <thead className="border-b border-slate-200"><tr><Th>Rule</Th><Th>Applies</Th><Th>Effect</Th><Th>Source</Th><Th>Inspect</Th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {policyRules.map((r) => (
                <tr key={r.id} className={cn(ruleId === r.id && "bg-indigo-50/50")}>
                  <Td className="font-medium text-slate-900">{r.rule}</Td>
                  <Td><Chip className={r.applies === "Applies" ? toneChip("info") : toneChip("neutral")}>{r.applies}</Chip></Td>
                  <Td>{r.effect}</Td>
                  <Td>{r.source}</Td>
                  <Td>
                    <button type="button" onClick={() => { setRuleId(r.id); setDrawer({ title: "Policy rule", rows: [["Rule", r.rule], ["Applies", r.applies], ["Effect", r.effect], ["Source", r.source]] }); }} className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50">Inspect</button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SectionNote>All policy values are synthetic demonstration data. This page does not change module wide policy settings.</SectionNote>
      </Panel>

      {/* --------------------------- guardrails ----------------------------- */}
      <Panel
        title="Operational Guardrails"
        subtitle={blockingGuardrails.length ? `${blockingGuardrails.length} blocking guardrail open` : "No blocking guardrail open"}
        action={<Select label="Guardrail group" value={guardGroup} options={[ALL, ...GUARDRAIL_GROUPS]} onChange={setGuardGroup} />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[11.5px]">
            <caption className="sr-only">Operational guardrails evaluated for the selected action</caption>
            <thead className="border-b border-slate-200">
              <tr><Th>Group</Th><Th>Guardrail</Th><Th>Status</Th><Th>Current value</Th><Th>Required value</Th><Th>Evidence</Th><Th>Policy source</Th><Th>Enforcement</Th><Th>Inspect</Th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGuardrails.map((g: Guardrail) => (
                <tr key={g.id}>
                  <Td>{g.group}</Td>
                  <Td className="font-medium text-slate-900">{g.guardrail}</Td>
                  <Td><Chip className={statusChip(g.status)}>{g.status}</Chip></Td>
                  <Td>{g.current}</Td>
                  <Td>{g.required}</Td>
                  <Td>{approvalEvidence.find((e) => e.id === g.evidence)?.title ?? g.evidence}</Td>
                  <Td>{g.source}</Td>
                  <Td><Chip className={g.enforcement === "Blocking" ? toneChip("info") : toneChip("neutral")}>{g.enforcement}</Chip></Td>
                  <Td>
                    <button
                      type="button"
                      onClick={() => setDrawer({ title: g.guardrail, rows: [["Group", g.group], ["Status", g.status], ["Current", g.current], ["Required", g.required], ["Policy source", g.source], ["Enforcement", g.enforcement]] })}
                      className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50"
                    >
                      Inspect
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredGuardrails.length === 0 && <p className="p-4 text-center text-[12px] text-slate-500">No guardrails in this group.</p>}
        <SectionNote>All guardrail values are synthetic demonstration data.</SectionNote>
      </Panel>

      {/* ------------------- approvers and separation of duties -------------- */}
      <Panel title="Required Approvers" subtitle={`${approversCompleted} of ${approvers.filter((a) => a.kind === "Required").length} required approvals recorded`}>
        <div className="grid gap-2 lg:grid-cols-2">
          {approvers.map((a) => (
            <div key={a.id} className={cn("rounded-lg border p-3", a.kind === "Required" ? "border-slate-300 bg-white" : "border-slate-200 bg-slate-50/60")}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[12.5px] font-semibold text-slate-900">{a.name}</div>
                  <div className="text-[11px] text-slate-500">{a.role} · {a.kind}</div>
                </div>
                <Chip className={statusChip(a.status)}>{a.status}</Chip>
              </div>
              <p className="mt-1 text-[11.5px] text-slate-600">{a.responsibility}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <Field label="Time assigned" value={a.assignedAt} />
                <Field label="Evidence reviewed" value={`${a.evidenceReviewed} items`} />
                <Field label="Availability" value={a.availability} />
                <Field label="Escalation path" value={a.escalationPath} />
                <Field label="Decision note" value={a.note} />
                <Field label="Separation of duties" value={a.sodStatus} />
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {(["Approve", "Reject", "Defer", "Request more evidence", "Reassign approver", "Escalate approval", "Mark unavailable"] as const).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      if (label === "Approve") decide(a.id, "Approved");
                      else if (label === "Reject") decide(a.id, "Rejected");
                      else if (label === "Defer") decide(a.id, "Deferred");
                      else if (label === "Mark unavailable") { decide(a.id, "Unavailable"); record(approverUnavailableEvent.title, a.name, "Unavailable", "Approver", approverUnavailableEvent.state, approverUnavailableEvent.detail); }
                      else if (label === "Request more evidence") { setEvidenceRequested(true); record("Additional evidence requested", a.name, "Request evidence", "Evidence", "Awaiting additional evidence", "Named evidence item requested"); }
                      else if (label === "Reassign approver") record("Approver reassigned", a.name, "Reassign", "Approver", effectiveState, `Reassigned to ${a.escalationPath}`);
                      else record("Approval escalated", a.name, "Escalate", "Approver", "Escalated", `Escalated to ${a.escalationPath}`);
                    }}
                    className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="flex-1 min-w-[220px] text-[11px] text-slate-500">
            <span className="sr-only">Approver note</span>
            <input
              aria-label="Approver note"
              value={approverNoteDraft}
              onChange={(e) => setApproverNoteDraft(e.target.value)}
              placeholder="Add an approver decision note"
              className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-[11.5px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
          <ToolbarButton
            onClick={() => {
              if (!approverNoteDraft.trim()) return;
              setApprovers((prev) => prev.map((a) => (a.id === activeApproverId ? { ...a, note: approverNoteDraft.trim() } : a)));
              record("Approver note added", approvers.find((a) => a.id === activeApproverId)?.name ?? "Approver", approverNoteDraft.trim(), "Approver", effectiveState, "Note attached to the approver record");
              setApproverNoteDraft("");
            }}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden /> Add approval note
          </ToolbarButton>
        </div>

        <h3 className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Separation of duties</h3>
        <ul className="mt-2 space-y-1">
          {separationOfDutiesRules.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 text-[11.5px]">
              <span className="text-slate-700">{r.rule}</span>
              <span className="flex items-center gap-2">
                <span className="text-[10.5px] text-slate-500">{r.detail}</span>
                <Chip className={statusChip(r.status)}>{r.status}</Chip>
              </span>
            </li>
          ))}
        </ul>

        <h3 className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Conditional approval</h3>
        <p className="mt-1 text-[11.5px] text-slate-600">
          An approver may approve only while named conditions hold. Selected conditions become part of the recorded decision.
        </p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-[11.5px]">
            <caption className="sr-only">Conditions that can be attached to a conditional approval</caption>
            <thead className="border-b border-slate-200">
              <tr><Th>Attach</Th><Th>Condition</Th><Th>Owner</Th><Th>Measurement</Th><Th>Current state</Th><Th>Expiration</Th><Th>Failure response</Th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {availableConditions.map((c) => (
                <tr key={c.id} className={cn(conditions.includes(c.id) && "bg-indigo-50/50")}>
                  <Td>
                    <input
                      type="checkbox"
                      aria-label={`Attach condition: ${c.condition}`}
                      checked={conditions.includes(c.id)}
                      onChange={() => setConditions((p) => (p.includes(c.id) ? p.filter((x) => x !== c.id) : [...p, c.id]))}
                    />
                  </Td>
                  <Td className="font-medium text-slate-900">{c.condition}</Td>
                  <Td>{c.owner}</Td>
                  <Td>{c.measurement}</Td>
                  <Td>{c.currentState}</Td>
                  <Td>{c.expiration}</Td>
                  <Td>{c.failureResponse}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2">
          <ToolbarButton
            onClick={() => {
              if (!conditions.length) return;
              decide(activeApproverId, "Approved with conditions", `Approved with ${conditions.length} conditions`);
              record("Conditional approval added", approvers.find((a) => a.id === activeApproverId)?.name ?? "Approver", "Approved with conditions", "Decision", "Partially approved", `${conditions.length} conditions attached`);
            }}
          >
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Add conditional approval
          </ToolbarButton>
        </div>
        {conditions.length > 0 && (
          <p className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 p-2 text-[11.5px] text-emerald-800">
            Approved with conditions: {conditions.length} condition{conditions.length === 1 ? "" : "s"} attached to the decision record.
          </p>
        )}
        <SectionNote>All approver records are synthetic demonstration data. This page does not create real identities or permissions.</SectionNote>
      </Panel>

      {/* --------------------------- audit timeline -------------------------- */}
      <Panel
        title="Approval and Decision History"
        subtitle={`${filteredEvents.length} of ${events.length} events shown`}
        action={
          <div className="flex flex-wrap gap-1.5">
            <Select label="Actor" value={tlActor} options={eventActors} onChange={setTlActor} />
            <Select label="Event type" value={tlType} options={[ALL, ...AUDIT_EVENT_TYPES]} onChange={setTlType} />
            <Select label="Approval state" value={tlState} options={[ALL, ...new Set(events.map((e) => e.state))]} onChange={setTlState} />
            <ToolbarButton onClick={() => { setEvents((p) => [...p, { id: `aud-manual-${p.length + 1}`, at: "Live", event: "Manual governance note", type: "Approver", actor: "P. Nandakumar, Service Reliability Owner", decision: "Note", evidence: "Session note", policy: "Not applicable", state: effectiveState, outcome: "Manual note recorded in the audit history", status: "Complete" }]); }}>
              <Plus className="h-3.5 w-3.5" aria-hidden /> Add manual note
            </ToolbarButton>
            <ToolbarButton onClick={() => setAuditExport(`Exported ${filteredEvents.length} audit events for ${selectedRow.id}. Synthetic demonstration export.`)}>
              <Download className="h-3.5 w-3.5" aria-hidden /> Export audit history
            </ToolbarButton>
          </div>
        }
      >
        {auditExport && <p className="mb-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-[11.5px] text-slate-700">{auditExport}</p>}
        {filteredEvents.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-200 p-6 text-center text-[12px] text-slate-500">No audit events match the current filters.</p>
        ) : (
          <ol className="space-y-1.5">
            {filteredEvents.map((e) => (
              <li key={e.id}>
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    aria-expanded={selectedEventId === e.id}
                    onClick={() => setSelectedEventId(selectedEventId === e.id ? null : e.id)}
                    className={cn(
                      "w-full rounded-lg border p-2.5 text-left",
                      selectedEventId === e.id ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 bg-white hover:bg-slate-50",
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11.5px] font-medium text-slate-900">{e.at} · {e.event}</span>
                      <span className="flex flex-wrap gap-1">
                        <Chip className={toneChip("neutral")}>{e.type}</Chip>
                        <Chip className={statusChip(e.state)}>{e.state}</Chip>
                        <Chip className={statusChip(e.status)}>{e.status}</Chip>
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">{e.actor} · {e.decision}</div>
                    {selectedEventId === e.id && (
                      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        <Field label="Evidence" value={e.evidence} />
                        <Field label="Policy" value={e.policy} />
                        <Field label="Outcome" value={e.outcome} />
                        <Field label="Approval state" value={e.state} />
                      </div>
                    )}
                  </button>
                  <button
                    type="button"
                    aria-label={`Pin ${e.event}`}
                    onClick={() => setPinnedEvents((p) => (p.includes(e.id) ? p.filter((x) => x !== e.id) : [...p, e.id]))}
                    className={cn("rounded border px-1.5 py-0.5 text-[10px]", pinnedEvents.includes(e.id) ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500")}
                  >
                    Pin
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
        {pinnedEvents.length > 1 && (
          <p className="mt-2 rounded-md border border-indigo-100 bg-indigo-50/60 p-2 text-[11.5px] text-slate-700">
            Comparing {pinnedEvents.length} pinned decisions: {pinnedEvents.map((id) => events.find((e) => e.id === id)?.event).filter(Boolean).join(" · ")}
          </p>
        )}
        <SectionNote>All audit records are synthetic demonstration data.</SectionNote>
      </Panel>

      {/* ------------------------ progressive autonomy ----------------------- */}
      <Panel
        title="Progressive Autonomy"
        subtitle="Autonomy is introduced gradually, evidence first"
        action={<Select label="Introduce autonomy by" value={autonomyDimension} options={autonomyDimensions} onChange={setAutonomyDimension} />}
      >
        <p className="text-[11.5px] text-slate-600">
          Autonomy for this demonstration is scoped by {autonomyDimension.toLowerCase()}. Changes here are illustrative and do not modify module wide policy settings.
        </p>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-[11.5px]">
            <caption className="sr-only">Autonomy assignment for each action type</caption>
            <thead className="border-b border-slate-200">
              <tr><Th>Action</Th>{AUTONOMY_MATRIX_COLUMNS.map((c) => <Th key={c}>{c}</Th>)}<Th>Rationale</Th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {autonomyMatrix.map((r) => (
                <tr key={r.id}>
                  <Td className="font-medium text-slate-900">{r.action}</Td>
                  {AUTONOMY_MATRIX_COLUMNS.map((c) => (
                    <Td key={c} className="text-center">
                      {r.assignment === c ? (
                        <Chip className={c === "Prohibited" ? toneChip("risk") : c === "Approval required" ? toneChip("watch") : toneChip("good")}>Current</Chip>
                      ) : (
                        <span className="text-slate-300" aria-hidden>·</span>
                      )}
                    </Td>
                  ))}
                  <Td>{r.rationale}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Maturity progression</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {maturityStages.map((s) => (
            <div key={s.stage} className={cn("rounded-lg border p-2.5", s.state === "Current" ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white")}>
              <div className="text-[11px] font-semibold text-slate-900">Stage {s.stage} · {s.name}</div>
              <Chip className={cn("mt-1", s.state === "Complete" ? toneChip("good") : s.state === "Current" ? toneChip("info") : toneChip("neutral"))}>{s.state}</Chip>
              <p className="mt-1 text-[10.5px] text-slate-600">{s.detail}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Autonomy readiness</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {autonomyReadiness.map((r) => (
            <div key={r.id} className="rounded-lg border border-slate-200 p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600">{r.label}</span>
                <span className="text-[12.5px] font-semibold text-slate-900">{r.value}%</span>
              </div>
              <Meter value={r.value} color={r.value >= r.target ? "#059669" : "#d97706"} />
              <p className="mt-1 text-[10.5px] text-slate-500">Target {r.target}% · {r.note}</p>
            </div>
          ))}
        </div>
        <SectionNote>All readiness values are synthetic demonstration data.</SectionNote>
      </Panel>

      {/* --------------------------- emergency ------------------------------ */}
      <Panel title="Emergency Controls" subtitle="Available to a named human authority at any autonomy level">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {emergencyControls.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => { setPendingControl(c); setControlReason(""); }}
              className={cn(
                "rounded-lg border p-2.5 text-left hover:bg-slate-50",
                appliedControls.includes(c.id) ? "border-rose-300 bg-rose-50" : c.severity === "high" ? "border-slate-300 bg-white" : "border-slate-200 bg-white",
              )}
            >
              <div className="text-[11.5px] font-semibold text-slate-900">{c.control}</div>
              <p className="mt-1 text-[10.5px] text-slate-600">{c.effect}</p>
              {appliedControls.includes(c.id) && <Chip className={cn("mt-1", toneChip("risk"))}>Applied in this session</Chip>}
            </button>
          ))}
        </div>
        <SectionNote>Emergency controls are simulated in this page only. No real operational action is performed.</SectionNote>
      </Panel>

      {/* ------------------------ approval simulation ------------------------ */}
      <Panel
        title="Run Governed Approval Scenario"
        subtitle={stage ? `Stage ${stage.index} of ${approvalScenario.length} · ${stage.title}` : "Twenty stage deterministic walkthrough of a governed approval"}
        action={
          <div className="flex flex-wrap gap-1.5">
            <ToolbarButton onClick={() => { setRunning(true); if (stageIdx === null) advance(); }} active={running}>
              <Play className="h-3.5 w-3.5" aria-hidden /> Start
            </ToolbarButton>
            <ToolbarButton onClick={() => setRunning(false)}>
              <Pause className="h-3.5 w-3.5" aria-hidden /> Pause
            </ToolbarButton>
            <ToolbarButton onClick={() => { setRunning(true); advance(); }}>
              <Play className="h-3.5 w-3.5" aria-hidden /> Continue
            </ToolbarButton>
            <ToolbarButton onClick={advance}>
              <SkipForward className="h-3.5 w-3.5" aria-hidden /> Skip to next stage
            </ToolbarButton>
            <ToolbarButton onClick={() => { setStageIdx(null); setRunning(false); setInjections([]); }}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset scenario
            </ToolbarButton>
          </div>
        }
      >
        <div className="flex flex-wrap gap-1">
          {approvalScenario.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={stageIdx === i}
              onClick={() => setStageIdx(i)}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px]",
                stageIdx === i ? "border-indigo-500 bg-indigo-50 font-medium text-indigo-700"
                  : stageIdx !== null && i < stageIdx ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-500",
              )}
            >
              {s.index}. {s.title}
            </button>
          ))}
        </div>

        {stage && (
          <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50/50 p-3">
            <div className="text-[12.5px] font-semibold text-slate-900">Stage {stage.index} · {stage.title}</div>
            <p className="mt-1 text-[11.5px] text-slate-700">{stage.narrative}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
              <Field label="Approval state" value={stage.state} />
              <Field label="Approvers completed" value={`${stage.approversCompleted} of 2`} />
              <Field label="Evidence completeness" value={`${stage.evidenceCompleteness}%`} />
              <Field label="Rollback readiness" value={`${stage.rollbackReadiness}%`} />
              <Field label="Validation passing" value={`${stage.validationPassed} of 12`} />
              <Field label="Policy result" value={stage.policyResult} />
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          <ToolbarButton onClick={() => { decide(activeApproverId, "Approved"); setState("Approved"); }}>
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Approve
          </ToolbarButton>
          <ToolbarButton onClick={() => decide(activeApproverId, "Rejected")}>
            <CircleSlash className="h-3.5 w-3.5" aria-hidden /> Reject
          </ToolbarButton>
          <ToolbarButton onClick={() => decide(activeApproverId, "Deferred")}>
            <Clock className="h-3.5 w-3.5" aria-hidden /> Defer
          </ToolbarButton>
          <ToolbarButton onClick={() => setEvidenceRequested(true)} active={evidenceRequested}>
            <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Request more evidence
          </ToolbarButton>
          <ToolbarButton onClick={() => { setConditions(["cond-headroom"]); decide(activeApproverId, "Approved with conditions"); }}>
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Add conditional approval
          </ToolbarButton>
          <ToolbarButton onClick={() => { setPolicyBlocked(true); setInjections((p) => [...p, policyBlockEvent.title]); record(policyBlockEvent.title, "Policy Guardian Agent", "Block", "Policy", policyBlockEvent.state, policyBlockEvent.detail); }} active={policyBlocked}>
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden /> Trigger policy block
          </ToolbarButton>
          <ToolbarButton
            onClick={() => { decide("apv-reliability", "Unavailable"); setInjections((p) => [...p, approverUnavailableEvent.title]); record(approverUnavailableEvent.title, "P. Nandakumar, Service Reliability Owner", "Unavailable", "Approver", approverUnavailableEvent.state, approverUnavailableEvent.detail); }}
          >
            <User className="h-3.5 w-3.5" aria-hidden /> Simulate approver unavailable
          </ToolbarButton>
          <ToolbarButton onClick={() => { runRollbackTest(true); setInjections((p) => [...p, rollbackFailureEvent.title]); }} active={rollbackFailed}>
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> Simulate rollback failure
          </ToolbarButton>
          <ToolbarButton onClick={() => setShowComparison((v) => !v)} active={showComparison}>
            <Scale className="h-3.5 w-3.5" aria-hidden /> Compare governed and fully autonomous
          </ToolbarButton>
        </div>

        {injections.length > 0 && (
          <ul className="mt-2 space-y-1">
            {injections.map((i, idx) => (
              <li key={`${i}-${idx}`} className="rounded-md border border-amber-200 bg-amber-50 p-2 text-[11.5px] text-amber-800">{i}</li>
            ))}
          </ul>
        )}

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <Field label="Execution authorization" value={readyForAuthorization ? "Ready to authorize" : "Withheld"} />
          <Field label="Blocking guardrails" value={String(blockingGuardrails.length)} />
          <Field label="Autonomy readiness" value={`${stage ? stage.autonomyReadiness : 88}%`} />
        </div>
        <SectionNote>Scenario state is local and deterministic. No shared scenario engine and no real execution.</SectionNote>
      </Panel>

      {/* ------------------- governed versus ungoverned ---------------------- */}
      {showComparison && (
        <Panel title="Governed Agentic Action Versus Ungoverned Automation" subtitle="Contrast only. Ungoverned automation is not a recommended operating model.">
          <div className="overflow-x-auto">
            <table className="w-full text-[11.5px]">
              <caption className="sr-only">Governed agentic action compared with ungoverned automation</caption>
              <thead className="border-b border-slate-200"><tr><Th>Dimension</Th><Th>Ungoverned automation</Th><Th>Governed agentic action</Th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {governanceComparison.map((r) => (
                  <tr key={r.dimension}>
                    <Td className="font-medium text-slate-900">{r.dimension}</Td>
                    <Td className="text-slate-500">{r.ungoverned}</Td>
                    <Td className="text-slate-800">{r.governed}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-[11.5px] text-slate-600">{comparisonDisclaimer}</p>
        </Panel>
      )}

      {/* ---------------------------- drawers -------------------------------- */}
      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          {drawer && (
            <div className="space-y-3">
              <SheetTitle className="text-[14px] font-semibold text-slate-900">{drawer.title}</SheetTitle>
              <SheetDescription className="text-[12px] text-slate-600">
                {drawer.body ?? "Synthetic demonstration detail for the selected object."}
              </SheetDescription>
              <div className="grid gap-2">
                {drawer.rows.map(([k, v]) => <Field key={k} label={k} value={v} />)}
              </div>
              <p className="text-[10.5px] text-slate-400">Synthetic demonstration data.</p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* --------------------- emergency confirmation ------------------------ */}
      {pendingControl && (
        <div role="dialog" aria-modal="true" aria-label="Confirm emergency control" className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-[14px] font-semibold text-slate-900">Confirm emergency control</h2>
              <button type="button" aria-label="Close" onClick={() => setPendingControl(null)} className="rounded p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="mt-3 grid gap-2">
              <Field label="Requested control" value={pendingControl.control} />
              <Field label="Expected effect" value={pendingControl.effect} />
              <Field label="Services affected" value={pendingControl.servicesAffected} />
              <Field label="Current owner" value={pendingControl.currentOwner} />
              <Field label="Required authority" value={pendingControl.requiredAuthority} />
              <Field label="Audit requirement" value={pendingControl.auditRequirement} />
            </div>
            <label className="mt-3 block text-[11px] text-slate-500">
              Emergency override reason
              <input
                aria-label="Emergency override reason"
                value={controlReason}
                onChange={(e) => setControlReason(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-[11.5px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <ToolbarButton
                onClick={() => {
                  const c = pendingControl;
                  setAppliedControls((p) => [...p, c.id]);
                  if (c.id === "ec-stop" || c.id === "ec-pause-all") setEmergencyStopped(true);
                  if (c.id === "ec-revoke") setState("Awaiting required approver");
                  if (c.id === "ec-rollback") { setRollbackTriggered(true); runRollbackTest(false); }
                  record(`Emergency control applied: ${c.control}`, c.currentOwner, controlReason || "No reason supplied", "Emergency", c.id === "ec-rollback" ? "Rolled back" : effectiveState, c.effect);
                  setPendingControl(null);
                }}
              >
                <ShieldAlert className="h-3.5 w-3.5" aria-hidden /> Confirm control
              </ToolbarButton>
              <ToolbarButton onClick={() => setPendingControl(null)}>Cancel</ToolbarButton>
            </div>
            <p className="mt-2 text-[10.5px] text-slate-400">Simulated in this page only. No real operational action is performed.</p>
          </div>
        </div>
      )}
    </div>
  );
}
