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

import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  AlertTriangle, ChevronRight, Download, Info, Maximize2, Minimize2, MoreHorizontal,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, ToolbarButton } from "./components/NocPrimitives";
import {
  breadcrumb, featureContributions, forecastHorizons, governanceRecords, kpiMetrics,
  linkPredictions, modelActivity, modelEvidence, modelFeatures, modelSummary, pageSubtitle,
  panelSpecs, pipelineStages, products, recommendedActions, regions, scenarios, timeRanges,
  traditionalMonitoringGaps, trainingDatasets, trainingTabs, validationResults,
  type PanelSpec, type PipelineStageKey, type TrainingTab,
} from "./data/pliFixtures";

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
  label, value, deltaLabel, direction, intent, sparkline, description, loading,
}: {
  label: string; value: string; deltaLabel: string; direction: "up" | "down" | "flat";
  intent: "positive" | "negative" | "neutral"; sparkline: number[]; description: string; loading: boolean;
}) {
  const toneClass =
    intent === "positive" ? "text-emerald-700" : intent === "negative" ? "text-rose-700" : "text-slate-600";
  const stroke = intent === "positive" ? "#059669" : intent === "negative" ? "#e11d48" : "#64748b";
  return (
    <article
      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
      aria-label={`${label}. ${description}`}
    >
      <h3 className="text-[11.5px] font-medium text-slate-600">{label}</h3>
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
  spec, state, heightClass, className, children,
}: {
  spec: PanelSpec; state: PanelState; heightClass: string; className?: string; children?: React.ReactNode;
}) {
  const headingId = `pli-panel-${spec.id}`;
  const descId = `${headingId}-desc`;
  return (
    <section
      aria-labelledby={headingId}
      aria-describedby={descId}
      data-testid={`pli-panel-${spec.id}`}
      data-panel-state={state}
      className={cn("flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm", className)}
    >
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-200 px-4 py-2.5">
        <div className="min-w-0">
          <h2 id={headingId} className="text-sm font-semibold text-slate-900">{spec.title}</h2>
          <p id={descId} className="text-[11px] text-slate-500">{spec.description}</p>
        </div>
        <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
          Placeholder
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
              className="mt-1 rounded-md border border-rose-300 bg-white px-2 py-1 text-[11px] font-medium text-rose-700 shadow-sm hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              Retry
            </button>
          </div>
        )}

        {state === "ready" && (
          <div className="flex h-full flex-col">
            <div className="flex-1">{children}</div>
            <p className="mt-2 border-t border-dashed border-slate-200 pt-1.5 text-[10.5px] text-slate-500">
              Planned visual: {spec.visualType} · Target height {spec.desktopHeight} · Final graphics arrive in AIM-002.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function Reserved({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[80px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-3 text-center text-[11px] text-slate-500">
      {label}
    </div>
  );
}

/* --------------------------------- page ----------------------------------- */

export default function PredictiveOpticalLinkIntelligence() {
  /* page-level typed state */
  const [scenario, setScenario] = useState(scenarios[0].label);
  const [timeRange, setTimeRange] = useState<string>(timeRanges[1]);
  const [horizon, setHorizon] = useState<string>(forecastHorizons[1]);
  const [region, setRegion] = useState<string>(regions[0]);
  const [product, setProduct] = useState<string>(products[0]);
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<PipelineStageKey>("observe");
  const [trainingTab, setTrainingTab] = useState<TrainingTab>(trainingTabs[0]);
  const [explainOpen, setExplainOpen] = useState(false);
  const [whatIfOpen, setWhatIfOpen] = useState(false);
  const [playbackRunning, setPlaybackRunning] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [panelState, setPanelState] = useState<PanelState>("ready");
  const [actionsOpen, setActionsOpen] = useState(false);

  const activeScenario = useMemo(
    () => scenarios.find((s) => s.label === scenario) ?? scenarios[0],
    [scenario],
  );
  const spec = useMemo(() => Object.fromEntries(panelSpecs.map((p) => [p.id, p])), []);
  const loading = panelState === "loading";

  const groupedFeatures = useMemo(() => {
    const groups = ["Optical", "Environmental", "Network and Service", "Historical and Context"] as const;
    return groups.map((g) => ({ group: g, items: modelFeatures.filter((f) => f.group === g) }));
  }, []);

  return (
    <div
      data-testid="pli-page"
      className={cn(
        "w-full max-w-full space-y-4 overflow-x-hidden bg-white px-4 py-5 sm:px-6",
        fullScreen && "fixed inset-0 z-40 overflow-y-auto",
      )}
    >
      {/* ------------------------------ header ------------------------------ */}
      <header className="space-y-3">
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

          <div className="mx-1 hidden h-6 w-px bg-slate-200 lg:block" aria-hidden />

          <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
            <div><dt className="inline text-slate-500">Model version: </dt><dd className="inline font-semibold text-slate-900">{modelSummary.version}</dd></div>
            <div><dt className="inline text-slate-500">Last retrained: </dt><dd className="inline font-semibold text-slate-900">{modelSummary.lastRetrained}</dd></div>
            <div><dt className="inline text-slate-500">Model health: </dt><dd className="inline font-semibold text-slate-900">{modelSummary.health}</dd></div>
          </dl>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <ToolbarButton onClick={() => setExplainOpen(true)} active={explainOpen} title="Explain Model">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />Explain Model
            </ToolbarButton>
            <ToolbarButton onClick={() => setWhatIfOpen(true)} active={whatIfOpen} title="Run What-If">
              Run What-If
            </ToolbarButton>
            <ToolbarButton onClick={() => setPlaybackRunning((p) => !p)} active={playbackRunning} title="Scenario playback">
              {playbackRunning ? "Pause scenario" : "Play scenario"}
            </ToolbarButton>
            <ToolbarButton onClick={() => undefined} title="Export Model Report">
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
      <section aria-label="Model key performance indicators">
        <h2 className="sr-only">Model key performance indicators</h2>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {kpiMetrics.map((m) => (
            <KpiCard key={m.key} {...m} loading={loading} />
          ))}
        </div>
      </section>

      {/* --------------------------- primary layout ------------------------- */}
      <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-12">
        <PanelShell
          spec={spec.pipeline}
          state={panelState}
          heightClass="xl:min-h-[480px]"
          className="xl:col-span-7"
        >
          <ol className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:grid-cols-6">
            {pipelineStages.map((s) => (
              <li key={s.key}>
                <button
                  type="button"
                  aria-pressed={selectedStage === s.key}
                  onClick={() => setSelectedStage(s.key)}
                  className={cn(
                    "h-full w-full rounded-lg border px-2 py-1.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    selectedStage === s.key ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50",
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-[9px] font-semibold text-slate-700">
                      {s.index}
                    </span>
                    <span className="text-[12px] font-semibold text-slate-900">{s.title}</span>
                  </span>
                  <span className="mt-0.5 block text-[10.5px] text-slate-500">{s.caption}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            <Reserved label="Reserved for signal group cards" />
            <Reserved label="Reserved for feature engineering and anomaly detection cards" />
            <Reserved label="Reserved for risk model, impact and protected-action cards" />
          </div>
        </PanelShell>

        <div className="space-y-3 xl:col-span-5">
          <PanelShell spec={spec.chennai} state={panelState} heightClass="xl:min-h-[360px]">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
              <div className="sm:col-span-3"><Reserved label="Reserved for scenario risk map" /></div>
              <dl className="sm:col-span-2 space-y-1">
                {modelEvidence.map((e) => (
                  <div key={e.key} className="rounded border border-slate-200 bg-slate-50 px-2 py-1">
                    <dt className="text-[10px] uppercase tracking-wide text-slate-500">{e.label}</dt>
                    <dd className="text-[11.5px] font-medium text-slate-900">{e.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <p className="mt-2 text-[11px] text-slate-600">
              {activeScenario.headline} · {activeScenario.riskLabel} · Region {activeScenario.region}
            </p>
          </PanelShell>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PanelShell spec={spec.performance} state={panelState} heightClass="min-h-[260px]">
              <dl className="space-y-1">
                {validationResults.map((v) => (
                  <div key={v.key} className="flex items-baseline justify-between gap-2 border-b border-slate-100 py-0.5">
                    <dt className="text-[11px] text-slate-600">{v.label}</dt>
                    <dd className="text-[11.5px] font-semibold text-slate-900">{v.value}</dd>
                  </div>
                ))}
              </dl>
            </PanelShell>

            <PanelShell spec={spec.factors} state={panelState} heightClass="min-h-[260px]">
              <ul className="space-y-1">
                {featureContributions.map((f) => (
                  <li key={f.feature} className="flex items-baseline justify-between gap-2 border-b border-slate-100 py-0.5">
                    <span className="text-[11px] text-slate-600">{f.feature}</span>
                    <span className="text-[11.5px] font-semibold text-slate-900">{f.weightPct}%</span>
                  </li>
                ))}
              </ul>
            </PanelShell>
          </div>
        </div>
      </div>

      {/* --------------------------- lower analytics ------------------------ */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">
        <PanelShell spec={spec.training} state={panelState} heightClass="min-h-[260px]" className="xl:col-span-5">
          <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-1" role="tablist" aria-label="Model training and validation views">
            {trainingTabs.map((t) => (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={trainingTab === t}
                onClick={() => setTrainingTab(t)}
                className={cn(
                  "rounded px-2 py-1 text-[11px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  trainingTab === t ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <ul className="mt-2 space-y-1">
            {trainingDatasets.map((d) => (
              <li key={d.key} className="flex items-baseline justify-between gap-2 text-[11px]">
                <span className="text-slate-600">{d.label}</span>
                <span className="font-semibold text-slate-900">{d.sharePct}% · {d.samples}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2"><Reserved label={`Reserved for ${trainingTab} visual`} /></div>
        </PanelShell>

        <PanelShell spec={spec.horizon} state={panelState} heightClass="min-h-[260px]" className="xl:col-span-4">
          <Reserved label="Reserved for confidence decay chart across the forecast horizon" />
        </PanelShell>

        <PanelShell spec={spec.traditional} state={panelState} heightClass="min-h-[260px]" className="xl:col-span-3">
          <ul className="space-y-1">
            {traditionalMonitoringGaps.map((g) => (
              <li key={g} className="flex gap-1.5 text-[11px] text-slate-700">
                <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />{g}
              </li>
            ))}
          </ul>
        </PanelShell>
      </div>

      {/* ---------------------------- bottom strip -------------------------- */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <PanelShell spec={spec.inputs} state={panelState} heightClass="min-h-[200px]">
          <dl className="space-y-1.5">
            {groupedFeatures.map((g) => (
              <div key={g.group}>
                <dt className="text-[11px] font-semibold text-slate-800">{g.group}</dt>
                <dd className="text-[11px] text-slate-600">{g.items.map((i) => i.label).join(", ")}</dd>
              </div>
            ))}
          </dl>
        </PanelShell>

        <PanelShell spec={spec.output} state={panelState} heightClass="min-h-[200px]">
          <table className="w-full text-left text-[11px]">
            <caption className="sr-only">Placeholder per-link prediction records</caption>
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                <th scope="col" className="py-1">Link</th>
                <th scope="col" className="py-1">Risk</th>
                <th scope="col" className="py-1">Lead time</th>
                <th scope="col" className="py-1">Services</th>
              </tr>
            </thead>
            <tbody>
              {linkPredictions.map((l) => (
                <tr
                  key={l.linkId}
                  onClick={() => setSelectedLink(l.linkId === selectedLink ? null : l.linkId)}
                  className={cn("cursor-pointer border-t border-slate-100", selectedLink === l.linkId && "bg-blue-50")}
                >
                  <th scope="row" className="py-1 font-medium text-slate-900">{l.linkId}</th>
                  <td className="py-1 text-slate-700">{l.risk}</td>
                  <td className="py-1 text-slate-700">{l.leadTime}</td>
                  <td className="py-1 text-slate-700">{l.servicesExposed}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="mt-2 flex flex-wrap gap-1">
            {recommendedActions.map((a) => (
              <li key={a.key} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10.5px] text-slate-700">
                {a.label} · {a.approval}
              </li>
            ))}
          </ul>
        </PanelShell>

        <PanelShell spec={spec.governance} state={panelState} heightClass="min-h-[200px]">
          <dl className="space-y-1">
            {governanceRecords.map((r) => (
              <div key={r.key} className="flex items-baseline justify-between gap-2 border-b border-slate-100 py-0.5">
                <dt className="text-[11px] text-slate-600">{r.label}</dt>
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

      {/* --------------------------- drawer shells -------------------------- */}
      {(explainOpen || whatIfOpen) && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label={explainOpen ? "Explain Model" : "Run What-If"}
          className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-xl rounded-t-xl border border-slate-200 bg-white p-4 shadow-lg sm:right-4 sm:left-auto sm:bottom-4 sm:rounded-xl"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">{explainOpen ? "Explain Model" : "Run What-If"}</h2>
              <p className="mt-1 text-[11.5px] text-slate-600">
                Placeholder drawer. Model explanation, feature attribution and what-if simulation are implemented in a
                later stage.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setExplainOpen(false); setWhatIfOpen(false); }}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <p className="text-[10.5px] text-slate-500">
        Synthetic Taara-aligned demonstration. Values, sparklines and panel content are temporary fixtures for the
        AIM-001 page framework and do not represent deployed systems.
      </p>
    </div>
  );
}
