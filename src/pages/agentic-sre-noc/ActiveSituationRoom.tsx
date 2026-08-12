/**
 * Active Situation Room — Agentic SRE NOC.
 *
 * Single-page, evidence-driven response workspace for one priority operational
 * situation (SIT-2026-0417). All data is synthetic and lives in
 * ./data/situationFixtures.ts, which reuses the shared GOOC / CSH / topology /
 * PLR identifiers. Progressive disclosure happens through tabs, drawers and
 * expandable panels; this page never navigates away for essential detail.
 */

import { useCallback, useMemo, useState } from "react";
import {
  AlertTriangle, Bot, CheckCircle2, ChevronRight, CloudFog, Download, Maximize2,
  Minimize2, Pause, Play, RefreshCw, RotateCcw, Search, ShieldCheck, SkipForward,
  Sparkles, TrendingDown, TrendingUp, User, X,
} from "lucide-react";
import {
  CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer,
  Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Field, Panel, Select, ToolbarButton } from "./components/NocPrimitives";
import { ServiceRouteGraph } from "./components/ServiceRouteGraph";
import {
  aiDraftedUpdate, alternativeActions, COMM_AUDIENCES, COMM_TEMPLATES,
  communications, EVENT_CATEGORIES, evidenceItems, EVIDENCE_TYPES,
  fallbackFailureEvent, fallbackState, hypotheses, OPTICAL_METRICS, ownership,
  powerDependencies, primaryRecommendation, responseComparison,
  routeComparison, routeOwnershipLegend, routeSegmentNotes, SEVERITIES,
  seriesAnnotations, situationAgents, situationEvents, situationHeader,
  situationKpis, situationParticipants, situationRoute, situationScenario,
  situationSeries, situationSummary, SITUATION_ID, SITUATION_STATES,
  sreOutcomes, stateProgression, telemetryThresholds, terminalAssessment,
  terminalHealth, validationChecks, weatherContext, weatherRecoveryEvent,
  WEATHER_METRICS, WORKSTREAM_COLUMNS, workItems,
  type CommMessage, type EventCategory, type EvidenceItem, type Hypothesis,
  type OpticalMetricKey, type SituationAgent, type SituationEvent,
  type SituationKpi, type SituationState, type WeatherMetricKey,
  type WorkItem, type WorkstreamColumn,
} from "./data/situationFixtures";

const ALL_CATEGORIES = "All categories";
const ALL_ACTORS = "All actors";
const ALL_IMPACT = "All customer impact";
const ALL_EVIDENCE = "All evidence types";

/* ------------------------------ small parts ----------------------------- */

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

function KpiCard({ kpi, active, onClick }: { kpi: SituationKpi; active: boolean; onClick: () => void }) {
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
          <TrendIcon className="h-3 w-3" aria-hidden />
          {kpi.trend}
        </Chip>
      </div>
      <span className="mt-1 text-xl font-semibold text-slate-900">{kpi.value}</span>
      <span className="text-[11px] text-slate-500">{kpi.sub}</span>
      <span className="mt-2 text-[10px] text-slate-400">
        Target {kpi.target} · Previous {kpi.previous} · {kpi.at}
      </span>
    </button>
  );
}

