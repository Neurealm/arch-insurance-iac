/** Organizational Learning — operational panels. Reuses ECF panel and table conventions. */

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Pill, Row, type Tone } from "../persona-studio/primitives";
import { Panel, EmptyState } from "../cognitive-memory/panels";
import {
  assumptionEvaluations, causalDimensionLabels, causalFor, contradictions, controlEffectiveness,
  decisionContext, evidenceById, evidenceRecords, expectations, historyEvents, learningCandidates,
  learningPackage, learningQuality, lifecycleCallouts, matrixRows, mitigationEffectiveness, observations,
  olKpis, olStages, olTone, patterns, personaNameById, relatedKnowledge, riskRealizations, stageQueueRows,
  stageTabs, unexpectedConsequences, varianceDimensions, varianceSummary, variances,
  type LearningCandidate, type MatrixRow, type OlDerivedState, type OrganizationalLearningActivity,
  type OrganizationalLearningAnalysis, type OrganizationalLearningStage, type StageTab,
} from "./data";

export type Density = "compact" | "standard" | "comfortable";
export { Panel, EmptyState };

const pad = (d: Density) => (d === "compact" ? "py-0.5" : d === "comfortable" ? "py-2" : "py-1");

export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th scope="col" className={cn("whitespace-nowrap px-2 py-1 text-left font-medium text-slate-500", className)}>{children}</th>;
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-2 align-top text-slate-700", className)}>{children}</td>;
}

/* ==================================================================== KPIs */

