// SRE Based Agentic NOC — Global Optical Operations Center (Stage 1).
// Route: /operations/sre-agentic-noc/global-optical-operations

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, Filter, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AgenticGlobalOpticalMap,
} from "@/components/operations/AgenticGlobalOpticalMap";
import {
  AgenticMapLayerControls, DEFAULT_LAYERS,
} from "@/components/operations/AgenticMapLayerControls";
import {
  OperationalMetricCard, OpsPanel,
} from "@/components/operations/OperationsPrimitives";
import {
  ActiveSituationRoom, AgenticInvestigationWorkspace, AgenticOperationalEventStream,
  CapacityTrafficIntelligence, ChangeIntelligencePanel, HumanApprovalActionCenter,
  LearningImprovementPanel, OpticalNetworkHealthTable, PredictiveLinkRiskCenter,
  ServiceReliabilitySummary, SloErrorBudgetPanel,
} from "./panels";
import { Stage2WorkflowSection } from "./Stage2WorkflowSection";
import { linkStatusOverrides, useAgenticNocStore } from "@/stores/useAgenticNocStore";
import {
  CUSTOMERS, REGIONS, SERVICES, TIME_RANGES, agenticActions, capacitySeries,
  changeRecords, hypotheses, learningRecords, links as allLinks, metricSummary,
  operationalEvents, predictedRisks, serviceReliability, situations as allSituations,
  sloRecords, terminals as allTerminals,
} from "@/data/agenticOpticalNetworkData";
import type {
  AgenticFilters, MapLayers, OpticalLink, OpticalTerminal, ViewMode,
} from "@/types/agenticOpticalOperations";

const DEFAULT_FILTERS: AgenticFilters = {
  timeRange: "Last 24 hours",
  region: "All regions",
  country: "All countries",
  customer: "All customers",
  service: "All services",
  terminal: "All terminals",
  link: "All links",
  situationStatus: "All statuses",
  networkStatus: "All network states",
  riskLevel: "All risk levels",
  agentActivity: "All agent activity",
  validationState: "All validation states",
};

const NETWORK_STATES = [
  "All network states", "healthy", "degraded", "critical", "at-risk",
  "maintenance", "recovery-active", "validated",
];
const RISK_LEVELS = ["All risk levels", "low", "medium", "high", "critical"];
const AGENT_ACTIVITIES = [
  "All agent activity", "observing", "investigating", "recommending",
  "awaiting-approval", "executing", "validating", "learning",
];
const VALIDATION_STATES = ["All validation states", "not-started", "running", "passed", "failed"];
const SITUATION_STATUSES = ["All statuses", "Open", "Mitigating", "Monitoring", "Resolved"];

function useUtcClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

