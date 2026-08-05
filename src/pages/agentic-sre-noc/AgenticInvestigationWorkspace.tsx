/**
 * Agentic Investigation Workspace — Agentic SRE NOC.
 *
 * A single-page, evidence-driven investigation environment for the synthetic
 * Chennai situation SIT-2026-0417. All data is synthetic and lives in
 * ./data/investigationFixtures.ts, which reuses the shared GOOC / CSH /
 * topology / PLR / situation identifiers. Every interaction is local and
 * deterministic; the page never navigates away for essential detail.
 */

import { useCallback, useMemo, useState } from "react";
import {
  AlertTriangle, Bot, CheckCircle2, ChevronRight, CircleSlash, Download,
  FlaskConical, Maximize2, Minimize2, Pause, Play, Plus, RefreshCw, RotateCcw,
  Scale, SkipForward, Sparkles, ThumbsDown, ThumbsUp, TrendingDown, TrendingUp,
  User, X,
} from "lucide-react";
import {
  CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Scatter,
  ScatterChart, Tooltip as RTooltip, XAxis, YAxis, ZAxis,
} from "recharts";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Field, Panel, Select, ToolbarButton } from "./components/NocPrimitives";
import { ServiceRouteGraph } from "./components/ServiceRouteGraph";
import { situationRoute } from "./data/situationFixtures";
import {
  additionalActions, causeHypotheses, causeStatement, changeConclusions,
  comparisonDisclaimer, CORRELATION_PAIRS, domainSignals, eliminatedCauses,
  environmentalConclusion, environmentalConditions, EVIDENCE_DOMAINS,
  firmwareAnomalyEvent, handoffFailureEvent, INVESTIGATION_ID,
  INVESTIGATION_STATES, investigationAgents, investigationComparison,
  investigationConclusion, investigationEvents, investigationHeader,
  investigationKpis, investigationParticipants, investigationScenario,
  investigationSeries, investigationStateStages, investigationTasks,
  investigationTerminals, networkConclusion, opticalFindings, primaryAction,
  readinessChecks, recentChanges, routeSegmentEvidence, selectableSituations,
  similarIncidents, TASK_COLUMNS, validationTests,
  type CauseHypothesis, type DomainSignal, type EvidenceDomain,
  type InvestigationAgent, type InvestigationEvent, type InvestigationKpi,
  type InvestigationState, type InvestigationTask, type RecentChange,
  type SimilarIncident, type TaskColumn,
} from "./data/investigationFixtures";

const ALL_DOMAINS = "All domains";
const ALL_ACTORS = "All actors";
const ALL_HYPOTHESES = "All hypotheses";

/* ------------------------------ small parts ------------------------------ */

function Chip({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium", className)}>
      {children}
    </span>
  );
}

const toneChip = (tone: "good" | "watch" | "risk" | "neutral") =>
  tone === "good"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : tone === "watch"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : tone === "risk"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : "border-slate-200 bg-slate-50 text-slate-600";

const statusChip = (status: string) =>
  status === "Leading Cause"
    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
    : status === "Monitoring"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : status === "Testing"
        ? "border-sky-200 bg-sky-50 text-sky-700"
        : "border-slate-200 bg-slate-50 text-slate-500";

const relationChip = (r: DomainSignal["relation"]) =>
  r === "Supports" ? toneChip("good") : r === "Contradicts" ? toneChip("risk") : toneChip("neutral");

const checkChip = (s: string) =>
  s === "Passed" ? toneChip("good") : s === "Pending" ? toneChip("watch") : s === "Failed" ? toneChip("risk") : toneChip("neutral");

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

function KpiCard({ kpi, active, onClick }: { kpi: InvestigationKpi; active: boolean; onClick: () => void }) {
  const TrendIcon = kpi.trend === "down" ? TrendingDown : TrendingUp;
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
        <Chip className={toneChip(kpi.status)}>
          <TrendIcon className="h-3 w-3" aria-hidden /> {kpi.trend}
        </Chip>
      </div>
      <span className="mt-1 text-xl font-semibold text-slate-900">{kpi.value}</span>
      <span className="text-[11px] text-slate-500">{kpi.sub}</span>
      <span className="mt-2 text-[10px] text-slate-400">Target {kpi.target} · Previous {kpi.previous} · {kpi.at}</span>
    </button>
  );
}

