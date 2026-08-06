/**
 * Predictive Optical Link Intelligence — AIM-001 page framework.
 *
 * Internal capability: AI Modeling for Predictive Optical Link Protection.
 *
 * This stage establishes page structure, the white-background visual system,
 * responsive layout, panel proportions and loading placeholders only. No
 * operational charts, map rendering, predictive calculations, scenario
 * playback or model analytics are implemented here.
 */

import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  AlertTriangle, ChevronRight, Download, Info, Maximize2, Minimize2, MoreHorizontal,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { controlTransition, focusRing, surfaceTransition } from "./components/motion";
import { Select, ToolbarButton } from "./components/NocPrimitives";

import { PredictivePipeline } from "./pipeline/PredictivePipeline";
import { ChennaiWorkspace } from "./chennai/ChennaiWorkspace";
import { useAnalyticsState } from "./analytics/useAnalyticsState";
import { OperationalModelPerformance } from "./analytics/OperationalModelPerformance";
import { PredictiveFactorsChart } from "./analytics/PredictiveFactorsChart";
import { FeatureImpactWaterfall } from "./analytics/FeatureImpactWaterfall";
import { PredictionHorizonChart } from "./analytics/PredictionHorizonChart";
import { HighRiskLinksTable } from "./analytics/HighRiskLinksTable";
import { ThresholdTradeoffPanel } from "./analytics/ThresholdTradeoffPanel";
import { AnalyticsMetricDrawer } from "./analytics/AnalyticsMetricDrawer";
import { ModelLifecycleWorkspace } from "./lifecycle/ModelLifecycleWorkspace";
import { ACTIVE_VERSION } from "./lifecycle/lifecycleFixtures";
import type { LifecycleTab } from "./lifecycle/lifecycleTypes";
import { DEFAULT_ANALYTICS_LINK_ID, highRiskLinkRecords } from "./analytics/analyticsFixtures";
import type { AnalyticsPanelState } from "./analytics/AnalyticsPrimitives";
import type { PredictionOverrides } from "./chennai/chennaiGeojson";
import { useScenarioState } from "./scenario/useScenarioState";
import { ExplainModelDrawer } from "./scenario/ExplainModelDrawer";
import { TraditionalComparisonPanel } from "./scenario/TraditionalComparisonPanel";
import { ScenarioWorkspace } from "./scenario/ScenarioWorkspace";
import { exportExplainReport } from "./scenario/scenarioExport";
import { SCENARIO_LINK_ID } from "./scenario/scenarioFixtures";

import {
  breadcrumb, forecastHorizons, governanceRecords, kpiMetrics, lifecycleSummary,
  modelActivity, modelEvidence, modelSummary, pageSubtitle,
  panelSpecs, products, regions, scenarios, syntheticNotice, timeRanges,
  traditionalMonitoringGaps, validationResults,
  type PanelSpec, type ViewingMode,
} from "./data/pliFixtures";

import {
  Disclosure, OperationalConfidenceCard, OperationalSummaryBar, OperationalTrustCard,
  RecommendedActionCard, ViewingModeSwitch,
} from "./executive/ExecutivePrimitives";

/* ------------------------------ shared parts ------------------------------ */

type PanelState = "ready" | "loading" | "empty" | "error";
const panelStates: PanelState[] = ["ready", "loading", "empty", "error"];