function Meter({ value, tone }: { value: number; tone: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100">
      <div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, value)}%`, backgroundColor: tone }} />
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-2.5 py-2 text-left font-medium text-slate-500">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="whitespace-nowrap px-2.5 py-2 text-slate-700">{children}</td>;
}

/* --------------------------------- page --------------------------------- */

export default function ActiveSituationRoom() {
  /* header + situation state */
  const [severity, setSeverity] = useState<string>(situationHeader.severity);
  const [state, setState] = useState<SituationState>(situationHeader.state);
  const [commander, setCommander] = useState(situationHeader.commander);
  const [participants, setParticipants] = useState<string[]>(situationParticipants);
  const [notes, setNotes] = useState<string[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [paused, setPaused] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [closed, setClosed] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState(situationHeader.lastUpdate);
  const [brief, setBrief] = useState<string | null>(null);

  /* focus + selection */
  const [activeKpi, setActiveKpi] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<SituationAgent | null>(null);
  const [selectedHypothesis, setSelectedHypothesis] = useState<Hypothesis | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SituationEvent | null>(null);
  const [selectedValidation, setSelectedValidation] = useState<string | null>(null);

  /* telemetry */
  const [opticalMetrics, setOpticalMetrics] = useState<OpticalMetricKey[]>(["marginA", "attenuation", "throughput"]);
  const [compareTerminals, setCompareTerminals] = useState(true);
  const [showWeatherAnnotations, setShowWeatherAnnotations] = useState(true);
  const [showAgentActions, setShowAgentActions] = useState(true);
  const [brushStart, setBrushStart] = useState(0);
  const [brushEnd, setBrushEnd] = useState(situationSeries.length - 1);
  const [showTable, setShowTable] = useState(false);
  const [weatherMetrics, setWeatherMetrics] = useState<WeatherMetricKey[]>(["visibility", "fogDensity", "humidity"]);

  /* workstream */
  const [items, setItems] = useState<WorkItem[]>(workItems);
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);

  /* approvals */
  const [approval, setApproval] = useState<"Pending" | "Approved" | "Rejected" | "More evidence requested" | "Deferred">("Pending");
  const [approvalNote, setApprovalNote] = useState("");
  const [approvalOwner, setApprovalOwner] = useState(situationHeader.commander);
  const [compareAlternatives, setCompareAlternatives] = useState(false);
  const [simulatedAlt, setSimulatedAlt] = useState<string | null>(null);

  /* timeline */
  const [events, setEvents] = useState<SituationEvent[]>(situationEvents);
  const [live, setLive] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [playhead, setPlayhead] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL_CATEGORIES);
  const [actorFilter, setActorFilter] = useState<string>(ALL_ACTORS);
  const [impactFilter, setImpactFilter] = useState<string>(ALL_IMPACT);
  const [pinned, setPinned] = useState<string[]>([]);

  /* evidence */
  const [evidence, setEvidence] = useState<EvidenceItem[]>(evidenceItems);
  const [evidenceQuery, setEvidenceQuery] = useState("");
  const [evidenceType, setEvidenceType] = useState<string>(ALL_EVIDENCE);
  const [evidenceSort, setEvidenceSort] = useState<string>("Newest first");
  const [pinnedEvidence, setPinnedEvidence] = useState<string[]>([]);

  /* communications */
  const [messages, setMessages] = useState<CommMessage[]>(communications);
  const [draft, setDraft] = useState(aiDraftedUpdate);
  const [draftAudience, setDraftAudience] = useState<string>("Customer operations");
  const [draftTemplate, setDraftTemplate] = useState<string>("Mitigation update");
  const [nextUpdate, setNextUpdate] = useState("11:30 UTC");
  const [showCommHistory, setShowCommHistory] = useState(false);

  /* scenario */
  const [stage, setStage] = useState(-1);
  const [running, setRunning] = useState(false);
  const [scenarioLog, setScenarioLog] = useState<string[]>([]);

  const currentStage = stage >= 0 ? situationScenario[stage] : null;
  const effectiveState: SituationState = currentStage ? currentStage.state : state;

  const pushEvent = useCallback((e: Omit<SituationEvent, "id">) => {
    setEvents((prev) => [...prev, { ...e, id: `se-x-${prev.length + 1}` }]);
  }, []);

  const advance = useCallback((next: number) => {
    const s = situationScenario[next];
    if (!s) return;
    setStage(next);
    setState(s.state);
    pushEvent({
      at: `Stage ${next + 1}`, event: s.title, actor: s.actor,
      actorType: s.actor.includes("Agent") || s.actor.includes("Guardian") || s.actor.includes("Investigator") ? "Agent" : "Human",
      category: s.category, component: situationHeader.serviceName,
      customerImpact: s.impact, evidence: "ev-index",
      decision: s.requiresApproval ? "Approval required" : "None",
      outcome: s.detail, status: s.requiresApproval ? "Awaiting approval" : "Complete",
    });
    setScenarioLog((prev) => [...prev, `Stage ${next + 1}: ${s.title}`]);
    if (s.requiresApproval) { setRunning(false); setApproval("Pending"); }
  }, [pushEvent]);

  const startScenario = () => { setRunning(true); advance(stage < 0 ? 0 : Math.min(stage + 1, situationScenario.length - 1)); };
  const resetScenario = () => {
    setStage(-1); setRunning(false); setScenarioLog([]); setEvents(situationEvents);
    setState(situationHeader.state); setApproval("Pending");
  };

  const resetPage = () => {
    resetScenario();
    setSeverity(situationHeader.severity); setCommander(situationHeader.commander);
    setParticipants(situationParticipants); setNotes([]); setItems(workItems);
    setEvidence(evidenceItems); setMessages(communications); setDraft(aiDraftedUpdate);
    setPinned([]); setPinnedEvidence([]); setActiveKpi(null); setSelectedNodeId(null);
    setSelectedEdgeId(null); setClosed(false); setEscalated(false); setPaused(false);
  };

  /* derived */
  const view = useMemo(() => situationSeries.slice(brushStart, brushEnd + 1), [brushStart, brushEnd]);

  const filteredEvents = useMemo(() => events.filter((e) =>
    (categoryFilter === ALL_CATEGORIES || e.category === categoryFilter) &&
    (actorFilter === ALL_ACTORS || e.actorType === actorFilter) &&
    (impactFilter === ALL_IMPACT || e.customerImpact.toLowerCase().includes(impactFilter.toLowerCase()))
  ), [events, categoryFilter, actorFilter, impactFilter]);

  const filteredEvidence = useMemo(() => {
    const q = evidenceQuery.trim().toLowerCase();
    const list = evidence.filter((e) =>
      (evidenceType === ALL_EVIDENCE || e.type === evidenceType) &&
      (!q || `${e.title} ${e.source} ${e.relatedObject} ${e.preview}`.toLowerCase().includes(q)));
    return [...list].sort((a, b) => evidenceSort === "Newest first"
      ? b.at.localeCompare(a.at)
      : evidenceSort === "Oldest first" ? a.at.localeCompare(b.at) : a.type.localeCompare(b.type));
  }, [evidence, evidenceQuery, evidenceType, evidenceSort]);

  const selectedNode = situationRoute.nodes.find((n) => n.id === selectedNodeId) ?? null;
  const selectedEdge = situationRoute.edges.find((e) => e.id === selectedEdgeId) ?? null;

  const setItemStatus = (id: string, status: WorkstreamColumn) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));

  const exportCsv = (name: string, rows: string[][]) => {
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
  };

  const headerFacts = [
    ["Customer", situationHeader.customer],
    ["Customer service", situationHeader.serviceName],
    ["Region", situationHeader.region],
    ["Product", situationHeader.product],
    ["Committed capacity", situationHeader.committedCapacity],
    ["Time detected", situationHeader.detectedAt],
    ["Time active", situationHeader.timeActive],
    ["Incident commander", commander],
    ["Customer impact", currentStage ? currentStage.impact : situationHeader.customerImpact],
    ["Response objective", situationHeader.objective],
    ["Last update", refreshedAt],
    ["Data confidence", situationHeader.dataConfidence],
    ["Situation confidence", situationHeader.situationConfidence],
    ["War room participants", `${participants.length} participants`],
    ["Autonomy level", situationHeader.autonomy],
  ];

  return (
    <div className={cn("px-4 py-6 sm:px-6 space-y-5", fullScreen ? "max-w-none" : "max-w-[1500px]")}>
      {/* ------------------------------ header ------------------------------ */}
      <header className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-indigo-50/40 p-5 shadow-sm">
        <nav aria-label="Breadcrumb" className="text-[11px] text-slate-500">
          SRE / Agentic SRE NOC / <span className="font-medium text-slate-700">Active Situation Room</span>
        </nav>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">Active Situation Room</h1>
            <p className="mt-1 max-w-3xl text-[12.5px] text-slate-600">
              Coordinate customer impact, evidence, ownership, agentic investigation, and service restoration within one operational workspace
            </p>
          </div>
          <Chip className="border-slate-200 bg-white text-slate-500">
            <Sparkles className="h-3 w-3" aria-hidden /> Synthetic Taara aligned demonstration environment
          </Chip>
        </div>
      </header>

      {/* -------------------------- command header -------------------------- */}
      <Panel
        title={`${SITUATION_ID} · ${situationHeader.title}`}
        subtitle={closed ? "Situation closed in this demonstration session" : situationHeader.stateLabel}
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <Select label="Severity" value={severity} options={SEVERITIES} onChange={setSeverity} />
            <Select label="Situation state" value={effectiveState} options={SITUATION_STATES} onChange={(v) => setState(v as SituationState)} />
            <ToolbarButton onClick={() => setPaused((p) => !p)} active={paused} title="Pause live updates">
              {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />} {paused ? "Resume" : "Pause"}
            </ToolbarButton>
            <ToolbarButton onClick={() => setRefreshedAt(`${refreshedAt.slice(0, 5)}:refreshed`)} title="Refresh">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </ToolbarButton>
            <ToolbarButton onClick={() => setFullScreen((f) => !f)} active={fullScreen} title="Full screen mode">
              {fullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />} Full screen
            </ToolbarButton>
            <ToolbarButton onClick={() => setBrief(`${SITUATION_ID} situation brief generated at ${refreshedAt} with ${evidence.length} evidence items, ${items.length} response actions and ${events.length} timeline events.`)} title="Export situation brief">
              <Download className="h-3.5 w-3.5" /> Export brief
            </ToolbarButton>
            <ToolbarButton onClick={() => setEscalated(true)} active={escalated} title="Escalate situation">
              <AlertTriangle className="h-3.5 w-3.5" /> Escalate
            </ToolbarButton>
            <ToolbarButton onClick={() => setClosed(true)} active={closed} title="Close situation">
              <X className="h-3.5 w-3.5" /> Close
            </ToolbarButton>
            <ToolbarButton onClick={resetPage} title="Reset page state">
              <RotateCcw className="h-3.5 w-3.5" /> Reset page
            </ToolbarButton>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
          {headerFacts.map(([l, v]) => <Field key={l} label={l} value={v} />)}
        </div>
        {escalated && <p className="mt-2 text-[11.5px] text-amber-700">Escalated to the executive escalation owner in this demonstration session.</p>}
        {brief && <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11.5px] text-slate-700">{brief}</p>}

        <div className="mt-3 grid gap-3 lg:grid-cols-[2fr_1fr]">
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">State progression</h3>
            <ol className="mt-2 flex flex-wrap gap-1.5">
              {stateProgression.map((s) => {
                const idx = SITUATION_STATES.indexOf(s.state);
                const cur = SITUATION_STATES.indexOf(effectiveState);
                const status = s.blocked ? "blocked" : idx < cur ? "complete" : idx === cur ? "current" : "next";
                return (
                  <li
                    key={s.state}
                    title={`Owner ${s.owner} · Time in stage ${s.duration}`}
                    className={cn("rounded-md border px-2 py-1 text-[10.5px]",
                      status === "complete" && "border-emerald-200 bg-emerald-50 text-emerald-700",
                      status === "current" && "border-indigo-500 bg-indigo-50 font-semibold text-indigo-700",
                      status === "next" && "border-slate-200 bg-white text-slate-500",
                      status === "blocked" && "border-rose-200 bg-rose-50 text-rose-700")}
                  >
                    {s.state}
                    <span className="ml-1 text-[9.5px] opacity-70">{s.duration}</span>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500" htmlFor="commander">Assign incident commander</label>
            <input
              id="commander" value={commander} onChange={(e) => setCommander(e.target.value)}
              className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-[11.5px] text-slate-800"
            />
            <div className="flex gap-1.5">
              <input
                aria-label="Add operational note or participant" value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)} placeholder="Operational note or participant"
                className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-[11.5px] text-slate-800"
              />
              <ToolbarButton onClick={() => { if (noteDraft.trim()) { setNotes((n) => [...n, noteDraft.trim()]); setNoteDraft(""); } }}>Add note</ToolbarButton>
              <ToolbarButton onClick={() => { if (noteDraft.trim()) { setParticipants((p) => [...p, noteDraft.trim()]); setNoteDraft(""); } }}>Add participant</ToolbarButton>
            </div>
            {notes.length > 0 && (
              <ul className="max-h-20 space-y-1 overflow-y-auto text-[11px] text-slate-600">
                {notes.map((n, i) => <li key={i}>· {n}</li>)}
              </ul>
            )}
          </div>
        </div>
      </Panel>

      {/* ------------------------------- KPIs ------------------------------- */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        {situationKpis.map((k) => (
          <KpiCard key={k.id} kpi={k} active={activeKpi === k.id} onClick={() => setActiveKpi(activeKpi === k.id ? null : k.id)} />
        ))}
      </div>

      {/* ------------------------- summary + objective ---------------------- */}
      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <Panel title="Situation Summary" subtitle="Synthetic operational narrative">
          <p className="text-[12.5px] leading-relaxed text-slate-700">{situationSummary.narrative}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Field label="What happened" value={situationSummary.whatHappened} />
            <Field label="When it began" value={situationSummary.began} />
            <Field label="How it was detected" value={situationSummary.detection} />
            <Field label="Current customer impact" value={situationSummary.customerImpact} />
            <Field label="Current mitigation" value={situationSummary.mitigation} />
            <Field label="Most likely cause" value={situationSummary.likelyCause} />
            <Field label="Current uncertainty" value={situationSummary.uncertainty} />
            <Field label="Expected recovery condition" value={situationSummary.recovery} />
          </div>
        </Panel>
        <div className="space-y-4">
          <section className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 shadow-sm">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">Current objective</h2>
            <p className="mt-1 text-[13px] font-medium leading-relaxed text-slate-900">{situationSummary.objective}</p>
            <p className="mt-2 text-[11.5px] text-slate-600"><span className="font-semibold">Next decision:</span> {situationSummary.nextDecision}</p>
          </section>
          <Panel title="Traditional Response Versus Agentic Situation Response" subtitle="Synthetic demonstration values, not measured Taara results">
            <div className="overflow-x-auto">
              <table className="w-full text-[11.5px]">
                <thead><tr className="border-b border-slate-200"><Th>Activity</Th><Th>Traditional</Th><Th>Agentic</Th></tr></thead>
                <tbody>
                  {responseComparison.map((r) => (
                    <tr key={r.activity} className="border-b border-slate-100">
                      <Td>{r.activity}</Td><Td>{r.traditional}</Td>
                      <td className="whitespace-nowrap px-2.5 py-2 font-medium text-emerald-700">{r.agentic}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>

      {/* --------------------------- affected route ------------------------- */}
      <Panel
        title="Affected Customer Service Route"
        subtitle="Customer network to downstream traffic, including fallback, alternate routes and ownership"
        action={<Chip className={toneChip("watch")}>Current transport: optical degraded with RF fallback active</Chip>}
      >
        <ServiceRouteGraph
          route={situationRoute}
          selectedNodeId={selectedNodeId}
          selectedEdgeId={selectedEdgeId}
          onSelectNode={(id) => { setSelectedNodeId(id); setSelectedEdgeId(null); }}
          onSelectEdge={(id) => { setSelectedEdgeId(id); setSelectedNodeId(null); }}
        />
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Ownership</h3>
            <ul className="mt-1 space-y-1 text-[11.5px] text-slate-600">
              {routeOwnershipLegend.map((o) => <li key={o.owner}><span className="font-medium text-slate-800">{o.owner}</span> — {o.scope}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Power dependencies</h3>
            <ul className="mt-1 space-y-1 text-[11.5px] text-slate-600">
              {powerDependencies.map((p) => <li key={p.site}><span className="font-medium text-slate-800">{p.site}</span> — {p.supply}, {p.state}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Route state</h3>
            <p className="mt-1 text-[11.5px] text-slate-600">{situationRoute.customerImpact}</p>
            <p className="mt-1 text-[11.5px] text-slate-500">Affected segments: primary optical span. Healthy segments: all access, handoff, aggregation and downstream segments.</p>
          </div>
        </div>
      </Panel>

      {/* ------------------------- terminals + optical ---------------------- */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Terminal Health" subtitle={terminalAssessment}>
          <div className="grid gap-3 sm:grid-cols-2">
            {terminalHealth.map((t) => (
              <div key={t.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[12.5px] font-semibold text-slate-900">{t.name}</h3>
                  <Chip className={toneChip("good")}><CheckCircle2 className="h-3 w-3" aria-hidden /> Healthy</Chip>
                </div>
                <dl className="mt-2 space-y-1 text-[11.5px]">
                  {([
                    ["Terminal identifier", t.id], ["Product", t.product], ["Site", t.site],
                    ["Firmware", t.firmware], ["Availability", t.availability], ["Beam lock", t.beamLock],
                    ["Transmit optical power", t.txPower], ["Received optical power", t.rxPower],
                    ["Link margin", t.margin], ["Pointing error", t.pointingError],
                    ["Tracking correction rate", t.trackingRate], ["Internal temperature", t.temperature],
                    ["Power state", t.powerState], ["Voltage stability", t.voltage],
                    ["Mounting vibration", t.vibration], ["Configuration drift", t.configDrift],
                    ["Telemetry freshness", t.telemetryFreshness], ["Agent assessment", t.assessment],
                  ] as [string, string][]).map(([l, v]) => (
                    <div key={l} className="flex justify-between gap-3">
                      <dt className="text-slate-500">{l}</dt>
                      <dd className="text-right font-medium text-slate-800">{v}</dd>
                    </div>
                  ))}
                </dl>
                <ToolbarButton onClick={() => setSelectedEvidence(evidence.find((e) => e.id === "ev-terminal") ?? null)}>
                  Inspect evidence
                </ToolbarButton>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Optical Path Telemetry"
          subtitle={`Normal range: ${telemetryThresholds.normalRange}. Warning ${telemetryThresholds.warning} dB, critical ${telemetryThresholds.critical} dB.`}
          action={
            <div className="flex flex-wrap items-center gap-1.5">
              <ToolbarButton onClick={() => setCompareTerminals((c) => !c)} active={compareTerminals}>Compare terminals</ToolbarButton>
              <ToolbarButton onClick={() => setShowWeatherAnnotations((v) => !v)} active={showWeatherAnnotations}>Weather annotations</ToolbarButton>
              <ToolbarButton onClick={() => setShowAgentActions((v) => !v)} active={showAgentActions}>Agent and change actions</ToolbarButton>
              <ToolbarButton onClick={() => setShowTable((v) => !v)} active={showTable}>Data table</ToolbarButton>
              <ToolbarButton onClick={() => exportCsv("situation-telemetry.csv", [["time", ...OPTICAL_METRICS.map((m) => m.key)], ...view.map((p) => [p.t, ...OPTICAL_METRICS.map((m) => String(p[m.key]))])])}>
                <Download className="h-3.5 w-3.5" /> Export
              </ToolbarButton>
            </div>
          }
        >
          <div className="mb-2 flex flex-wrap gap-1.5">
            {OPTICAL_METRICS.filter((m) => compareTerminals || m.key !== "marginB").map((m) => (
              <button
                key={m.key} type="button" aria-pressed={opticalMetrics.includes(m.key)}
                onClick={() => setOpticalMetrics((prev) => prev.includes(m.key) ? prev.filter((k) => k !== m.key) : [...prev, m.key])}
                className={cn("rounded-full border px-2 py-0.5 text-[10.5px]",
                  opticalMetrics.includes(m.key) ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-600")}
              >{m.label}</button>
            ))}
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={view}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <RTooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine y={telemetryThresholds.warning} stroke="#d97706" strokeDasharray="4 4" label={{ value: "Warning", fontSize: 9 }} />
                <ReferenceLine y={telemetryThresholds.critical} stroke="#e11d48" strokeDasharray="4 4" label={{ value: "Critical", fontSize: 9 }} />
                {seriesAnnotations
                  .filter((a) => (showWeatherAnnotations || a.tone !== "weather") && (showAgentActions || (a.tone !== "action" && a.tone !== "approval")))
                  .map((a) => <ReferenceLine key={a.label} x={a.at} stroke="#64748b" strokeDasharray="2 2" label={{ value: a.label, fontSize: 9, angle: -90, position: "insideTopLeft" }} />)}
                {OPTICAL_METRICS.filter((m) => opticalMetrics.includes(m.key)).map((m) => (
                  <Line key={m.key} type="monotone" dataKey={m.key} name={m.label} stroke={m.color} dot={false} strokeWidth={2} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
            <label className="flex items-center gap-1">Zoom from
              <input type="range" min={0} max={situationSeries.length - 2} value={brushStart}
                aria-label="Time brush start"
                onChange={(e) => setBrushStart(Math.min(Number(e.target.value), brushEnd - 1))} />
              {situationSeries[brushStart].t}
            </label>
            <label className="flex items-center gap-1">to
              <input type="range" min={1} max={situationSeries.length - 1} value={brushEnd}
                aria-label="Time brush end"
                onChange={(e) => setBrushEnd(Math.max(Number(e.target.value), brushStart + 1))} />
              {situationSeries[brushEnd].t}
            </label>
          </div>
          {showTable && (
            <div className="mt-2 max-h-56 overflow-auto">
              <table className="w-full text-[11px]">
                <caption className="sr-only">Optical path telemetry values</caption>
                <thead><tr className="border-b border-slate-200"><Th>Time</Th>{OPTICAL_METRICS.map((m) => <Th key={m.key}>{m.label}</Th>)}</tr></thead>
                <tbody>
                  {view.map((p) => (
                    <tr key={p.t} className="border-b border-slate-100">
                      <Td>{p.t}</Td>{OPTICAL_METRICS.map((m) => <Td key={m.key}>{String(p[m.key])}</Td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      {/* --------------------------- weather + fallback --------------------- */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Weather and Atmospheric Conditions" subtitle="Synthetic operational weather context, not a live weather integration">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Field label="Visibility" value={weatherContext.visibility} />
            <Field label="Fog density" value={weatherContext.fogDensity} />
            <Field label="Relative humidity" value={weatherContext.humidity} />
            <Field label="Rainfall" value={weatherContext.rainfall} />
            <Field label="Wind speed" value={weatherContext.windSpeed} />
            <Field label="Wind direction" value={weatherContext.windDirection} />
            <Field label="Temperature" value={weatherContext.temperature} />
            <Field label="Atmospheric risk" value={weatherContext.atmosphericRisk} />
            <Field label="Current forecast" value={weatherContext.forecast} />
            <Field label="Expected improvement" value={weatherContext.improvement} />
            <Field label="Data freshness" value={weatherContext.freshness} />
            <Field label="Forecast confidence" value={weatherContext.confidence} />
          </div>
          <div className="mt-2 mb-2 flex flex-wrap gap-1.5">
            {WEATHER_METRICS.map((m) => (
              <button
                key={m.key} type="button" aria-pressed={weatherMetrics.includes(m.key)}
                onClick={() => setWeatherMetrics((prev) => prev.includes(m.key) ? prev.filter((k) => k !== m.key) : [...prev, m.key])}
                className={cn("rounded-full border px-2 py-0.5 text-[10.5px]",
                  weatherMetrics.includes(m.key) ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-600")}
              >{m.label}</button>
            ))}
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={view}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <RTooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="attenuation" name="Optical attenuation (dB)" stroke="#f97316" dot={false} strokeWidth={2} />
                {WEATHER_METRICS.filter((m) => weatherMetrics.includes(m.key)).map((m) => (
                  <Line key={m.key} type="monotone" dataKey={m.key} name={m.label} stroke={m.color} dot={false} strokeWidth={2} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-[11.5px] text-sky-900">
            <CloudFog className="mr-1 inline h-3.5 w-3.5" aria-hidden /> {weatherContext.conclusion}
          </p>
        </Panel>

        <Panel title="Fallback and Service Resilience" subtitle="RF fallback is protecting priority traffic while the optical path recovers">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Field label="RF fallback status" value={fallbackState.status} />
            <Field label="Activation time" value={fallbackState.activatedAt} />
            <Field label="Total fallback capacity" value={fallbackState.totalCapacity} />
            <Field label="Available capacity" value={fallbackState.availableCapacity} />
            <Field label="Current throughput" value={fallbackState.currentThroughput} />
            <Field label="Fallback latency" value={fallbackState.latency} />
            <Field label="Packet loss" value={fallbackState.packetLoss} />
            <Field label="Traffic protected" value={fallbackState.protected} />
            <Field label="Remaining headroom" value={fallbackState.headroom} />
            <Field label="Safe operating duration" value={fallbackState.safeDuration} />
            <Field label="Policy status" value={fallbackState.policy} />
            <Field label="Last validation" value={fallbackState.lastValidation} />
            <Field label="Current owner" value={fallbackState.owner} />
            <Field label="Return-to-optical readiness" value={fallbackState.returnReadiness} />
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-[11.5px]">
              <caption className="sr-only">Route comparison</caption>
              <thead><tr className="border-b border-slate-200">
                <Th>Route</Th><Th>State</Th><Th>Capacity</Th><Th>Throughput</Th><Th>Latency</Th>
                <Th>Availability</Th><Th>Risk</Th><Th>Owner</Th><Th>Activation readiness</Th><Th>Recommended use</Th>
              </tr></thead>
              <tbody>
                {routeComparison.map((r) => (
                  <tr key={r.route} className="border-b border-slate-100">
                    <td className="whitespace-nowrap px-2.5 py-2 font-medium text-slate-900">{r.route}</td>
                    <Td>{r.state}</Td><Td>{r.capacity}</Td><Td>{r.throughput}</Td><Td>{r.latency}</Td>
                    <Td>{r.availability}</Td><Td>{r.risk}</Td><Td>{r.owner}</Td><Td>{r.readiness}</Td>
                    <td className="px-2.5 py-2 text-slate-700">{r.recommended}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {/* ------------------------ agentic investigation --------------------- */}
      <Panel title="Agentic Investigation" subtitle="Digital coworkers working in parallel with auditable findings and evidence">
        <div className="grid gap-3 lg:grid-cols-[3fr_2fr]">
          <div className="grid gap-2 sm:grid-cols-2">
            {situationAgents.map((a) => (
              <button
                key={a.id} type="button" onClick={() => setSelectedAgent(a)}
                className="rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm hover:border-indigo-300"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-900">
                    <Bot className="h-3.5 w-3.5 text-indigo-600" aria-hidden /> {a.name}
                  </span>
                  <Chip className={toneChip(a.status === "Awaiting approval" ? "watch" : "good")}>{a.status}</Chip>
                </div>
                <p className="mt-1 text-[11.5px] text-slate-600">{a.task}</p>
                <p className="mt-1 text-[11.5px] text-slate-800"><span className="text-slate-500">Finding:</span> {a.finding}</p>
                <div className="mt-2"><Meter value={a.confidence} tone="#4f46e5" /></div>
                <p className="mt-1 text-[10.5px] text-slate-500">{a.confidence}% confidence · {a.evidenceReviewed} evidence items · {a.guardrail} · {a.lastUpdate}</p>
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Ranked cause hypotheses</h3>
            {hypotheses.map((h) => (
              <button
                key={h.id} type="button" onClick={() => setSelectedHypothesis(h)}
                className={cn("w-full rounded-lg border p-3 text-left shadow-sm hover:border-indigo-300",
                  h.leading ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 bg-white")}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[12px] font-medium text-slate-900">{h.cause}</span>
                  <Chip className={toneChip(h.leading ? "good" : "neutral")}>{h.confidence}%</Chip>
                </div>
                <p className="mt-1 text-[11px] text-slate-600">{h.status} · {h.owner} · {h.lastEvaluated}</p>
                <div className="mt-1.5"><Meter value={h.confidence} tone={h.leading ? "#059669" : "#94a3b8"} /></div>
              </button>
            ))}
          </div>
        </div>
      </Panel>

      {/* --------------------- workstream + ownership ----------------------- */}
      <Panel title="Response Workstream" subtitle="Ownership, approval state and evidence for every response action">
        <div className="grid gap-2 md:grid-cols-4 xl:grid-cols-7">
          {WORKSTREAM_COLUMNS.map((col) => (
            <div key={col} className="rounded-lg border border-slate-200 bg-slate-50/60 p-2">
              <h3 className="mb-1.5 text-[11px] font-semibold text-slate-700">{col} <span className="text-slate-400">({items.filter((i) => i.status === col).length})</span></h3>
              <ul className="space-y-1.5">
                {items.filter((i) => i.status === col).map((i) => (
                  <li key={i.id}>
                    <button
                      type="button" onClick={() => setSelectedItem(i)}
                      className="w-full rounded-md border border-slate-200 bg-white p-2 text-left text-[11px] shadow-sm hover:border-indigo-300"
                    >
                      <span className="block font-medium text-slate-900">{i.action}</span>
                      <span className="mt-0.5 flex items-center gap-1 text-[10.5px] text-slate-500">
                        {i.ownerType === "Agent" ? <Bot className="h-3 w-3" aria-hidden /> : <User className="h-3 w-3" aria-hidden />}
                        {i.owner}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-slate-400">{i.priority} · due {i.due} · {i.approval}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Situation Ownership" subtitle="RACI view across Taara operations, customer, partners, field service, cloud platform and product engineering">
        <div className="overflow-x-auto">
          <table className="w-full text-[11.5px]">
            <caption className="sr-only">Situation ownership and RACI</caption>
            <thead><tr className="border-b border-slate-200">
              <Th>Role</Th><Th>Assigned</Th><Th>Organisation</Th><Th>Responsibility</Th>
              <Th>Current action</Th><Th>Availability</Th><Th>Last update</Th><Th>Escalation</Th><Th>RACI</Th>
            </tr></thead>
            <tbody>
              {ownership.map((o) => (
                <tr key={o.role} className="border-b border-slate-100">
                  <td className="whitespace-nowrap px-2.5 py-2 font-medium text-slate-900">{o.role}</td>
                  <Td>{o.assignee}</Td><Td>{o.organisation}</Td>
                  <td className="px-2.5 py-2 text-slate-700">{o.responsibility}</td>
                  <td className="px-2.5 py-2 text-slate-700">{o.currentAction}</td>
                  <Td>{o.availability}</Td><Td>{o.lastUpdate}</Td><Td>{o.escalation}</Td>
                  <td className="px-2.5 py-2"><Chip className={toneChip(o.raci === "Accountable" ? "good" : "neutral")}>{o.raci}</Chip></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* --------------------- recommendation and approvals ----------------- */}
      <Panel
        title="Recommended Next Actions"
        subtitle={`Approval state: ${approval}`}
        action={
          <div className="flex flex-wrap gap-1.5">
            <ToolbarButton onClick={() => { setApproval("Approved"); if (currentStage?.requiresApproval) advance(stage + 1); }}>Approve</ToolbarButton>
            <ToolbarButton onClick={() => setApproval("Rejected")}>Reject</ToolbarButton>
            <ToolbarButton onClick={() => setApproval("More evidence requested")}>Request more evidence</ToolbarButton>
            <ToolbarButton onClick={() => setApproval("Deferred")}>Defer</ToolbarButton>
            <ToolbarButton onClick={() => setCompareAlternatives((c) => !c)} active={compareAlternatives}>Compare alternatives</ToolbarButton>
          </div>
        }
      >
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
          <p className="text-[13px] font-medium text-slate-900">{primaryRecommendation.headline}</p>
          <p className="mt-1 text-[11.5px] text-slate-700">{primaryRecommendation.reason}</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Field label="Confidence" value={`${primaryRecommendation.confidence}%`} />
            <Field label="Customer outcome protected" value={primaryRecommendation.customerOutcome} />
            <Field label="Capacity protected" value={primaryRecommendation.capacityProtected} />
            <Field label="Expected latency impact" value={primaryRecommendation.latencyImpact} />
            <Field label="SLO impact" value={primaryRecommendation.sloImpact} />
            <Field label="Policy status" value={primaryRecommendation.policy} />
            <Field label="Approval requirement" value={primaryRecommendation.approval} />
            <Field label="Rollback condition" value={primaryRecommendation.rollback} />
            <Field label="Validation criteria" value={primaryRecommendation.validation} />
            <Field label="Evidence count" value={`${primaryRecommendation.evidenceCount} items`} />
            <Field label="Execution window" value={primaryRecommendation.window} />
            <Field label="Assigned human owner" value={approvalOwner} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <input
              aria-label="Assign human owner" value={approvalOwner} onChange={(e) => setApprovalOwner(e.target.value)}
              className="rounded-md border border-slate-200 px-2 py-1.5 text-[11.5px] text-slate-800"
            />
            <input
              aria-label="Add approval note" value={approvalNote} onChange={(e) => setApprovalNote(e.target.value)}
              placeholder="Add approval note"
              className="min-w-[220px] flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-[11.5px] text-slate-800"
            />
          </div>
          {approvalNote && <p className="mt-1 text-[11px] text-slate-600">Note recorded: {approvalNote}</p>}
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-[11.5px]">
            <caption className="sr-only">Alternative actions</caption>
            <thead><tr className="border-b border-slate-200">
              <Th>Alternative</Th><Th>Expected outcome</Th><Th>Operational risk</Th><Th>Customer impact</Th>
              <Th>SLO impact</Th><Th>Reversibility</Th><Th>Approval</Th><Th>Confidence</Th><Th>Actions</Th>
            </tr></thead>
            <tbody>
              {(compareAlternatives ? alternativeActions : alternativeActions.slice(0, 4)).map((a) => (
                <tr key={a.id} className={cn("border-b border-slate-100", a.recommended && "bg-emerald-50/50")}>
                  <td className="whitespace-nowrap px-2.5 py-2 font-medium text-slate-900">{a.name}</td>
                  <td className="px-2.5 py-2 text-slate-700">{a.outcome}</td>
                  <Td>{a.operationalRisk}</Td><Td>{a.customerImpact}</Td><Td>{a.sloImpact}</Td>
                  <Td>{a.reversibility}</Td><Td>{a.approval}</Td><Td>{a.confidence}%</Td>
                  <td className="px-2.5 py-2"><ToolbarButton onClick={() => setSimulatedAlt(a.id)} active={simulatedAlt === a.id}>Simulate</ToolbarButton></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {simulatedAlt && (
          <p className="mt-2 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-[11.5px] text-indigo-900">
            Simulated locally: {alternativeActions.find((a) => a.id === simulatedAlt)?.outcome}. No transport state was changed.
          </p>
        )}
      </Panel>

      {/* -------------------------- shared timeline ------------------------- */}
      <Panel
        title="Situation Timeline"
        subtitle={`${filteredEvents.length} of ${events.length} events`}
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <Select label="Category" value={categoryFilter} options={[ALL_CATEGORIES, ...EVENT_CATEGORIES]} onChange={setCategoryFilter} />
            <Select label="Actor" value={actorFilter} options={[ALL_ACTORS, "Agent", "Human"]} onChange={setActorFilter} />
            <Select label="Customer impact" value={impactFilter} options={[ALL_IMPACT, "None", "Moderate", "Mitigated"]} onChange={setImpactFilter} />
            <ToolbarButton onClick={() => setLive((l) => !l)} active={live}>{live ? "Live" : "Paused"}</ToolbarButton>
            <ToolbarButton onClick={() => setZoom((z) => (z >= 2 ? 1 : z + 0.5))}>Zoom {zoom}x</ToolbarButton>
            <ToolbarButton onClick={() => setPlayhead((p) => (p === null ? 0 : Math.min(p + 1, filteredEvents.length - 1)))}>
              <Play className="h-3.5 w-3.5" /> Playback
            </ToolbarButton>
            <ToolbarButton onClick={() => pushEvent({
              at: "Manual", event: "Manual operator note added to the timeline", actor: commander, actorType: "Human",
              category: "Human decision", component: situationHeader.serviceName, customerImpact: "Unchanged",
              evidence: "ev-note", decision: "Recorded", outcome: noteDraft || "Operator observation recorded", status: "Complete",
            })}>Add event</ToolbarButton>
            <ToolbarButton onClick={() => exportCsv("situation-timeline.csv", [["time", "event", "actor", "category", "outcome"], ...filteredEvents.map((e) => [e.at, e.event, e.actor, e.category, e.outcome])])}>
              <Download className="h-3.5 w-3.5" /> Export
            </ToolbarButton>
          </div>
        }
      >
        <ol className="space-y-1.5" style={{ fontSize: `${11.5 * zoom}px` }}>
          {filteredEvents.map((e, i) => (
            <li key={e.id}>
              <button
                type="button" onClick={() => { setSelectedEvent(e); setSelectedEvidence(evidence.find((x) => x.id === e.evidence) ?? null); }}
                className={cn("flex w-full flex-wrap items-center gap-2 rounded-md border px-2.5 py-1.5 text-left hover:border-indigo-300",
                  playhead === i ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white",
                  pinned.includes(e.id) && "ring-1 ring-amber-300")}
              >
                <span className="font-mono text-slate-500">{e.at}</span>
                <Chip className={toneChip(e.status === "Complete" ? "good" : e.status === "Awaiting approval" ? "watch" : "neutral")}>{e.category}</Chip>
                <span className="font-medium text-slate-900">{e.event}</span>
                <span className="text-slate-500">{e.actor}</span>
                <span className="ml-auto text-slate-500">{e.customerImpact}</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              </button>
            </li>
          ))}
        </ol>
        {selectedEvent && (
          <div className="mt-2 rounded-md border border-indigo-200 bg-indigo-50/60 px-3 py-2 text-[11.5px] text-slate-800">
            <div className="flex items-center justify-between gap-2">
              <strong>{selectedEvent.event}</strong>
              <div className="flex gap-1.5">
                <ToolbarButton onClick={() => setPinned((p) => p.includes(selectedEvent.id) ? p.filter((x) => x !== selectedEvent.id) : [...p, selectedEvent.id])}>
                  {pinned.includes(selectedEvent.id) ? "Unpin" : "Pin event"}
                </ToolbarButton>
                <ToolbarButton onClick={() => setSelectedEvent(null)}>Close</ToolbarButton>
              </div>
            </div>
            <p className="mt-1">
              {selectedEvent.actor} · {selectedEvent.component} · decision {selectedEvent.decision} · outcome {selectedEvent.outcome} · status {selectedEvent.status}
            </p>
            {pinned.length > 1 && <p className="mt-1 text-slate-600">Comparing {pinned.length} pinned events.</p>}
          </div>
        )}
      </Panel>

      {/* --------------------------- evidence ------------------------------- */}
      <Panel
        title="Situation Evidence"
        subtitle={`${filteredEvidence.length} of ${evidence.length} evidence items`}
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <label className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1.5">
              <Search className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              <input
                aria-label="Search evidence" value={evidenceQuery} onChange={(e) => setEvidenceQuery(e.target.value)}
                placeholder="Search evidence" className="w-40 text-[11.5px] outline-none"
              />
            </label>
            <Select label="Evidence type" value={evidenceType} options={[ALL_EVIDENCE, ...EVIDENCE_TYPES]} onChange={setEvidenceType} />
            <Select label="Sort" value={evidenceSort} options={["Newest first", "Oldest first", "By type"]} onChange={setEvidenceSort} />
            <ToolbarButton onClick={() => exportCsv("situation-evidence.csv", [["title", "type", "source", "timestamp", "reliability"], ...filteredEvidence.map((e) => [e.title, e.type, e.source, e.at, e.reliability])])}>
              <Download className="h-3.5 w-3.5" /> Export index
            </ToolbarButton>
          </div>
        }
      >
        <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvidence.map((e) => (
            <li key={e.id}>
              <button
                type="button" onClick={() => setSelectedEvidence(e)}
                className={cn("h-full w-full rounded-lg border bg-white p-3 text-left shadow-sm hover:border-indigo-300",
                  e.superseded ? "border-slate-200 opacity-70" : "border-slate-200",
                  pinnedEvidence.includes(e.id) && "ring-1 ring-amber-300")}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[12px] font-medium text-slate-900">{e.title}</span>
                  <Chip className={toneChip(e.reliability === "High" ? "good" : e.reliability === "Medium" ? "watch" : "neutral")}>{e.reliability}</Chip>
                </div>
                <p className="mt-1 text-[11px] text-slate-600">{e.preview}</p>
                <p className="mt-1 text-[10.5px] text-slate-500">
                  {e.type} · {e.source} · {e.at} · {e.relatedObject} · freshness {e.freshness}
                </p>
                <p className="text-[10.5px] text-slate-400">Added by {e.addedBy} · used by {e.usedBy} · supports {e.supports}{e.superseded ? " · superseded" : ""}</p>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <ToolbarButton onClick={() => setEvidence((prev) => [...prev, {
            id: `ev-note-${prev.length}`, title: noteDraft || "Synthetic evidence note", type: "Human notes",
            source: commander, at: refreshedAt.slice(0, 8), relatedObject: SITUATION_ID, reliability: "Medium",
            freshness: "Just now", addedBy: commander, usedBy: "0 agents", supports: "Situation brief",
            preview: noteDraft || "Operator recorded a synthetic evidence note in this session.",
          }])}>Add synthetic evidence note</ToolbarButton>
        </div>
      </Panel>

      {/* ------------------------- communications --------------------------- */}
      <Panel
        title="Stakeholder Communications"
        subtitle="Synthetic communication drafts only. No email, chat or customer messaging systems are connected."
        action={<ToolbarButton onClick={() => setShowCommHistory((v) => !v)} active={showCommHistory}>Communication history</ToolbarButton>}
      >
        <div className="grid gap-3 lg:grid-cols-[2fr_3fr]">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              <Select label="Audience" value={draftAudience} options={COMM_AUDIENCES} onChange={setDraftAudience} />
              <Select label="Template" value={draftTemplate} options={COMM_TEMPLATES} onChange={setDraftTemplate} />
            </div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500" htmlFor="comm-draft">AI drafted update</label>
            <textarea
              id="comm-draft" value={draft} onChange={(e) => setDraft(e.target.value)} rows={6}
              className="w-full rounded-md border border-slate-200 p-2 text-[11.5px] text-slate-800"
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <ToolbarButton onClick={() => setDraft(`${draft} Situation ${SITUATION_ID}, ${situationHeader.serviceName}, severity ${severity}.`)}>Add situation details</ToolbarButton>
              <label className="flex items-center gap-1 text-[11px] text-slate-500">
                Next update
                <input value={nextUpdate} onChange={(e) => setNextUpdate(e.target.value)} aria-label="Next update time"
                  className="w-24 rounded-md border border-slate-200 px-2 py-1 text-[11.5px]" />
              </label>
              <ToolbarButton onClick={() => setMessages((prev) => prev.map((m) => m.id === "cm-5" ? { ...m, body: draft, status: "Draft" } : m))}>Approve communication</ToolbarButton>
              <ToolbarButton onClick={() => setMessages((prev) => prev.map((m) => m.id === "cm-5" ? { ...m, body: draft, status: "Sent" } : m))}>Mark sent</ToolbarButton>
            </div>
          </div>
          <ul className="space-y-1.5">
            {(showCommHistory ? messages : messages.slice(-3)).map((m) => (
              <li key={m.id} className="rounded-md border border-slate-200 bg-white p-2.5 text-[11.5px] shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-slate-500">{m.at}</span>
                  <Chip className={toneChip(m.status === "Sent" ? "good" : m.status === "Awaiting approval" ? "watch" : "neutral")}>{m.status}</Chip>
                  <span className="font-medium text-slate-900">{m.audience}</span>
                  <span className="text-slate-500">{m.template}</span>
                  <span className="ml-auto text-slate-400">{m.author}</span>
                </div>
                <p className="mt-1 text-slate-700">{m.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </Panel>

      {/* ----------------- validation, SRE impact, simulation --------------- */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Service Validation and Reliability Impact" subtitle="Synthetic outcome measures for this situation">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {sreOutcomes.map((o) => <Field key={o.label} label={o.label} value={`${o.value} — ${o.note}`} />)}
          </div>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {validationChecks.map((v) => (
              <li key={v.id}>
                <button
                  type="button" onClick={() => setSelectedValidation(selectedValidation === v.id ? null : v.id)}
                  className="flex w-full items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-left text-[11.5px] hover:border-indigo-300"
                  aria-expanded={selectedValidation === v.id}
                >
                  <Chip className={toneChip(v.status === "Passed" ? "good" : v.status === "Pending" ? "watch" : v.status === "Failed" ? "risk" : "neutral")}>{v.status}</Chip>
                  <span className="text-slate-800">{v.check}</span>
                </button>
                {selectedValidation === v.id && <p className="px-2.5 py-1 text-[11px] text-slate-600">{v.detail}</p>}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Run Active Situation Scenario"
          subtitle={currentStage ? `Stage ${stage + 1} of ${situationScenario.length}: ${currentStage.title}` : "Deterministic 18 stage demonstration of the Chennai situation response"}
          action={
            <div className="flex flex-wrap gap-1.5">
              <ToolbarButton onClick={startScenario} active={running}><Play className="h-3.5 w-3.5" /> {stage < 0 ? "Start" : "Continue"}</ToolbarButton>
              <ToolbarButton onClick={() => setRunning(false)}><Pause className="h-3.5 w-3.5" /> Pause</ToolbarButton>
              <ToolbarButton onClick={() => advance(Math.min(stage + 1, situationScenario.length - 1))}><SkipForward className="h-3.5 w-3.5" /> Skip to next stage</ToolbarButton>
              <ToolbarButton onClick={resetScenario}><RotateCcw className="h-3.5 w-3.5" /> Reset</ToolbarButton>
            </div>
          }
        >
          <div className="flex flex-wrap gap-1.5">
            <ToolbarButton onClick={() => { setApproval("Approved"); if (currentStage?.requiresApproval) advance(stage + 1); }}>Approve recommendation</ToolbarButton>
            <ToolbarButton onClick={() => setApproval("Rejected")}>Reject recommendation</ToolbarButton>
            <ToolbarButton onClick={() => setApproval("More evidence requested")}>Request more evidence</ToolbarButton>
            <ToolbarButton onClick={() => { setScenarioLog((l) => [...l, fallbackFailureEvent.detail]); pushEvent({ at: "Injected", event: fallbackFailureEvent.title, actor: "RF Fallback Guardian", actorType: "Agent", category: "Traffic transition", component: "e-rf", customerImpact: "Elevated", evidence: "ev-fallback", decision: "Escalate alternate fiber", outcome: fallbackFailureEvent.detail, status: "In progress" }); }}>
              Simulate fallback failure
            </ToolbarButton>
            <ToolbarButton onClick={() => { setScenarioLog((l) => [...l, weatherRecoveryEvent.detail]); pushEvent({ at: "Injected", event: weatherRecoveryEvent.title, actor: "Weather Risk Agent", actorType: "Agent", category: "Weather", component: "Chennai coastal cell", customerImpact: "Reducing", evidence: "ev-weather", decision: "Open validation window", outcome: weatherRecoveryEvent.detail, status: "Complete" }); }}>
              Simulate weather recovery
            </ToolbarButton>
          </div>
          {currentStage && (
            <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50/60 p-3 text-[11.5px]">
              <p className="font-medium text-slate-900">{currentStage.title}</p>
              <p className="mt-1 text-slate-700">{currentStage.detail}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Field label="Actor" value={currentStage.actor} />
                <Field label="Situation state" value={currentStage.state} />
                <Field label="Service state" value={currentStage.serviceState} />
                <Field label="Throughput" value={currentStage.throughput} />
                <Field label="Fallback" value={currentStage.fallback} />
                <Field label="Customer impact" value={currentStage.impact} />
              </div>
              {currentStage.requiresApproval && approval === "Pending" && (
                <p className="mt-2 flex items-center gap-1 text-amber-700"><ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Human approval required before this stage completes.</p>
              )}
            </div>
          )}
          {scenarioLog.length > 0 && (
            <ol className="mt-2 max-h-40 space-y-1 overflow-y-auto text-[11px] text-slate-600">
              {scenarioLog.map((l, i) => <li key={i}>· {l}</li>)}
            </ol>
          )}
        </Panel>
      </div>

      {/* ------------------------------ drawers ----------------------------- */}
      <Sheet open={!!(selectedNode || selectedEdge)} onOpenChange={(o) => { if (!o) { setSelectedNodeId(null); setSelectedEdgeId(null); } }}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selectedNode && (
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-slate-900">{selectedNode.name}</h2>
              <Field label="Type" value={selectedNode.type} />
              <Field label="Health" value={selectedNode.health} />
              <Field label="Owner" value={selectedNode.owner} />
              <Field label="Capacity" value={selectedNode.capacity} />
              <Field label="Latency" value={selectedNode.latency} />
              <Field label="Active issue" value={selectedNode.issue} />
              <Field label="Current agent" value={selectedNode.agentActivity} />
              <Field label="Response action" value={routeSegmentNotes[selectedNode.id]?.responseAction ?? "No action assigned"} />
              <Field label="Evidence" value={routeSegmentNotes[selectedNode.id]?.evidence ?? "No evidence attached"} />
              <Field label="Active change" value={routeSegmentNotes[selectedNode.id]?.change ?? "None"} />
            </div>
          )}
          {selectedEdge && (
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-slate-900">{selectedEdge.transport}</h2>
              <Field label="State" value={selectedEdge.state} />
              <Field label="Current throughput" value={selectedEdge.throughput} />
              <Field label="Capacity" value={selectedEdge.maxCapacity} />
              <Field label="Latency" value={selectedEdge.latency} />
              <Field label="Availability" value={selectedEdge.availability} />
              <Field label="Fallback eligible" value={selectedEdge.fallbackEligible} />
              <Field label="Response action" value={routeSegmentNotes[selectedEdge.id]?.responseAction ?? "No action assigned"} />
              <Field label="Evidence" value={routeSegmentNotes[selectedEdge.id]?.evidence ?? "No evidence attached"} />
              <Field label="Active change" value={routeSegmentNotes[selectedEdge.id]?.change ?? "None"} />
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={!!selectedAgent} onOpenChange={(o) => !o && setSelectedAgent(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selectedAgent && (
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-slate-900">{selectedAgent.name}</h2>
              <Field label="Objective" value={selectedAgent.objective} />
              <Field label="Current task" value={selectedAgent.task} />
              <Field label="Status" value={selectedAgent.status} />
              <Field label="Confidence" value={`${selectedAgent.confidence}%`} />
              <Field label="Evidence reviewed" value={`${selectedAgent.evidenceReviewed} items`} />
              <Field label="Finding" value={selectedAgent.finding} />
              <Field label="Recommended action" value={selectedAgent.recommendation} />
              <Field label="Owner interaction" value={selectedAgent.ownerInteraction} />
              <Field label="Guardrail status" value={selectedAgent.guardrail} />
              <Field label="Last update" value={selectedAgent.lastUpdate} />
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={!!selectedHypothesis} onOpenChange={(o) => !o && setSelectedHypothesis(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selectedHypothesis && (
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-slate-900">{selectedHypothesis.cause}</h2>
              <Field label="Confidence" value={`${selectedHypothesis.confidence}%`} />
              <Field label="Status" value={selectedHypothesis.status} />
              <Field label="Agent owner" value={selectedHypothesis.owner} />
              <Field label="Last evaluation" value={selectedHypothesis.lastEvaluated} />
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Supporting evidence</h3>
                <ul className="mt-1 space-y-1 text-[11.5px] text-slate-700">{selectedHypothesis.supporting.map((s) => <li key={s}>· {s}</li>)}</ul>
              </div>
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-rose-700">Contradicting evidence</h3>
                <ul className="mt-1 space-y-1 text-[11.5px] text-slate-700">{selectedHypothesis.contradicting.map((s) => <li key={s}>· {s}</li>)}</ul>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={!!selectedItem} onOpenChange={(o) => !o && setSelectedItem(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selectedItem && (
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-slate-900">{selectedItem.action}</h2>
              <Field label="Owner" value={`${selectedItem.owner} (${selectedItem.ownerType})`} />
              <Field label="Priority" value={selectedItem.priority} />
              <Field label="Status" value={items.find((i) => i.id === selectedItem.id)?.status ?? selectedItem.status} />
              <Field label="Due" value={selectedItem.due} />
              <Field label="Dependencies" value={selectedItem.dependencies} />
              <Field label="Evidence" value={selectedItem.evidence} />
              <Field label="Approval state" value={selectedItem.approval} />
              <Field label="Customer impact" value={selectedItem.customerImpact} />
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500" htmlFor="wi-owner">Assign owner</label>
              <input
                id="wi-owner" defaultValue={selectedItem.owner}
                onBlur={(e) => setItems((prev) => prev.map((i) => i.id === selectedItem.id ? { ...i, owner: e.target.value } : i))}
                className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-[11.5px]"
              />
              <Select
                label="Change state" value={items.find((i) => i.id === selectedItem.id)?.status ?? selectedItem.status}
                options={WORKSTREAM_COLUMNS} onChange={(v) => setItemStatus(selectedItem.id, v as WorkstreamColumn)}
              />
              <div className="flex flex-wrap gap-1.5">
                <ToolbarButton onClick={() => setItemStatus(selectedItem.id, "Completed")}>Complete action</ToolbarButton>
                <ToolbarButton onClick={() => setItemStatus(selectedItem.id, "Blocked")}>Mark blocked</ToolbarButton>
                <ToolbarButton onClick={() => setItemStatus(selectedItem.id, "Investigating")}>Request more investigation</ToolbarButton>
                <ToolbarButton onClick={() => setItems((prev) => prev.map((i) => i.id === selectedItem.id ? { ...i, approval: "Approved" } : i))}>Approve</ToolbarButton>
                <ToolbarButton onClick={() => setItems((prev) => prev.map((i) => i.id === selectedItem.id ? { ...i, approval: "Rejected" } : i))}>Reject</ToolbarButton>
                <ToolbarButton onClick={() => setItems((prev) => prev.map((i) => i.id === selectedItem.id ? { ...i, note: noteDraft || "Note added in session" } : i))}>Add note</ToolbarButton>
                <ToolbarButton onClick={() => setItems((prev) => prev.map((i) => i.id === selectedItem.id ? { ...i, evidence: `${i.evidence}, ev-note` } : i))}>Add evidence</ToolbarButton>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={!!selectedEvidence} onOpenChange={(o) => !o && setSelectedEvidence(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selectedEvidence && (
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-slate-900">{selectedEvidence.title}</h2>
              <Field label="Evidence type" value={selectedEvidence.type} />
              <Field label="Source" value={selectedEvidence.source} />
              <Field label="Timestamp" value={selectedEvidence.at} />
              <Field label="Related object" value={selectedEvidence.relatedObject} />
              <Field label="Reliability" value={selectedEvidence.reliability} />
              <Field label="Data freshness" value={selectedEvidence.freshness} />
              <Field label="Added by" value={selectedEvidence.addedBy} />
              <Field label="Used by agents" value={selectedEvidence.usedBy} />
              <Field label="Decision supported" value={selectedEvidence.supports} />
              <p className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[11.5px] text-slate-700">{selectedEvidence.preview}</p>
              <div className="flex flex-wrap gap-1.5">
                <ToolbarButton onClick={() => setPinnedEvidence((p) => p.includes(selectedEvidence.id) ? p.filter((x) => x !== selectedEvidence.id) : [...p, selectedEvidence.id])}>
                  {pinnedEvidence.includes(selectedEvidence.id) ? "Unpin evidence" : "Pin evidence"}
                </ToolbarButton>
                <ToolbarButton onClick={() => setSelectedHypothesis(hypotheses[0])}>Link to hypothesis</ToolbarButton>
                <ToolbarButton onClick={() => setSelectedItem(items[0])}>Link to action</ToolbarButton>
                <ToolbarButton onClick={() => setEvidence((prev) => prev.map((e) => e.id === selectedEvidence.id ? { ...e, superseded: true } : e))}>Mark superseded</ToolbarButton>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