function EvidenceList({ items, tone }: { items: string[]; tone: "good" | "risk" }) {
  if (!items.length) return <p className="text-[11.5px] text-slate-500">No evidence recorded.</p>;
  return (
    <ul className="space-y-1">
      {items.map((e) => (
        <li key={e} className="flex gap-1.5 text-[11.5px] text-slate-700">
          <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", tone === "good" ? "bg-emerald-500" : "bg-rose-500")} aria-hidden />
          {e}
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------- page ---------------------------------- */

const HYP_TABS = [
  "Summary", "Supporting Evidence", "Contradicting Evidence", "Telemetry",
  "Similar Incidents", "Changes", "Validation Tests", "Agent Findings", "History",
] as const;
type HypTab = (typeof HYP_TABS)[number];

export default function AgenticInvestigationWorkspace() {
  /* command header state */
  const [situationId, setSituationId] = useState<string>(investigationHeader.situationId);
  const [state, setState] = useState<InvestigationState>(investigationHeader.state);
  const [owner, setOwner] = useState(investigationHeader.owner);
  const [participants, setParticipants] = useState<string[]>(investigationParticipants);
  const [notes, setNotes] = useState<string[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [fullScreen, setFullScreen] = useState(false);
  const [brief, setBrief] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState(investigationHeader.lastEvidenceUpdate);
  const [readyToConclude, setReadyToConclude] = useState(false);

  /* hypotheses */
  const [hyps, setHyps] = useState<CauseHypothesis[]>(causeHypotheses);
  const [selectedHypId, setSelectedHypId] = useState("hyp-fog");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [hypTab, setHypTab] = useState<HypTab>("Summary");
  const [assessments, setAssessments] = useState<Record<string, string[]>>({});
  const [assessmentDraft, setAssessmentDraft] = useState("");
  const [linkedEvidence, setLinkedEvidence] = useState<Record<string, string[]>>({});

  /* evidence correlation */
  const [domain, setDomain] = useState<EvidenceDomain | typeof ALL_DOMAINS>(ALL_DOMAINS);
  const [relationFilter, setRelationFilter] = useState<"All" | "Supports" | "Contradicts">("All");
  const [signalId, setSignalId] = useState<string | null>("sig-atten");
  const [pinned, setPinned] = useState<string[]>([]);
  const [evidenceExport, setEvidenceExport] = useState<string | null>(null);

  /* optical / terminal */
  const [opticalMetric, setOpticalMetric] = useState("Received optical power (dBm)");
  const [compareTerminals, setCompareTerminals] = useState(false);
  const [showBaseline, setShowBaseline] = useState(true);
  const [showRange, setShowRange] = useState(true);
  const [showAnomaly, setShowAnomaly] = useState(true);
  const [testResults, setTestResults] = useState<Record<string, string>>({});

  /* network */
  const [segmentId, setSegmentId] = useState<string>("n-terminal-a");
  const [routeEdgeId, setRouteEdgeId] = useState<string | null>(null);
  const [networkNote, setNetworkNote] = useState<string | null>(null);

  /* environment */
  const [pairId, setPairId] = useState<string>(CORRELATION_PAIRS[0].id);
  const [watchCreated, setWatchCreated] = useState(false);

  /* change */
  const [changeId, setChangeId] = useState<string>(recentChanges[0].id);
  const [changeVerdicts, setChangeVerdicts] = useState<Record<string, string>>({});

  /* similar incidents */
  const [incidentId, setIncidentId] = useState<string>(similarIncidents[0].id);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [reuseNote, setReuseNote] = useState<string | null>(null);

  /* eliminated register */
  const [permanentlyExcluded, setPermanentlyExcluded] = useState<string[]>([]);
  const [reviewerNotes, setReviewerNotes] = useState<Record<string, string[]>>({});

  /* tasks */
  const [tasks, setTasks] = useState<InvestigationTask[]>(investigationTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  /* timeline */
  const [events, setEvents] = useState<InvestigationEvent[]>(investigationEvents);
  const [tlDomain, setTlDomain] = useState<string>(ALL_DOMAINS);
  const [tlActor, setTlActor] = useState<string>(ALL_ACTORS);
  const [tlHyp, setTlHyp] = useState<string>(ALL_HYPOTHESES);
  const [tlOnlyConfidence, setTlOnlyConfidence] = useState(false);
  const [tlOnlyEvidence, setTlOnlyEvidence] = useState(false);
  const [pinnedEvents, setPinnedEvents] = useState<string[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [timelineExport, setTimelineExport] = useState<string | null>(null);

  /* conclusion */
  const [conclusionState, setConclusionState] = useState<"Proposed" | "Accepted" | "Rejected">("Proposed");
  const [conclusionNote, setConclusionNote] = useState<string | null>(null);

  /* scenario */
  const [stageIdx, setStageIdx] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [injections, setInjections] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  /* drawer */
  const [drawer, setDrawer] = useState<{ title: string; rows: [string, string][]; body?: string } | null>(null);

  const stage = stageIdx === null ? null : investigationScenario[stageIdx];

  /* --------------------------- derived values --------------------------- */

  const rankedHyps = useMemo(
    () => [...hyps].sort((a, b) => b.confidence - a.confidence),
    [hyps],
  );
  const selectedHyp = hyps.find((h) => h.id === selectedHypId) ?? rankedHyps[0];
  const leading = rankedHyps[0];
  const eliminatedCount = hyps.filter((h) => h.status === "Eliminated").length;
  const openTasks = tasks.filter((t) => t.status !== "Completed").length;

  const leadingConfidence = stage ? stage.leadingConfidence : leading.confidence;
  const evidenceReviewed = stage ? stage.evidenceReviewed : investigationHeader.evidenceReviewed;
  const readiness = readyToConclude
    ? 100
    : stage
      ? stage.readiness
      : investigationHeader.conclusionReadiness;
  const effectiveState: InvestigationState = stage ? stage.state : state;

  const signals = useMemo(
    () =>
      domainSignals.filter(
        (s) =>
          (domain === ALL_DOMAINS || s.domain === domain) &&
          (relationFilter === "All" || s.relation === relationFilter),
      ),
    [domain, relationFilter],
  );
  const selectedSignal = domainSignals.find((s) => s.id === signalId) ?? null;

  const domainCounts = useMemo(
    () =>
      EVIDENCE_DOMAINS.map((d) => {
        const items = domainSignals.filter((s) => s.domain === d);
        return {
          domain: d,
          total: items.length,
          supports: items.filter((s) => s.relation === "Supports").length,
          contradicts: items.filter((s) => s.relation === "Contradicts").length,
        };
      }),
    [],
  );

  const kpis = useMemo<InvestigationKpi[]>(
    () =>
      investigationKpis.map((k) => {
        if (k.id === "kpi-confidence") return { ...k, value: `${leadingConfidence}%`, sub: leading.cause };
        if (k.id === "kpi-evidence") return { ...k, value: String(evidenceReviewed) };
        if (k.id === "kpi-eliminated") return { ...k, value: String(stage ? stage.eliminated : eliminatedCount) };
        if (k.id === "kpi-readiness") return { ...k, value: `${readiness}%` };
        if (k.id === "kpi-hypotheses") return { ...k, value: String(hyps.length) };
        return k;
      }),
    [leadingConfidence, leading.cause, evidenceReviewed, stage, eliminatedCount, readiness, hyps.length],
  );
  const [activeKpi, setActiveKpi] = useState<string | null>(null);

  const filteredEvents = useMemo(
    () =>
      events.filter(
        (e) =>
          (tlDomain === ALL_DOMAINS || e.domain === tlDomain) &&
          (tlActor === ALL_ACTORS || e.actor === tlActor) &&
          (tlHyp === ALL_HYPOTHESES || e.hypothesisId === tlHyp) &&
          (!tlOnlyConfidence || e.confidenceChange !== "—") &&
          (!tlOnlyEvidence || e.evidenceAdded !== ""),
      ),
    [events, tlDomain, tlActor, tlHyp, tlOnlyConfidence, tlOnlyEvidence],
  );

  const checks = useMemo(
    () =>
      readinessChecks.map((c) =>
        readyToConclude || conclusionState === "Accepted" ? { ...c, status: "Passed" as const } : c,
      ),
    [readyToConclude, conclusionState],
  );
  const passedChecks = checks.filter((c) => c.status === "Passed").length;

  const chartData = useMemo(
    () =>
      investigationSeries.map((p) => ({
        ...p,
        baselineRx: -24.0,
        baselineMargin: 9.5,
      })),
    [],
  );

  const pair = CORRELATION_PAIRS.find((p) => p.id === pairId)!;
  const scatterData = useMemo(
    () =>
      investigationSeries.map((p) => ({
        x: p[pair.x as keyof typeof p] as number,
        y: p[pair.y as keyof typeof p] as number,
        t: p.t,
      })),
    [pair],
  );

  /* ------------------------------ actions ------------------------------ */

  const logEvent = useCallback((e: Omit<InvestigationEvent, "id">) => {
    setEvents((prev) => [...prev, { ...e, id: `iev-local-${prev.length + 1}` }]);
  }, []);

  const adjustConfidence = useCallback((id: string, delta: number) => {
    setHyps((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, confidence: Math.max(0, Math.min(99, h.confidence + delta)) } : h,
      ),
    );
  }, []);

  const setStatus = useCallback((id: string, status: CauseHypothesis["status"]) => {
    setHyps((prev) => prev.map((h) => (h.id === id ? { ...h, status } : h)));
  }, []);

  const toggleCompare = (id: string) =>
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 3 ? [...prev.slice(1), id] : [...prev, id],
    );

  const runTest = (id: string, label: string) =>
    setTestResults((prev) => ({ ...prev, [id]: `${label} completed at ${refreshedAt} — result recorded in this session.` }));

  const moveTask = (id: string, status: TaskColumn) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));

  const resetPage = () => {
    setSituationId(investigationHeader.situationId);
    setState(investigationHeader.state);
    setOwner(investigationHeader.owner);
    setParticipants(investigationParticipants);
    setNotes([]); setNoteDraft(""); setBrief(null); setFullScreen(false);
    setReadyToConclude(false);
    setHyps(causeHypotheses); setSelectedHypId("hyp-fog"); setCompareIds([]); setHypTab("Summary");
    setAssessments({}); setLinkedEvidence({}); setAssessmentDraft("");
    setDomain(ALL_DOMAINS); setRelationFilter("All"); setSignalId("sig-atten"); setPinned([]); setEvidenceExport(null);
    setOpticalMetric("Received optical power (dBm)"); setCompareTerminals(false);
    setShowBaseline(true); setShowRange(true); setShowAnomaly(true); setTestResults({});
    setSegmentId("n-terminal-a"); setRouteEdgeId(null); setNetworkNote(null);
    setPairId(CORRELATION_PAIRS[0].id); setWatchCreated(false);
    setChangeId(recentChanges[0].id); setChangeVerdicts({});
    setIncidentId(similarIncidents[0].id); setExcluded([]); setReuseNote(null);
    setPermanentlyExcluded([]); setReviewerNotes({});
    setTasks(investigationTasks); setSelectedTaskId(null);
    setEvents(investigationEvents); setTlDomain(ALL_DOMAINS); setTlActor(ALL_ACTORS); setTlHyp(ALL_HYPOTHESES);
    setTlOnlyConfidence(false); setTlOnlyEvidence(false); setPinnedEvents([]); setSelectedEventId(null);
    setTimelineExport(null);
    setConclusionState("Proposed"); setConclusionNote(null);
    setStageIdx(null); setRunning(false); setInjections([]); setShowComparison(false);
    setActiveKpi(null); setDrawer(null); setRefreshedAt(investigationHeader.lastEvidenceUpdate);
  };

  const applyStage = (idx: number) => {
    const s = investigationScenario[idx];
    setStageIdx(idx);
    setState(s.state);
    if (s.hypothesisId) setSelectedHypId(s.hypothesisId);
    setHyps((prev) =>
      prev.map((h) => {
        if (h.id === "hyp-fog") return { ...h, confidence: s.leadingConfidence || h.confidence };
        return h;
      }),
    );
    logEvent({
      at: `Stage ${idx + 1}`, event: s.title, actor: s.actor,
      actorKind: s.actor.includes("Agent") || s.actor.includes("Investigator") || s.actor.includes("Guardian") ? "Agent" : "Human",
      hypothesisId: s.hypothesisId, domain: s.domain, evidenceAdded: `${s.evidenceReviewed} records reviewed`,
      confidenceChange: `Leading ${s.leadingConfidence}%`, decision: s.title,
      outcome: s.detail, status: "Complete",
    });
    if (s.id === "is-20") setConclusionState("Accepted");
  };

  const nextStage = () => {
    const next = stageIdx === null ? 0 : Math.min(investigationScenario.length - 1, stageIdx + 1);
    applyStage(next);
  };

  const inject = (kind: "firmware" | "handoff") => {
    const ev = kind === "firmware" ? firmwareAnomalyEvent : handoffFailureEvent;
    setInjections((prev) => (prev.includes(ev.title) ? prev : [...prev, ev.title]));
    setHyps((prev) =>
      prev.map((h) =>
        h.id === ev.hypothesisId
          ? { ...h, confidence: ev.confidence, status: "Testing" }
          : h.id === "hyp-fog"
            ? { ...h, confidence: Math.max(60, h.confidence - 12) }
            : h,
      ),
    );
    setSelectedHypId(ev.hypothesisId);
    setTasks((prev) => [
      ...prev,
      {
        id: `task-${kind}-reopen`, title: kind === "firmware" ? "Re-run firmware cohort comparison" : "Re-validate upstream network handoff",
        status: "Running", owner: kind === "firmware" ? "Change Risk Agent" : "Network Path Agent",
        humanOwner: "M. Dorai", priority: "High", hypothesisId: ev.hypothesisId,
        domain: kind === "firmware" ? "Software and Change" : "Network",
        result: "Queued by simulated anomaly injection.", at: refreshedAt,
      },
    ]);
    logEvent({
      at: refreshedAt, event: ev.title, actor: "Investigation simulation", actorKind: "Agent",
      hypothesisId: ev.hypothesisId, domain: kind === "firmware" ? "Software and Change" : "Network",
      evidenceAdded: "Simulated anomaly record", confidenceChange: `${ev.hypothesisId} raised to ${ev.confidence}%`,
      decision: "Reopen cause", outcome: ev.detail, status: "In progress",
    });
  };

  const headerFacts: [string, string][] = [
    ["Situation", situationId],
    ["Situation title", investigationHeader.situationTitle],
    ["Customer", investigationHeader.customer],
    ["Customer service", investigationHeader.serviceName],
    ["Region", investigationHeader.region],
    ["Product", investigationHeader.product],
    ["Investigation state", effectiveState],
    ["Leading cause", leading.cause],
    ["Leading confidence", `${leadingConfidence}%`],
    ["Investigation owner", owner],
    ["Agents participating", `${investigationAgents.length} digital coworkers`],
    ["Evidence items reviewed", String(evidenceReviewed)],
    ["Causes under investigation", String(hyps.filter((h) => h.status !== "Eliminated").length)],
    ["Causes eliminated", String(stage ? stage.eliminated : eliminatedCount)],
    ["Open investigation tasks", String(openTasks)],
    ["Last evidence update", refreshedAt],
    ["Data confidence", investigationHeader.dataConfidence],
    ["Conclusion readiness", `${readiness}%`],
  ];

  const opticalSeriesKeys: Record<string, { key: string; color: string }> = {
    "Received optical power (dBm)": { key: "rxPower", color: "#0891b2" },
    "Link margin (dB)": { key: "marginA", color: "#4f46e5" },
    "Optical attenuation (dB)": { key: "attenuation", color: "#f97316" },
    "Pointing error (mrad)": { key: "pointingError", color: "#a855f7" },
    "Tracking corrections per minute": { key: "trackingRate", color: "#0ea5e9" },
    "Beam lock": { key: "beamLock", color: "#16a34a" },
    "Terminal temperature proxy (C)": { key: "temperature", color: "#ef4444" },
    "Reacquisition attempts": { key: "reacquisitions", color: "#64748b" },
  };
  const opticalKey = opticalSeriesKeys[opticalMetric];

  const segment = routeSegmentEvidence.find((s) => s.nodeId === segmentId)!;
  const change = recentChanges.find((c) => c.id === changeId)!;
  const incident = similarIncidents.find((i) => i.id === incidentId)!;

  /* -------------------------------- render ------------------------------- */

  return (
    <div className={cn("px-4 py-6 sm:px-6 space-y-5", fullScreen ? "max-w-none" : "max-w-[1500px]")}>
      {/* -------------------------------- header ------------------------------ */}
      <header className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-indigo-50/40 p-5 shadow-sm">
        <nav aria-label="Breadcrumb" className="text-[11px] text-slate-500">
          SRE / Agentic SRE NOC / <span className="font-medium text-slate-700">Agentic Investigation Workspace</span>
        </nav>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">Agentic Investigation Workspace</h1>
            <p className="mt-1 max-w-3xl text-[12.5px] text-slate-600">
              Correlate optical, network, environmental, software, and customer evidence to determine the most likely cause and next action
            </p>
          </div>
          <Chip className="border-slate-200 bg-white text-slate-500">
            <Sparkles className="h-3 w-3" aria-hidden /> Synthetic Taara aligned demonstration environment
          </Chip>
        </div>
      </header>

      {/* --------------------------- command header --------------------------- */}
      <Panel
        title={`${INVESTIGATION_ID} · ${investigationHeader.situationTitle}`}
        subtitle={investigationHeader.stateLabel}
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <Select
              label="Active situation"
              value={situationId}
              options={selectableSituations.map((s) => s.id)}
              onChange={setSituationId}
            />
            <Select
              label="Investigation state"
              value={effectiveState}
              options={INVESTIGATION_STATES}
              onChange={(v) => { setStageIdx(null); setState(v as InvestigationState); }}
            />
            <ToolbarButton onClick={() => setRefreshedAt(`${refreshedAt.slice(0, 8)} refreshed`)} title="Request additional evidence">
              <RefreshCw className="h-3.5 w-3.5" /> Request evidence
            </ToolbarButton>
            <ToolbarButton onClick={() => setFullScreen((f) => !f)} active={fullScreen} title="Full screen mode">
              {fullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />} Full screen
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                setBrief(
                  `${INVESTIGATION_ID} investigation brief generated at ${refreshedAt}. Leading cause ${leading.cause} at ${leadingConfidence}% confidence, ${evidenceReviewed} evidence records, ${eliminatedCount} causes eliminated, ${openTasks} open tasks, readiness ${readiness}%.`,
                )
              }
              title="Export investigation brief"
            >
              <Download className="h-3.5 w-3.5" /> Export brief
            </ToolbarButton>
            <ToolbarButton onClick={() => setReadyToConclude(true)} active={readyToConclude} title="Mark investigation ready to conclude">
              <CheckCircle2 className="h-3.5 w-3.5" /> Ready to conclude
            </ToolbarButton>
            <ToolbarButton onClick={resetPage} title="Reset page state">
              <RotateCcw className="h-3.5 w-3.5" /> Reset page
            </ToolbarButton>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {headerFacts.map(([l, v]) => <Field key={l} label={l} value={v} />)}
        </div>
        {brief && <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11.5px] text-slate-700">{brief}</p>}
        {readyToConclude && (
          <p className="mt-2 text-[11.5px] text-emerald-700">
            Investigation marked ready to conclude in this demonstration session.
          </p>
        )}

        <div className="mt-3 grid gap-3 lg:grid-cols-[2fr_1fr]">
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Investigation state progression</h3>
            <ol className="mt-2 flex flex-wrap gap-1.5">
              {investigationStateStages.map((s) => {
                const idx = INVESTIGATION_STATES.indexOf(s.state);
                const cur = INVESTIGATION_STATES.indexOf(effectiveState);
                const status = idx < cur ? "complete" : idx === cur ? "current" : "next";
                return (
                  <li key={s.state}>
                    <button
                      type="button"
                      onClick={() =>
                        setDrawer({
                          title: `Investigation state · ${s.state}`,
                          rows: [
                            ["Status", status === "complete" ? "Complete" : status === "current" ? "Current" : "Not entered"],
                            ["Time entered", s.enteredAt],
                            ["Time spent", s.duration],
                            ["Owner", s.owner],
                            ["Required evidence", s.requiredEvidence],
                            ["Exit criteria", s.exitCriteria],
                            ["Remaining blockers", s.blockers],
                          ],
                        })
                      }
                      title={`Owner ${s.owner} · ${s.duration}`}
                      className={cn(
                        "rounded-md border px-2 py-1 text-[10.5px]",
                        status === "complete" && "border-emerald-200 bg-emerald-50 text-emerald-700",
                        status === "current" && "border-indigo-500 bg-indigo-50 font-semibold text-indigo-700",
                        status === "next" && "border-slate-200 bg-white text-slate-500",
                      )}
                    >
                      {s.state}
                      <span className="ml-1 text-[9.5px] opacity-70">{s.duration}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500" htmlFor="inv-owner">
              Assign investigation owner
            </label>
            <input
              id="inv-owner" value={owner} onChange={(e) => setOwner(e.target.value)}
              className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-[11.5px] text-slate-800"
            />
            <div className="flex flex-wrap gap-1.5">
              <input
                aria-label="Add investigator, digital coworker or investigation note"
                value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Investigator, digital coworker or note"
                className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-[11.5px] text-slate-800"
              />
              <ToolbarButton onClick={() => { if (noteDraft.trim()) { setParticipants((p) => [...p, `${noteDraft.trim()} (human investigator)`]); setNoteDraft(""); } }}>
                <User className="h-3.5 w-3.5" /> Add investigator
              </ToolbarButton>
              <ToolbarButton onClick={() => { if (noteDraft.trim()) { setParticipants((p) => [...p, `${noteDraft.trim()} (digital coworker)`]); setNoteDraft(""); } }}>
                <Bot className="h-3.5 w-3.5" /> Add coworker
              </ToolbarButton>
              <ToolbarButton onClick={() => { if (noteDraft.trim()) { setNotes((n) => [...n, noteDraft.trim()]); setNoteDraft(""); } }}>
                <Plus className="h-3.5 w-3.5" /> Add note
              </ToolbarButton>
            </div>
            <p className="text-[10.5px] text-slate-500">{participants.length} participants in this session</p>
            {notes.length > 0 && (
              <ul className="max-h-20 space-y-1 overflow-y-auto text-[11px] text-slate-600">
                {notes.map((n, i) => <li key={i}>· {n}</li>)}
              </ul>
            )}
          </div>
        </div>
      </Panel>

      {/* --------------------------------- KPIs ------------------------------- */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        {kpis.map((k) => (
          <KpiCard key={k.id} kpi={k} active={activeKpi === k.id} onClick={() => setActiveKpi(activeKpi === k.id ? null : k.id)} />
        ))}
      </div>

      {/* -------------------- hypotheses + selected analysis ------------------ */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Panel
          title="Ranked Cause Hypotheses"
          subtitle={`${hyps.length} candidate causes scored across six evidence domains`}
          action={
            <ToolbarButton onClick={() => setCompareIds([])} active={compareIds.length > 0} title="Clear hypothesis comparison">
              <Scale className="h-3.5 w-3.5" /> {compareIds.length ? `Comparing ${compareIds.length}` : "Compare"}
            </ToolbarButton>
          }
        >
          <ol className="space-y-2">
            {rankedHyps.map((h, i) => (
              <li key={h.id}>
                <div
                  className={cn(
                    "rounded-lg border p-3",
                    h.id === selectedHypId ? "border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-100" : "border-slate-200 bg-white",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedHypId(h.id)}
                      aria-pressed={h.id === selectedHypId}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-slate-400">Rank {i + 1}</span>
                        <Chip className={statusChip(h.status)}>{h.status}</Chip>
                      </div>
                      <div className="mt-0.5 text-[12.5px] font-semibold text-slate-900">{h.cause}</div>
                    </button>
                    <div className="shrink-0 text-right">
                      <div className="text-lg font-semibold text-slate-900">{h.confidence}%</div>
                      <div className="text-[10px] text-slate-500">{h.lastEvaluated}</div>
                    </div>
                  </div>
                  <div className="mt-2"><Meter value={h.confidence} color={h.status === "Leading Cause" ? "#4f46e5" : h.status === "Monitoring" ? "#f59e0b" : "#94a3b8"} /></div>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[10.5px] text-slate-600">
                    <Chip className={toneChip("good")}>{h.supporting.length} supporting</Chip>
                    <Chip className={toneChip("risk")}>{h.contradicting.length} contradicting</Chip>
                    <Chip className={toneChip("neutral")}>{h.agents.length} agents</Chip>
                    <Chip className={toneChip("neutral")}>{h.domain}</Chip>
                  </div>
                  <dl className="mt-2 grid gap-1 text-[11px] text-slate-600 sm:grid-cols-2">
                    <div><dt className="inline font-medium text-slate-500">Required validation: </dt><dd className="inline">{h.requiredValidation}</dd></div>
                    <div><dt className="inline font-medium text-slate-500">Next test: </dt><dd className="inline">{h.nextTest}</dd></div>
                    <div><dt className="inline font-medium text-slate-500">Customer relevance: </dt><dd className="inline">{h.customerRelevance}</dd></div>
                    <div><dt className="inline font-medium text-slate-500">SLO relevance: </dt><dd className="inline">{h.sloRelevance}</dd></div>
                  </dl>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <ToolbarButton onClick={() => toggleCompare(h.id)} active={compareIds.includes(h.id)}>Compare</ToolbarButton>
                    <ToolbarButton onClick={() => { adjustConfidence(h.id, 5); setStatus(h.id, "Leading Cause"); }}>Promote</ToolbarButton>
                    <ToolbarButton onClick={() => adjustConfidence(h.id, -5)}>Lower</ToolbarButton>
                    {h.status === "Eliminated" ? (
                      <ToolbarButton onClick={() => { setStatus(h.id, "Testing"); adjustConfidence(h.id, 12); }}>Reopen cause</ToolbarButton>
                    ) : (
                      <ToolbarButton onClick={() => setStatus(h.id, "Eliminated")}>Eliminate cause</ToolbarButton>
                    )}
                    <ToolbarButton onClick={() => runTest(h.id, `Validation test for ${h.cause}`)}>
                      <FlaskConical className="h-3.5 w-3.5" /> Run validation
                    </ToolbarButton>
                    <ToolbarButton onClick={() => { setSelectedHypId(h.id); setRefreshedAt(`${refreshedAt} +request`); }}>Request evidence</ToolbarButton>
                    <ToolbarButton onClick={() => setLinkedEvidence((p) => ({ ...p, [h.id]: [...(p[h.id] ?? []), selectedSignal?.signal ?? "Selected signal"] }))}>
                      Link evidence
                    </ToolbarButton>
                  </div>
                  {testResults[h.id] && <p className="mt-1.5 text-[11px] text-emerald-700">{testResults[h.id]}</p>}
                  {(linkedEvidence[h.id]?.length ?? 0) > 0 && (
                    <p className="mt-1 text-[11px] text-indigo-700">Linked evidence: {linkedEvidence[h.id].join(", ")}</p>
                  )}
                  {(assessments[h.id]?.length ?? 0) > 0 && (
                    <ul className="mt-1 space-y-0.5 text-[11px] text-slate-600">
                      {assessments[h.id].map((a, ix) => <li key={ix}>· Human assessment: {a}</li>)}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>

          {compareIds.length > 0 && (
            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-[11.5px]">
                <caption className="sr-only">Hypothesis comparison</caption>
                <thead className="bg-slate-50"><tr><Th>Attribute</Th>{compareIds.map((id) => <Th key={id}>{hyps.find((h) => h.id === id)?.cause}</Th>)}</tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {([
                    ["Confidence", (h: CauseHypothesis) => `${h.confidence}%`],
                    ["Status", (h: CauseHypothesis) => h.status],
                    ["Supporting evidence", (h: CauseHypothesis) => String(h.supporting.length)],
                    ["Contradicting evidence", (h: CauseHypothesis) => String(h.contradicting.length)],
                    ["Evidence completeness", (h: CauseHypothesis) => `${h.evidenceCompleteness}%`],
                    ["Recommended action", (h: CauseHypothesis) => h.recommendedAction],
                  ] as [string, (h: CauseHypothesis) => string][]).map(([label, get]) => (
                    <tr key={label}>
                      <Td className="font-medium text-slate-500">{label}</Td>
                      {compareIds.map((id) => <Td key={id}>{get(hyps.find((h) => h.id === id)!)}</Td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel
          title="Selected Cause Analysis"
          subtitle={selectedHyp.cause}
          action={
            <div className="flex flex-wrap gap-1.5">
              {HYP_TABS.map((t) => (
                <button
                  key={t} type="button" onClick={() => setHypTab(t)} aria-pressed={hypTab === t}
                  className={cn("rounded-md border px-2 py-1 text-[11px]",
                    hypTab === t ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}
                >{t}</button>
              ))}
            </div>
          }
        >
          {hypTab === "Summary" && (
            <div className="space-y-3">
              <p className="text-[12.5px] leading-relaxed text-slate-700">{selectedHyp.description}</p>
              <div className="grid gap-2 sm:grid-cols-3">
                <Field label="Current confidence" value={`${selectedHyp.confidence}%`} />
                <Field label="Confidence trend" value={`${selectedHyp.confidenceHistory[0].value}% to ${selectedHyp.confidenceHistory[selectedHyp.confidenceHistory.length - 1].value}%`} />
                <Field label="Status" value={selectedHyp.status} />
                <Field label="Customer impact" value={selectedHyp.customerRelevance} />
                <Field label="SLO impact" value={selectedHyp.sloRelevance} />
                <Field label="Components involved" value={selectedHyp.components.join(", ")} />
                <Field label="Agents involved" value={selectedHyp.agents.join(", ")} />
                <Field label="Evidence completeness" value={`${selectedHyp.evidenceCompleteness}%`} />
                <Field label="Validation status" value={selectedHyp.requiredValidation} />
                <Field label="Remaining uncertainty" value={selectedHyp.remainingUncertainty} />
                <Field label="Recommended action" value={selectedHyp.recommendedAction} />
                <Field label="Conclusion readiness" value={`${readiness}%`} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Supporting factors</h4>
                  <div className="mt-1"><EvidenceList items={selectedHyp.supporting} tone="good" /></div>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wide text-rose-700">Contradicting factors</h4>
                  <div className="mt-1"><EvidenceList items={selectedHyp.contradicting} tone="risk" /></div>
                </div>
              </div>
              <blockquote className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-3 text-[12px] leading-relaxed text-slate-800">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-indigo-700">Auditable cause statement</span>
                {causeStatement}
              </blockquote>
              <div className="flex flex-wrap items-center gap-1.5">
                <input
                  aria-label="Add human assessment" value={assessmentDraft} onChange={(e) => setAssessmentDraft(e.target.value)}
                  placeholder="Add a human assessment for this hypothesis"
                  className="min-w-[220px] flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-[11.5px] text-slate-800"
                />
                <ToolbarButton
                  onClick={() => {
                    if (!assessmentDraft.trim()) return;
                    setAssessments((p) => ({ ...p, [selectedHyp.id]: [...(p[selectedHyp.id] ?? []), assessmentDraft.trim()] }));
                    setAssessmentDraft("");
                  }}
                >Add human assessment</ToolbarButton>
              </div>
            </div>
          )}

          {hypTab === "Supporting Evidence" && <EvidenceList items={selectedHyp.supporting} tone="good" />}
          {hypTab === "Contradicting Evidence" && <EvidenceList items={selectedHyp.contradicting} tone="risk" />}

          {hypTab === "Telemetry" && (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <RTooltip contentStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="attenuation" name="Optical attenuation (dB)" stroke="#f97316" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="marginA" name="Link margin (dB)" stroke="#4f46e5" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="visibility" name="Visibility (km)" stroke="#0ea5e9" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {hypTab === "Similar Incidents" && (
            <ul className="space-y-2">
              {similarIncidents.map((s) => (
                <li key={s.id} className="rounded-lg border border-slate-200 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-medium text-slate-900">{s.title}</span>
                    <Chip className={toneChip(s.similarity > 70 ? "good" : "neutral")}>{s.similarity}% similar</Chip>
                  </div>
                  <p className="text-[11.5px] text-slate-600">Confirmed cause: {s.confirmedCause} · {s.outcome}</p>
                </li>
              ))}
            </ul>
          )}

          {hypTab === "Changes" && (
            <ul className="space-y-1.5">
              {recentChanges.map((c) => (
                <li key={c.id} className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[11.5px] text-slate-700">
                  <span className="font-medium text-slate-900">{c.id}</span> · {c.type} · {c.relationship} — {c.agentAssessment}
                </li>
              ))}
            </ul>
          )}

          {hypTab === "Validation Tests" && (
            <div className="overflow-x-auto">
              <table className="w-full text-[11.5px]">
                <caption className="sr-only">Validation tests for the selected hypothesis</caption>
                <thead className="bg-slate-50"><tr><Th>Test</Th><Th>Scope</Th><Th>Result</Th><Th>Detail</Th><Th>Run by</Th><Th>Time</Th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {validationTests.filter((v) => v.hypothesisId === selectedHyp.id).map((v) => (
                    <tr key={v.id}>
                      <Td className="font-medium text-slate-900">{v.name}</Td>
                      <Td>{v.scope}</Td>
                      <Td><Chip className={v.result === "Passed" ? toneChip("good") : v.result === "Failed" ? toneChip("risk") : toneChip("watch")}>{v.result}</Chip></Td>
                      <Td>{v.detail}</Td><Td>{v.runBy}</Td><Td>{v.at}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {hypTab === "Agent Findings" && (
            <ul className="space-y-1.5">
              {investigationAgents
                .filter((a) => a.supports.includes(selectedHyp.id) || a.contradicts.includes(selectedHyp.id))
                .map((a) => (
                  <li key={a.id} className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[11.5px]">
                    <span className="font-medium text-slate-900">{a.name}</span>
                    <Chip className={cn("ml-1.5", a.supports.includes(selectedHyp.id) ? toneChip("good") : toneChip("risk"))}>
                      {a.supports.includes(selectedHyp.id) ? "Supports" : "Contradicts"}
                    </Chip>
                    <span className="ml-1.5 text-slate-600">{a.lastFinding}</span>
                  </li>
                ))}
            </ul>
          )}

          {hypTab === "History" && (
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedHyp.confidenceHistory} margin={{ top: 8, right: 12, bottom: 4, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="at" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <RTooltip contentStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="value" name="Confidence (%)" stroke="#4f46e5" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>

      {/* --------------------- cross-domain evidence correlation -------------- */}
      <Panel
        title="Cross-Domain Evidence Correlation"
        subtitle="Optical, terminal, network, environmental, software and change, and customer evidence aligned on one timeline"
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <Select label="Evidence domain" value={domain} options={[ALL_DOMAINS, ...EVIDENCE_DOMAINS]} onChange={(v) => setDomain(v as EvidenceDomain)} />
            <ToolbarButton onClick={() => setRelationFilter(relationFilter === "Supports" ? "All" : "Supports")} active={relationFilter === "Supports"}>
              Supports leading cause
            </ToolbarButton>
            <ToolbarButton onClick={() => setRelationFilter(relationFilter === "Contradicts" ? "All" : "Contradicts")} active={relationFilter === "Contradicts"}>
              Contradicts hypotheses
            </ToolbarButton>
            <ToolbarButton onClick={() => setEvidenceExport(`Evidence summary exported at ${refreshedAt} with ${signals.length} signals and ${pinned.length} pinned records.`)}>
              <Download className="h-3.5 w-3.5" /> Export evidence
            </ToolbarButton>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          {domainCounts.map((d) => (
            <button
              key={d.domain} type="button" onClick={() => setDomain(domain === d.domain ? ALL_DOMAINS : d.domain)}
              aria-pressed={domain === d.domain}
              className={cn("rounded-lg border p-2.5 text-left", domain === d.domain ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 bg-white hover:bg-slate-50")}
            >
              <div className="text-[11px] font-semibold text-slate-900">{d.domain}</div>
              <div className="text-[10.5px] text-slate-500">{d.total} signals</div>
              <div className="mt-1 flex gap-1">
                <Chip className={toneChip("good")}>{d.supports} support</Chip>
                <Chip className={toneChip("risk")}>{d.contradicts} contradict</Chip>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="max-h-[380px] overflow-auto rounded-lg border border-slate-200">
            <table className="w-full text-[11.5px]">
              <caption className="sr-only">Cross-domain evidence signals</caption>
              <thead className="sticky top-0 bg-slate-50"><tr><Th>Signal</Th><Th>Value</Th><Th>Baseline</Th><Th>Change</Th><Th>Relation</Th><Th>Time</Th><Th>Pin</Th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {signals.map((s) => (
                  <tr key={s.id} className={cn("cursor-pointer hover:bg-slate-50", signalId === s.id && "bg-indigo-50/60")} onClick={() => setSignalId(s.id)}>
                    <Td className="font-medium text-slate-900">{s.signal}<div className="text-[10px] font-normal text-slate-500">{s.domain}</div></Td>
                    <Td>{s.value}</Td><Td>{s.baseline}</Td><Td>{s.change}</Td>
                    <Td><Chip className={relationChip(s.relation)}>{s.relation}</Chip></Td>
                    <Td>{s.at}</Td>
                    <Td>
                      <button
                        type="button" aria-label={`Pin ${s.signal}`}
                        onClick={(e) => { e.stopPropagation(); setPinned((p) => p.includes(s.id) ? p.filter((x) => x !== s.id) : [...p, s.id]); }}
                        className={cn("rounded border px-1.5 py-0.5 text-[10px]", pinned.includes(s.id) ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500")}
                      >{pinned.includes(s.id) ? "Pinned" : "Pin"}</button>
                    </Td>
                  </tr>
                ))}
                {signals.length === 0 && (
                  <tr><Td className="text-slate-500">No signals match the selected domain and relation filters.</Td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-2">
            {selectedSignal ? (
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[12.5px] font-semibold text-slate-900">{selectedSignal.signal}</h3>
                  <Chip className={relationChip(selectedSignal.relation)}>{selectedSignal.relation}</Chip>
                </div>
                <p className="mt-1 text-[11.5px] text-slate-600">{selectedSignal.note}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Field label="Domain" value={selectedSignal.domain} />
                  <Field label="Source" value={selectedSignal.source} />
                  <Field label="Aligned timestamp" value={selectedSignal.at} />
                  <Field label="Related hypothesis" value={hyps.find((h) => h.id === selectedSignal.hypothesisId)?.cause ?? "—"} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <ToolbarButton onClick={() => setLinkedEvidence((p) => ({ ...p, [selectedHyp.id]: [...(p[selectedHyp.id] ?? []), selectedSignal.signal] }))}>
                    Link to selected hypothesis
                  </ToolbarButton>
                  <ToolbarButton onClick={() => setDrawer({ title: `Evidence source · ${selectedSignal.signal}`, rows: [["Source", selectedSignal.source], ["Domain", selectedSignal.domain], ["Value", selectedSignal.value], ["Baseline", selectedSignal.baseline], ["Change", selectedSignal.change], ["Captured", selectedSignal.at], ["Relation", selectedSignal.relation]], body: selectedSignal.note })}>
                    Open source detail
                  </ToolbarButton>
                </div>
                {selectedSignal.seriesKey && (
                  <div className="mt-2 h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 6, right: 8, bottom: 0, left: -22 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="t" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 9 }} />
                        <RTooltip contentStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey={selectedSignal.seriesKey} name={selectedSignal.signal} stroke="#4f46e5" dot={false} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-slate-300 p-4 text-[11.5px] text-slate-500">Select a signal to see aligned detail.</p>
            )}
            {pinned.length > 0 && (
              <div className="rounded-lg border border-slate-200 p-2.5">
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Pinned evidence</h4>
                <ul className="mt-1 space-y-0.5 text-[11.5px] text-slate-700">
                  {pinned.map((p) => <li key={p}>· {domainSignals.find((s) => s.id === p)?.signal}</li>)}
                </ul>
              </div>
            )}
            {evidenceExport && <p className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11.5px] text-slate-700">{evidenceExport}</p>}
          </div>
        </div>
      </Panel>

      {/* ------------------- optical and terminal investigation --------------- */}
      <Panel
        title="Optical and Terminal Investigation"
        subtitle="Terminal A, Terminal B and the optical path between them"
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <Select label="Metric" value={opticalMetric} options={Object.keys(opticalSeriesKeys)} onChange={setOpticalMetric} />
            <ToolbarButton onClick={() => setCompareTerminals((c) => !c)} active={compareTerminals}>Compare terminals</ToolbarButton>
            <ToolbarButton onClick={() => setShowBaseline((b) => !b)} active={showBaseline}>Current versus baseline</ToolbarButton>
            <ToolbarButton onClick={() => setShowRange((r) => !r)} active={showRange}>Expected range</ToolbarButton>
            <ToolbarButton onClick={() => setShowAnomaly((a) => !a)} active={showAnomaly}>Anomaly period</ToolbarButton>
          </div>
        }
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: -14 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <RTooltip contentStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey={opticalKey.key} name={opticalMetric} stroke={opticalKey.color} dot={false} strokeWidth={2} />
                {compareTerminals && <Line type="monotone" dataKey="marginB" name="Terminal B link margin (dB)" stroke="#7c3aed" dot={false} strokeWidth={2} strokeDasharray="4 3" />}
                {showBaseline && <ReferenceLine y={opticalKey.key === "rxPower" ? -24 : 9.5} stroke="#94a3b8" strokeDasharray="4 3" label={{ value: "Baseline", fontSize: 9, fill: "#64748b" }} />}
                {showRange && <ReferenceLine y={6} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "Preventive threshold", fontSize: 9, fill: "#b45309" }} />}
                {showAnomaly && <ReferenceLine x="10:45" stroke="#e11d48" label={{ value: "Anomaly onset", fontSize: 9, fill: "#be123c" }} />}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            <div className="grid gap-2 sm:grid-cols-2">
              {investigationTerminals.map((t) => (
                <button
                  key={t.id} type="button"
                  onClick={() => setDrawer({
                    title: `${t.name} · terminal evidence`,
                    rows: [["Site", t.site], ["Firmware", t.firmware], ["Availability", t.availability], ["Beam lock", t.beamLock],
                    ["Transmit power", t.txPower], ["Received power", t.rxPower], ["Link margin", t.margin], ["Pointing error", t.pointingError],
                    ["Tracking rate", t.trackingRate], ["Temperature", t.temperature], ["Power state", t.powerState], ["Voltage", t.voltage],
                    ["Mounting vibration", t.vibration], ["Configuration drift", t.configDrift], ["Telemetry freshness", t.telemetryFreshness]],
                    body: t.assessment,
                  })}
                  className="rounded-lg border border-slate-200 bg-white p-2.5 text-left hover:border-indigo-300"
                >
                  <div className="text-[12px] font-semibold text-slate-900">{t.name}</div>
                  <div className="text-[10.5px] text-slate-500">{t.site}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Chip className={toneChip("good")}>{t.assessment.split("—")[0].trim()}</Chip>
                    <Chip className={toneChip("neutral")}>{t.margin} margin</Chip>
                    <Chip className={toneChip("neutral")}>{t.vibration} vibration</Chip>
                  </div>
                </button>
              ))}
            </div>
            <div className="rounded-lg border border-slate-200 p-2.5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Investigation findings</h4>
              <ul className="mt-1 space-y-0.5">
                {opticalFindings.map((f) => (
                  <li key={f} className="flex gap-1.5 text-[11.5px] text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" aria-hidden /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <ToolbarButton onClick={() => runTest("vt-terminal", "Terminal health validation")}>Run terminal health validation</ToolbarButton>
              <ToolbarButton onClick={() => runTest("vt-align", "Beam alignment validation")}>Run beam alignment validation</ToolbarButton>
              <ToolbarButton onClick={() => runTest("vt-mount", "Mounting stability validation")}>Run mounting stability validation</ToolbarButton>
              <ToolbarButton onClick={() => setLinkedEvidence((p) => ({ ...p, [selectedHyp.id]: [...(p[selectedHyp.id] ?? []), "Optical and terminal investigation findings"] }))}>
                Add evidence to selected hypothesis
              </ToolbarButton>
            </div>
            {["vt-terminal", "vt-align", "vt-mount"].filter((k) => testResults[k]).map((k) => (
              <p key={k} className="text-[11px] text-emerald-700">{testResults[k]}</p>
            ))}
          </div>
        </div>
      </Panel>

      {/* ------------------ network and service path investigation ------------ */}
      <Panel
        title="Network and Service Path Investigation"
        subtitle="Customer network through to downstream traffic, segment by segment"
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <Select label="Route segment" value={segmentId} options={routeSegmentEvidence.map((s) => s.nodeId)} onChange={setSegmentId} />
            <ToolbarButton onClick={() => setNetworkNote("Upstream path validated: partner aggregation and fiber handoff healthy with zero errors.")}>Validate upstream</ToolbarButton>
            <ToolbarButton onClick={() => setNetworkNote("Downstream path validated: regional aggregation and 34 tower clusters reachable.")}>Validate downstream</ToolbarButton>
            <ToolbarButton onClick={() => setNetworkNote("Primary optical delivers 5.5 Gbps at 4.2 ms. RF fallback delivers 3.1 Gbps at 7.8 ms with 48 percent headroom.")}>Compare primary and fallback</ToolbarButton>
            <ToolbarButton onClick={() => setNetworkNote("Route latency: 0.3, 0.4, 1.1, 0.6, optical 4.2, 1.6, 0.4 ms per segment.")}>Show route latency</ToolbarButton>
            <ToolbarButton onClick={() => setNetworkNote("Packet loss localised to the optical span between Terminal A and Terminal B during the attenuation window.")}>Show packet loss location</ToolbarButton>
            <ToolbarButton onClick={() => setNetworkNote("Dependency impact: 1 customer service, 34 tower clusters, 42,000 synthetic downstream users.")}>Analyze dependency impact</ToolbarButton>
          </div>
        }
      >
        <ServiceRouteGraph
          route={situationRoute}
          selectedNodeId={segmentId}
          selectedEdgeId={routeEdgeId}
          onSelectNode={(id) => { if (routeSegmentEvidence.some((s) => s.nodeId === id)) setSegmentId(id); }}
          onSelectEdge={(id) => setRouteEdgeId(id)}
        />
        {networkNote && <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11.5px] text-slate-700">{networkNote}</p>}

        <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-[11.5px]">
            <caption className="sr-only">Route segment evidence</caption>
            <thead className="bg-slate-50">
              <tr><Th>Segment</Th><Th>Interface</Th><Th>Routing</Th><Th>Capacity</Th><Th>Throughput</Th><Th>Latency</Th><Th>Loss</Th><Th>Errors</Th><Th>Owner</Th><Th>Active changes</Th><Th>Incidents</Th><Th>Agent finding</Th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {routeSegmentEvidence.map((s) => (
                <tr key={s.nodeId} className={cn("cursor-pointer hover:bg-slate-50", segmentId === s.nodeId && "bg-indigo-50/60")} onClick={() => setSegmentId(s.nodeId)}>
                  <Td className="font-medium text-slate-900">{s.segment}</Td>
                  <Td>{s.interfaceState}</Td><Td>{s.routingState}</Td><Td>{s.capacity}</Td><Td>{s.throughput}</Td>
                  <Td>{s.latency}</Td><Td>{s.packetLoss}</Td><Td>{s.errors}</Td><Td>{s.owner}</Td>
                  <Td>{s.activeChanges}</Td><Td>{s.incidents}</Td><Td>{s.finding}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <p className="flex-1 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11.5px] text-emerald-800">{networkConclusion}</p>
          <ToolbarButton onClick={() => setLinkedEvidence((p) => ({ ...p, [selectedHyp.id]: [...(p[selectedHyp.id] ?? []), `Route evidence for ${segment.segment}`] }))}>
            Link route evidence to hypothesis
          </ToolbarButton>
          <ToolbarButton onClick={() => setDrawer({
            title: `Topology detail · ${segment.segment}`,
            rows: [["Interface state", segment.interfaceState], ["Routing state", segment.routingState], ["Capacity", segment.capacity],
            ["Throughput", segment.throughput], ["Latency", segment.latency], ["Packet loss", segment.packetLoss],
            ["Errors", segment.errors], ["Ownership", segment.owner], ["Active changes", segment.activeChanges], ["Incidents", segment.incidents]],
            body: segment.finding,
          })}>
            Open topology detail
          </ToolbarButton>
        </div>
      </Panel>

      {/* -------------------------- environmental ----------------------------- */}
      <Panel
        title="Environmental Investigation"
        subtitle="Atmospheric conditions aligned with optical and customer signals"
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <Select label="Correlation" value={pairId} options={CORRELATION_PAIRS.map((p) => p.id)} onChange={setPairId} />
            <ToolbarButton onClick={() => setIncidentId("SIT-2025-0977")}>Compare with historical incidents</ToolbarButton>
            <ToolbarButton onClick={() => setNetworkNote("Nearby links Chennai 038 and Chennai 044 show comparable attenuation, consistent with a regional environmental cause.")}>Compare nearby links</ToolbarButton>
            <ToolbarButton onClick={() => runTest("vt-env", "Environmental cause validation")}>Run environmental validation</ToolbarButton>
            <ToolbarButton onClick={() => setWatchCreated(true)} active={watchCreated}>Create monitoring watch</ToolbarButton>
          </div>
        }
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Visibility" value={environmentalConditions.visibility} />
            <Field label="Fog density" value={environmentalConditions.fogDensity} />
            <Field label="Relative humidity" value={environmentalConditions.humidity} />
            <Field label="Rainfall" value={environmentalConditions.rainfall} />
            <Field label="Wind speed" value={environmentalConditions.windSpeed} />
            <Field label="Wind direction" value={environmentalConditions.windDirection} />
            <Field label="Temperature" value={environmentalConditions.temperature} />
            <Field label="Atmospheric risk" value={environmentalConditions.atmosphericRisk} />
            <Field label="Forecast confidence" value={environmentalConditions.confidence} />
            <Field label="Expected recovery window" value={environmentalConditions.expectedRecovery} />
          </div>
          <div>
            <div className="h-[210px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <RTooltip contentStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="visibility" name="Visibility (km)" stroke="#0ea5e9" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="attenuation" name="Optical attenuation (dB)" stroke="#f97316" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="marginA" name="Link margin (dB)" stroke="#4f46e5" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="throughput" name="Throughput (Gbps)" stroke="#16a34a" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 8, right: 12, bottom: 8, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" dataKey="x" name={pair.x} tick={{ fontSize: 9 }} />
                  <YAxis type="number" dataKey="y" name={pair.y} tick={{ fontSize: 9 }} />
                  <ZAxis range={[36, 36]} />
                  <RTooltip contentStyle={{ fontSize: 11 }} cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter data={scatterData} fill="#6366f1" name={pair.label} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-600">{pair.label} · correlation {pair.coefficient} · {pair.note}</p>
          </div>
        </div>
        <p className="mt-2 rounded-md border border-indigo-200 bg-indigo-50/60 px-3 py-2 text-[11.5px] text-slate-800">{environmentalConclusion}</p>
        {watchCreated && <p className="mt-1.5 text-[11.5px] text-emerald-700">Continued monitoring watch created for the Chennai coastal cell in this session.</p>}
        {testResults["vt-env"] && <p className="mt-1 text-[11px] text-emerald-700">{testResults["vt-env"]}</p>}
        <div className="mt-2">
          <ToolbarButton onClick={() => setLinkedEvidence((p) => ({ ...p, [selectedHyp.id]: [...(p[selectedHyp.id] ?? []), "Environmental correlation analysis"] }))}>
            Add environmental evidence to selected hypothesis
          </ToolbarButton>
        </div>
      </Panel>

      {/* --------------------------- software and change ---------------------- */}
      <Panel
        title="Software and Change Analysis"
        subtitle="Recent changes affecting the selected service and route"
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <Select label="Change" value={changeId} options={recentChanges.map((c) => c.id)} onChange={setChangeId} />
            <ToolbarButton onClick={() => setChangeVerdicts((p) => ({ ...p, [changeId]: "Pre-change and post-change telemetry compared — no behavioural difference detected." }))}>Compare pre and post change</ToolbarButton>
            <ToolbarButton onClick={() => setChangeVerdicts((p) => ({ ...p, [changeId]: "Affected and unaffected links compared — no cohort divergence." }))}>Compare affected and unaffected links</ToolbarButton>
            <ToolbarButton onClick={() => setChangeVerdicts((p) => ({ ...p, [changeId]: "Marked unrelated to this investigation." }))}>Mark change unrelated</ToolbarButton>
            <ToolbarButton onClick={() => setChangeVerdicts((p) => ({ ...p, [changeId]: "Change investigation reopened for further review." }))}>Reopen change investigation</ToolbarButton>
            <ToolbarButton onClick={() => setChangeVerdicts((p) => ({ ...p, [changeId]: `Change owner review requested from ${change.owner}.` }))}>Request change owner review</ToolbarButton>
            <ToolbarButton onClick={() => setChangeVerdicts((p) => ({ ...p, [changeId]: `Rollback readiness: ${change.rollbackReadiness}.` }))}>Show rollback readiness</ToolbarButton>
          </div>
        }
      >
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-[11.5px]">
            <caption className="sr-only">Recent changes affecting this service</caption>
            <thead className="bg-slate-50">
              <tr><Th>Change</Th><Th>Type</Th><Th>Object affected</Th><Th>Date and time</Th><Th>Owner</Th><Th>Status</Th><Th>Risk</Th><Th>Relationship</Th><Th>Agent assessment</Th><Th>Evidence</Th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentChanges.map((c) => (
                <tr key={c.id} className={cn("cursor-pointer hover:bg-slate-50", changeId === c.id && "bg-indigo-50/60")} onClick={() => setChangeId(c.id)}>
                  <Td className="font-medium text-slate-900">{c.id}</Td><Td>{c.type}</Td><Td>{c.object}</Td><Td>{c.at}</Td>
                  <Td>{c.owner}</Td><Td>{c.status}</Td>
                  <Td><Chip className={c.risk === "High" ? toneChip("risk") : c.risk === "Medium" ? toneChip("watch") : toneChip("good")}>{c.risk}</Chip></Td>
                  <Td>{c.relationship}</Td><Td>{c.agentAssessment}</Td><Td>{c.evidence}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {changeVerdicts[changeId] && (
          <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11.5px] text-slate-700">{changeId}: {changeVerdicts[changeId]}</p>
        )}
        <div className="mt-2 flex flex-wrap items-start gap-2">
          <ul className="flex-1 space-y-0.5">
            {changeConclusions.map((c) => (
              <li key={c} className="flex gap-1.5 text-[11.5px] text-slate-700">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" aria-hidden /> {c}
              </li>
            ))}
          </ul>
          <ToolbarButton onClick={() => setLinkedEvidence((p) => ({ ...p, [selectedHyp.id]: [...(p[selectedHyp.id] ?? []), `Change record ${changeId}`] }))}>
            Link change to hypothesis
          </ToolbarButton>
        </div>
      </Panel>

      {/* --------------------------- similar incidents ------------------------ */}
      <Panel
        title="Similar Historical Situations"
        subtitle="Synthetic prior situations ranked by signal similarity"
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <Select label="Incident" value={incidentId} options={similarIncidents.map((i) => i.id)} onChange={setIncidentId} />
            <ToolbarButton onClick={() => setReuseNote(`Prior diagnostic from ${incident.title} applied: ${incident.runbook}.`)}>Apply prior diagnostic test</ToolbarButton>
            <ToolbarButton onClick={() => setReuseNote(`Runbook ${incident.runbook} reused for this investigation.`)}>Reuse prior runbook</ToolbarButton>
            <ToolbarButton onClick={() => setLinkedEvidence((p) => ({ ...p, [selectedHyp.id]: [...(p[selectedHyp.id] ?? []), `Historical situation ${incident.id}`] }))}>Add as supporting evidence</ToolbarButton>
            <ToolbarButton onClick={() => setExcluded((p) => p.includes(incidentId) ? p.filter((x) => x !== incidentId) : [...p, incidentId])} active={excluded.includes(incidentId)}>
              {excluded.includes(incidentId) ? "Included" : "Exclude from comparison"}
            </ToolbarButton>
          </div>
        }
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <ul className="space-y-2">
            {similarIncidents.map((s) => (
              <li key={s.id}>
                <button
                  type="button" onClick={() => setIncidentId(s.id)} aria-pressed={incidentId === s.id}
                  className={cn("w-full rounded-lg border p-2.5 text-left",
                    excluded.includes(s.id) && "opacity-50",
                    incidentId === s.id ? "border-indigo-500 bg-indigo-50/40" : "border-slate-200 bg-white hover:bg-slate-50")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12.5px] font-semibold text-slate-900">{s.title}</span>
                    <Chip className={toneChip(s.similarity >= 70 ? "good" : s.similarity >= 40 ? "watch" : "neutral")}>{s.similarity}% similar</Chip>
                  </div>
                  <div className="mt-1"><Meter value={s.similarity} color={s.similarity >= 70 ? "#059669" : "#94a3b8"} /></div>
                  <p className="mt-1 text-[11.5px] text-slate-600">
                    Confirmed cause: {s.confirmedCause} · Outcome: {s.outcome} · Time to restore {s.timeToRestore}
                  </p>
                </button>
              </li>
            ))}
          </ul>
          <div className="rounded-lg border border-slate-200 p-3">
            <h3 className="text-[12.5px] font-semibold text-slate-900">{incident.title}</h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Field label="Similarity" value={`${incident.similarity}%`} />
              <Field label="Confirmed cause" value={incident.confirmedCause} />
              <Field label="Customer impact" value={incident.customerImpact} />
              <Field label="Resolution" value={incident.resolution} />
              <Field label="Time to restore" value={incident.timeToRestore} />
              <Field label="Evidence quality" value={incident.evidenceQuality} />
              <Field label="Runbook used" value={incident.runbook} />
              <Field label="Knowledge learned" value={incident.knowledge} />
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Matching signals</h4>
                <EvidenceList items={incident.matchingSignals} tone="good" />
              </div>
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-rose-700">Different signals</h4>
                <EvidenceList items={incident.differentSignals} tone="risk" />
              </div>
            </div>
            {reuseNote && <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11.5px] text-slate-700">{reuseNote}</p>}
          </div>
        </div>
      </Panel>

      {/* ------------------------ eliminated cause register ------------------- */}
      <Panel title="Eliminated Causes" subtitle="Every cause evaluated and excluded, with rationale and reopen criteria">
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-[11.5px]">
            <caption className="sr-only">Eliminated cause register</caption>
            <thead className="bg-slate-50">
              <tr><Th>Cause</Th><Th>Original</Th><Th>Current</Th><Th>Status</Th><Th>Evidence reviewed</Th><Th>Key contradicting evidence</Th><Th>Agent owner</Th><Th>Human reviewer</Th><Th>Time eliminated</Th><Th>Reopen criteria</Th><Th>Actions</Th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {eliminatedCauses.map((c) => {
                const live = hyps.find((h) => h.id === c.hypothesisId)!;
                const status = permanentlyExcluded.includes(c.hypothesisId)
                  ? "Permanently excluded"
                  : live.status === "Eliminated" ? c.status : "Reopened";
                return (
                  <tr key={c.hypothesisId}>
                    <Td className="font-medium text-slate-900">{c.cause}</Td>
                    <Td>{c.originalConfidence}%</Td>
                    <Td>{live.confidence}%</Td>
                    <Td><Chip className={status === "Reopened" ? toneChip("watch") : toneChip("neutral")}>{status}</Chip></Td>
                    <Td>{c.evidenceReviewed}</Td>
                    <Td>{c.keyContradicting}</Td>
                    <Td>{c.agentOwner}</Td>
                    <Td>{c.humanReviewer}</Td>
                    <Td>{c.eliminatedAt}</Td>
                    <Td>{c.reopenCriteria}</Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        <ToolbarButton onClick={() => { setStatus(c.hypothesisId, "Testing"); adjustConfidence(c.hypothesisId, 12); setSelectedHypId(c.hypothesisId); }}>Reopen</ToolbarButton>
                        <ToolbarButton onClick={() => setDrawer({ title: `Eliminated cause · ${c.cause}`, rows: [["Original confidence", `${c.originalConfidence}%`], ["Current confidence", `${live.confidence}%`], ["Evidence reviewed", String(c.evidenceReviewed)], ["Agent owner", c.agentOwner], ["Human reviewer", c.humanReviewer], ["Time eliminated", c.eliminatedAt], ["Reopen criteria", c.reopenCriteria]], body: c.rationale })}>
                          View evidence
                        </ToolbarButton>
                        <ToolbarButton onClick={() => setReviewerNotes((p) => ({ ...p, [c.hypothesisId]: [...(p[c.hypothesisId] ?? []), `Reviewed by ${owner} at ${refreshedAt}`] }))}>Add reviewer note</ToolbarButton>
                        <ToolbarButton onClick={() => toggleCompare(c.hypothesisId)}>Compare with leading</ToolbarButton>
                        <ToolbarButton onClick={() => setPermanentlyExcluded((p) => p.includes(c.hypothesisId) ? p : [...p, c.hypothesisId])} active={permanentlyExcluded.includes(c.hypothesisId)}>
                          <CircleSlash className="h-3.5 w-3.5" /> Exclude permanently
                        </ToolbarButton>
                      </div>
                      {(reviewerNotes[c.hypothesisId]?.length ?? 0) > 0 && (
                        <p className="mt-1 text-[10.5px] text-slate-500">{reviewerNotes[c.hypothesisId].join(" · ")}</p>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <ul className="mt-2 space-y-1">
          {eliminatedCauses.map((c) => (
            <li key={`r-${c.hypothesisId}`} className="text-[11.5px] leading-relaxed text-slate-600">· {c.rationale}</li>
          ))}
        </ul>
      </Panel>

      {/* --------------------- agents and investigation tasks ----------------- */}
      <Panel title="Investigation Agents and Work Queue" subtitle="Digital coworkers investigating in parallel across six domains">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {investigationAgents.map((a: InvestigationAgent) => (
            <button
              key={a.id} type="button"
              onClick={() => setDrawer({
                title: `${a.name} · agent detail`,
                rows: [["Current objective", a.objective], ["Current task", a.task], ["Status", a.status],
                ["Confidence", `${a.confidence}%`], ["Evidence reviewed", String(a.evidenceReviewed)],
                ["Hypotheses supported", a.supports.map((s) => hyps.find((h) => h.id === s)?.cause ?? s).join(", ") || "None"],
                ["Hypotheses contradicted", a.contradicts.map((s) => hyps.find((h) => h.id === s)?.cause ?? s).join(", ") || "None"],
                ["Tasks completed", String(a.tasksCompleted)], ["Open task", a.openTask],
                ["Guardrail status", a.guardrail], ["Last update", a.lastUpdate]],
                body: a.lastFinding,
              })}
              className="rounded-lg border border-slate-200 bg-white p-2.5 text-left hover:border-indigo-300"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[12px] font-semibold text-slate-900">{a.name}</span>
                <Chip className={a.status === "Complete" ? toneChip("good") : a.status === "Awaiting review" ? toneChip("watch") : toneChip("neutral")}>{a.status}</Chip>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">{a.objective}</p>
              <p className="mt-1 text-[11.5px] text-slate-700">{a.lastFinding}</p>
              <div className="mt-1.5"><Meter value={a.confidence} color="#4f46e5" /></div>
              <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-slate-500">
                <Chip className={toneChip("neutral")}>{a.confidence}% confidence</Chip>
                <Chip className={toneChip("neutral")}>{a.evidenceReviewed} evidence</Chip>
                <Chip className={toneChip("neutral")}>{a.tasksCompleted} tasks</Chip>
                <Chip className={toneChip("good")}>{a.supports.length} supports</Chip>
                <Chip className={toneChip("risk")}>{a.contradicts.length} contradicts</Chip>
              </div>
              <p className="mt-1 text-[10.5px] text-slate-500">Open task: {a.openTask} · {a.guardrail}</p>
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
          {TASK_COLUMNS.map((col) => (
            <div key={col} className="rounded-lg border border-slate-200 bg-slate-50/60 p-2">
              <h4 className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-700">
                {col}
                <span className="rounded-full bg-white px-1.5 text-[10px] text-slate-500">{tasks.filter((t) => t.status === col).length}</span>
              </h4>
              <ul className="space-y-1.5">
                {tasks.filter((t) => t.status === col).map((t) => (
                  <li key={t.id}>
                    <button
                      type="button" onClick={() => setSelectedTaskId(selectedTaskId === t.id ? null : t.id)}
                      aria-expanded={selectedTaskId === t.id}
                      className={cn("w-full rounded-md border bg-white p-2 text-left text-[11px]",
                        selectedTaskId === t.id ? "border-indigo-500" : "border-slate-200 hover:border-indigo-300")}
                    >
                      <div className="font-medium text-slate-900">{t.title}</div>
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        <Chip className={toneChip(t.priority === "High" ? "risk" : t.priority === "Medium" ? "watch" : "neutral")}>{t.priority}</Chip>
                        <Chip className={toneChip("neutral")}>{t.domain}</Chip>
                      </div>
                      <div className="mt-0.5 text-[10.5px] text-slate-500">{t.owner} · {t.humanOwner}</div>
                    </button>
                    {selectedTaskId === t.id && (
                      <div className="mt-1 rounded-md border border-slate-200 bg-white p-2 text-[11px] text-slate-700">
                        <p>{t.result}</p>
                        <p className="mt-0.5 text-[10.5px] text-slate-500">{t.at}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {TASK_COLUMNS.filter((c) => c !== t.status).map((c) => (
                            <ToolbarButton key={c} onClick={() => moveTask(t.id, c)}>{c}</ToolbarButton>
                          ))}
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          <ToolbarButton onClick={() => setTasks((prev) => prev.map((x) => x.id === t.id ? { ...x, humanOwner: owner } : x))}>Assign to owner</ToolbarButton>
                          <ToolbarButton onClick={() => setTasks((prev) => prev.map((x) => x.id === t.id ? { ...x, priority: x.priority === "High" ? "Medium" : "High" } : x))}>Change priority</ToolbarButton>
                          <ToolbarButton onClick={() => moveTask(t.id, "Awaiting Evidence")}>Request evidence</ToolbarButton>
                          <ToolbarButton onClick={() => setTasks((prev) => prev.map((x) => x.id === t.id ? { ...x, result: `${x.result} Re-run at ${refreshedAt}.` } : x))}>Rerun test</ToolbarButton>
                          <ToolbarButton onClick={() => moveTask(t.id, "Completed")}>Mark complete</ToolbarButton>
                          <ToolbarButton onClick={() => moveTask(t.id, "Blocked")}>Mark blocked</ToolbarButton>
                          <ToolbarButton onClick={() => setLinkedEvidence((p) => ({ ...p, [t.hypothesisId || selectedHyp.id]: [...(p[t.hypothesisId || selectedHyp.id] ?? []), t.title] }))}>Link result to hypothesis</ToolbarButton>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
                {tasks.filter((t) => t.status === col).length === 0 && (
                  <li className="rounded-md border border-dashed border-slate-300 p-2 text-[10.5px] text-slate-400">No tasks</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </Panel>

      {/* ----------------------------- timeline ------------------------------- */}
      <Panel
        title="Investigation Timeline"
        subtitle={`${filteredEvents.length} of ${events.length} events`}
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <Select label="Domain" value={tlDomain} options={[ALL_DOMAINS, ...EVIDENCE_DOMAINS]} onChange={setTlDomain} />
            <Select label="Actor" value={tlActor} options={[ALL_ACTORS, ...Array.from(new Set(events.map((e) => e.actor)))]} onChange={setTlActor} />
            <Select label="Hypothesis" value={tlHyp} options={[ALL_HYPOTHESES, ...hyps.map((h) => h.id)]} onChange={setTlHyp} />
            <ToolbarButton onClick={() => setTlOnlyConfidence((v) => !v)} active={tlOnlyConfidence}>Confidence changes</ToolbarButton>
            <ToolbarButton onClick={() => setTlOnlyEvidence((v) => !v)} active={tlOnlyEvidence}>Evidence additions</ToolbarButton>
            <ToolbarButton onClick={() => setTimelineExport(`Timeline exported at ${refreshedAt} with ${filteredEvents.length} events and ${pinnedEvents.length} pinned.`)}>
              <Download className="h-3.5 w-3.5" /> Export timeline
            </ToolbarButton>
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <input
            aria-label="Add manual investigation note to the timeline" value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)} placeholder="Manual investigation note"
            className="min-w-[220px] flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-[11.5px] text-slate-800"
          />
          <ToolbarButton
            onClick={() => {
              if (!noteDraft.trim()) return;
              logEvent({
                at: refreshedAt, event: noteDraft.trim(), actor: owner, actorKind: "Human",
                hypothesisId: selectedHyp.id, domain: selectedHyp.domain, evidenceAdded: "Human note",
                confidenceChange: "—", decision: "Record note", outcome: "Note added to the investigation record", status: "Complete",
              });
              setNoteDraft("");
            }}
          >Add investigation note</ToolbarButton>
        </div>

        <ol className="mt-3 space-y-1.5">
          {filteredEvents.map((e) => (
            <li key={e.id}>
              <button
                type="button" onClick={() => setSelectedEventId(selectedEventId === e.id ? null : e.id)}
                aria-expanded={selectedEventId === e.id}
                className={cn("w-full rounded-lg border p-2.5 text-left",
                  selectedEventId === e.id ? "border-indigo-500 bg-indigo-50/40" : "border-slate-200 bg-white hover:bg-slate-50")}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10.5px] text-slate-500">{e.at}</span>
                  <span className="text-[12px] font-medium text-slate-900">{e.event}</span>
                  <Chip className={e.actorKind === "Human" ? toneChip("watch") : toneChip("neutral")}>
                    {e.actorKind === "Human" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />} {e.actor}
                  </Chip>
                  <Chip className={toneChip("neutral")}>{e.domain}</Chip>
                  {e.confidenceChange !== "—" && <Chip className={toneChip("good")}>{e.confidenceChange}</Chip>}
                  <Chip className={e.status === "Complete" ? toneChip("good") : e.status === "In progress" ? toneChip("watch") : toneChip("neutral")}>{e.status}</Chip>
                  <span
                    role="button" tabIndex={0}
                    onClick={(ev) => { ev.stopPropagation(); setPinnedEvents((p) => p.includes(e.id) ? p.filter((x) => x !== e.id) : [...p, e.id]); }}
                    onKeyDown={(ev) => { if (ev.key === "Enter") { ev.stopPropagation(); setPinnedEvents((p) => p.includes(e.id) ? p.filter((x) => x !== e.id) : [...p, e.id]); } }}
                    className={cn("ml-auto rounded border px-1.5 py-0.5 text-[10px]", pinnedEvents.includes(e.id) ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500")}
                  >{pinnedEvents.includes(e.id) ? "Pinned" : "Pin"}</span>
                </div>
                {selectedEventId === e.id && (
                  <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
                    <Field label="Hypothesis affected" value={hyps.find((h) => h.id === e.hypothesisId)?.cause ?? "Not hypothesis specific"} />
                    <Field label="Evidence added" value={e.evidenceAdded} />
                    <Field label="Decision" value={e.decision} />
                    <Field label="Outcome" value={e.outcome} />
                  </div>
                )}
              </button>
            </li>
          ))}
          {filteredEvents.length === 0 && (
            <li className="rounded-lg border border-dashed border-slate-300 p-4 text-[11.5px] text-slate-500">No timeline events match the current filters.</li>
          )}
        </ol>
        {pinnedEvents.length > 1 && (
          <p className="mt-2 text-[11.5px] text-indigo-700">
            Comparing {pinnedEvents.length} pinned events: {pinnedEvents.map((id) => events.find((e) => e.id === id)?.event).join(" versus ")}
          </p>
        )}
        {timelineExport && <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11.5px] text-slate-700">{timelineExport}</p>}
      </Panel>

      {/* --------------------- conclusion + recommended actions --------------- */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <Panel title="Investigation Conclusion" subtitle={`${passedChecks} of ${checks.length} readiness checks passed`}>
          <blockquote className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-3 text-[12.5px] leading-relaxed text-slate-800">
            {investigationConclusion.statement}
          </blockquote>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Field label="Proposed root cause" value={investigationConclusion.proposedCause} />
            <Field label="Confidence" value={`${leadingConfidence}%`} />
            <Field label="Evidence completeness" value={`${investigationConclusion.evidenceCompleteness}%`} />
            <Field label="Supporting evidence" value={String(investigationConclusion.supportingCount)} />
            <Field label="Contradicting evidence" value={String(investigationConclusion.contradictingCount)} />
            <Field label="Causes eliminated" value={String(eliminatedCount)} />
            <Field label="Remaining uncertainty" value={investigationConclusion.remainingUncertainty} />
            <Field label="Customer impact understood" value={investigationConclusion.customerImpactUnderstood} />
            <Field label="Service dependencies validated" value={investigationConclusion.dependenciesValidated} />
            <Field label="Corrective action identified" value={investigationConclusion.correctiveAction} />
            <Field label="Validation criteria satisfied" value={`${passedChecks} of ${checks.length}`} />
            <Field label="Human review status" value={conclusionState === "Proposed" ? investigationConclusion.humanReview : conclusionState} />
          </div>

          <h3 className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Conclusion readiness checks</h3>
          <ul className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
            {checks.map((c) => (
              <li key={c.id} className="flex items-start justify-between gap-2 rounded-md border border-slate-200 px-2.5 py-1.5">
                <div className="min-w-0">
                  <div className="text-[11.5px] font-medium text-slate-800">{c.label}</div>
                  <div className="text-[10.5px] text-slate-500">{c.detail} · {c.owner}</div>
                </div>
                <Chip className={checkChip(c.status)}>{c.status}</Chip>
              </li>
            ))}
          </ul>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <ToolbarButton onClick={() => { setConclusionState("Accepted"); setConclusionNote(`Conclusion accepted by ${owner} at ${refreshedAt}.`); }} active={conclusionState === "Accepted"}>
              <ThumbsUp className="h-3.5 w-3.5" /> Accept conclusion
            </ToolbarButton>
            <ToolbarButton onClick={() => { setConclusionState("Rejected"); setConclusionNote(`Conclusion rejected by ${owner}. Investigation returns to validation.`); }} active={conclusionState === "Rejected"}>
              <ThumbsDown className="h-3.5 w-3.5" /> Reject conclusion
            </ToolbarButton>
            <ToolbarButton onClick={() => setConclusionNote("Additional evidence requested. Sustained recovery validation queued.")}>Request more evidence</ToolbarButton>
            <ToolbarButton onClick={() => { setStatus("hyp-firmware", "Testing"); setSelectedHypId("hyp-firmware"); setConclusionNote("Firmware cause reopened for review."); }}>Reopen eliminated cause</ToolbarButton>
            <ToolbarButton onClick={() => runTest("vt-recovery", "Sustained recovery validation")}>Run additional validation</ToolbarButton>
            <ToolbarButton onClick={() => setConclusionNote(`Conclusion sent to the Active Situation Room record for ${situationId} in this demonstration session.`)}>Send to Active Situation Room</ToolbarButton>
            <ToolbarButton onClick={() => setConclusionNote(`Evidence package exported at ${refreshedAt} with ${evidenceReviewed} records.`)}>Export evidence package</ToolbarButton>
            <ToolbarButton onClick={() => setConclusionNote("Saved as a known diagnostic pattern: coastal fog attenuation signature.")}>Save as diagnostic pattern</ToolbarButton>
          </div>
          {conclusionNote && <p className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11.5px] text-emerald-800">{conclusionNote}</p>}
          {testResults["vt-recovery"] && <p className="mt-1 text-[11px] text-emerald-700">{testResults["vt-recovery"]}</p>}
        </Panel>

        <Panel title="Recommended Next Actions" subtitle="Evidence-backed actions from the investigating agents">
          <div className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-3">
            <Chip className="border-indigo-200 bg-white text-indigo-700">Primary action</Chip>
            <p className="mt-1 text-[12.5px] font-medium text-slate-900">{primaryAction.title}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Field label="Recommendation confidence" value={`${primaryAction.confidence}%`} />
              <Field label="Customer outcome protected" value={primaryAction.outcomeProtected} />
              <Field label="Expected duration" value={primaryAction.expectedDuration} />
              <Field label="Validation criteria" value={primaryAction.validationCriteria} />
              <Field label="Approval requirement" value={primaryAction.approvalRequirement} />
              <Field label="Rollback condition" value={primaryAction.rollbackCondition} />
              <Field label="Evidence count" value={String(primaryAction.evidenceCount)} />
              <Field label="Status" value={conclusionState} />
            </div>
          </div>
          <ul className="mt-2 space-y-1.5">
            {additionalActions.map((a) => (
              <li key={a.id} className="rounded-md border border-slate-200 px-2.5 py-1.5">
                <div className="text-[11.5px] font-medium text-slate-900">{a.title}</div>
                <div className="text-[10.5px] text-slate-500">{a.detail} · {a.owner}</div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* ---------------------------- scenario controls ----------------------- */}
      <Panel
        title="Run Agentic Investigation Scenario"
        subtitle={stage ? `Stage ${(stageIdx ?? 0) + 1} of ${investigationScenario.length} · ${stage.title}` : "Deterministic 20 stage synthetic investigation walkthrough"}
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <ToolbarButton onClick={() => { setRunning(true); applyStage(0); }} active={running && stageIdx === 0}>
              <Play className="h-3.5 w-3.5" /> Start
            </ToolbarButton>
            <ToolbarButton onClick={() => setRunning(false)} active={!running && stageIdx !== null}>
              <Pause className="h-3.5 w-3.5" /> Pause
            </ToolbarButton>
            <ToolbarButton onClick={() => { setRunning(true); nextStage(); }}>
              <Play className="h-3.5 w-3.5" /> Continue
            </ToolbarButton>
            <ToolbarButton onClick={nextStage}>
              <SkipForward className="h-3.5 w-3.5" /> Skip to next stage
            </ToolbarButton>
            <ToolbarButton onClick={() => { setStageIdx(null); setRunning(false); setInjections([]); setHyps(causeHypotheses); setState(investigationHeader.state); }}>
              <RotateCcw className="h-3.5 w-3.5" /> Reset scenario
            </ToolbarButton>
            <ToolbarButton onClick={() => setRefreshedAt(`${refreshedAt} +evidence`)}>Request more evidence</ToolbarButton>
            <ToolbarButton onClick={() => { setStatus("hyp-hardware", "Testing"); setSelectedHypId("hyp-hardware"); }}>Reopen eliminated cause</ToolbarButton>
            <ToolbarButton onClick={() => setConclusionState("Accepted")} active={conclusionState === "Accepted"}>Accept conclusion</ToolbarButton>
            <ToolbarButton onClick={() => setConclusionState("Rejected")} active={conclusionState === "Rejected"}>Reject conclusion</ToolbarButton>
            <ToolbarButton onClick={() => inject("firmware")} active={injections.includes(firmwareAnomalyEvent.title)}>
              <AlertTriangle className="h-3.5 w-3.5" /> Firmware anomaly
            </ToolbarButton>
            <ToolbarButton onClick={() => inject("handoff")} active={injections.includes(handoffFailureEvent.title)}>
              <AlertTriangle className="h-3.5 w-3.5" /> Handoff failure
            </ToolbarButton>
            <ToolbarButton onClick={() => setShowComparison((c) => !c)} active={showComparison}>
              <Scale className="h-3.5 w-3.5" /> Compare manual and agentic
            </ToolbarButton>
          </div>
        }
      >
        <ol className="grid gap-1.5 md:grid-cols-2 xl:grid-cols-4">
          {investigationScenario.map((s, i) => {
            const done = stageIdx !== null && i < stageIdx;
            const cur = stageIdx === i;
            return (
              <li key={s.id}>
                <button
                  type="button" onClick={() => applyStage(i)} aria-current={cur ? "step" : undefined}
                  className={cn("w-full rounded-md border p-2 text-left text-[11px]",
                    done && "border-emerald-200 bg-emerald-50 text-emerald-800",
                    cur && "border-indigo-500 bg-indigo-50 font-semibold text-indigo-800",
                    !done && !cur && "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}
                >
                  <span className="text-[10px] text-slate-400">Stage {i + 1}</span>
                  <div className="font-medium">{s.title}</div>
                  <div className="text-[10.5px] opacity-80">{s.actor} · leading {s.leadingConfidence}%</div>
                  {s.requiresApproval && <Chip className={cn("mt-1", toneChip("watch"))}>Human approval</Chip>}
                </button>
              </li>
            );
          })}
        </ol>
        {stage && <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11.5px] text-slate-700">{stage.detail}</p>}
        {injections.length > 0 && (
          <ul className="mt-2 space-y-1">
            {injections.map((t) => (
              <li key={t} className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11.5px] text-amber-800">
                {t}: {t === firmwareAnomalyEvent.title ? firmwareAnomalyEvent.detail : handoffFailureEvent.detail}
              </li>
            ))}
          </ul>
        )}

        {showComparison && (
          <div className="mt-3">
            <h3 className="text-[12px] font-semibold text-slate-900">Traditional Investigation Versus Agentic Investigation</h3>
            <div className="mt-1.5 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-[11.5px]">
                <caption className="sr-only">Traditional versus agentic investigation comparison</caption>
                <thead className="bg-slate-50"><tr><Th>Dimension</Th><Th>Traditional investigation</Th><Th>Agentic investigation</Th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {investigationComparison.map((r) => (
                    <tr key={r.dimension}>
                      <Td className="font-medium text-slate-900">{r.dimension}</Td>
                      <Td>{r.traditional}</Td>
                      <Td className="text-emerald-700">{r.agentic}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-1.5 text-[10.5px] text-slate-500">{comparisonDisclaimer}</p>
          </div>
        )}
      </Panel>

      {/* ------------------------------- drawer -------------------------------- */}
      <Sheet open={!!drawer} onOpenChange={(o) => { if (!o) setDrawer(null); }}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          {drawer && (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-[14px] font-semibold text-slate-900">{drawer.title}</h2>
                <button type="button" aria-label="Close detail" onClick={() => setDrawer(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {drawer.body && <p className="text-[12px] leading-relaxed text-slate-700">{drawer.body}</p>}
              <dl className="space-y-1.5">
                {drawer.rows.map(([k, v]) => (
                  <div key={k} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                    <dt className="text-[10px] uppercase tracking-wide text-slate-500">{k}</dt>
                    <dd className="text-[12px] text-slate-900">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="flex items-center gap-1 text-[10.5px] text-slate-400">
                <ChevronRight className="h-3 w-3" /> Synthetic demonstration detail, resolved within this page
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
