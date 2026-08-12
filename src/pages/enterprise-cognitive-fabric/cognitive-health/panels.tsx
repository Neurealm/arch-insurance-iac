/** Enterprise Cognitive Health — operational panels. Reuses ECF panel, table and pill conventions. */

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowDown, ArrowRight, ArrowUp, ChevronDown, ChevronUp } from "lucide-react";
import {
  CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis, Legend,
} from "recharts";
import { Pill, Row, type Tone } from "../persona-studio/primitives";
import { Panel, EmptyState } from "../cognitive-memory/panels";
import {
  associatedEvents, bandFor, businessUnits, chActivity, chKpis, chStageTabs, chStages, chTone,
  contextPreservationMetrics, contributionGlyph, contributionTone, contributorsForDimension,
  criticalSignals, crossTeamAwarenessMetrics, decisionConfidenceMetrics, dependencyVisibilityMetrics,
  diagnosticPaths, dimensionById, dimensionContribution, dimensions, echiHighlights, echiSnapshot,
  healthChanges, healthSummary, heatmapRows, highAttentionDependencies, historicalRewriteViolations,
  informationQualityAttention, informationQualityMetrics, knowledgeDomains, latencyBottlenecks,
  latencyMetrics, learningMaturityAttention, learningMaturityMetrics, lifecycleCallouts,
  moduleContributions, personaHealth, signals, stageCauseRows, stageDecisionRows, stageLearningRows,
  stageOutputs, trendLabel, trendRanges, trendSeries,
  type ChStageTab, type CognitiveHealthActivity, type CognitiveHealthDimension, type CognitiveHealthSignal,
  type CognitiveHealthStage, type HeatmapMode, type HeatmapRow, type MetricRow,
  type TeamPersonaCognitiveHealth, type TrendRange,
} from "./data";

export type Density = "compact" | "standard" | "comfortable";
export { Panel, EmptyState };

const pad = (d: Density) => (d === "compact" ? "py-0.5" : d === "comfortable" ? "py-2" : "py-1");

export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th scope="col" className={cn("px-1.5 py-1 text-left text-[10.5px] font-medium uppercase tracking-wide text-slate-500", className)}>{children}</th>;
}
export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-1.5 align-top text-[11.5px] text-slate-700", className)}>{children}</td>;
}

/** Trend indicator that never relies on color alone — arrow glyph plus signed text. */
export function Trend({ value, suffix }: { value: number; suffix?: string }) {
  const Icon = value > 0 ? ArrowUp : value < 0 ? ArrowDown : ArrowRight;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-[10.5px]",
      value > 0 ? "text-emerald-700" : value < 0 ? "text-red-700" : "text-slate-500")}>
      <Icon className="h-3 w-3" aria-hidden />
      {value > 0 ? "+" : ""}{value}{suffix ?? ""}
    </span>
  );
}

function ScoreBar({ score, target }: { score: number; target: number }) {
  return (
    <div className="relative h-1.5 w-full rounded bg-slate-100">
      <div className={cn("absolute inset-y-0 left-0 rounded",
        score >= 90 ? "bg-emerald-500" : score >= 86 ? "bg-teal-500" : score >= 78 ? "bg-amber-500" : "bg-red-500")}
        style={{ width: `${score}%` }} />
      <div className="absolute inset-y-[-2px] w-px bg-slate-700" style={{ left: `${target}%` }} aria-hidden />
    </div>
  );
}

/* ================================================================ ECHI */