export default function SreAgenticOpticalOperationsCenter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const now = useUtcClock();

  const [view, setView] = useState<ViewMode>(
    searchParams.get("view") === "Executive View" ? "Executive View" : "SRE View",
  );
  const [filters, setFilters] = useState<AgenticFilters>(() => {
    const next = { ...DEFAULT_FILTERS };
    (Object.keys(DEFAULT_FILTERS) as (keyof AgenticFilters)[]).forEach((key) => {
      const value = searchParams.get(key);
      if (value) next[key] = value;
    });
    return next;
  });
  const [layers, setLayers] = useState<MapLayers>({ ...DEFAULT_LAYERS });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(() => new Date());
  const [selectedTerminalId, setSelectedTerminalId] = useState<string | null>(null);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(timer);
  }, []);

  // Persist filters and view in the URL.
  useEffect(() => {
    const params = new URLSearchParams();
    (Object.keys(filters) as (keyof AgenticFilters)[]).forEach((key) => {
      if (filters[key] !== DEFAULT_FILTERS[key]) params.set(key, filters[key]);
    });
    if (view !== "SRE View") params.set("view", view);
    setSearchParams(params, { replace: true });
  }, [filters, view, setSearchParams]);

  const setFilter = useCallback((key: keyof AgenticFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);
  const resetFilters = useCallback(() => setFilters({ ...DEFAULT_FILTERS }), []);

  const countries = useMemo(
    () => ["All countries", ...Array.from(new Set(allTerminals.map((t) => t.country)))],
    [],
  );
  const terminalNames = useMemo(
    () => ["All terminals", ...allTerminals.map((t) => t.name)],
    [],
  );
  const linkNamesList = useMemo(() => ["All links", ...allLinks.map((l) => l.name)], []);

  const terminals = useMemo(() => allTerminals.filter((t) => (
    (filters.region === DEFAULT_FILTERS.region || t.region === filters.region) &&
    (filters.country === DEFAULT_FILTERS.country || t.country === filters.country) &&
    (filters.terminal === DEFAULT_FILTERS.terminal || t.name === filters.terminal) &&
    (filters.service === DEFAULT_FILTERS.service || t.services.includes(filters.service)) &&
    (filters.networkStatus === DEFAULT_FILTERS.networkStatus || t.status === filters.networkStatus) &&
    (filters.agentActivity === DEFAULT_FILTERS.agentActivity || t.agentActivity === filters.agentActivity)
  )), [filters]);

  const terminalIds = useMemo(() => new Set(terminals.map((t) => t.id)), [terminals]);

  // Stage 2 workflow state can override live link status on the twin.
  const workflowActionState = useAgenticNocStore((s) => s.actionRuntimes[PRIMARY_ACTION_ID]?.state);
  const workflowValidationState = useAgenticNocStore((s) => s.validationState);
  const statusOverrides = useMemo(
    () => linkStatusOverrides({
      actionRuntimes: { [PRIMARY_ACTION_ID]: { state: workflowActionState } },
      validationState: workflowValidationState,
    } as never),
    [workflowActionState, workflowValidationState],
  );

  const links = useMemo(() => allLinks
    .map((l) => (statusOverrides[l.id] ? { ...l, status: statusOverrides[l.id] } : l))
    .filter((l) => (
      terminalIds.has(l.sourceTerminalId) && terminalIds.has(l.targetTerminalId) &&
      (filters.link === DEFAULT_FILTERS.link || l.name === filters.link) &&
      (filters.service === DEFAULT_FILTERS.service || l.services.includes(filters.service)) &&
      (filters.networkStatus === DEFAULT_FILTERS.networkStatus || l.status === filters.networkStatus) &&
      (filters.riskLevel === DEFAULT_FILTERS.riskLevel || l.riskLevel === filters.riskLevel) &&
      (filters.agentActivity === DEFAULT_FILTERS.agentActivity || l.agentActivity === filters.agentActivity) &&
      (filters.validationState === DEFAULT_FILTERS.validationState ||
        (l.validationState ?? "not-started") === filters.validationState)
    )), [terminalIds, filters, statusOverrides]);

  const linkIds = useMemo(() => new Set(links.map((l) => l.id)), [links]);
  const linkNames = useMemo(
    () => Object.fromEntries(allLinks.map((l) => [l.id, l.name])) as Record<string, string>,
    [],
  );

  const situations = useMemo(() => allSituations.filter((s) => (
    (filters.region === DEFAULT_FILTERS.region || s.region === filters.region) &&
    (filters.situationStatus === DEFAULT_FILTERS.situationStatus || s.status === filters.situationStatus) &&
    (filters.service === DEFAULT_FILTERS.service || s.servicesAffected.includes(filters.service)) &&
    (filters.validationState === DEFAULT_FILTERS.validationState || s.validationState === filters.validationState) &&
    s.linkIds.some((id) => linkIds.has(id))
  )), [filters, linkIds]);

  const situationIds = useMemo(() => new Set(situations.map((s) => s.id)), [situations]);

  const visibleHypotheses = useMemo(
    () => hypotheses.filter((h) => situationIds.has(h.situationId)),
    [situationIds],
  );
  const visibleRisks = useMemo(() => predictedRisks.filter((r) => (
    linkIds.has(r.linkId) &&
    (filters.riskLevel === DEFAULT_FILTERS.riskLevel || r.riskLevel === filters.riskLevel) &&
    (filters.service === DEFAULT_FILTERS.service || r.affectedServices.includes(filters.service))
  )), [linkIds, filters]);

  const visibleActions = useMemo(() => agenticActions.filter((a) => (
    (!a.linkId || linkIds.has(a.linkId)) &&
    (!a.terminalId || terminalIds.has(a.terminalId)) &&
    (filters.agentActivity === DEFAULT_FILTERS.agentActivity || a.activityType === filters.agentActivity) &&
    (filters.validationState === DEFAULT_FILTERS.validationState || a.validationState === filters.validationState)
  )), [linkIds, terminalIds, filters]);

  const visibleSlos = useMemo(() => sloRecords.filter((s) => (
    (filters.region === DEFAULT_FILTERS.region || s.region === filters.region || s.region === "All regions") &&
    (filters.service === DEFAULT_FILTERS.service || s.service === filters.service)
  )), [filters]);

  const visibleServices = useMemo(() => serviceReliability.filter((s) => (
    (filters.region === DEFAULT_FILTERS.region || s.region === filters.region) &&
    (filters.service === DEFAULT_FILTERS.service || s.service === filters.service)
  )), [filters]);

  const visibleChanges = useMemo(() => changeRecords.filter((c) => (
    filters.region === DEFAULT_FILTERS.region || c.region === filters.region
  )), [filters]);

  const visibleEvents = useMemo(() => operationalEvents.filter((e) => (
    (filters.region === DEFAULT_FILTERS.region || e.region === filters.region) &&
    (filters.agentActivity === DEFAULT_FILTERS.agentActivity || e.activityType === filters.agentActivity) &&
    (filters.validationState === DEFAULT_FILTERS.validationState || e.validationState === filters.validationState)
  )), [filters]);

  const metrics = useMemo(() => {
    const customersAffected = links.reduce((sum, l) => sum + l.customersAffected, 0);
    const criticalSituations = situations.filter((s) => s.severity === "Critical").length;
    const majorSituations = situations.filter((s) => s.severity === "Major").length;
    return { customersAffected, criticalSituations, majorSituations };
  }, [links, situations]);

  const selectedTerminal = terminals.find((t) => t.id === selectedTerminalId) ?? null;
  const selectedLink = links.find((l) => l.id === selectedLinkId) ?? null;

  const refresh = () => {
    setLoading(true);
    setLastRefreshed(new Date());
    window.setTimeout(() => setLoading(false), 250);
  };

  const exportCsv = () => {
    const rows = [
      ["Link", "Status", "Availability", "Margin dB", "Utilisation", "Customers affected"],
      ...links.map((l) => [l.name, l.status, l.availability.toFixed(3), l.linkMarginDb.toFixed(1),
        String(l.utilizationPercent), String(l.customersAffected)]),
    ];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "sre-agentic-noc-optical-health.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const executive = view === "Executive View";

  const twinPanel = (
    <OpsPanel
      title="Global Reliability Digital Twin"
      subtitle="Live optical terminals, routes, risk and automation"
      className="lg:col-span-6"
      action={<span className="inline-flex items-center gap-1.5 text-[11px] text-green-700">
        <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />Live
      </span>}
    >
      <div className="space-y-2.5">
        <AgenticMapLayerControls
          layers={layers}
          onToggle={(key) => setLayers((prev) => ({ ...prev, [key]: !prev[key] }))}
          onReset={() => { setLayers({ ...DEFAULT_LAYERS }); setSelectedLinkId(null); setSelectedTerminalId(null); }}
        />
        <AgenticGlobalOpticalMap
          terminals={terminals}
          links={links}
          layers={layers}
          loading={loading}
          selectedTerminalId={selectedTerminalId}
          selectedLinkId={selectedLinkId}
          onTerminalSelect={(t: OpticalTerminal) => { setSelectedLinkId(null); setSelectedTerminalId(t.id === selectedTerminalId ? null : t.id); }}
          onLinkSelect={(l: OpticalLink) => { setSelectedTerminalId(null); setSelectedLinkId(l.id === selectedLinkId ? null : l.id); }}
        />
        {(selectedTerminal || selectedLink) && (
          <div className="rounded border border-slate-200 bg-slate-50 p-2.5 text-[11.5px] text-slate-700">
            {selectedTerminal
              ? `Selected terminal ${selectedTerminal.name} · ${selectedTerminal.city}, ${selectedTerminal.country} · availability ${selectedTerminal.availability.toFixed(3)}% · agent ${selectedTerminal.agentActivity ?? "none"}`
              : selectedLink
                ? `Selected route ${selectedLink.name} · margin ${selectedLink.linkMarginDb.toFixed(1)} dB · utilisation ${selectedLink.utilizationPercent}% · validation ${selectedLink.validationState ?? "not-started"}`
                : null}
          </div>
        )}
      </div>
    </OpsPanel>
  );

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 pl-10 lg:pl-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Terra Communications</p>
            <h1 className="text-[22px] font-semibold leading-tight text-slate-900">Global Optical Operations Center</h1>
            <p className="text-[14px] font-medium text-blue-700">SRE Based Agentic NOC</p>
            <p className="text-[12px] text-slate-500">Observe. Understand. Predict. Act. Learn.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-md border border-slate-200 p-0.5" role="group" aria-label="View selector">
              {(["SRE View", "Executive View"] as ViewMode[]).map((mode) => (
                <button
                  key={mode} type="button" onClick={() => setView(mode)} aria-pressed={view === mode}
                  className={cn("rounded px-2.5 py-1 text-[12px] font-medium transition",
                    view === mode ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:text-slate-900")}
                >
                  {mode}
                </button>
              ))}
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-1 text-[11.5px] text-slate-700">
              <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
              AI Agents Active · 28
            </span>
            <button type="button" onClick={() => setFiltersOpen((v) => !v)} aria-expanded={filtersOpen}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-1 text-[12px] text-slate-700 hover:border-slate-300">
              <Filter className="h-3.5 w-3.5" aria-hidden />Filters
            </button>
            <button type="button" onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-1 text-[12px] text-slate-700 hover:border-slate-300">
              <Download className="h-3.5 w-3.5" aria-hidden />Export
            </button>
            <button type="button" onClick={refresh} aria-label="Refresh operational data"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-1 text-[12px] text-slate-700 hover:border-slate-300">
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />Refresh
            </button>
            <div className="text-right text-[11px] text-slate-500">
              <p className="text-[13px] font-semibold text-slate-900">{now.toISOString().slice(11, 19)} UTC</p>
              <p>Last refreshed {lastRefreshed.toISOString().slice(11, 19)} UTC</p>
              <p>Data freshness: telemetry 12s behind</p>
            </div>
          </div>
        </div>

        {filtersOpen && (
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:grid-cols-6">
              <Select label="Time range" value={filters.timeRange} options={[...TIME_RANGES]} onChange={(v) => setFilter("timeRange", v)} />
              <Select label="Region" value={filters.region} options={[...REGIONS]} onChange={(v) => setFilter("region", v)} />
              <Select label="Country" value={filters.country} options={countries} onChange={(v) => setFilter("country", v)} />
              <Select label="Customer" value={filters.customer} options={[...CUSTOMERS]} onChange={(v) => setFilter("customer", v)} />
              <Select label="Service" value={filters.service} options={[...SERVICES]} onChange={(v) => setFilter("service", v)} />
              <Select label="Terminal" value={filters.terminal} options={terminalNames} onChange={(v) => setFilter("terminal", v)} />
              <Select label="Link" value={filters.link} options={linkNamesList} onChange={(v) => setFilter("link", v)} />
              <Select label="Situation status" value={filters.situationStatus} options={SITUATION_STATUSES} onChange={(v) => setFilter("situationStatus", v)} />
              <Select label="Network status" value={filters.networkStatus} options={NETWORK_STATES} onChange={(v) => setFilter("networkStatus", v)} />
              <Select label="Risk level" value={filters.riskLevel} options={RISK_LEVELS} onChange={(v) => setFilter("riskLevel", v)} />
              <Select label="Agent activity" value={filters.agentActivity} options={AGENT_ACTIVITIES} onChange={(v) => setFilter("agentActivity", v)} />
              <Select label="Validation state" value={filters.validationState} options={VALIDATION_STATES} onChange={(v) => setFilter("validationState", v)} />
            </div>
            <button type="button" onClick={resetFilters}
              className="mt-2 inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11.5px] text-slate-600 hover:border-slate-300">
              <X className="h-3 w-3" aria-hidden />Reset filters
            </button>
          </div>
        )}
      </header>

      <div className="space-y-4 px-4 py-4 lg:px-6">
        <section aria-label="Top level reliability metrics"
          className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <OperationalMetricCard
            title="Reliability compliance" value={`${metricSummary.reliability.attainment.toFixed(2)}%`}
            tone={metricSummary.reliability.attainment >= metricSummary.reliability.target ? "good" : "bad"}
            lines={[
              { label: "Target", value: `${metricSummary.reliability.target.toFixed(2)}%` },
              { label: "30 day trend", value: `+${metricSummary.reliability.trend30d} pp` },
              { label: "Services below target", value: String(metricSummary.reliability.servicesBelowTarget) },
              { label: "Error budget remaining", value: `${metricSummary.reliability.errorBudgetRemaining}%` },
            ]} />
          <OperationalMetricCard
            title="Customer and user impact" value={metrics.customersAffected.toLocaleString()} unit="customers"
            tone={metrics.customersAffected > 0 ? "bad" : "good"}
            lines={[
              { label: "Impacted services", value: String(metricSummary.customerImpact.services) },
              { label: "Critical journeys", value: String(metricSummary.customerImpact.criticalJourneys) },
              { label: "Estimated duration", value: `${metricSummary.customerImpact.estimatedDurationMinutes} min` },
            ]} />
          <OperationalMetricCard
            title="Active situations" value={String(metrics.criticalSituations + metrics.majorSituations)}
            tone={metrics.criticalSituations > 0 ? "bad" : "warn"}
            lines={[
              { label: "Critical", value: String(metrics.criticalSituations) },
              { label: "Major", value: String(metrics.majorSituations) },
              { label: "Under investigation", value: String(metricSummary.situations.investigating) },
              { label: "Under mitigation", value: String(metricSummary.situations.mitigating) },
              { label: "Oldest active", value: `${metricSummary.situations.oldestMinutes} min` },
            ]} />
          <OperationalMetricCard
            title="Automated resolutions" value={String(metricSummary.automation.automatedRecoveries)} unit="last 7 days"
            tone="good"
            lines={[
              { label: "Human approved actions", value: String(metricSummary.automation.humanApproved) },
              { label: "Preventive actions", value: String(metricSummary.automation.preventive) },
              { label: "Validation success", value: `${metricSummary.automation.validationSuccessRate}%` },
              { label: "Rollback rate", value: `${metricSummary.automation.rollbackRate}%` },
            ]} />
          <OperationalMetricCard
            title="Predicted risk reduction" value={String(metricSummary.predictedRisk.mitigated)} unit="risks mitigated"
            tone="good"
            lines={[
              { label: "Risks detected", value: String(metricSummary.predictedRisk.detected) },
              { label: "Incidents prevented", value: String(metricSummary.predictedRisk.incidentsPrevented) },
              { label: "Capacity breaches prevented", value: String(metricSummary.predictedRisk.capacityBreachesPrevented) },
              { label: "Weather risks reduced", value: String(metricSummary.predictedRisk.weatherRisksReduced) },
            ]} />
          <OperationalMetricCard
            title="Operational efficiency" value={`${metricSummary.efficiency.mttrReduction}%`} unit="MTTR reduction"
            tone="good"
            lines={[
              { label: "Toil avoided", value: `${metricSummary.efficiency.toilAvoidedHours} hrs` },
              { label: "Automation rate", value: `${metricSummary.efficiency.automationRate}%` },
              { label: "Cost avoidance", value: `$${(metricSummary.efficiency.costAvoidanceUsd / 1_000_000).toFixed(1)}M` },
              { label: "Engineering hours returned", value: String(metricSummary.efficiency.engineeringHoursReturned) },
            ]} />
        </section>

        {/* Row 1 */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:items-start">
          {executive ? (
            <>
              {twinPanel}
              <ServiceReliabilitySummary services={visibleServices} loading={loading} className="lg:col-span-3" />
              <SloErrorBudgetPanel slos={visibleSlos} loading={loading} className="lg:col-span-3" />
            </>
          ) : (
            <>
              {twinPanel}
              <ActiveSituationRoom situations={situations} loading={loading} className="lg:col-span-3" />
              <AgenticInvestigationWorkspace hypotheses={visibleHypotheses} loading={loading} className="lg:col-span-3" />
            </>
          )}
        </section>

        {/* Row 2 */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12">
          {executive ? (
            <>
              <ActiveSituationRoom situations={situations} loading={loading} className="lg:col-span-3" />
              <PredictiveLinkRiskCenter risks={visibleRisks} linkNames={linkNames} loading={loading}
                className="lg:col-span-3"
                onSelectRisk={(risk) => { setSelectedTerminalId(null); setSelectedLinkId(risk.linkId); }} />
              <ChangeIntelligencePanel changes={visibleChanges} loading={loading} className="lg:col-span-3" />
              <LearningImprovementPanel learnings={learningRecords} loading={loading} className="lg:col-span-3" />
            </>
          ) : (
            <>
              <PredictiveLinkRiskCenter risks={visibleRisks} linkNames={linkNames} loading={loading}
                className="lg:col-span-3"
                onSelectRisk={(risk) => { setSelectedTerminalId(null); setSelectedLinkId(risk.linkId); }} />
              <HumanApprovalActionCenter actions={visibleActions} loading={loading} className="lg:col-span-3" />
              <SloErrorBudgetPanel slos={visibleSlos} loading={loading} className="lg:col-span-3" />
              <ServiceReliabilitySummary services={visibleServices} loading={loading} className="lg:col-span-3" />
            </>
          )}
        </section>

        {/* Row 3 */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12">
          <OpticalNetworkHealthTable links={links} terminals={terminals} loading={loading}
            className="lg:col-span-4"
            onSelectLink={(link) => { setSelectedTerminalId(null); setSelectedLinkId(link.id); }} />
          <CapacityTrafficIntelligence series={capacitySeries} loading={loading} className="lg:col-span-4" />
          {executive ? (
            <>
              <HumanApprovalActionCenter actions={visibleActions} loading={loading} className="lg:col-span-2" />
              <AgenticInvestigationWorkspace hypotheses={visibleHypotheses} loading={loading} className="lg:col-span-2" />
            </>
          ) : (
            <>
              <ChangeIntelligencePanel changes={visibleChanges} loading={loading} className="lg:col-span-2" />
              <LearningImprovementPanel learnings={learningRecords} loading={loading} className="lg:col-span-2" />
            </>
          )}
        </section>

        {/* Stage 2 — active workflow surface */}
        <Stage2WorkflowSection />

        {/* Row 4 */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <AgenticOperationalEventStream events={visibleEvents} loading={loading} className="lg:col-span-12" />
        </section>
      </div>
    </div>
  );
}

function Select({
  label, value, options, onChange,
}: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="flex flex-col gap-1 text-[11px] text-slate-600">
      <span className="font-medium uppercase tracking-wide text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded border border-slate-200 bg-white px-2 py-1 text-[12px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}