function Sparkline({ points, tone }: { points: number[]; tone: string }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const d = points
    .map((p, i) => `${(i / (points.length - 1)) * 100},${28 - ((p - min) / span) * 24 - 2}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="h-7 w-full" role="img"
      aria-label="Temporary fixture sparkline, illustrative trend only" data-fixture="true">
      <polyline points={d} fill="none" stroke={tone} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function KpiCard({
  label, value, deltaLabel, direction, intent, sparkline, description, loading, selected, onSelect,
}: {
  label: string; value: string; deltaLabel: string; direction: "up" | "down" | "flat";
  intent: "positive" | "negative" | "neutral"; sparkline: number[]; description: string; loading: boolean;
  selected?: boolean; onSelect?: () => void;
}) {
  const toneClass =
    intent === "positive" ? "text-emerald-700" : intent === "negative" ? "text-rose-700" : "text-slate-600";
  const stroke = intent === "positive" ? "#059669" : intent === "negative" ? "#e11d48" : "#64748b";
  return (
    <article
      className={cn(
        "rounded-lg border bg-white p-3 shadow-sm hover:shadow-md",
        surfaceTransition,
        selected ? "border-blue-400 ring-1 ring-blue-300" : "border-slate-200",
      )}
      aria-label={`${label}. ${description}`}
      data-selected={selected ? "true" : "false"}
    >
      <h3 className="text-[11.5px] font-medium text-slate-600">
        <button
          type="button"
          aria-pressed={Boolean(selected)}
          onClick={onSelect}
          className={cn("w-full rounded text-left", focusRing)}
        >
          {label}
        </button>
      </h3>

      {loading ? (
        <>
          <div className="mt-2 h-6 w-20 animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-7 w-full animate-pulse rounded bg-slate-50" />
        </>
      ) : (
        <>
          <div className="mt-1 text-[22px] font-semibold leading-tight text-slate-900">{value}</div>
          <div className={cn("mt-0.5 text-[11px] font-medium", toneClass)}>
            <span aria-hidden>{direction === "up" ? "▲" : direction === "down" ? "▼" : "■"}</span>{" "}
            <span>{direction === "up" ? "Up" : direction === "down" ? "Down" : "Flat"} {deltaLabel}</span>
          </div>
          <Sparkline points={sparkline} tone={stroke} />
        </>
      )}
    </article>
  );
}

function PanelShell({
  spec, state, heightClass, className, functional, children,
}: {
  spec: PanelSpec; state: PanelState; heightClass: string; className?: string; functional?: boolean;
  children?: React.ReactNode;
}) {
  const headingId = `pli-panel-${spec.id}`;
  const descId = `${headingId}-desc`;
  return (
    <section
      aria-labelledby={headingId}
      aria-describedby={descId}
      data-testid={`pli-panel-${spec.id}`}
      data-panel-state={state}
      className={cn("flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm", surfaceTransition, className)}
    >
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-200 px-4 py-2.5">
        <div className="min-w-0">
          <h2 id={headingId} className="text-sm font-semibold text-slate-900">{spec.title}</h2>
          <p id={descId} className="text-[11px] text-slate-500">{spec.description}</p>
        </div>
        <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
          {functional ? "Synthetic data" : "Placeholder"}
        </span>
      </header>

      <div className={cn("flex-1 p-4", heightClass)}>
        {state === "loading" && (
          <div className="flex h-full flex-col gap-2" role="status" aria-live="polite">
            <span className="sr-only">Loading {spec.title}</span>
            <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
            <div className="flex-1 animate-pulse rounded bg-slate-50" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
          </div>
        )}

        {state === "empty" && (
          <div className="flex h-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-4 text-center">
            <Info className="h-4 w-4 text-slate-400" aria-hidden />
            <p className="text-[12px] font-medium text-slate-700">No data for the current selection</p>
            <p className="max-w-sm text-[11px] text-slate-500">
              Adjust the scenario, region, product or forecast horizon to populate {spec.title}.
            </p>
          </div>
        )}

        {state === "error" && (
          <div
            role="alert"
            className="flex h-full flex-col items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50/70 p-4 text-center"
          >
            <AlertTriangle className="h-4 w-4 text-rose-600" aria-hidden />
            <p className="text-[12px] font-medium text-rose-800">{spec.title} could not be loaded</p>
            <p className="max-w-sm text-[11px] text-rose-700">
              The model service did not respond. Retry, or continue with the remaining panels.
            </p>
            <button
              type="button"
              className={cn(
                "mt-1 rounded-md border border-rose-300 bg-white px-2 py-1 text-[11px] font-medium text-rose-700 shadow-sm hover:bg-rose-50",
                controlTransition,
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500",
              )}
            >

              Retry
            </button>
          </div>
        )}

        {state === "ready" && (
          <div className="flex h-full flex-col">
            <div className="flex-1">{children}</div>
            {!functional && (
              <p className="mt-2 border-t border-dashed border-slate-200 pt-1.5 text-[10.5px] text-slate-500">
                Planned visual: {spec.visualType} · Target height {spec.desktopHeight} · Final graphics arrive in a later stage.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/** Bottom governance strip item to lifecycle tab mapping. */
const governanceTabTargets: Record<string, LifecycleTab> = {
  owner: "Governance",
  review: "Governance",
  approval: "Governance",
  lineage: "Governance",
  drift: "Drift",
  retention: "Governance",
  training: "Training Data",
  validation: "Validation",
  explainability: "Explainability",
  rollback: "Governance",
};

/* --------------------------------- page ----------------------------------- */

export default function PredictiveOpticalLinkIntelligence() {
  /* page-level typed state */
  const [scenario, setScenario] = useState(scenarios[0].label);
  const [timeRange, setTimeRange] = useState<string>(timeRanges[1]);
  const [horizon, setHorizon] = useState<string>(forecastHorizons[1]);
  const [region, setRegion] = useState<string>(regions[0]);
  const [product, setProduct] = useState<string>(products[0]);
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [lifecycleTab, setLifecycleTab] = useState<LifecycleTab>("Training Data");
  const [activeModelVersion, setActiveModelVersion] = useState<string>(ACTIVE_VERSION);
  const [whatIfOpen, setWhatIfOpen] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [panelState, setPanelState] = useState<PanelState>("ready");
  const [actionsOpen, setActionsOpen] = useState(false);
  /* AIM-010 — executive experience state. */
  const [viewMode, setViewMode] = useState<ViewingMode>("Operational");
  const [contributionView, setContributionView] = useState<"Selected Link" | "Global">("Selected Link");

  const activeScenario = useMemo(
    () => scenarios.find((s) => s.label === scenario) ?? scenarios[0],
    [scenario],
  );
  const spec = useMemo(() => Object.fromEntries(panelSpecs.map((p) => [p.id, p])), []);
  const loading = panelState === "loading";

  /* ---------------------------- AIM-004 analytics --------------------------- */

  const activeLinkId = selectedLink ?? DEFAULT_ANALYTICS_LINK_ID;
  const analytics = useAnalyticsState(activeLinkId);
  const [analyticsState, setAnalyticsState] = useState<AnalyticsPanelState>("ready");
  const [metricDrawerOpen, setMetricDrawerOpen] = useState(false);
  const [pipelineThresholdPct, setPipelineThresholdPct] = useState(80);
  const [pushedThresholdPct, setPushedThresholdPct] = useState<number | null>(null);
  const [chennaiPredictions, setChennaiPredictions] = useState<PredictionOverrides>({});
  const [notice, setNotice] = useState<string>("");

  const factorToFeatureId: Record<string, string> = useMemo(
    () => ({
      visibility: "visibility-distance-ratio",
      fog: "atmospheric-attenuation-index",
      humidity: "atmospheric-attenuation-index",
      "link-margin": "optical-reserve-margin",
      "degradation-rate": "link-degradation-rate",
      attenuation: "atmospheric-attenuation-index",
      "received-power": "optical-reserve-margin",
      rain: "atmospheric-attenuation-index",
      temperature: "atmospheric-attenuation-index",
      wind: "atmospheric-attenuation-index",
      historical: "historical-similarity-score",
      other: "multi-signal-correlation",
    }),
    [],
  );

  const selectedRecord = useMemo(
    () => highRiskLinkRecords.find((r) => r.linkId === activeLinkId) ?? null,
    [activeLinkId],
  );
  const livePrediction = chennaiPredictions[activeLinkId] ?? null;
  const selectedLinkRisk = selectedRecord?.riskScore ?? livePrediction?.riskProbability ?? 0.5;
  const whatIfRisk = livePrediction && selectedRecord && Math.abs(livePrediction.riskProbability - selectedRecord.riskScore) > 0.001
    ? livePrediction.riskProbability
    : null;

  const highlightFeatureId = analytics.factorKey ? factorToFeatureId[analytics.factorKey] ?? null : null;

  const handleSelectLink = (linkId: string) => setSelectedLink(linkId);
  const handleNotify = (message: string) => { setNotice(message); analytics.announce(message); };
  const handleMetricDrawer = (key: string) => { analytics.selectMetric(key); setMetricDrawerOpen(true); };
  const handleKpi = (key: string) => {
    analytics.selectKpi(key);
    if (key === "false-positive" || key === "lead-time" || key === "accuracy" || key === "services-protected") {
      setMetricDrawerOpen(true);
    }
  };
  const handleThresholdPush = (pct: number) => { setPushedThresholdPct(pct); setPipelineThresholdPct(pct); };

  const focusLifecycleTab = (tab: LifecycleTab) => {
    setLifecycleTab(tab);
    document.getElementById("model-lifecycle-workspace")?.scrollIntoView?.({ block: "start" });
  };

  /* ------------------------ AIM-006 scenario and explain -------------------- */

  const scenarioContext = useMemo(
    () => ({
      selectedLinkId: activeLinkId,
      region,
      product,
      horizon,
      modelVersion: activeModelVersion,
      thresholdPct: pipelineThresholdPct,
    }),
    [activeLinkId, region, product, horizon, activeModelVersion, pipelineThresholdPct],
  );
  const scenarioState = useScenarioState(scenarioContext);
  const scenarioStageIndex = scenarioState.stageIndex;
  const scenarioFocus = scenarioState.stage.focus;
  const scenarioSetPanelState = scenarioState.setPanelState;

  /* Scenario progress drives the shared page selections owned by earlier stages. */
  useEffect(() => {
    if (scenarioStageIndex >= 4) setSelectedLink(SCENARIO_LINK_ID);
  }, [scenarioStageIndex]);

  useEffect(() => {
    if (scenarioFocus === "governance") setLifecycleTab("Governance");
  }, [scenarioFocus]);

  useEffect(() => {
    scenarioSetPanelState(panelState);
  }, [panelState, scenarioSetPanelState]);

  const explainOpen = scenarioState.explainOpen;
  const setExplainOpen = scenarioState.setExplainOpen;


  return (
    <div
      data-testid="pli-page"
      className={cn(
        "w-full max-w-full space-y-4 overflow-x-hidden bg-white px-4 py-5 sm:px-6",
        fullScreen && "fixed inset-0 z-40 overflow-y-auto",
      )}
    >
      {/* ------------------------------ header ------------------------------ */}
      <header data-testid="pli-header" className="space-y-3">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
            {breadcrumb.map((crumb, i) => (
              <li key={crumb} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3 text-slate-300" aria-hidden />}
                {i === breadcrumb.length - 1 ? (
                  <span aria-current="page" className="font-medium text-slate-800">{crumb}</span>
                ) : i === breadcrumb.length - 2 ? (
                  <RouterLink to="/agentic-sre-noc/global-link-health-twin" className="hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    {crumb}
                  </RouterLink>
                ) : (
                  <span>{crumb}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              Predictive Optical Link Intelligence
            </h1>
            <p className="mt-0.5 max-w-3xl text-[12.5px] text-slate-600">{pageSubtitle}</p>
            <p className="mt-1 text-[11px] text-slate-500">
              {modelSummary.capability} · Owner {modelSummary.owner}
            </p>
            <p data-testid="pli-synthetic-notice" className="mt-1 text-[10.5px] text-slate-500">
              {syntheticNotice}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              {modelSummary.state}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
              {modelSummary.environment}
            </span>
          </div>
        </div>

        {/* control bar */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2">
          <Select label="Scenario" value={scenario} options={scenarios.map((s) => s.label)} onChange={setScenario} />
          <Select label="Time range" value={timeRange} options={timeRanges} onChange={setTimeRange} />
          <Select label="Forecast horizon" value={horizon} options={forecastHorizons} onChange={setHorizon} />
          <Select label="Region" value={region} options={regions} onChange={setRegion} />
          <Select label="Product" value={product} options={products} onChange={setProduct} />
          <Select
            label="Panel state"
            value={panelState}
            options={panelStates}
            onChange={(v) => setPanelState(v as PanelState)}
          />

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-explain-trigger="true"
              title="Explain Model"
              aria-pressed={explainOpen}
              onClick={() => { setExplainOpen(true); scenarioState.setExplainTab("Model Overview"); }}
              className={cn(
                "flex min-h-11 items-center gap-1.5 rounded-md border px-2.5 text-[11.5px] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-0 sm:py-1.5",
                explainOpen ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />Explain Model
            </button>
            <ToolbarButton onClick={() => setWhatIfOpen(true)} active={whatIfOpen} title="Run What-If">
              Run What-If
            </ToolbarButton>
            <ToolbarButton
              onClick={() => {
                scenarioState.setPlaying(true);
                document.getElementById("chennai-protection-scenario")?.scrollIntoView?.({ block: "start" });
              }}
              active={scenarioState.playing}
              title="Run Chennai Predictive Protection Scenario"
            >
              Run Chennai Predictive Protection Scenario
            </ToolbarButton>
            <ToolbarButton
              onClick={() => scenarioState.setExportMessage(exportExplainReport(scenarioState.activeEvidence).message)}
              title="Export Model Report"
            >
              <Download className="h-3.5 w-3.5" aria-hidden />Export Model Report
            </ToolbarButton>

            <ToolbarButton onClick={() => setFullScreen((f) => !f)} active={fullScreen} title="Full screen">
              {fullScreen ? <Minimize2 className="h-3.5 w-3.5" aria-hidden /> : <Maximize2 className="h-3.5 w-3.5" aria-hidden />}
              {fullScreen ? "Exit full screen" : "Full screen"}
            </ToolbarButton>
            <ToolbarButton onClick={() => setActionsOpen((a) => !a)} active={actionsOpen} title="Actions">
              <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />Actions
            </ToolbarButton>
          </div>
        </div>

        {actionsOpen && (
          <div className="rounded-lg border border-slate-200 bg-white p-2 text-[11.5px] text-slate-600 shadow-sm">
            Placeholder actions menu. Share view, subscribe to alerts, open governance record and download evidence
            bundle arrive in a later stage.
          </div>
        )}
      </header>

      {/* ------------------------------ KPI row ----------------------------- */}
      <section aria-label="Operational key performance indicators">
        <h2 className="sr-only">Operational key performance indicators</h2>
        <div data-testid="pli-kpis" className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {kpiMetrics.map((m) =>
            m.key === "operational-trust" ? (
              <OperationalTrustCard
                key={m.key}
                selected={analytics.kpiKey === m.key}
                onSelect={() => handleKpi(m.key)}
              />
            ) : (
              <KpiCard
                key={m.key}
                {...m}
                loading={loading}
                selected={analytics.kpiKey === m.key}
                onSelect={() => handleKpi(m.key)}
              />
            ),
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => { analytics.resetKpi(); setMetricDrawerOpen(false); }}
            className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10.5px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Reset KPI Selection
          </button>
          <Select
            label="Analytics state"
            value={analyticsState}
            options={["ready", "loading", "empty", "error"]}
            onChange={(v) => setAnalyticsState(v as AnalyticsPanelState)}
          />
          <p aria-live="polite" className="text-[10.5px] text-slate-600">{analytics.announcement || notice}</p>
        </div>
      </section>

      {/* -------------------- Section 1, operational summary ----------------- */}
      <OperationalSummaryBar />

      {/* --------------------- Section 2, current situation ------------------ */}
      <section aria-labelledby="pli-current-situation" data-testid="pli-current-situation">
        <h2 id="pli-current-situation" className="sr-only">Current situation</h2>
        <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-12">
          <div className="min-w-0 xl:col-span-5">
            <PanelShell spec={spec.highrisk} state={panelState} heightClass="min-h-[320px]" functional>
              <div data-testid="analytics-highrisk" data-analytics-state={analyticsState} className="min-w-0">
                <HighRiskLinksTable
                  state={analytics}
                  selectedLinkId={activeLinkId}
                  panelState={analyticsState}
                  onSelectLink={handleSelectLink}
                  onNotify={handleNotify}
                />
              </div>
            </PanelShell>
          </div>

          <div className="min-w-0 xl:col-span-7">
            <PanelShell spec={spec.chennai} state={panelState} heightClass="xl:min-h-[360px]">
              <ChennaiWorkspace
                selectedLinkId={selectedLink}
                onSelectLink={setSelectedLink}
                whatIfOpen={whatIfOpen}
                onWhatIfOpenChange={setWhatIfOpen}
                onPredictionsChange={setChennaiPredictions}
              />
              <dl className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
                {modelEvidence
                  .filter((e) => ["driver", "impact", "confidence", "services", "window"].includes(e.key))
                  .map((e) => (
                    <div key={e.key} className="rounded border border-slate-200 bg-slate-50 px-2 py-1">
                      <dt className="text-[10px] uppercase tracking-wide text-slate-500">{e.label}</dt>
                      <dd className="text-[11.5px] font-medium text-slate-900">{e.detail}</dd>
                    </div>
                  ))}
              </dl>
              <p className="mt-2 text-[11px] text-slate-600">
                {activeScenario.headline} · {activeScenario.riskLabel} · Region {activeScenario.region}
              </p>
            </PanelShell>
          </div>
        </div>
      </section>

      {/* -------------------- Section 3, recommended action ------------------ */}
      <section aria-labelledby="pli-recommendation-section" className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <h2 id="pli-recommendation-section" className="sr-only">Recommended action and operational confidence</h2>
        <div className="min-w-0 xl:col-span-7">
          <RecommendedActionCard
            onExplain={() => { setExplainOpen(true); scenarioState.setExplainTab("Current Prediction"); }}
          />
        </div>
        <div className="min-w-0 xl:col-span-5">
          <OperationalConfidenceCard />
        </div>
      </section>

      {/* -------------------- Section 4, engineering analysis ---------------- */}
      <section aria-labelledby="pli-engineering-analysis" className="space-y-3">
        <h2 id="pli-engineering-analysis" className="text-sm font-semibold text-slate-900">
          Engineering Analysis
        </h2>
        <p className="-mt-2 text-[11.5px] text-slate-600">Why the prediction model reaches this conclusion.</p>

        <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-12">
          <PanelShell
            spec={spec.pipeline}
            state={panelState}
            heightClass="xl:min-h-[480px]"
            className="xl:col-span-12"
          >
            <PredictivePipeline
              externalLinkId={activeLinkId}
              onLinkChange={setSelectedLink}
              externalFeatureId={highlightFeatureId}
              onThresholdChange={setPipelineThresholdPct}
              externalThresholdPct={pushedThresholdPct}
            />
          </PanelShell>

          <PanelShell
            spec={spec.impact}
            state={panelState}
            heightClass="min-h-[320px]"
            className="xl:col-span-12"
            functional
          >
            <div className="mb-2 inline-flex overflow-hidden rounded border border-slate-200" role="group" aria-label="Feature contribution scope">
              {(["Selected Link", "Global"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={contributionView === v}
                  onClick={() => setContributionView(v)}
                  className={cn(
                    "px-2 py-1 text-[11px] font-medium",
                    controlTransition,
                    contributionView === v ? "bg-blue-600 text-white" : "bg-white text-slate-700 hover:bg-slate-50",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            {contributionView === "Selected Link" ? (
              <div data-testid="analytics-impact" data-analytics-state={analyticsState} className="min-w-0">
                <FeatureImpactWaterfall
                  state={analytics}
                  selectedLinkId={activeLinkId}
                  selectedLinkRisk={selectedLinkRisk}
                  horizonLabel={`Next ${analytics.horizonHours} Hours`}
                  whatIfRisk={whatIfRisk}
                  panelState={analyticsState}
                  onFactorSelected={(key) => handleNotify(key ? `Factor ${key} selected.` : "Factor selection cleared.")}
                  onNotify={handleNotify}
                />
              </div>
            ) : (
              <div data-testid="analytics-factors" data-analytics-state={analyticsState} className="min-w-0">
                <PredictiveFactorsChart
                  state={analytics}
                  selectedLinkId={activeLinkId}
                  selectedLinkRisk={selectedLinkRisk}
                  panelState={analyticsState}
                  onFactorSelected={(key) => handleNotify(key ? `Factor ${key} selected.` : "Factor selection cleared.")}
                  onNotify={handleNotify}
                />
              </div>
            )}
          </PanelShell>
        </div>
      </section>

      {/* ---------------------- Section 5, model analytics ------------------- */}
      <section aria-labelledby="pli-model-analytics" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="pli-model-analytics" className="text-sm font-semibold text-slate-900">Model Analytics</h2>
          <ViewingModeSwitch mode={viewMode} onChange={setViewMode} />
        </div>

        <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
          <PanelShell spec={spec.performance} state={panelState} heightClass="min-h-[300px]" functional>
            <div data-testid="analytics-performance" data-analytics-state={analyticsState} className="min-w-0">
              <OperationalModelPerformance
                state={analytics}
                panelState={analyticsState}
                onOpenMetricDrawer={handleMetricDrawer}
                onNotify={handleNotify}
              />
              {viewMode === "Data Science" && (
                <dl data-testid="pli-data-science-metrics" className="mt-2 grid grid-cols-2 gap-1.5">
                  {validationResults.map((v) => (
                    <div key={v.key} className="rounded border border-blue-200 bg-blue-50 px-2 py-1">
                      <dt className="text-[10px] uppercase tracking-wide text-blue-700">{v.label}</dt>
                      <dd className="text-[11.5px] font-medium text-slate-900">{v.value}</dd>
                    </div>
                  ))}
                  <div className="rounded border border-blue-200 bg-blue-50 px-2 py-1">
                    <dt className="text-[10px] uppercase tracking-wide text-blue-700">Calibration error</dt>
                    <dd className="text-[11.5px] font-medium text-slate-900">0.021 expected calibration error</dd>
                  </div>
                  <div className="rounded border border-blue-200 bg-blue-50 px-2 py-1">
                    <dt className="text-[10px] uppercase tracking-wide text-blue-700">ROC AUC</dt>
                    <dd className="text-[11.5px] font-medium text-slate-900">0.964</dd>
                  </div>
                </dl>
              )}
            </div>
          </PanelShell>

          <PanelShell spec={spec.horizon} state={panelState} heightClass="min-h-[300px]" functional>
            <div data-testid="analytics-horizon" data-analytics-state={analyticsState} className="min-w-0">
              <PredictionHorizonChart
                state={analytics}
                selectedLinkId={activeLinkId}
                panelState={analyticsState}
                onNotify={handleNotify}
              />
            </div>
          </PanelShell>
        </div>

        <Disclosure
          id="threshold"
          title="Advanced: threshold trade-off and technical metrics"
          summary={
            <p className="text-[11px] text-slate-600">
              Confidence threshold {pipelineThresholdPct}%. Expand to review precision, recall and false-positive trade-offs.
            </p>
          }
        >
          <div data-testid="analytics-threshold" data-analytics-state={analyticsState} className="min-w-0">
            <ThresholdTradeoffPanel
              state={analytics}
              pipelineThresholdPct={pipelineThresholdPct}
              onThresholdChange={handleThresholdPush}
            />
          </div>
          {viewMode === "Engineering" && (
            <p className="mt-2 text-[11px] text-slate-600">
              Feature engineering detail is available in the Engineering Analysis pipeline, Engineer stage.
            </p>
          )}
        </Disclosure>
      </section>

      {/* ------------------------- Section 6, lifecycle ---------------------- */}
      <section aria-labelledby="pli-lifecycle-section" className="space-y-3">
        <h2 id="pli-lifecycle-section" className="text-sm font-semibold text-slate-900">Lifecycle</h2>
        <Disclosure
          id="lifecycle"
          title="Model lifecycle, governance and validation"
          summary={
            <dl className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
              {lifecycleSummary.map((l) => (
                <div key={l.key} className="rounded border border-slate-200 bg-white px-2 py-1">
                  <dt className="text-[10px] uppercase tracking-wide text-slate-500">{l.label}</dt>
                  <dd className="text-[11.5px] font-medium text-slate-900">
                    {l.key === "version" ? <span data-testid="pli-active-version">{activeModelVersion}</span> : l.value}
                  </dd>
                </div>
              ))}
            </dl>
          }
        >
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            <PanelShell
              spec={spec.training}
              state={panelState}
              heightClass="min-h-[260px]"
              className="xl:col-span-8"
              functional
            >
              <div id="model-lifecycle-workspace" data-testid="model-lifecycle-workspace" className="min-w-0">
                <ModelLifecycleWorkspace
                  context={{
                    region,
                    product,
                    horizon,
                    selectedLinkId: selectedLink,
                    thresholdPct: pipelineThresholdPct,
                    tab: lifecycleTab,
                    onTabChange: setLifecycleTab,
                    activeVersion: activeModelVersion,
                    onActiveVersionChange: setActiveModelVersion,
                  }}
                />
              </div>
            </PanelShell>

            <PanelShell spec={spec.governance} state={panelState} heightClass="min-h-[200px]" className="xl:col-span-4">
              <dl className="space-y-1">
                {governanceRecords.map((r) => (
                  <div key={r.key} className="flex items-baseline justify-between gap-2 border-b border-slate-100 py-0.5">
                    <dt className="text-[11px] text-slate-600">
                      <button
                        type="button"
                        onClick={() => focusLifecycleTab(governanceTabTargets[r.key] ?? "Governance")}
                        className="text-left underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        {r.label}
                      </button>
                    </dt>
                    <dd className="text-[11.5px] font-medium text-slate-900">{r.value}</dd>
                  </div>
                ))}
              </dl>
              <ul className="mt-2 space-y-0.5 text-[10.5px] text-slate-600">
                {modelActivity.map((a) => (
                  <li key={a.at}>{a.at} · {a.actor} · {a.summary}</li>
                ))}
              </ul>
            </PanelShell>
          </div>
        </Disclosure>
      </section>


      <AnalyticsMetricDrawer
        open={metricDrawerOpen}
        metricKey={analytics.metricKey}
        onClose={() => setMetricDrawerOpen(false)}
        onSelectLink={handleSelectLink}
      />

      {/* --------------------------- drawer shells -------------------------- */}
      <ExplainModelDrawer state={scenarioState} />

      {whatIfOpen && !explainOpen && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Run What-If"
          className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-xl rounded-t-xl border border-slate-200 bg-white p-4 shadow-lg sm:right-4 sm:left-auto sm:bottom-4 sm:rounded-xl"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Run What-If</h2>
              <p className="mt-1 text-[11.5px] text-slate-600">
                What-If simulation runs inside the Chennai scenario workspace. Adjust drivers there to compare modelled
                risk against the current forecast.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setWhatIfOpen(false)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      )}



    </div>
  );
}