export function EchiSummaryPanel({
  onDimension, selectedDimension, derivedEchi,
}: {
  onDimension: (id: string) => void;
  selectedDimension: string;
  derivedEchi: number;
}) {
  const change = echiSnapshot.echiScore - echiSnapshot.previousScore;
  return (
    <Panel id="panel-echi" title="Enterprise Cognitive Health Index"
      subtitle="ECHI is explainable by construction — every point is attributed to a weighted dimension contribution"
      actions={<Pill label={echiSnapshot.status} tone={chTone(echiSnapshot.status)} />}>
      <div className="grid gap-3 lg:grid-cols-[260px_1fr]">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
          <p className="text-[10.5px] font-medium uppercase tracking-wide text-slate-500">ECHI</p>
          <p className="text-[34px] font-bold leading-none text-slate-900">
            {derivedEchi}<span className="text-[15px] font-medium text-slate-500"> / 100</span>
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-700">{echiSnapshot.status}</p>
          <div className="mt-1.5"><ScoreBar score={derivedEchi} target={echiSnapshot.targetScore} /></div>
          <div className="mt-1.5 grid grid-cols-2 gap-x-2">
            <Row label="Target" value={echiSnapshot.targetScore} />
            <Row label="Previous" value={echiSnapshot.previousScore} />
            <Row label="Change" value={<Trend value={change} />} />
            <Row label="Confidence" value={`${echiSnapshot.confidence}%`} />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Primary Improvement", echiHighlights.primaryImprovement],
            ["Primary Concern", echiHighlights.primaryConcern],
            ["Largest Structural Risk", echiHighlights.largestStructuralRisk],
            ["Most Stable", echiHighlights.mostStable],
            ["Largest Positive Contributor", echiHighlights.largestPositiveContributor],
            ["Largest Negative Contributor", echiHighlights.largestNegativeContributor],
            ["Most Improved Dimension", echiHighlights.mostImproved],
            ["Most Deteriorated", echiHighlights.mostDeteriorated],
          ].map(([label, value]) => (
            <div key={label} className="rounded border border-slate-200 px-2 py-1.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
              <p className="text-[11.5px] font-medium text-slate-800">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 grid gap-1.5 sm:grid-cols-2 xl:grid-cols-7">
        {dimensions.map((d) => (
          <button key={d.id} type="button" onClick={() => onDimension(d.id)}
            aria-pressed={selectedDimension === d.id}
            className={cn("rounded-lg border px-2 py-1.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              selectedDimension === d.id ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300")}>
            <p className="truncate text-[10.5px] font-medium uppercase tracking-wide text-slate-500">{d.name}</p>
            <p className="text-[20px] font-bold leading-tight text-slate-900">{d.score}</p>
            <ScoreBar score={d.score} target={d.target} />
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Target {d.target}</span>
              <Trend value={d.trend} />
            </div>
            <p className="mt-0.5 text-[10px] font-medium text-slate-600">{d.status}</p>
            <p className="text-[9.5px] text-slate-400">Contributes {dimensionContribution(d)} pts</p>
          </button>
        ))}
      </div>
    </Panel>
  );
}

/* ================================================================= KPIs */

export function KpiRow({ focus, onSelect }: { focus: string | null; onSelect: (id: string) => void }) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
        {chKpis.map((k) => (
          <Tooltip key={k.id}>
            <TooltipTrigger asChild>
              <button type="button" onClick={() => onSelect(k.id)} aria-pressed={focus === k.id}
                className={cn("rounded-xl border bg-white p-2 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  focus === k.id ? "border-blue-400 ring-1 ring-blue-200" : "border-slate-200 hover:border-slate-300")}>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{k.label}</p>
                <p className="text-[22px] font-bold leading-tight text-slate-900">{k.value}</p>
                {k.supporting.map((sp) => <p key={sp} className="text-[10.5px] text-slate-500">{sp}</p>)}
                <div className="mt-1 flex items-center justify-between">
                  <Pill label={k.status} tone={chTone(k.status)} />
                  <span className="text-[10px] text-slate-500">{k.trend}</span>
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[260px] text-[11px]">{k.tooltip}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

/* ============================================================ lifecycle */

export function LifecyclePanel({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <Panel id="panel-lifecycle" title="Cognitive Health Measurement Lifecycle"
      subtitle="Ten governed stages from raw ECF signal collection to prepared enterprise health context">
      <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-5">
        {chStages.map((s) => (
          <button key={s.id} type="button" onClick={() => onSelect(s.id)} aria-pressed={selected === s.id}
            className={cn("rounded-lg border p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              selected === s.id ? "border-blue-400 bg-blue-50 ring-1 ring-blue-200" : "border-slate-200 bg-white hover:border-slate-300")}>
            <div className="flex items-start justify-between gap-1">
              <span className="text-[10px] text-slate-400">{s.sequence}</span>
              <Pill label={s.status} tone={chTone(s.status)} />
            </div>
            <p className="text-[11.5px] font-medium text-slate-800">{s.name}</p>
            <p className="text-[10.5px] text-slate-500">{s.detail}</p>
            <p className="mt-0.5 text-[9.5px] text-slate-400">
              {s.successRate} · {s.averageDuration} avg · p95 {s.p95Duration}
            </p>
          </button>
        ))}
      </div>
      <ul className="mt-2 space-y-1">
        {lifecycleCallouts.map((c) => (
          <li key={c} className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-800">{c}</li>
        ))}
      </ul>
    </Panel>
  );
}

/* ======================================================== selected stage */

export function SelectedStagePanel({ stage }: { stage: CognitiveHealthStage }) {
  const [tab, setTab] = useState<ChStageTab>("Overview");
  return (
    <Panel id="panel-stage" title={`Selected Health Stage · ${stage.name}`}
      subtitle={`Owner ${stage.owner} · confidence ${stage.confidence}%`}
      actions={<Pill label={stage.status} tone={chTone(stage.status)} />}>
      <div className="grid grid-cols-2 gap-x-4 md:grid-cols-5">
        <Row label="Status" value={stage.status} />
        <Row label="Signals Processing" value={stage.processedCount} />
        <Row label="Pending" value={stage.pendingCount} />
        <Row label="Causes Identified" value={stageCauseRows.length} />
        <Row label="Critical" value={criticalSignals.filter((c) => c.severity === "Critical").length} />
        <Row label="High" value={criticalSignals.filter((c) => c.severity === "High").length} />
        <Row label="Warnings" value={stage.warningCount} />
        <Row label="Failures" value={stage.failedCount} />
        <Row label="Success Rate" value={stage.successRate} />
        <Row label="Average Duration" value={stage.averageDuration} />
        <Row label="P95 Duration" value={stage.p95Duration} />
        <Row label="Confidence" value={`${stage.confidence}%`} />
        <Row label="Owner" value={stage.owner} />
      </div>

      <div className="mt-2 flex flex-wrap gap-1 border-b border-slate-200" role="tablist" aria-label="Stage detail">
        {chStageTabs.map((t) => (
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
            {stage.detail}. This stage attributes measured health movement to contributing ECF records. Contribution is
            evidence linked and explicitly labelled as a contributing relationship, not proven causality.
          </p>
        )}
        {tab === "Signals" && (
          <table className="w-full"><thead><tr className="border-b border-slate-200">
            {["Signal", "Dimension", "Current", "Target", "Trend", "Severity", "Confidence", "Status"].map((h) => <Th key={h}>{h}</Th>)}
          </tr></thead><tbody>
            {signals.slice(0, 10).map((sig) => (
              <tr key={sig.id} className="border-b border-slate-100">
                <Td>{sig.id} · {sig.name}</Td><Td>{dimensionById(sig.dimensionId).name}</Td>
                <Td>{sig.currentValue}</Td><Td>{sig.targetValue}</Td>
                <Td><Trend value={sig.trend} /></Td><Td>{sig.severity}</Td>
                <Td>{sig.confidence}%</Td><Td><Pill label={sig.status} tone={chTone(sig.status)} /></Td>
              </tr>
            ))}
          </tbody></table>
        )}
        {tab === "Causes" && (
          <table className="w-full"><thead><tr className="border-b border-slate-200">
            {["Cause", "Dimension", "Affected Scope", "Contribution", "Evidence", "Confidence", "Status"].map((h) => <Th key={h}>{h}</Th>)}
          </tr></thead><tbody>
            {stageCauseRows.map((c) => (
              <tr key={c.id} className="border-b border-slate-100">
                <Td>{c.cause}</Td><Td>{c.dimension}</Td><Td>{c.scope}</Td><Td>{c.contribution}</Td>
                <Td>{c.evidence}</Td><Td>{c.confidence}%</Td>
                <Td><Pill label={c.status} tone={chTone(c.status)} /></Td>
              </tr>
            ))}
          </tbody></table>
        )}
        {tab === "Domains" && (
          <table className="w-full"><thead><tr className="border-b border-slate-200">
            {["Domain", "Health Score", "Primary Concern", "Trend"].map((h) => <Th key={h}>{h}</Th>)}
          </tr></thead><tbody>
            {knowledgeDomains.map((k) => (
              <tr key={k.id} className="border-b border-slate-100">
                <Td>{k.knowledgeDomain}</Td><Td>{k.overallScore}</Td>
                <Td>{k.attentionSignalIds.length ? k.attentionSignalIds.join(", ") : "No attention signals"}</Td>
                <Td><Trend value={k.trend} /></Td>
              </tr>
            ))}
          </tbody></table>
        )}
        {tab === "Teams" && (
          <table className="w-full"><thead><tr className="border-b border-slate-200">
            {["Team Persona", "Health Signals", "Attention Areas"].map((h) => <Th key={h}>{h}</Th>)}
          </tr></thead><tbody>
            {personaHealth.map((p) => (
              <tr key={p.id} className="border-b border-slate-100">
                <Td>{p.persona} {p.personaVersion}</Td><Td>{p.evidenceGapCount + p.openConflictCount} open</Td>
                <Td>{p.attentionItems.join(" · ")}</Td>
              </tr>
            ))}
          </tbody></table>
        )}
        {tab === "Decisions" && (
          <table className="w-full"><thead><tr className="border-b border-slate-200">
            {["Decision", "Affected Health Signal", "Decision State", "Risk"].map((h) => <Th key={h}>{h}</Th>)}
          </tr></thead><tbody>
            {stageDecisionRows.map((d) => (
              <tr key={d.id} className="border-b border-slate-100">
                <Td>{d.id} · {d.decision}</Td><Td>{d.signal}</Td><Td>{d.state}</Td>
                <Td><Pill label={d.risk} tone={chTone(d.risk)} /></Td>
              </tr>
            ))}
          </tbody></table>
        )}
        {tab === "Learning" && (
          <table className="w-full"><thead><tr className="border-b border-slate-200">
            {["Learning Record", "Reuse State", "Health Effect"].map((h) => <Th key={h}>{h}</Th>)}
          </tr></thead><tbody>
            {stageLearningRows.map((l) => (
              <tr key={l.id} className="border-b border-slate-100">
                <Td>{l.id} · {l.record}</Td><Td>{l.reuse}</Td><Td>{l.effect}</Td>
              </tr>
            ))}
          </tbody></table>
        )}
        {tab === "Outputs" && (
          <table className="w-full"><thead><tr className="border-b border-slate-200">
            {["Output", "Count", "Status"].map((h) => <Th key={h}>{h}</Th>)}
          </tr></thead><tbody>
            {stageOutputs.map((o) => (
              <tr key={o.id} className="border-b border-slate-100">
                <Td>{o.output}</Td><Td>{o.count}</Td><Td><Pill label={o.status} tone={chTone(o.status)} /></Td>
              </tr>
            ))}
          </tbody></table>
        )}
      </div>
    </Panel>
  );
}

/* =========================================================== dimensions */

export function DimensionPanel({ onOpen, selected }: { onOpen: (id: string) => void; selected: string }) {
  return (
    <Panel id="panel-dimensions" title="Enterprise Cognitive Health Dimensions"
      subtitle="Seven measured dimensions with explicit targets, drivers and affected scope. A weak dimension is never averaged away by a healthy overall score.">
      <div className="grid gap-2 lg:grid-cols-2 xl:grid-cols-4">
        {dimensions.map((d) => (
          <button key={d.id} type="button" onClick={() => onOpen(d.id)} aria-pressed={selected === d.id}
            className={cn("rounded-lg border p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              selected === d.id ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300")}>
            <div className="flex items-start justify-between gap-1">
              <p className="text-[12px] font-semibold text-slate-900">{d.name}</p>
              <Pill label={d.status} tone={chTone(d.status)} />
            </div>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-[26px] font-bold leading-none text-slate-900">{d.score}</span>
              <span className="pb-0.5 text-[10.5px] text-slate-500">Target {d.target} · Previous {d.previousScore}</span>
            </div>
            <div className="mt-1"><ScoreBar score={d.score} target={d.target} /></div>
            <div className="mt-1 flex items-center justify-between">
              <Trend value={d.trend} />
              <span className="text-[10px] text-slate-500">Confidence {d.confidence}%</span>
            </div>
            <p className="mt-1 text-[10.5px] text-emerald-700">Positive · {d.primaryPositiveDriver}</p>
            <p className="text-[10.5px] text-red-700">Negative · {d.primaryNegativeDriver}</p>
            <p className="mt-0.5 text-[10px] text-slate-500">Affected · {d.affectedScopeIds.join(", ")}</p>
          </button>
        ))}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
          <p className="text-[11.5px] font-semibold text-slate-800">Dimension Contribution to ECHI</p>
          {dimensions.map((d) => (
            <div key={d.id} className="mt-1">
              <div className="flex items-center justify-between text-[10.5px]">
                <span className="text-slate-600">{d.short}</span>
                <span className="font-medium text-slate-800">{dimensionContribution(d)} pts · weight {(d.weight * 100).toFixed(0)}%</span>
              </div>
              <Progress value={d.score} className="h-1" />
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

/* ======================================================= business units */

export function BusinessUnitPanel({ onSelect, selected }: { onSelect: (unit: string) => void; selected: string | null }) {
  return (
    <Panel id="panel-business-units" title="Business Unit Health"
      subtitle="Scope level ECHI equivalent with the full seven dimension breakdown. Selecting a unit scopes the page.">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-slate-200">
            <Th>Business Unit</Th><Th>Overall</Th>
            {dimensions.map((d) => <Th key={d.id}>{d.short}</Th>)}
            <Th>Trend</Th><Th>Primary Concern</Th><Th>Status</Th>
          </tr></thead>
          <tbody>
            {businessUnits.map((b) => (
              <tr key={b.id}
                className={cn("cursor-pointer border-b border-slate-100 hover:bg-slate-50",
                  selected === b.businessUnit && "bg-blue-50")}
                tabIndex={0} role="button" aria-pressed={selected === b.businessUnit}
                onClick={() => onSelect(b.businessUnit)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(b.businessUnit); } }}>
                <Td className="py-1 font-medium">{b.businessUnit}</Td>
                <Td className="py-1 font-semibold">{b.overallScore}</Td>
                {dimensions.map((d) => <Td key={d.id} className="py-1">{b.dimensionScores[d.id]}</Td>)}
                <Td className="py-1"><Trend value={b.trend} /></Td>
                <Td className="py-1">{b.primaryConcern}</Td>
                <Td className="py-1"><Pill label={b.status} tone={chTone(b.status)} /></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ================================================================ heatmap */

export function HeatmapPanel({
  mode, onMode, filter, onFilter, sortBy, onSort, onCell, tableAlt, onTableAlt,
}: {
  mode: HeatmapMode; onMode: (m: HeatmapMode) => void;
  filter: string; onFilter: (f: string) => void;
  sortBy: string; onSort: (s: string) => void;
  onCell: (scope: string, dimensionId: string) => void;
  tableAlt: boolean; onTableAlt: (v: boolean) => void;
}) {
  const rows = useMemo(() => {
    let r: HeatmapRow[] = heatmapRows(mode);
    if (filter === "attention") r = r.filter((x) => x.cells.some((c) => c.score < 86));
    if (filter === "deteriorating") r = r.filter((x) => x.trend < 0);
    if (filter === "improving") r = r.filter((x) => x.trend > 0);
    if (sortBy === "overall") r = [...r].sort((a, b) => a.overall - b.overall);
    else {
      const idx = dimensions.findIndex((d) => d.id === sortBy);
      if (idx >= 0) r = [...r].sort((a, b) => a.cells[idx].score - b.cells[idx].score);
    }
    return r;
  }, [mode, filter, sortBy]);

  const cellClass = (score: number) =>
    score >= 95 ? "bg-emerald-100 text-emerald-900 border-emerald-200"
      : score >= 90 ? "bg-emerald-50 text-emerald-800 border-emerald-200"
        : score >= 86 ? "bg-teal-50 text-teal-800 border-teal-200"
          : score >= 78 ? "bg-amber-50 text-amber-800 border-amber-200"
            : score >= 70 ? "bg-orange-50 text-orange-900 border-orange-200"
              : "bg-red-50 text-red-900 border-red-200";

  return (
    <Panel id="panel-heatmap" title="Enterprise Health Heatmap"
      subtitle="Scope by dimension. Every cell carries a score, a band label and a trend glyph so meaning never depends on color."
      actions={
        <>
          <div className="flex rounded border border-slate-200 p-0.5">
            {([["business-unit", "Business Unit"], ["team-persona", "Team Persona"], ["knowledge-domain", "Knowledge Domain"]] as [HeatmapMode, string][]).map(([m, l]) => (
              <button key={m} type="button" onClick={() => onMode(m)} aria-pressed={mode === m}
                className={cn("rounded px-1.5 py-0.5 text-[10.5px]", mode === m ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100")}>
                {l}
              </button>
            ))}
          </div>
          <select value={filter} onChange={(e) => onFilter(e.target.value)} aria-label="Heatmap filter"
            className="h-7 rounded border border-slate-200 px-1.5 text-[11px] text-slate-600">
            <option value="all">All Scopes</option>
            <option value="attention">Only Attention Areas</option>
            <option value="deteriorating">Only Deteriorating</option>
            <option value="improving">Only Improving</option>
          </select>
          <select value={sortBy} onChange={(e) => onSort(e.target.value)} aria-label="Heatmap sort"
            className="h-7 rounded border border-slate-200 px-1.5 text-[11px] text-slate-600">
            <option value="overall">Sort by Overall Health</option>
            {dimensions.map((d) => <option key={d.id} value={d.id}>Sort by {d.name}</option>)}
          </select>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onTableAlt(!tableAlt)}
            aria-expanded={tableAlt}>
            {tableAlt ? "Hide" : "Show"} Tabular Alternative
          </Button>
        </>
      }>
      {rows.length === 0 ? <EmptyState message="No scopes match this heatmap filter" hint="Clear the filter to see the full portfolio" /> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <caption className="sr-only">Cognitive health score by scope and dimension</caption>
            <thead><tr>
              <Th>Scope</Th><Th>Overall</Th>
              {dimensions.map((d) => <Th key={d.id} className="text-center">{d.short}</Th>)}
            </tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <Td className="py-1">
                    <p className="font-medium text-slate-800">{r.label}</p>
                    <p className="text-[10px] text-slate-400">{r.sublabel}</p>
                  </Td>
                  <Td className="py-1 font-semibold">{r.overall} <Trend value={r.trend} /></Td>
                  {r.cells.map((c) => (
                    <td key={c.dimensionId} className="px-0.5 py-0.5">
                      <button type="button" onClick={() => onCell(r.label, c.dimensionId)}
                        aria-label={`${r.label}, ${dimensionById(c.dimensionId).name}, score ${c.score}, band ${c.band}, trend ${trendLabel(c.trend)}`}
                        className={cn("w-full rounded border px-1 py-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500", cellClass(c.score))}>
                        <span className="block text-[13px] font-bold leading-none">{c.score}</span>
                        <span className="block text-[8.5px] leading-tight">{c.band}</span>
                        <span className="block text-[8.5px] leading-tight">{c.trend > 0 ? "▲" : c.trend < 0 ? "▼" : "▬"} {c.confidence}%</span>
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tableAlt && (
        <div className="mt-2 overflow-x-auto rounded border border-slate-200 p-2">
          <p className="mb-1 text-[11px] font-medium text-slate-700">Accessible tabular alternative</p>
          <table className="w-full text-[11px]">
            <thead><tr className="border-b border-slate-200">
              <Th>Scope</Th><Th>Dimension</Th><Th>Score</Th><Th>Band</Th><Th>Trend</Th><Th>Confidence</Th>
            </tr></thead>
            <tbody>
              {rows.flatMap((r) => r.cells.map((c) => (
                <tr key={`${r.id}-${c.dimensionId}`} className="border-b border-slate-100">
                  <Td>{r.label}</Td><Td>{dimensionById(c.dimensionId).name}</Td><Td>{c.score}</Td>
                  <Td>{c.band}</Td><Td>{trendLabel(c.trend)}</Td><Td>{c.confidence}%</Td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

/* ======================================================== persona health */

export function PersonaHealthPanel({ onOpen }: { onOpen: (p: TeamPersonaCognitiveHealth) => void }) {
  return (
    <Panel id="panel-personas" title="Team Persona Health"
      subtitle="Health belongs to the operating context a Persona represents. This is not an employee performance measure and no individual is scored."
      actions={<Pill label="Context health, not people" tone="slate" />}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead><tr className="border-b border-slate-200">
            {["Team Persona", "Version", "Overall", "Info Quality", "Dependency", "Cross Team", "Decision", "Latency", "Learning", "Freshness", "Attention Items", "Status"].map((h) => <Th key={h}>{h}</Th>)}
          </tr></thead>
          <tbody>
            {personaHealth.map((p) => (
              <tr key={p.id} className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                tabIndex={0} role="button"
                onClick={() => onOpen(p)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(p); } }}>
                <Td className="py-1 font-medium">{p.persona}</Td>
                <Td className="py-1">{p.personaVersion}</Td>
                <Td className="py-1 font-semibold">{p.overallScore}</Td>
                <Td className="py-1">{p.dimensionScores["DIM IQ"]}</Td>
                <Td className="py-1">{p.dimensionScores["DIM DV"]}</Td>
                <Td className="py-1">{p.dimensionScores["DIM CTA"]}</Td>
                <Td className="py-1">{p.dimensionScores["DIM DC"]}</Td>
                <Td className="py-1">{p.dimensionScores["DIM RL"]}</Td>
                <Td className="py-1">{p.dimensionScores["DIM LM"]}</Td>
                <Td className="py-1">{p.freshness}</Td>
                <Td className="py-1">{p.attentionItems.length}</Td>
                <Td className="py-1"><Pill label={p.status} tone={chTone(p.status)} /></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ======================================================= knowledge domains */

export function KnowledgeDomainPanel({ onSelect }: { onSelect: (domain: string) => void }) {
  return (
    <Panel id="panel-domains" title="Knowledge Domain Health"
      subtitle="Domain level cognition health across evidence quality, dependency visibility, decision confidence and learning reuse">
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {knowledgeDomains.map((k) => (
          <button key={k.id} type="button" onClick={() => onSelect(k.knowledgeDomain)}
            className="rounded-lg border border-slate-200 bg-white p-2 text-left hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <div className="flex items-start justify-between gap-1">
              <p className="text-[12px] font-semibold text-slate-900">{k.knowledgeDomain}</p>
              <Pill label={k.status} tone={chTone(k.status)} />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-[22px] font-bold leading-none text-slate-900">{k.overallScore}</span>
              <Trend value={k.trend} />
            </div>
            <div className="mt-1 grid grid-cols-2 gap-x-2">
              <Row label="Evidence Quality" value={`${k.evidenceQuality}%`} />
              <Row label="Dependency Visibility" value={`${k.dependencyVisibility}%`} />
              <Row label="Decision Confidence" value={`${k.decisionConfidence}%`} />
              <Row label="Learning Reuse" value={`${k.learningReuse}%`} />
            </div>
            <p className="mt-0.5 text-[10px] text-slate-500">
              Attention signals · {k.attentionSignalIds.length ? k.attentionSignalIds.join(", ") : "None"}
            </p>
          </button>
        ))}
      </div>
    </Panel>
  );
}

/* ======================================================== signal explorer */

export function SignalExplorerPanel({
  rows, query, onQuery, dimension, onDimension, severity, onSeverity, sourceModule, onSourceModule,
  page, pageCount, onPage, onOpen, density, onDensity,
}: {
  rows: CognitiveHealthSignal[]; query: string; onQuery: (v: string) => void;
  dimension: string; onDimension: (v: string) => void;
  severity: string; onSeverity: (v: string) => void;
  sourceModule: string; onSourceModule: (v: string) => void;
  page: number; pageCount: number; onPage: (p: number) => void;
  onOpen: (s: CognitiveHealthSignal) => void;
  density: Density; onDensity: (d: Density) => void;
}) {
  const modules = ["All", ...Array.from(new Set(signals.map((x) => x.sourceModule)))];
  return (
    <Panel id="panel-signals" title="Cognitive Health Signal Explorer"
      subtitle={`${rows.length} signals · every signal traces back to the ECF module and records that produced it`}
      actions={
        <>
          <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search signals"
            aria-label="Search signals"
            className="h-7 w-48 rounded border border-slate-200 px-2 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
          <select value={dimension} onChange={(e) => onDimension(e.target.value)} aria-label="Signal dimension"
            className="h-7 rounded border border-slate-200 px-1.5 text-[11px] text-slate-600">
            <option>All</option>{dimensions.map((d) => <option key={d.id}>{d.name}</option>)}
          </select>
          <select value={severity} onChange={(e) => onSeverity(e.target.value)} aria-label="Signal severity"
            className="h-7 rounded border border-slate-200 px-1.5 text-[11px] text-slate-600">
            {["All", "Critical", "High", "Medium High", "Medium", "Low"].map((x) => <option key={x}>{x}</option>)}
          </select>
          <select value={sourceModule} onChange={(e) => onSourceModule(e.target.value)} aria-label="Source module"
            className="h-7 rounded border border-slate-200 px-1.5 text-[11px] text-slate-600">
            {modules.map((x) => <option key={x}>{x}</option>)}
          </select>
          <select value={density} onChange={(e) => onDensity(e.target.value as Density)} aria-label="Table density"
            className="h-7 rounded border border-slate-200 px-1.5 text-[11px] text-slate-600">
            <option value="compact">Compact</option><option value="standard">Standard</option><option value="comfortable">Comfortable</option>
          </select>
        </>
      }>
      {rows.length === 0 ? <EmptyState message="No health signals match these filters" hint="Widen the dimension, severity, or source module filter" /> : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead><tr className="border-b border-slate-200">
                {["Signal ID", "Signal", "Dimension", "Scope", "Current", "Target", "Previous", "Trend", "Confidence", "Severity", "Source Module", "Records", "Status"].map((h) => <Th key={h}>{h}</Th>)}
              </tr></thead>
              <tbody>
                {rows.map((sig) => (
                  <tr key={sig.id} className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                    tabIndex={0} role="button" onClick={() => onOpen(sig)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(sig); } }}>
                    <Td className={pad(density)}>{sig.id}</Td>
                    <Td className={cn(pad(density), "font-medium")}>{sig.name}</Td>
                    <Td className={pad(density)}>{dimensionById(sig.dimensionId).name}</Td>
                    <Td className={pad(density)}>{sig.scopeId}</Td>
                    <Td className={pad(density)}>{sig.currentValue}</Td>
                    <Td className={pad(density)}>{sig.targetValue}</Td>
                    <Td className={pad(density)}>{sig.previousValue}</Td>
                    <Td className={pad(density)}><Trend value={sig.trend} /></Td>
                    <Td className={pad(density)}>{sig.confidence}%</Td>
                    <Td className={pad(density)}>{sig.severity}</Td>
                    <Td className={pad(density)}>{sig.sourceModule}</Td>
                    <Td className={pad(density)}>{sig.recordCount.toLocaleString()}</Td>
                    <Td className={pad(density)}><Pill label={sig.status} tone={chTone(sig.status)} /></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-1.5 flex items-center justify-end gap-1.5">
            <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button>
            <span className="text-[11px] text-slate-500">Page {page} of {pageCount}</span>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>Next</Button>
          </div>
        </>
      )}
    </Panel>
  );
}

/* ======================================================= latency analysis */

export function LatencyPanel() {
  return (
    <Panel id="panel-latency" title="Enterprise Decision Response Latency"
      subtitle="This measures the time required for the enterprise to establish shared understanding and decision context. It is not software response time."
      actions={<Pill label="Organizational time, not system time" tone="slate" />}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px]">
          <thead><tr className="border-b border-slate-200">
            {["Latency Measure", "From", "To", "Current", "Target", "Previous", "Trend", "Status"].map((h) => <Th key={h}>{h}</Th>)}
          </tr></thead>
          <tbody>
            {latencyMetrics.map((m) => (
              <tr key={m.id} className={cn("border-b border-slate-100", m.id === "LAT 6" && "bg-slate-50 font-medium")}>
                <Td className="py-1">{m.name}</Td><Td className="py-1">{m.stageFrom}</Td><Td className="py-1">{m.stageTo}</Td>
                <Td className="py-1">{m.currentDuration}</Td><Td className="py-1">{m.targetDuration}</Td>
                <Td className="py-1">{m.previousDuration}</Td><Td className="py-1"><Trend value={m.trend} /></Td>
                <Td className="py-1"><Pill label={m.status} tone={chTone(m.status)} /></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Bottlenecks</p>
      <div className="grid gap-2 md:grid-cols-4">
        {latencyBottlenecks.map((b) => (
          <div key={b.id} className="rounded border border-slate-200 p-2">
            <div className="flex items-center justify-between">
              <p className="text-[11.5px] font-medium text-slate-800">{b.name}</p>
              <span className="text-[13px] font-bold text-slate-900">{b.share}</span>
            </div>
            <p className="text-[10.5px] text-slate-500">{b.detail}</p>
            <Trend value={b.trend} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ============================================ dimension metric group panels */

function MetricGrid({ metrics }: { metrics: MetricRow[] }) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((m) => (
        <div key={m.label} className="rounded border border-slate-200 px-2 py-1.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{m.label}</p>
          <div className="flex items-end justify-between">
            <span className="text-[17px] font-bold leading-tight text-slate-900">{m.value}</span>
            <Pill label={m.status} tone={chTone(m.status)} />
          </div>
          {m.target && <p className="text-[10px] text-slate-500">Target {m.target}</p>}
        </div>
      ))}
    </div>
  );
}

export function DependencyVisibilityPanel() {
  return (
    <Panel id="panel-dependency" title="Dependency Visibility Health"
      subtitle="Whether decision makers can see the systems, services, teams and journeys a change will touch">
      <MetricGrid metrics={dependencyVisibilityMetrics} />
      <p className="mt-2 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">High Attention Dependencies</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px]">
          <thead><tr className="border-b border-slate-200">
            {["Dependency", "Affected Personas", "Relationship Confidence", "Evidence Freshness", "Owner State", "Active Decisions", "Health Effect"].map((h) => <Th key={h}>{h}</Th>)}
          </tr></thead>
          <tbody>
            {highAttentionDependencies.map((d) => (
              <tr key={d.id} className="border-b border-slate-100">
                <Td className="py-1">{d.id} · {d.name}</Td>
                <Td className="py-1">{d.personas.join(", ")}</Td>
                <Td className="py-1">{d.confidence}%</Td>
                <Td className="py-1">{d.freshness}</Td>
                <Td className="py-1"><Pill label={d.owner} tone={chTone(d.owner)} /></Td>
                <Td className="py-1">{d.decisions.join(", ") || "None"}</Td>
                <Td className="py-1">{d.effect}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function InformationQualityPanel() {
  return (
    <Panel id="panel-information-quality" title="Information Quality Health"
      subtitle="Whether enterprise information is authoritative, evidence linked, current, owned and reusable">
      <MetricGrid metrics={informationQualityMetrics} />
      <ul className="mt-2 space-y-1">
        {informationQualityAttention.map((a) => (
          <li key={a} className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-800">{a}</li>
        ))}
      </ul>
    </Panel>
  );
}

export function ContextPreservationPanel() {
  return (
    <Panel id="panel-context-preservation" title="Context Preservation Health"
      subtitle="Whether enterprise context remains traceable across evidence, conditions, personas, decisions, outcomes and historical versions">
      <MetricGrid metrics={contextPreservationMetrics} />
      <div className={cn("mt-2 rounded border px-2 py-1.5",
        historicalRewriteViolations === 0 ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50")}>
        <p className="text-[11.5px] font-semibold text-slate-800">
          Historical Context Rewrite Violations · {historicalRewriteViolations}
        </p>
        <p className="text-[10.5px] text-slate-600">
          Historical decision context is never rewritten with knowledge discovered later. This value must remain zero in
          every healthy scenario; any non zero value is a governance breach, not a score adjustment.
        </p>
      </div>
    </Panel>
  );
}

export function DecisionConfidencePanel() {
  return (
    <Panel id="panel-decision-confidence" title="Decision Confidence Health"
      subtitle="Whether decisions are made with sufficient context, evidence, alternatives, risk analysis and explicit tradeoffs">
      <MetricGrid metrics={decisionConfidenceMetrics} />
    </Panel>
  );
}

export function CrossTeamAwarenessPanel() {
  return (
    <Panel id="panel-cross-team" title="Cross Team Awareness Health"
      subtitle="Whether teams understand how their work affects other Team Personas before consequences become reactive">
      <MetricGrid metrics={crossTeamAwarenessMetrics} />
    </Panel>
  );
}

export function LearningMaturityPanel() {
  return (
    <Panel id="panel-learning-maturity" title="Learning Maturity Health"
      subtitle="Whether decisions connect to outcomes and whether validated learning improves the context of future decisions">
      <MetricGrid metrics={learningMaturityMetrics} />
      <ul className="mt-2 space-y-1">
        {learningMaturityAttention.map((a) => (
          <li key={a} className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-800">{a}</li>
        ))}
      </ul>
    </Panel>
  );
}

/* ======================================================== module matrix */

export function ModuleCorrelationPanel({ onCell }: { onCell: (module: string, dimensionId: string) => void }) {
  return (
    <Panel id="panel-modules" title="ECF Module Health Contribution"
      subtitle="Which Enterprise Cognitive Fabric modules currently carry each health dimension. Letters accompany every state so meaning does not depend on color."
      actions={<span className="text-[10px] text-slate-500">S Strong · P Positive · — Neutral · A Attention · C Critical</span>}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead><tr className="border-b border-slate-200">
            <Th>Module</Th>{dimensions.map((d) => <Th key={d.id} className="text-center">{d.short}</Th>)}
          </tr></thead>
          <tbody>
            {moduleContributions.map((m) => (
              <tr key={m.module} className="border-b border-slate-100">
                <Td className="py-1 font-medium">{m.module}</Td>
                {dimensions.map((d) => {
                  const level = m.levels[d.id];
                  return (
                    <td key={d.id} className="px-0.5 py-0.5 text-center">
                      <button type="button" onClick={() => onCell(m.module, d.id)}
                        aria-label={`${m.module}, ${d.name}, ${level}`}
                        className="w-full rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                        <Pill label={`${contributionGlyph(level)} ${level.replace(" Contributor", "")}`} tone={contributionTone(level)} />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ================================================================= trend */

export function TrendPanel({
  range, onRange, overlays, onOverlay,
}: {
  range: TrendRange; onRange: (r: TrendRange) => void;
  overlays: string[]; onOverlay: (id: string) => void;
}) {
  const data = useMemo(() => trendSeries(range), [range]);
  const colors: Record<string, string> = {
    ECHI: "#1d4ed8", "DIM IQ": "#0f766e", "DIM CP": "#15803d", "DIM DV": "#b45309",
    "DIM CTA": "#be123c", "DIM DC": "#7c3aed", "DIM RL": "#c2410c", "DIM LM": "#0369a1",
  };
  return (
    <Panel id="panel-trend" title="Enterprise Cognitive Health Trend"
      subtitle="ECHI and all seven dimensions. Overlaid events are labelled Associated Event — no causal claim is made."
      actions={
        <select value={range} onChange={(e) => onRange(e.target.value as TrendRange)} aria-label="Trend range"
          className="h-7 rounded border border-slate-200 px-1.5 text-[11px] text-slate-600">
          {trendRanges.map((r) => <option key={r}>{r}</option>)}
        </select>
      }>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 6, right: 12, bottom: 4, left: -18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="period" tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <YAxis domain={[55, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <RTooltip contentStyle={{ fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <ReferenceLine y={92} stroke="#334155" strokeDasharray="4 4" label={{ value: "ECHI target 92", fontSize: 9, fill: "#334155" }} />
            <Line type="monotone" dataKey="ECHI" stroke={colors.ECHI} strokeWidth={2.5} dot={false} name="ECHI" />
            {dimensions.map((d) => (
              <Line key={d.id} type="monotone" dataKey={d.id} stroke={colors[d.id]} strokeWidth={1.2} dot={false} name={d.short} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Associated Events</p>
      <div className="flex flex-wrap gap-1.5">
        {associatedEvents.map((e) => (
          <button key={e.id} type="button" onClick={() => onOverlay(e.id)} aria-pressed={overlays.includes(e.id)}
            className={cn("rounded border px-2 py-1 text-left text-[10.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              overlays.includes(e.id) ? "border-blue-400 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-600 hover:border-slate-300")}>
            <span className="font-medium">{e.label}</span>
            <span className="ml-1 text-slate-400">{e.period}</span>
            {overlays.includes(e.id) && <span className="block text-[10px] text-slate-500">{e.detail}</span>}
          </button>
        ))}
      </div>
      <p className="mt-1 text-[10px] text-slate-500">
        Events are shown as associated context. An event appearing near a score movement is not evidence that it caused
        the movement.
      </p>
    </Panel>
  );
}

/* ====================================================== change explainer */

export function ChangeExplainerPanel({ comparisonPeriod }: { comparisonPeriod: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const improvements = healthChanges.filter((c) => c.change > 0);
  const deteriorations = healthChanges.filter((c) => c.change < 0);
  return (
    <Panel id="panel-changes" title="What Changed?"
      subtitle={`Current period compared against ${comparisonPeriod.toLowerCase()}`}>
      <div className="grid gap-2 lg:grid-cols-2">
        {[["Improvements", improvements], ["Deteriorations", deteriorations]].map(([label, list]) => (
          <div key={label as string}>
            <p className="mb-1 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">{label as string}</p>
            <ul className="space-y-1">
              {(list as typeof healthChanges).map((c) => (
                <li key={c.id}>
                  <button type="button" onClick={() => setOpen(open === c.id ? null : c.id)} aria-expanded={open === c.id}
                    className={cn("w-full rounded border px-2 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                      c.change > 0 ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50")}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11.5px] font-medium text-slate-800">{c.dimensionName}</span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-600">
                        {c.previousValue} → {c.currentValue} <Trend value={c.change} />
                        {open === c.id ? <ChevronUp className="h-3 w-3" aria-hidden /> : <ChevronDown className="h-3 w-3" aria-hidden />}
                      </span>
                    </div>
                    {open === c.id && (
                      <div className="mt-1 space-y-0.5 text-[10.5px] text-slate-600">
                        <p>Scope · {c.scopeType} {c.scopeId}</p>
                        <p>Contributing Signals · {c.contributingSignalIds.join(", ")}</p>
                        <p>Associated Events · {c.associatedEventIds.length
                          ? c.associatedEventIds.map((e) => associatedEvents.find((x) => x.id === e)?.label ?? e).join(", ")
                          : "None recorded"}</p>
                        <p>Confidence · {c.confidence}% · Recorded {c.timestamp}</p>
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ====================================================== critical signals */

export function CriticalSignalsPanel({ onOpen }: { onOpen: (signalId: string) => void }) {
  return (
    <Panel id="panel-critical" title="Critical Cognitive Health Signals"
      subtitle="Prompt 1 supports investigation only. Alerting, ownership routing and intervention arrive in Prompt 2."
      actions={<Pill label="Investigation only" tone="slate" />}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead><tr className="border-b border-slate-200">
            {["Signal", "Dimension", "Scope", "Severity", "Current", "Target", "Trend", "Affected Decisions", "Affected Teams", "Owner Context", "Status"].map((h) => <Th key={h}>{h}</Th>)}
          </tr></thead>
          <tbody>
            {criticalSignals.map((c) => (
              <tr key={c.id} className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                tabIndex={0} role="button" onClick={() => onOpen(c.signalId)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(c.signalId); } }}>
                <Td className="py-1 font-medium">{c.signal}</Td>
                <Td className="py-1">{c.dimension}</Td><Td className="py-1">{c.scope}</Td>
                <Td className="py-1"><Pill label={c.severity} tone={chTone(c.severity)} /></Td>
                <Td className="py-1">{c.current}</Td><Td className="py-1">{c.target}</Td>
                <Td className="py-1"><Trend value={c.trend} /></Td>
                <Td className="py-1">{c.decisions.join(", ") || "None"}</Td>
                <Td className="py-1">{c.teams.join(", ")}</Td>
                <Td className="py-1">{c.owner}</Td>
                <Td className="py-1"><Pill label={c.status} tone={chTone(c.status)} /></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* =============================================================== summary */

export function HealthSummaryPanel({ onPrompt2 }: { onPrompt2: (label: string) => void }) {
  const sm = healthSummary;
  return (
    <Panel id="panel-summary" title="Enterprise Cognitive Health Summary"
      subtitle="The enterprise level read of organizational cognition health for this period"
      actions={<Pill label={sm.status} tone={chTone(sm.status)} />}>
      <div className="grid gap-2 lg:grid-cols-[220px_1fr]">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
          <p className="text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Current ECHI</p>
          <p className="text-[32px] font-bold leading-none text-slate-900">{sm.currentEchi}</p>
          <p className="text-[11px] text-slate-500">Target {sm.target}</p>
          <div className="mt-1"><ScoreBar score={sm.currentEchi} target={sm.target} /></div>
          <p className="mt-1.5 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Strongest</p>
          {sm.strongest.map((x) => <p key={x} className="text-[11px] text-emerald-700">{x}</p>)}
          <p className="mt-1 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Attention</p>
          {sm.attention.map((x) => <p key={x} className="text-[11px] text-amber-700">{x}</p>)}
        </div>
        <div className="space-y-2">
          <div className="rounded border border-slate-200 bg-white px-2 py-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Primary Enterprise Finding</p>
            <p className="text-[12px] text-slate-800">{sm.primaryFinding}</p>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <p className="text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Key Positive Signals</p>
              <ul className="list-inside list-disc text-[11px] text-slate-700">{sm.positiveSignals.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
            <div>
              <p className="text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Key Attention Signals</p>
              <ul className="list-inside list-disc text-[11px] text-slate-700">{sm.attentionSignals.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          </div>
          <div className="rounded border border-amber-200 bg-amber-50 px-2 py-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wide text-amber-700">Current Decision Exposure</p>
            <p className="text-[11.5px] text-amber-900">{sm.decisionExposure}</p>
          </div>
          <div>
            <p className="text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Potential Improvement Levers</p>
            <div className="flex flex-wrap gap-1.5">
              {sm.improvementLevers.map((x) => (
                <Button key={x} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onPrompt2(`Health Intervention · ${x}`)}>
                  {x}
                </Button>
              ))}
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              Prompt 2 converts these levers into governed Health Interventions with owners, plans and review workflow.
            </p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* ============================================================== activity */

export function ActivityPanel({ items }: { items: CognitiveHealthActivity[] }) {
  return (
    <Panel id="panel-activity" title="Recent Health Activity"
      subtitle="Deterministic audit trail of health measurement events">
      <ol className="space-y-1">
        {items.map((a) => (
          <li key={a.id} className="flex items-start justify-between gap-2 border-b border-slate-100 py-1 last:border-0">
            <div>
              <p className="text-[11.5px] font-medium text-slate-800">{a.action} · {a.scopeId}</p>
              <p className="text-[11px] text-slate-500">{a.description}</p>
              <p className="text-[10px] text-slate-400">{a.result} · {a.owner} · {a.auditId}</p>
            </div>
            <span className="shrink-0 text-[10.5px] text-slate-400">{a.timestamp}</span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