export function KpiRow({ focus, onSelect }: { focus: string | null; onSelect: (id: string) => void }) {
  return (
    <TooltipProvider delayDuration={150}>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        {olKpis.map((k) => (
          <Tooltip key={k.id}>
            <TooltipTrigger asChild>
              <button type="button" onClick={() => onSelect(k.id)} aria-pressed={focus === k.id}
                className={cn("rounded-xl border bg-white p-2 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  focus === k.id ? "border-blue-400 ring-1 ring-blue-200" : "border-slate-200 hover:border-slate-300")}>
                <p className="text-[10.5px] font-medium uppercase tracking-wide text-slate-500">{k.label}</p>
                <p className="mt-0.5 text-[19px] font-bold leading-none text-slate-900">{k.value}</p>
                <p className="mt-1 text-[10.5px] text-slate-500">{k.supporting}</p>
                <div className="mt-1 flex items-center justify-between gap-1">
                  <Pill label={k.status} tone={olTone(k.status)} />
                  <span className="text-[10px] text-slate-400">{k.target ?? k.trend}</span>
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-[11px]">{k.tooltip} Trend {k.trend}.</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

/* =============================================================== lifecycle */

export function LifecyclePanel({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <Panel id="panel-lifecycle" title="Organizational Learning Lifecycle"
      subtitle="Fourteen governed stages from decision context to learning package">
      <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4 xl:grid-cols-7">
        {olStages.map((s) => (
          <button key={s.id} type="button" onClick={() => onSelect(s.id)} aria-pressed={selected === s.id}
            className={cn("rounded-lg border p-1.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              selected === s.id ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300")}>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[9.5px] font-semibold text-slate-400">{s.sequence}</span>
              <Pill label={s.status} tone={olTone(s.status)} />
            </div>
            <p className="mt-0.5 text-[11px] font-medium leading-tight text-slate-800">{s.name}</p>
            <p className="text-[10px] text-slate-500">{s.detail}</p>
            <p className="mt-0.5 text-[9.5px] text-slate-400">{s.successRate}% · {s.averageDuration} avg · p95 {s.p95Duration}</p>
          </button>
        ))}
      </div>
      <ul className="mt-2 space-y-1">
        {lifecycleCallouts.map((c) => (
          <li key={c} className="flex items-start gap-1.5 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-800">
            <span aria-hidden>•</span><span>{c}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* =========================================================== selected stage */

export function SelectedStagePanel({ stage }: { stage: OrganizationalLearningStage }) {
  const [tab, setTab] = useState<StageTab>("Overview");
  return (
    <Panel id="panel-stage" title={`Selected Learning Stage · ${stage.name}`}
      subtitle={`Owner ${stage.owner} · ${stage.slaStatus}`}
      actions={<Pill label={stage.status} tone={olTone(stage.status)} />}>
      <div className="grid grid-cols-2 gap-x-4 md:grid-cols-4 xl:grid-cols-7">
        <Row label="Status" value={stage.status} />
        <Row label="Decisions Processing" value={stage.processedCount.toLocaleString()} />
        <Row label="Outcome Metrics Compared" value={(stage.processedCount * 6).toLocaleString()} />
        <Row label="Material Variances" value="74" />
        <Row label="Positive Variances" value="18" />
        <Row label="Negative Variances" value="39" />
        <Row label="Mixed Variances" value="17" />
        <Row label="Evidence Required" value={stage.warningCount} />
        <Row label="Average Duration" value={stage.averageDuration} />
        <Row label="P95 Duration" value={stage.p95Duration} />
        <Row label="Confidence" value={`${stage.successRate}%`} />
        <Row label="SLA" value={stage.slaStatus} />
        <Row label="Owner" value={stage.owner} />
        <Row label="Throughput" value={stage.throughput} />
      </div>

      <div className="mt-2 flex flex-wrap gap-1 border-b border-slate-200" role="tablist" aria-label="Stage detail">
        {stageTabs.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)}
            className={cn("rounded-t px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              tab === t ? "border-b-2 border-blue-600 font-medium text-blue-700" : "text-slate-500 hover:text-slate-700")}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-2 overflow-x-auto">
        {tab === "Overview" && (
          <p className="text-[11.5px] text-slate-600">
            {stage.detail}. This stage compares each recorded expectation against its observed outcome and records the
            resulting variance without altering the historical decision context.
          </p>
        )}
        {tab === "Queue" && (
          <table className="w-full text-[11px]">
            <thead><tr className="border-b border-slate-200">
              <Th>Learning Analysis ID</Th><Th>Decision</Th><Th>Work Item</Th><Th>Metric</Th><Th>Expected</Th>
              <Th>Observed</Th><Th>Variance</Th><Th>Severity</Th><Th>Confidence</Th><Th>Status</Th>
            </tr></thead>
            <tbody>
              {stageQueueRows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <Td>{r.analysis}</Td><Td>{r.decision}</Td><Td>{r.workItem}</Td><Td>{r.metric}</Td>
                  <Td>{r.expected}</Td><Td>{r.observed}</Td><Td>{r.variance}</Td>
                  <Td><Pill label={r.severity} tone={olTone(r.severity)} /></Td>
                  <Td>{r.confidence}%</Td><Td><Pill label={r.status} tone={olTone(r.status)} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "Expected Outcomes" && (
          <table className="w-full text-[11px]">
            <thead><tr className="border-b border-slate-200">
              <Th>Decision</Th><Th>Metric</Th><Th>Baseline</Th><Th>Expected Value</Th><Th>Expected Range</Th>
              <Th>Observation Window</Th><Th>Owner</Th>
            </tr></thead>
            <tbody>{expectations.map((e) => (
              <tr key={e.id} className="border-b border-slate-100">
                <Td>{e.decisionId}</Td><Td>{e.metric}</Td><Td>{e.baseline}</Td><Td>{e.expectedValue}</Td>
                <Td>{e.expectedRange}</Td><Td>{e.observationWindow}</Td><Td>{e.owner}</Td>
              </tr>
            ))}</tbody>
          </table>
        )}
        {tab === "Observed Outcomes" && (
          <table className="w-full text-[11px]">
            <thead><tr className="border-b border-slate-200">
              <Th>Decision</Th><Th>Metric</Th><Th>Observed Value</Th><Th>Evidence</Th><Th>Observation Period</Th>
              <Th>Owner</Th><Th>Confidence</Th>
            </tr></thead>
            <tbody>{observations.map((o) => (
              <tr key={o.id} className="border-b border-slate-100">
                <Td>{o.decisionId}</Td><Td>{o.metric}</Td><Td>{o.observedValue}</Td>
                <Td>{o.evidenceReferenceIds.join(", ")}</Td><Td>{o.observationPeriod}</Td><Td>{o.owner}</Td>
                <Td>{o.confidence}%</Td>
              </tr>
            ))}</tbody>
          </table>
        )}
        {tab === "Variance" && (
          <table className="w-full text-[11px]">
            <thead><tr className="border-b border-slate-200">
              <Th>Metric</Th><Th>Expected</Th><Th>Observed</Th><Th>Direction</Th><Th>Magnitude</Th>
              <Th>Materiality</Th><Th>Affected Personas</Th><Th>Status</Th>
            </tr></thead>
            <tbody>{variances.map((v) => (
              <tr key={v.id} className="border-b border-slate-100">
                <Td>{v.metric}</Td><Td>{v.expectedValue}</Td><Td>{v.observedValue}</Td>
                <Td>{v.varianceDirection}</Td><Td>{v.varianceMagnitude}</Td><Td>{v.materiality}</Td>
                <Td>{v.affectedPersonaIds.map(personaNameById).join(", ")}</Td>
                <Td><Pill label={v.status} tone={olTone(v.status)} /></Td>
              </tr>
            ))}</tbody>
          </table>
        )}
        {tab === "Evidence" && (
          <table className="w-full text-[11px]">
            <thead><tr className="border-b border-slate-200">
              <Th>Evidence Record</Th><Th>Evidence Type</Th><Th>Authority</Th><Th>Freshness</Th><Th>Quality</Th>
              <Th>Supports</Th><Th>Status</Th>
            </tr></thead>
            <tbody>{evidenceRecords.slice(0, 12).map((e) => (
              <tr key={e.id} className="border-b border-slate-100">
                <Td>{e.id} · {e.title}</Td><Td>{e.evidenceType}</Td><Td>{e.authority}</Td>
                <Td>{e.freshness}</Td><Td>{e.quality}</Td><Td>{e.supports}</Td>
                <Td><Pill label={e.status} tone={olTone(e.status)} /></Td>
              </tr>
            ))}</tbody>
          </table>
        )}
        {tab === "Assumptions" && (
          <table className="w-full text-[11px]">
            <thead><tr className="border-b border-slate-200">
              <Th>Assumption</Th><Th>Original Confidence</Th><Th>Observed Result</Th><Th>Validation State</Th><Th>Confidence</Th>
            </tr></thead>
            <tbody>{assumptionEvaluations.map((a) => (
              <tr key={a.id} className="border-b border-slate-100">
                <Td>{a.decisionAssumption}</Td><Td>{a.originalConfidence}%</Td><Td>{a.reason}</Td>
                <Td><Pill label={a.validationState} tone={olTone(a.validationState)} /></Td><Td>{a.confidence}%</Td>
              </tr>
            ))}</tbody>
          </table>
        )}
        {tab === "Outputs" && (
          <div className="grid grid-cols-2 gap-x-6 md:grid-cols-5">
            <Row label="Variance Records" value={variances.length} />
            <Row label="Assumption Results" value={assumptionEvaluations.length} />
            <Row label="Learning Candidates" value="186" />
            <Row label="Evidence Gaps" value="21" />
            <Row label="Learning Packages" value="128" />
          </div>
        )}
      </div>
    </Panel>
  );
}

/* =================================================================== queue */

export function LearningQueuePanel({
  rows, density, hiddenColumns, query, onQuery, sortKey, sortDir, onSort, page, pageCount, onPage,
  selected, onToggle, onOpen, columnMenu, onColumnMenu, onToggleColumn, onDensity, savedView,
}: {
  rows: OrganizationalLearningAnalysis[];
  density: Density;
  hiddenColumns: string[];
  query: string;
  onQuery: (v: string) => void;
  sortKey: string;
  sortDir: "asc" | "desc";
  onSort: (k: string) => void;
  page: number;
  pageCount: number;
  onPage: (p: number) => void;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onOpen: (a: OrganizationalLearningAnalysis) => void;
  columnMenu: boolean;
  onColumnMenu: (v: boolean) => void;
  onToggleColumn: (c: string) => void;
  onDensity: (d: Density) => void;
  savedView: string | null;
}) {
  const visible = (c: string) => !hiddenColumns.includes(c);
  const cell = (a: OrganizationalLearningAnalysis, c: string): React.ReactNode => ({
    "Learning ID": a.id,
    Decision: a.decisionId,
    "Work Item": a.workItem,
    "Decision Date": a.decisionDate,
    "Observation Window": a.observationWindow,
    "Expected Outcomes": a.expectedOutcomeIds.length,
    "Observed Outcomes": a.observedOutcomeIds.length,
    "Material Variances": a.materialVariances,
    "Learning Candidates": a.learningCandidateIds.length,
    "Evidence Coverage": `${a.evidenceCoverage}%`,
    "Causal Confidence": `${a.causalConfidence}%`,
    "Current Stage": a.currentStageId,
    "Learning Owner": a.owner,
    Status: <Pill label={a.status} tone={olTone(a.status)} />,
    Actions: (
      <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10.5px]"
        onClick={(e) => { e.stopPropagation(); onOpen(a); }}>Open</Button>
    ),
  }[c] ?? "");

  const sortable = ["Evidence Coverage", "Causal Confidence", "Material Variances", "Learning ID"];

  return (
    <Panel id="panel-queue" title="Organizational Learning Queue"
      subtitle={`${rows.length} learning analyses${savedView ? ` · saved view ${savedView}` : ""}`}
      actions={
        <>
          <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search learning analyses"
            aria-label="Search learning analyses"
            className="h-7 w-56 rounded border border-slate-200 px-2 text-[11px] focus:border-blue-400 focus:outline-none" />
          <div className="relative">
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onColumnMenu(!columnMenu)}>Columns</Button>
            {columnMenu && (
              <div className="absolute right-0 z-20 mt-1 max-h-64 w-56 overflow-y-auto rounded-md border border-slate-200 bg-white p-2 shadow-lg">
                {["Learning ID", "Decision", "Work Item", "Decision Date", "Observation Window", "Expected Outcomes",
                  "Observed Outcomes", "Material Variances", "Learning Candidates", "Evidence Coverage",
                  "Causal Confidence", "Current Stage", "Learning Owner", "Status", "Actions"].map((c) => (
                    <label key={c} className="flex items-center gap-1.5 py-0.5 text-[11px] text-slate-600">
                      <input type="checkbox" checked={visible(c)} onChange={() => onToggleColumn(c)} />{c}
                    </label>
                  ))}
              </div>
            )}
          </div>
          <select value={density} onChange={(e) => onDensity(e.target.value as Density)} aria-label="Table density"
            className="h-7 rounded border border-slate-200 px-1.5 text-[11px] text-slate-600">
            <option value="compact">Compact</option><option value="standard">Standard</option><option value="comfortable">Comfortable</option>
          </select>
        </>
      }>
      {rows.length === 0 ? <EmptyState message="No learning analyses match the current filters" hint="Clear filters or widen the time range" /> : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <Th className="w-6"><span className="sr-only">Select</span></Th>
                  {["Learning ID", "Decision", "Work Item", "Decision Date", "Observation Window", "Expected Outcomes",
                    "Observed Outcomes", "Material Variances", "Learning Candidates", "Evidence Coverage",
                    "Causal Confidence", "Current Stage", "Learning Owner", "Status", "Actions"]
                    .filter(visible).map((c) => (
                      <Th key={c}>
                        {sortable.includes(c) ? (
                          <button type="button" onClick={() => onSort(c)} className="inline-flex items-center gap-0.5 hover:text-slate-700">
                            {c}{sortKey === c && (sortDir === "asc" ? <ChevronUp className="h-3 w-3" aria-hidden /> : <ChevronDown className="h-3 w-3" aria-hidden />)}
                          </button>
                        ) : c}
                      </Th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id} tabIndex={0} onClick={() => onOpen(a)}
                    onKeyDown={(e) => { if (e.key === "Enter") onOpen(a); }}
                    className={cn("cursor-pointer border-b border-slate-100 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500", pad(density))}>
                    <Td className={pad(density)}>
                      <input type="checkbox" checked={selected.has(a.id)} aria-label={`Select ${a.id}`}
                        onClick={(e) => e.stopPropagation()} onChange={() => onToggle(a.id)} />
                    </Td>
                    {["Learning ID", "Decision", "Work Item", "Decision Date", "Observation Window", "Expected Outcomes",
                      "Observed Outcomes", "Material Variances", "Learning Candidates", "Evidence Coverage",
                      "Causal Confidence", "Current Stage", "Learning Owner", "Status", "Actions"]
                      .filter(visible).map((c) => <Td key={c} className={pad(density)}>{cell(a, c)}</Td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>{selected.size} selected</span>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" className="h-6 text-[10.5px]" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button>
              <span>Page {page} of {pageCount || 1}</span>
              <Button size="sm" variant="outline" className="h-6 text-[10.5px]" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>Next</Button>
            </div>
          </div>
        </>
      )}
    </Panel>
  );
}

/* ================================================ expected vs observed matrix */

export function ExpectedVsObservedPanel({
  onOpenEvidence, onOpenExpectation, onOpenVariance, selectedMetric,
}: {
  onOpenEvidence: (id: string) => void;
  onOpenExpectation: (id: string) => void;
  onOpenVariance: (id: string) => void;
  selectedMetric: string | null;
}) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortDesc, setSortDesc] = useState(false);
  const rows = useMemo(() => {
    let r = matrixRows.filter((x) => statusFilter === "All" || x.status === statusFilter);
    r = [...r].sort((a, b) => (sortDesc ? b.confidence - a.confidence : a.confidence - b.confidence));
    return r;
  }, [statusFilter, sortDesc]);

  return (
    <Panel id="panel-matrix" title="Expected vs Observed Outcomes"
      subtitle="Each recorded expectation compared against its observed outcome"
      actions={
        <>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter status"
            className="h-7 rounded border border-slate-200 px-1.5 text-[11px] text-slate-600">
            {["All", ...new Set(matrixRows.map((r) => r.status))].map((s) => <option key={s}>{s}</option>)}
          </select>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setSortDesc((v) => !v)}>
            Sort confidence {sortDesc ? "descending" : "ascending"}
          </Button>
        </>
      }>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead><tr className="border-b border-slate-200">
            <Th>Metric</Th><Th>Baseline</Th><Th>Expected Value</Th><Th>Expected Range</Th><Th>Observed Value</Th>
            <Th>Variance</Th><Th>Materiality</Th><Th>Evidence Coverage</Th><Th>Confidence</Th><Th>Status</Th><Th>Open</Th>
          </tr></thead>
          <tbody>
            {rows.map((r: MatrixRow) => (
              <tr key={r.expectedOutcomeId}
                className={cn("border-b border-slate-100", selectedMetric === r.metric && "bg-blue-50")}>
                <Td className="py-1 font-medium text-slate-800">{r.metric}</Td>
                <Td className="py-1">{r.baseline}</Td>
                <Td className="py-1">{r.expectedValue}</Td>
                <Td className="py-1">{r.expectedRange}</Td>
                <Td className="py-1">{r.observedValue}</Td>
                <Td className="py-1">{r.variance}</Td>
                <Td className="py-1">{r.materiality}</Td>
                <Td className="py-1">{r.evidenceCoverage}%</Td>
                <Td className="py-1">{r.confidence}%</Td>
                <Td className="py-1"><Pill label={r.status} tone={olTone(r.status)} /></Td>
                <Td className="py-1">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-6 px-1 text-[10px]" onClick={() => onOpenExpectation(r.expectedOutcomeId)}>Expectation</Button>
                    <Button size="sm" variant="ghost" className="h-6 px-1 text-[10px]" onClick={() => onOpenEvidence(r.observationId)}>Evidence</Button>
                    {r.varianceId && <Button size="sm" variant="ghost" className="h-6 px-1 text-[10px]" onClick={() => onOpenVariance(r.varianceId!)}>Variance</Button>}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ======================================================== variance analysis */

export function VarianceAnalysisPanel({ derived }: { derived: OlDerivedState }) {
  return (
    <Panel id="panel-variance" title="Outcome Variance Analysis"
      subtitle="Enterprise variance distribution and per dimension materiality">
      <div className="grid grid-cols-2 gap-1.5 md:grid-cols-5">
        {varianceSummary.map((s) => (
          <div key={s.label} className="rounded-lg border border-slate-200 p-2">
            <p className="text-[10.5px] text-slate-500">{s.label}</p>
            <p className="text-[17px] font-bold text-slate-900">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead><tr className="border-b border-slate-200">
            <Th>Dimension</Th><Th>Material Variances</Th><Th>Positive</Th><Th>Negative</Th><Th>Confidence</Th>
          </tr></thead>
          <tbody>{varianceDimensions.map((d) => (
            <tr key={d.dimension} className="border-b border-slate-100">
              <Td className="py-1">{d.dimension}</Td><Td className="py-1">{d.material}</Td>
              <Td className="py-1 text-emerald-700">{d.positive}</Td><Td className="py-1 text-red-700">{d.negative}</Td>
              <Td className="py-1">{d.confidence}%</Td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="mt-2 space-y-2">
        {variances.map((v) => (
          <div key={v.id} className="rounded-lg border border-slate-200 p-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[12px] font-semibold text-slate-800">{v.metric}</p>
              <div className="flex gap-1">
                <Pill label={v.varianceDirection} tone={v.varianceDirection === "Negative" ? "red" : "green"} />
                <Pill label={v.materiality} tone={olTone(v.materiality)} />
              </div>
            </div>
            <div className="mt-1 grid grid-cols-2 gap-x-4 md:grid-cols-4">
              <Row label="Expected" value={v.expectedValue} />
              <Row label="Observed" value={v.observedValue} />
              <Row label="Absolute Difference" value={v.absoluteDifference} />
              <Row label="Relative Difference" value={v.relativeDifference} />
              <Row label="Threshold Difference" value={v.thresholdDifference} />
              <Row label="Evidence" value={v.evidenceReferenceIds.join(", ")} />
              <Row label="Confidence" value={`${Math.min(v.confidence, derived.causalConfidence)}%`} />
              <Row label="Affected Personas" value={v.affectedPersonaIds.map(personaNameById).join(", ")} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ========================================================= assumption panel */

export function AssumptionPanel({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  return (
    <Panel id="panel-assumptions" title="Decision Assumption Validation"
      subtitle="Assumptions recorded at decision time, evaluated against observed outcomes">
      <table className="w-full text-[11px]">
        <thead><tr className="border-b border-slate-200">
          <Th>Assumption</Th><Th>Original Confidence</Th><Th>Observed Result</Th><Th>Validation State</Th><Th>Evidence</Th><Th>Confidence</Th>
        </tr></thead>
        <tbody>{assumptionEvaluations.map((a) => (
          <tr key={a.id} onClick={() => onSelect(a.id)} tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") onSelect(a.id); }}
            className={cn("cursor-pointer border-b border-slate-100 hover:bg-slate-50", selected === a.id && "bg-blue-50")}>
            <Td className="py-1">{a.decisionAssumption}</Td>
            <Td className="py-1">{a.originalConfidence}%</Td>
            <Td className="py-1">{a.reason}</Td>
            <Td className="py-1"><Pill label={a.validationState} tone={olTone(a.validationState)} /></Td>
            <Td className="py-1">{a.evidenceReferenceIds.join(", ")}</Td>
            <Td className="py-1">{a.confidence}%</Td>
          </tr>
        ))}</tbody>
      </table>
    </Panel>
  );
}

/* ============================================================ risk realization */

export function RiskRealizationPanel() {
  return (
    <Panel id="panel-risk" title="Risk Realization"
      subtitle="Each pre decision risk compared against the observed result">
      <table className="w-full text-[11px]">
        <thead><tr className="border-b border-slate-200">
          <Th>Risk</Th><Th>Predicted Severity</Th><Th>Materialized</Th><Th>Observed Severity</Th><Th>Controls</Th>
          <Th>Evidence</Th><Th>Learning Implication</Th><Th>Confidence</Th>
        </tr></thead>
        <tbody>{riskRealizations.map((r) => (
          <tr key={r.id} className="border-b border-slate-100">
            <Td className="py-1 font-medium text-slate-800">{r.risk}</Td>
            <Td className="py-1">{r.predictedSeverity}</Td>
            <Td className="py-1"><Pill label={r.materialized} tone={olTone(r.materialized)} /></Td>
            <Td className="py-1">{r.observedSeverity}</Td>
            <Td className="py-1">{r.controlIds.join(", ")}</Td>
            <Td className="py-1">{r.evidenceReferenceIds.join(", ") || "None"}</Td>
            <Td className="py-1">{r.learningImplication}</Td>
            <Td className="py-1">{r.confidence}%</Td>
          </tr>
        ))}</tbody>
      </table>
    </Panel>
  );
}

/* ======================================================= control / mitigation */

export function ControlEffectivenessPanel({ onCandidate }: { onCandidate: (id: string) => void }) {
  return (
    <Panel id="panel-controls" title="Control Effectiveness"
      subtitle="Observed effect of each decision control, including controls that were never exercised">
      <table className="w-full text-[11px]">
        <thead><tr className="border-b border-slate-200">
          <Th>Control</Th><Th>Type</Th><Th>Expected Purpose</Th><Th>Applied</Th><Th>Evidence</Th>
          <Th>Effectiveness</Th><Th>Confidence</Th><Th>Observed Limitation</Th><Th>Learning Candidate</Th>
        </tr></thead>
        <tbody>{controlEffectiveness.map((c) => (
          <tr key={c.id} className="border-b border-slate-100">
            <Td className="py-1 font-medium text-slate-800">{c.control}</Td>
            <Td className="py-1">{c.controlType}</Td>
            <Td className="py-1">{c.expectedPurpose}</Td>
            <Td className="py-1">{c.applied}</Td>
            <Td className="py-1">{c.evidenceReferenceIds.join(", ")}</Td>
            <Td className="py-1"><Pill label={c.effectiveness} tone={olTone(c.effectiveness)} /></Td>
            <Td className="py-1">{c.confidence}%</Td>
            <Td className="py-1">{c.limitation}</Td>
            <Td className="py-1">
              {c.learningCandidateId
                ? <Button size="sm" variant="ghost" className="h-6 px-1 text-[10px]" onClick={() => onCandidate(c.learningCandidateId!)}>{c.learningCandidateId}</Button>
                : <span className="text-slate-400">None</span>}
            </Td>
          </tr>
        ))}</tbody>
      </table>
    </Panel>
  );
}

export function MitigationEffectivenessPanel() {
  return (
    <Panel id="panel-mitigations" title="Mitigation Effectiveness"
      subtitle="Expected mitigation effect compared against the observed effect">
      <table className="w-full text-[11px]">
        <thead><tr className="border-b border-slate-200">
          <Th>Mitigation</Th><Th>Expected Effect</Th><Th>Observed Effect</Th><Th>Variance</Th>
          <Th>Effectiveness</Th><Th>Evidence</Th><Th>Confidence</Th>
        </tr></thead>
        <tbody>{mitigationEffectiveness.map((m) => (
          <tr key={m.id} className="border-b border-slate-100">
            <Td className="py-1 font-medium text-slate-800">{m.mitigation}</Td>
            <Td className="py-1">{m.expectedEffect}</Td><Td className="py-1">{m.observedEffect}</Td>
            <Td className="py-1">{m.variance}</Td>
            <Td className="py-1"><Pill label={m.effectiveness} tone={olTone(m.effectiveness)} /></Td>
            <Td className="py-1">{m.evidenceReferenceIds.join(", ")}</Td><Td className="py-1">{m.confidence}%</Td>
          </tr>
        ))}</tbody>
      </table>
    </Panel>
  );
}

export function UnexpectedConsequencePanel({ onCandidate }: { onCandidate: (id: string) => void }) {
  return (
    <Panel id="panel-unexpected" title="Unexpected Consequences"
      subtitle="Outcomes that were not part of the recorded expectation set">
      <div className="space-y-2">
        {unexpectedConsequences.map((u) => (
          <div key={u.id} className="rounded-lg border border-slate-200 p-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-[12px] font-semibold text-slate-800">{u.title}</p>
              <div className="flex gap-1">
                <Pill label={u.direction} tone={u.direction === "Negative" ? "red" : u.direction === "Mixed" ? "amber" : "green"} />
                <Pill label={u.severity} tone={olTone(u.severity)} />
              </div>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-600">{u.description}</p>
            <div className="mt-1 grid grid-cols-2 gap-x-4 md:grid-cols-3">
              <Row label="Affected Teams" value={u.affectedTeams.join(", ")} />
              <Row label="Customer Impact" value={u.customerImpact} />
              <Row label="Business Impact" value={u.businessImpact} />
              <Row label="Evidence" value={u.evidenceReferenceIds.join(", ")} />
              <Row label="Was Predicted" value={u.wasPredicted} />
              <Row label="Learning Candidate" value={u.learningCandidateId
                ? <button type="button" className="text-blue-700 underline" onClick={() => onCandidate(u.learningCandidateId!)}>{u.learningCandidateId}</button>
                : "None"} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ==================================================== learning candidate table */

export function LearningCandidatePanel({
  candidates, onOpen, onCompare, query, onQuery,
}: {
  candidates: LearningCandidate[];
  onOpen: (c: LearningCandidate) => void;
  onCompare: (c: LearningCandidate) => void;
  query: string;
  onQuery: (v: string) => void;
}) {
  return (
    <Panel id="panel-candidates" title="Learning Candidates"
      subtitle="Proposed interpretations of observed outcomes. Candidates are not validated organizational knowledge."
      actions={
        <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search candidates"
          aria-label="Search learning candidates"
          className="h-7 w-52 rounded border border-slate-200 px-2 text-[11px] focus:border-blue-400 focus:outline-none" />
      }>
      {candidates.length === 0 ? <EmptyState message="No learning candidates match the search" /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead><tr className="border-b border-slate-200">
              <Th>Candidate ID</Th><Th>Decision</Th><Th>Learning</Th><Th>Learning Type</Th><Th>Trigger</Th>
              <Th>Supporting Outcomes</Th><Th>Supporting Evidence</Th><Th>Causal Confidence</Th><Th>Applicability</Th>
              <Th>Potentially Affected Teams</Th><Th>Potential Memory Updates</Th><Th>Status</Th><Th>Open</Th>
            </tr></thead>
            <tbody>{candidates.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                <Td className="py-1">{c.id}</Td>
                <Td className="py-1">{c.decisionId}</Td>
                <Td className="py-1 max-w-md">{c.title}</Td>
                <Td className="py-1">{c.learningType}</Td>
                <Td className="py-1">{c.trigger}</Td>
                <Td className="py-1">{c.supportingOutcomeIds.join(", ") || "—"}</Td>
                <Td className="py-1">{c.evidenceReferenceIds.length}</Td>
                <Td className="py-1">{c.causalConfidence}%</Td>
                <Td className="py-1">{c.applicableScopes.length} bounded · {c.excludedScopes.length} excluded</Td>
                <Td className="py-1">{c.affectedTeams.join(", ")}</Td>
                <Td className="py-1">{c.potentialMemoryUpdateTypes.join(", ")}</Td>
                <Td className="py-1"><Pill label={c.status} tone={olTone(c.status)} /></Td>
                <Td className="py-1">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-6 px-1 text-[10px]" onClick={() => onOpen(c)}>Open</Button>
                    <Button size="sm" variant="ghost" className="h-6 px-1 text-[10px]" onClick={() => onCompare(c)}>Compare</Button>
                  </div>
                </Td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

/* ============================================================ causal panel */

export function CausalConfidencePanel({ candidateId, derived }: { candidateId: string; derived: OlDerivedState }) {
  const a = causalFor(candidateId);
  return (
    <Panel id="panel-causal" title="Learning Causal Confidence"
      subtitle="Causal confidence, not proof of causality. Human validation is required before publication."
      actions={<Pill label={derived.causalClassification} tone={olTone(derived.causalClassification)} />}>
      <div className="grid gap-2 lg:grid-cols-2">
        <div className="space-y-1">
          {causalDimensionLabels.map((d) => {
            const raw = a[d.key] as number;
            return (
              <div key={d.key}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">{d.label}</span>
                  <span className="font-medium text-slate-800">{raw}%</span>
                </div>
                <Progress value={raw} className="h-1.5" />
                <p className="text-[10px] text-slate-400">{d.description}</p>
              </div>
            );
          })}
        </div>
        <div className="rounded-lg border border-slate-200 p-2">
          <Row label="Candidate" value={candidateId} />
          <Row label="Overall Causal Confidence" value={`${derived.causalConfidence}%`} />
          <Row label="Classification" value={derived.causalClassification} />
          <Row label="Evidence Coverage" value={`${derived.evidenceCoverage}%`} />
          <Row label="Status" value="Requires human validation in Prompt 2" />
          <p className="mt-2 rounded border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] text-blue-800">
            Causal confidence expresses how strongly the observed outcome can be attributed to the decision.
            It is not proof of causality and does not authorise publication as organizational knowledge.
          </p>
          {derived.evidenceGaps.length > 0 && (
            <ul className="mt-2 space-y-1">
              {derived.evidenceGaps.map((g) => (
                <li key={g} className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-800">{g}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Panel>
  );
}

/* ======================================================= applicability panel */

export function ApplicabilityPanel({
  candidateId, records, derived,
}: {
  candidateId: string;
  records: ReturnType<typeof import("./data").applicabilityFor>;
  derived: OlDerivedState;
}) {
  const groups: { state: string; tone: Tone; title: string }[] = [
    { state: "Applies To", tone: "green", title: "Applies To" },
    { state: "Potentially Applies To", tone: "amber", title: "Potentially Applies To" },
    { state: "Does Not Apply", tone: "red", title: "Does NOT Yet Apply To" },
    { state: "Unknown", tone: "slate", title: "Unknown" },
  ];
  return (
    <Panel id="panel-applicability" title="Learning Applicability"
      subtitle={`Bounded reuse scope for ${candidateId}. Learning is never generalized beyond the supporting evidence.`}
      actions={<Pill label={`Applicability ${derived.applicabilityConfidence}%`} tone="blue" />}>
      {derived.extrapolationWarning && (
        <p className="mb-2 rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-800">
          {derived.extrapolationWarning}
        </p>
      )}
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {groups.map((g) => {
          const rows = records.filter((r) => r.applicabilityState === g.state);
          return (
            <div key={g.state} className="rounded-lg border border-slate-200 p-2">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[11.5px] font-semibold text-slate-800">{g.title}</p>
                <Pill label={String(rows.length)} tone={g.tone} />
              </div>
              {rows.length === 0 ? <p className="text-[11px] text-slate-400">None recorded</p> : (
                <ul className="space-y-1">
                  {rows.map((r) => (
                    <li key={r.id} className="rounded border border-slate-100 bg-slate-50 px-1.5 py-1">
                      <p className="text-[11px] font-medium text-slate-800">{r.scopeValue}</p>
                      <p className="text-[10px] text-slate-500">{r.scopeType} · {r.confidence}% · {r.reason}</p>
                      {r.additionalEvidenceRequired !== "None" && (
                        <p className="text-[10px] text-amber-700">Required evidence: {r.additionalEvidenceRequired}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* ================================================== related + contradictions */

export function RelatedKnowledgePanel() {
  return (
    <Panel id="panel-related" title="Related Organizational Knowledge"
      subtitle="Existing learning, conditions and persona rules compared against the selected candidate">
      <table className="w-full text-[11px]">
        <thead><tr className="border-b border-slate-200">
          <Th>Record</Th><Th>Record Type</Th><Th>Title</Th><Th>Relationship</Th><Th>Authority</Th><Th>Status</Th>
        </tr></thead>
        <tbody>{relatedKnowledge.map((r) => (
          <tr key={r.id} className="border-b border-slate-100">
            <Td className="py-1">{r.id}</Td><Td className="py-1">{r.recordType}</Td><Td className="py-1">{r.title}</Td>
            <Td className="py-1"><Pill label={r.relationship} tone={olTone(r.relationship)} /></Td>
            <Td className="py-1">{r.authority}</Td>
            <Td className="py-1"><Pill label={r.status} tone={olTone(r.status)} /></Td>
          </tr>
        ))}</tbody>
      </table>
    </Panel>
  );
}

export function ContradictionPanel({ onCandidate }: { onCandidate: (id: string) => void }) {
  return (
    <Panel id="panel-contradictions" title="Learning Contradictions & Tensions"
      subtitle="Detected tensions between candidate learning and existing organizational knowledge. Resolution arrives in Prompt 2.">
      <table className="w-full text-[11px]">
        <thead><tr className="border-b border-slate-200">
          <Th>Candidate</Th><Th>Existing Record</Th><Th>Conflict Type</Th><Th>Description</Th><Th>Authority</Th>
          <Th>Evidence</Th><Th>Severity</Th><Th>Potential Resolution</Th><Th>Status</Th>
        </tr></thead>
        <tbody>{contradictions.map((c) => (
          <tr key={c.id} className="border-b border-slate-100">
            <Td className="py-1">
              <button type="button" className="text-blue-700 underline" onClick={() => onCandidate(c.learningCandidateId)}>{c.learningCandidateId}</button>
            </Td>
            <Td className="py-1">{c.existingRecordId} · {c.existingRecord}</Td>
            <Td className="py-1">{c.conflictType}</Td>
            <Td className="py-1 max-w-sm">{c.description}</Td>
            <Td className="py-1">{c.authorityComparison}</Td>
            <Td className="py-1">{c.evidenceReferenceIds.join(", ")}</Td>
            <Td className="py-1"><Pill label={c.severity} tone={olTone(c.severity)} /></Td>
            <Td className="py-1">{c.potentialResolution}</Td>
            <Td className="py-1"><Pill label={c.status} tone={olTone(c.status)} /></Td>
          </tr>
        ))}</tbody>
      </table>
    </Panel>
  );
}

/* ================================================================= patterns */

export function PatternPanel() {
  return (
    <Panel id="panel-patterns" title="Cross Decision Learning Patterns"
      subtitle="Candidate patterns observed across prior decisions. Not automatically validated enterprise guidance.">
      <div className="grid gap-2 lg:grid-cols-3">
        {patterns.map((p) => (
          <div key={p.id} className="rounded-lg border border-slate-200 p-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[12px] font-semibold leading-tight text-slate-800">{p.title}</p>
              <Pill label={p.status} tone="amber" />
            </div>
            <p className="mt-1 text-[11px] text-slate-600">{p.description}</p>
            <div className="mt-1 grid grid-cols-2 gap-x-3">
              <Row label="Pattern Type" value={p.patternType} />
              <Row label="Decisions" value={p.decisionCount} />
              <Row label="Supporting Outcomes" value={p.supportingCount} />
              <Row label="Contradicting Outcomes" value={p.contradictingCount} />
              <Row label="Insufficient" value={p.insufficientCount} />
              <Row label="Confidence" value={`${p.confidence}%`} />
            </div>
            <Progress value={p.confidence} className="mt-1 h-1.5" />
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ================================================================== quality */

export function LearningQualityPanel() {
  return (
    <Panel id="panel-quality" title="Organizational Learning Quality"
      subtitle={`Overall ${learningQuality.overall} / 100 against a target of ${learningQuality.target}`}
      actions={<Pill label={learningQuality.overall >= learningQuality.target ? "On Target" : "Below Target"}
        tone={learningQuality.overall >= learningQuality.target ? "green" : "amber"} />}>
      <table className="w-full text-[11px]">
        <thead><tr className="border-b border-slate-200">
          <Th>Dimension</Th><Th>Current</Th><Th>Target</Th><Th>Variance</Th><Th>Trend</Th>
          <Th>Affected Learning Analyses</Th><Th>Status</Th>
        </tr></thead>
        <tbody>{learningQuality.dimensions.map((d) => {
          const variance = d.current - d.target;
          const status = variance >= 0 ? "On Target" : variance >= -4 ? "Attention" : "Below Target";
          return (
            <tr key={d.name} className="border-b border-slate-100">
              <Td className="py-1">{d.name}</Td><Td className="py-1">{d.current}</Td><Td className="py-1">{d.target}</Td>
              <Td className={cn("py-1", variance < 0 ? "text-red-700" : "text-emerald-700")}>{variance > 0 ? `+${variance}` : variance}</Td>
              <Td className="py-1">{d.trend}</Td><Td className="py-1">{d.affected}</Td>
              <Td className="py-1"><Pill label={status} tone={variance >= 0 ? "green" : variance >= -4 ? "amber" : "red"} /></Td>
            </tr>
          );
        })}</tbody>
      </table>
    </Panel>
  );
}

/* ================================================================== package */

export function LearningPackagePanel({ derived, onPrompt2 }: { derived: OlDerivedState; onPrompt2: (label: string) => void }) {
  const p = learningPackage;
  return (
    <Panel id="panel-package" title="Learning Package"
      subtitle="OL 9001 · Checkout Retry Policy Update"
      actions={
        <>
          <Pill label={`Package confidence ${derived.packageConfidence}%`} tone="blue" />
          <Pill label={p.status} tone={olTone(p.status)} />
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onPrompt2("Publish Learning")}>Publish Learning</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onPrompt2("Governed Export")}>Export Package</Button>
        </>
      }>
      <p className="mb-2 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-800">
        This package contains learning candidates. It does not mean the learning has been approved or published.
        Validation, approval and publication are governed in Prompt 2.
      </p>
      <div className="grid gap-2 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 p-2">
          <p className="mb-1 text-[11.5px] font-semibold text-slate-800">Package Contents</p>
          <Row label="Decision" value={p.decisionId} />
          <Row label="Decision Context Snapshot" value={p.decisionContextSnapshotId} />
          <Row label="Expected Outcomes" value={p.expectedOutcomeIds.length} />
          <Row label="Observed Outcomes" value={p.observedOutcomeIds.length} />
          <Row label="Material Variances" value={p.varianceIds.length} />
          <Row label="Assumption Results" value={p.assumptionEvaluationIds.length} />
          <Row label="Risk Realizations" value={p.riskRealizationIds.length} />
          <Row label="Control Effectiveness" value={p.controlEffectivenessIds.length} />
          <Row label="Mitigation Effectiveness" value={p.mitigationEffectivenessIds.length} />
          <Row label="Unexpected Consequences" value={p.unexpectedConsequenceIds.length} />
          <Row label="Learning Candidates" value={p.learningCandidateIds.length} />
          <Row label="Supporting Evidence" value={derived.activeEvidenceIds.length} />
        </div>
        <div className="rounded-lg border border-slate-200 p-2">
          <p className="mb-1 text-[11.5px] font-semibold text-slate-800">Confidence & Boundaries</p>
          <Row label="Causal Confidence" value={`${derived.causalConfidence}%`} />
          <Row label="Applicability Confidence" value={`${derived.applicabilityConfidence}%`} />
          <Row label="Package Confidence" value={`${derived.packageConfidence}%`} />
          <Row label="Known Exclusions" value="100% immediate rollout · Persistent declines · Nonpayment workflows" />
          <Row label="Related Learning" value="LRN 1182" />
          <Row label="Potential Contradictions" value={`${contradictions.length}`} />
          <Row label="Historical Context" value="Preserved. Never rewritten." />
        </div>
        <div className="rounded-lg border border-slate-200 p-2">
          <p className="mb-1 text-[11.5px] font-semibold text-slate-800">Potential Update Targets</p>
          <ul className="space-y-1">
            {p.potentialUpdateTargets.map((t) => (
              <li key={t.target} className="rounded border border-slate-100 bg-slate-50 px-1.5 py-1">
                <p className="text-[11px] font-medium text-slate-800">{t.type}</p>
                <p className="text-[10.5px] text-slate-600">{t.target}</p>
                <p className="text-[10px] text-slate-500">{t.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}

/* ================================================================= activity */

export function ActivityPanel({ items }: { items: OrganizationalLearningActivity[] }) {
  return (
    <Panel id="panel-activity" title="Recent Learning Activity" subtitle="Audit linked activity for the selected analysis">
      <ol className="space-y-1">
        {items.map((a) => (
          <li key={a.id} className="flex items-start justify-between gap-2 border-b border-slate-100 py-1 last:border-0">
            <div>
              <p className="text-[11.5px] font-medium text-slate-800">{a.action}</p>
              <p className="text-[11px] text-slate-500">{a.description}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[10.5px] text-slate-500">{a.timestamp} · {a.owner}</p>
              <p className="text-[10px] text-slate-400">{a.auditId}</p>
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

/* ============================================================ history panel */

export function HistoryPanel() {
  return (
    <Panel id="panel-history" title="Decision to Learning History"
      subtitle="Historical decision context is preserved and never rewritten by later knowledge">
      <ol className="grid gap-1.5 md:grid-cols-4 xl:grid-cols-7">
        {historyEvents.map((h) => (
          <li key={h.id} className="rounded-lg border border-slate-200 p-1.5">
            <p className="text-[11px] font-medium text-slate-800">{h.label}</p>
            <p className="text-[10px] text-slate-500">{h.timestamp}</p>
            <p className="text-[10.5px] text-slate-600">{h.detail}</p>
          </li>
        ))}
      </ol>
      <p className="mt-2 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600">
        {decisionContext.historicalNote}
      </p>
    </Panel>
  );
}

export const evidenceTitle = (id: string) => evidenceById(id)?.title ?? id;
export const allCandidates = learningCandidates;
