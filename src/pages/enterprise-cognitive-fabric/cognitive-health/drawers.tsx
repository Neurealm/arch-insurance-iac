/** Enterprise Cognitive Health — detail drawers. Reuses the shared ECF Drawer primitive. */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { Drawer, Pill, Row } from "../persona-studio/primitives";
import { Trend } from "./panels";
import {
  businessUnits, chTone, contributorsForDimension, criticalSignals, dimensionById, dimensions,
  healthChanges, knowledgeDomains, pathsForDimension, personaHealth, signalsForDimension, signals,
  trendSeries,
  type CognitiveHealthDimension, type CognitiveHealthSignal, type TeamPersonaCognitiveHealth,
} from "./data";

function Tabs({ tabs, tab, onTab }: { tabs: string[]; tab: string; onTab: (t: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-slate-200" role="tablist">
      {tabs.map((t) => (
        <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => onTab(t)}
          className={cn("rounded-t px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            tab === t ? "border-b-2 border-blue-600 font-medium text-blue-700" : "text-slate-500 hover:text-slate-700")}>
          {t}
        </button>
      ))}
    </div>
  );
}

function MiniTable({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <table className="w-full text-[11px]">
      <thead><tr className="border-b border-slate-200">
        {head.map((h) => <th key={h} scope="col" className="px-1.5 py-1 text-left font-medium text-slate-500">{h}</th>)}
      </tr></thead>
      <tbody>{rows.map((r, i) => (
        <tr key={i} className="border-b border-slate-100">
          {r.map((c, j) => <td key={j} className="px-1.5 py-1 align-top text-slate-700">{c}</td>)}
        </tr>
      ))}</tbody>
    </table>
  );
}

/* =================================================== dimension detail drawer */

const DIMENSION_TABS = ["Overview", "Signals", "Contributors", "Business Units", "Teams", "Domains", "Decisions", "History"];

export function DimensionDrawer({
  dimension, onClose, onSignal, onNavigate,
}: {
  dimension: CognitiveHealthDimension | null;
  onClose: () => void;
  onSignal: (id: string) => void;
  onNavigate: (target: string) => void;
}) {
  const [tab, setTab] = useState("Overview");
  if (!dimension) return null;
  const dimSignals = signalsForDimension(dimension.id);
  const contribs = contributorsForDimension(dimension.id);
  const series = trendSeries("30 Days");
  const affectedDecisions = Array.from(new Set(dimSignals.flatMap((s) => s.affectedDecisionIds)));

  return (
    <Drawer open={!!dimension} onOpenChange={(v) => { if (!v) onClose(); }} wide
      title={`${dimension.name} · ${dimension.score} / 100`}
      description={`Target ${dimension.target} · previous ${dimension.previousScore} · confidence ${dimension.confidence}% · ${dimension.status}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <Pill label={dimension.status} tone={chTone(dimension.status)} />
        <Trend value={dimension.trend} />
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onNavigate("workbench")}>Open in Workbench</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onNavigate("signals")}>Open Signal Explorer</Button>
      </div>

      <Tabs tabs={DIMENSION_TABS} tab={tab} onTab={setTab} />

      <div className="mt-2 space-y-2">
        {tab === "Overview" && (
          <div>
            <Row label="Definition" value={dimension.description} />
            <Row label="Why It Matters" value={dimension.whyItMatters} />
            <div className="grid grid-cols-2 gap-x-4">
              <Row label="Current Score" value={dimension.score} />
              <Row label="Target" value={dimension.target} />
              <Row label="Previous" value={dimension.previousScore} />
              <Row label="Confidence" value={`${dimension.confidence}%`} />
              <Row label="Signal Coverage" value={`${dimSignals.length} measured signals`} />
              <Row label="ECHI Weight" value={`${(dimension.weight * 100).toFixed(0)}%`} />
            </div>
            <p className="mt-1 text-[10.5px] font-medium uppercase tracking-wide text-emerald-700">Positive Drivers</p>
            <ul className="list-inside list-disc text-[11px] text-slate-700">
              {contribs.filter((c) => c.contributionDirection === "Positive").map((c) => <li key={c.id}>{c.description}</li>)}
            </ul>
            <p className="mt-1 text-[10.5px] font-medium uppercase tracking-wide text-red-700">Negative Drivers</p>
            <ul className="list-inside list-disc text-[11px] text-slate-700">
              {contribs.filter((c) => c.contributionDirection === "Negative").map((c) => <li key={c.id}>{c.description}</li>)}
            </ul>
            <p className="mt-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-1 text-[10.5px] text-slate-600">
              Recommended focus · {dimension.recommendedFocus}
            </p>
          </div>
        )}

        {tab === "Signals" && (
          <MiniTable head={["Signal", "Current", "Target", "Weight", "Confidence", "Trend", "Status"]}
            rows={dimSignals.map((s) => [
              <button key={s.id} type="button" className="text-left text-blue-700 underline-offset-2 hover:underline"
                onClick={() => onSignal(s.id)}>{s.id} · {s.name}</button>,
              s.currentValue, s.targetValue, `${(dimension.weight * 100 / dimSignals.length).toFixed(1)}%`,
              `${s.confidence}%`, <Trend key={`t${s.id}`} value={s.trend} />,
              <Pill key={`p${s.id}`} label={s.status} tone={chTone(s.status)} />,
            ])} />
        )}

        {tab === "Contributors" && (
          <MiniTable head={["Record", "Module", "Contribution", "Evidence", "Impact"]}
            rows={contribs.map((c) => [
              c.sourceRecordIds.join(", "), c.sourceModule,
              `${c.contributionDirection === "Positive" ? "+" : ""}${c.contributionMagnitude}`,
              `${c.signalId} · confidence ${c.confidence}%`, c.description,
            ])} />
        )}

        {tab === "Business Units" && (
          <MiniTable head={["Unit", "Score", "Trend", "Primary Driver"]}
            rows={businessUnits.map((b) => [
              b.businessUnit, b.dimensionScores[dimension.id],
              <Trend key={b.id} value={b.trend} />, b.primaryConcern,
            ])} />
        )}

        {tab === "Teams" && (
          <MiniTable head={["Team Persona", "Score", "Trend", "Attention Area"]}
            rows={personaHealth.map((p) => [
              `${p.persona} ${p.personaVersion}`, p.dimensionScores[dimension.id],
              <Trend key={p.id} value={p.overallScore >= 88 ? 3 : p.overallScore >= 82 ? 1 : -1} />,
              p.attentionItems[0] ?? "None",
            ])} />
        )}

        {tab === "Domains" && (
          <MiniTable head={["Knowledge Domain", "Score", "Trend"]}
            rows={knowledgeDomains.map((k) => [
              k.knowledgeDomain, k.dimensionScores[dimension.id], <Trend key={k.id} value={k.trend} />,
            ])} />
        )}

        {tab === "Decisions" && (
          affectedDecisions.length === 0
            ? <p className="text-[11px] text-slate-500">No active decision currently carries material risk from this dimension.</p>
            : <MiniTable head={["Decision", "Relevance", "Risk"]}
              rows={affectedDecisions.map((d) => {
                const crit = criticalSignals.find((c) => c.decisions.includes(d));
                return [d, crit?.signal ?? "Contributing signal", crit?.severity ?? "Medium"];
              })} />
        )}

        {tab === "History" && (
          <div>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 6, right: 8, bottom: 0, left: -22 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="period" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis domain={[60, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <RTooltip contentStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey={dimension.id} stroke="#1d4ed8" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Material Events</p>
            <MiniTable head={["Recorded", "Change", "Scope", "Confidence"]}
              rows={healthChanges.filter((c) => c.dimensionId === dimension.id).map((c) => [
                c.timestamp, `${c.previousValue} to ${c.currentValue}`, `${c.scopeType} ${c.scopeId}`, `${c.confidence}%`,
              ])} />
          </div>
        )}
      </div>
    </Drawer>
  );
}

/* ====================================================== signal detail drawer */

const SIGNAL_TABS = ["Overview", "Calculation", "Underlying Records", "Scope", "Trend", "Affected Decisions", "Evidence"];

export function SignalDrawer({ signal, onClose }: { signal: CognitiveHealthSignal | null; onClose: () => void }) {
  const [tab, setTab] = useState("Overview");
  if (!signal) return null;
  const dim = dimensionById(signal.dimensionId);
  const data = signal.series.map((v, i) => ({ period: ["P1", "P2", "P3", "P4", "Current"][i], value: v }));

  return (
    <Drawer open={!!signal} onOpenChange={(v) => { if (!v) onClose(); }} wide
      title={`${signal.id} · ${signal.name}`}
      description={`${dim.name} · ${signal.scopeType} scope ${signal.scopeId} · source ${signal.sourceModule}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <Pill label={signal.status} tone={chTone(signal.status)} />
        <Pill label={signal.severity} tone={chTone(signal.severity)} />
        <Trend value={signal.trend} />
      </div>

      <Tabs tabs={SIGNAL_TABS} tab={tab} onTab={setTab} />

      <div className="mt-2 space-y-2">
        {tab === "Overview" && (
          <div className="grid grid-cols-2 gap-x-4">
            <Row label="Definition" value={signal.definition} />
            <Row label="Dimension" value={dim.name} />
            <Row label="Current" value={signal.currentValue} />
            <Row label="Target" value={signal.targetValue} />
            <Row label="Previous" value={signal.previousValue} />
            <Row label="Confidence" value={`${signal.confidence}%`} />
            <Row label="Severity" value={signal.severity} />
            <Row label="Freshness" value={signal.freshness} />
          </div>
        )}
        {tab === "Calculation" && (
          <div>
            <p className="rounded border border-slate-200 bg-slate-50 px-1.5 py-1 text-[11px] text-slate-700">{signal.calculation}</p>
            <MiniTable head={["Input", "Value"]} rows={[
              ["Records evaluated", signal.recordCount.toLocaleString()],
              ["Unit", signal.unit],
              ["Source module", signal.sourceModule],
              ["Measurement freshness", signal.freshness],
              ["Confidence", `${signal.confidence}%`],
            ]} />
            <p className="text-[10px] text-slate-500">
              Deterministic demonstration calculation. It is transparent by design and does not imply statistical precision.
            </p>
          </div>
        )}
        {tab === "Underlying Records" && (
          <MiniTable head={["Record", "Module", "Role"]}
            rows={signal.sourceRecordIds.map((r) => [r, signal.sourceModule, "Contributing record"])} />
        )}
        {tab === "Scope" && (
          <div>
            <Row label="Scope Type" value={signal.scopeType} />
            <Row label="Scope" value={signal.scopeId} />
            <MiniTable head={["Business Unit", "Dimension Score"]}
              rows={businessUnits.map((b) => [b.businessUnit, b.dimensionScores[dim.id]])} />
          </div>
        )}
        {tab === "Trend" && (
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -22 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <RTooltip contentStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="value" stroke="#1d4ed8" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {tab === "Affected Decisions" && (
          signal.affectedDecisionIds.length === 0
            ? <p className="text-[11px] text-slate-500">This signal does not currently create material risk for an active decision.</p>
            : <MiniTable head={["Decision", "Material Risk"]}
              rows={signal.affectedDecisionIds.map((d) => [d, `${signal.name} below target`])} />
        )}
        {tab === "Evidence" && (
          <MiniTable head={["Attribute", "Value"]} rows={[
            ["Evidence source", signal.sourceModule],
            ["Record count", signal.recordCount.toLocaleString()],
            ["Freshness", signal.freshness],
            ["Measurement confidence", `${signal.confidence}%`],
            ["Scope", `${signal.scopeType} · ${signal.scopeId}`],
          ]} />
        )}
      </div>
    </Drawer>
  );
}

/* ================================================== team health detail drawer */

export function TeamHealthDrawer({
  persona, onClose, onNavigate,
}: {
  persona: TeamPersonaCognitiveHealth | null;
  onClose: () => void;
  onNavigate: (target: string) => void;
}) {
  if (!persona) return null;
  return (
    <Drawer open={!!persona} onOpenChange={(v) => { if (!v) onClose(); }} wide
      title={`${persona.persona} ${persona.personaVersion} · Cognitive Health ${persona.overallScore}`}
      description="Health of the operating context this Persona represents. No individual is measured or ranked.">
      <div className="flex flex-wrap gap-1.5">
        <Pill label={persona.status} tone={chTone(persona.status)} />
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onNavigate("persona")}>Open Persona</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onNavigate("conditions")}>Open Related Conditions</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onNavigate("decisions")}>Open Related Decisions</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onNavigate("learning")}>Open Learning</Button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-x-4">
        <Row label="Persona Version" value={persona.personaVersion} />
        <Row label="Persona Quality" value={`${persona.personaQuality} / 100`} />
        <Row label="Overall Cognitive Health" value={persona.overallScore} />
        <Row label="Dependency Health" value={`${persona.dependencyHealth}%`} />
        <Row label="Open Conflicts" value={persona.openConflictCount} />
        <Row label="Coordination Actions" value={persona.coordinationActionCount} />
        <Row label="Evidence Gaps" value={persona.evidenceGapCount} />
        <Row label="Active Decisions" value={persona.activeDecisionIds.join(", ") || "None"} />
        <Row label="Learning Reuse" value={`${persona.learningReuse}%`} />
        <Row label="Average Response Latency" value={persona.responseLatency} />
        <Row label="Evidence Freshness" value={persona.freshness} />
      </div>

      <p className="mt-1 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Dimension Scores</p>
      <div className="space-y-0.5">
        {dimensions.map((d) => (
          <div key={d.id}>
            <div className="flex items-center justify-between text-[10.5px]">
              <span className="text-slate-600">{d.name}</span>
              <span className="font-medium text-slate-800">{persona.dimensionScores[d.id]}</span>
            </div>
            <Progress value={persona.dimensionScores[d.id]} className="h-1" />
          </div>
        ))}
      </div>

      <div className="mt-1 grid gap-2 md:grid-cols-2">
        <div>
          <p className="text-[10.5px] font-medium uppercase tracking-wide text-emerald-700">Primary Strengths</p>
          <ul className="list-inside list-disc text-[11px] text-slate-700">{persona.strengths.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        <div>
          <p className="text-[10.5px] font-medium uppercase tracking-wide text-amber-700">Primary Attention Areas</p>
          <ul className="list-inside list-disc text-[11px] text-slate-700">{persona.attentionItems.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      </div>

      <p className="mt-1 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Recent Health Changes</p>
      <ul className="list-inside list-disc text-[11px] text-slate-700">{persona.recentChanges.map((x) => <li key={x}>{x}</li>)}</ul>

      <p className="mt-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-1 text-[10px] text-slate-600">
        Prompt 2 adds intervention actions, ownership assignment and remediation planning for this context.
      </p>
    </Drawer>
  );
}

/* ============================================== scope plus dimension drawer */

export function HeatmapCellDrawer({
  scope, dimensionId, onClose, onWorkbench,
}: {
  scope: string | null; dimensionId: string | null;
  onClose: () => void;
  onWorkbench: (scope: string, dimensionId: string) => void;
}) {
  if (!scope || !dimensionId) return null;
  const dim = dimensionById(dimensionId);
  const bu = businessUnits.find((b) => b.businessUnit === scope);
  const pp = personaHealth.find((p) => p.persona === scope);
  const kdm = knowledgeDomains.find((k) => k.knowledgeDomain === scope);
  const score = bu?.dimensionScores[dim.id] ?? pp?.dimensionScores[dim.id] ?? kdm?.dimensionScores[dim.id] ?? dim.score;
  const scopeSignals = signals.filter((s) => s.dimensionId === dim.id && (s.scopeId === scope || s.scopeId === "Enterprise"));
  const paths = pathsForDimension(dim.id);

  return (
    <Drawer open onOpenChange={(v) => { if (!v) onClose(); }} wide
      title={`${scope} · ${dim.name}`}
      description={`Scope and dimension detail · score ${score} · ${dim.status}`}>
      <div className="flex flex-wrap gap-1.5">
        <Pill label={`Score ${score}`} tone={chTone(dim.status)} />
        <Button size="sm" className="h-7 text-[11px]" onClick={() => onWorkbench(scope, dim.id)}>Open in Workbench</Button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-4">
        <Row label="Dimension" value={dim.name} />
        <Row label="Enterprise Score" value={dim.score} />
        <Row label="Scope Score" value={score} />
        <Row label="Target" value={dim.target} />
        <Row label="Primary Concern" value={bu?.primaryConcern ?? pp?.attentionItems[0] ?? kdm?.attentionSignalIds.join(", ") ?? "None recorded"} />
        <Row label="Confidence" value={`${dim.confidence}%`} />
      </div>
      <p className="mt-1 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Signals in Scope</p>
      <MiniTable head={["Signal", "Current", "Target", "Severity", "Source"]}
        rows={scopeSignals.map((s) => [s.name, s.currentValue, s.targetValue, s.severity, s.sourceModule])} />
      <p className="mt-1 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Contributing Paths</p>
      {paths.length === 0
        ? <p className="text-[11px] text-slate-500">No contributing path is currently recorded for this dimension.</p>
        : <MiniTable head={["Path", "Confidence", "Status"]} rows={paths.map((p) => [p.title, `${p.confidence}%`, p.status])} />}
    </Drawer>
  );
}
