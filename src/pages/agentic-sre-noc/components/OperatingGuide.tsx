/**
 * Global Link Health Operating Guide.
 *
 * A compact operating brief embedded at the top of the Global Link Health Twin
 * page. It explains the outcome the twin is responsible for, the operating
 * method used to achieve it, and the current operating objective. All numbers
 * are supplied by the page; the guide adds presentation data only.
 */

import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { ChevronDown, ChevronRight, Network } from "lucide-react";
import { cn } from "@/lib/utils";
import { guideObjective, guideOutcome, guideStages } from "../data/guideFixtures";

export interface GuideMetric { label: string; value: string }

export interface OperatingGuideProps {
  outcomeMetrics: GuideMetric[];
  objectiveFacts: GuideMetric[];
  currentStageKey: string;
  onShowMap: () => void;
  onViewRisks: () => void;
  onOpenEvidence: () => void;
  onViewCoworkers: () => void;
  onRunScenario: () => void;
}

const statusTone: Record<string, string> = {
  Complete: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Active: "border-blue-200 bg-blue-50 text-blue-700",
  Upcoming: "border-slate-200 bg-slate-50 text-slate-600",
};

function GuideAction({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {children}
    </button>
  );
}

export function OperatingGuide({
  outcomeMetrics, objectiveFacts, currentStageKey,
  onShowMap, onViewRisks, onOpenEvidence, onViewCoworkers, onRunScenario,
}: OperatingGuideProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mode, setMode] = useState<"summary" | "expanded">("summary");
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const current = guideStages.find((s) => s.key === currentStageKey) ?? guideStages[0];
  const detail = guideStages.find((s) => s.key === selectedStage) ?? null;

  const viewOperatingMethod = () => {
    setCollapsed(false);
    setMode("expanded");
    setSelectedStage(current.key);
  };

  return (
    <section
      aria-labelledby="glht-guide-heading"
      className="rounded-xl border border-slate-200 bg-white shadow-sm"
      data-testid="glht-operating-guide"
    >
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-200 px-4 py-2.5">
        <div className="min-w-0">
          <h2 id="glht-guide-heading" className="text-sm font-semibold text-slate-900">
            Global Link Health Operating Guide
          </h2>
          <p className="text-[11.5px] text-slate-500">
            How the Digital Twin protects optical transport availability and customer connectivity
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex rounded-md border border-slate-200 bg-slate-50 p-0.5" role="group" aria-label="Guide display mode">
            {(["summary", "expanded"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={cn(
                  "rounded px-2 py-0.5 text-[11px] font-medium capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  mode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-600",
                )}
              >
                {m}
              </button>
            ))}
          </div>
          <RouterLink
            to="/agentic-sre-noc/global-link-health-twin/production-architecture"
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Network className="h-3 w-3" aria-hidden />Solution Diagram
          </RouterLink>
          <button
            type="button"
            aria-expanded={!collapsed}
            aria-controls="glht-guide-body"
            onClick={() => setCollapsed((c) => !c)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {collapsed ? <ChevronRight className="h-3 w-3" aria-hidden /> : <ChevronDown className="h-3 w-3" aria-hidden />}
            {collapsed ? "Expand guide" : "Collapse guide"}
          </button>
        </div>
      </header>

      {collapsed ? (
        <div id="glht-guide-body" className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5">
          <p className="min-w-[16rem] flex-1 text-[12px] text-slate-700">{guideOutcome.primary}</p>
          <span className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10.5px] font-semibold text-amber-700">
            Current risk state: Chennai fog degradation predicted
          </span>
          <span className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10.5px] font-semibold text-blue-700">
            Current stage: {current.index}. {current.title}
          </span>
        </div>
      ) : (
        <div
          id="glht-guide-body"
          className="grid grid-cols-1 gap-2.5 px-4 py-2.5 md:grid-cols-2 xl:grid-cols-12 motion-safe:transition-all"
        >
          {/* ------------------------------ Outcome --------------------------- */}
          <div className="order-1 rounded-lg border border-slate-200 bg-slate-50 p-3 md:col-span-2 xl:order-none xl:col-span-3">
            <h3 className="text-[12px] font-semibold text-slate-900">Outcome</h3>
            <p className="mt-1 text-[11.5px] leading-relaxed text-slate-700">{guideOutcome.primary}</p>

            <dl className="mt-2 divide-y divide-slate-200 rounded border border-slate-200 bg-white px-2">
              {outcomeMetrics.map((m) => (
                <div key={m.label} className="flex items-baseline justify-between gap-2 py-0.5">
                  <dt className="text-[10.5px] text-slate-500">{m.label}</dt>
                  <dd className="text-[11px] font-semibold text-slate-900">{m.value}</dd>
                </div>
              ))}
            </dl>

            {mode === "expanded" && (
              <>
                <ul className="mt-2 space-y-0.5 text-[11px] text-slate-700">
                  {guideOutcome.supporting.map((s) => (
                    <li key={s} className="flex gap-1.5">
                      <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />{s}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[11px] italic text-slate-600">{guideOutcome.successStatement}</p>
              </>
            )}
          </div>

          {/* ---------------------------- How it works ------------------------ */}
          <div className="order-3 rounded-lg border border-slate-200 p-3 md:col-span-2 xl:order-none xl:col-span-6">
            <h3 className="text-[12px] font-semibold text-slate-900">How the Global Link Health Twin Works</h3>

            <ol className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
              {guideStages.map((s) => {
                const active = selectedStage === s.key;
                return (
                  <li key={s.key}>
                    <button
                      type="button"
                      aria-pressed={active}
                      aria-current={s.key === currentStageKey ? "step" : undefined}
                      onClick={() => setSelectedStage(active ? null : s.key)}
                      className={cn(
                        "h-full w-full rounded border px-1.5 py-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                        active ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50",
                      )}
                    >
                      <span className="flex items-center gap-1">
                        <span className="text-[10px] font-semibold text-slate-500">{s.index}</span>
                        <span className="text-[11.5px] font-medium text-slate-900">{s.title}</span>
                        <span className={cn("ml-auto rounded border px-1 text-[9px] font-semibold", statusTone[s.status])}>
                          {s.status}
                        </span>
                      </span>
                      {mode === "expanded" && (
                        <span className="mt-0.5 block text-[10.5px] leading-snug text-slate-600">{s.oneLine}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>

            {detail && (
              <div className="mt-2 rounded border border-slate-200 bg-slate-50 p-2" data-testid="glht-guide-stage-detail">
                <h4 className="text-[11.5px] font-semibold text-slate-900">
                  {detail.index}. {detail.title} · {detail.status}
                </h4>
                <p className="mt-0.5 text-[11px] text-slate-700">{detail.description}</p>
                <dl className="mt-1.5 grid grid-cols-1 gap-x-4 gap-y-1 text-[10.5px] text-slate-700 sm:grid-cols-2">
                  <div><dt className="inline text-slate-500">Purpose: </dt><dd className="inline">{detail.purpose}</dd></div>
                  <div><dt className="inline text-slate-500">Processing: </dt><dd className="inline">{detail.processing}</dd></div>
                  <div><dt className="inline text-slate-500">Output: </dt><dd className="inline">{detail.output}</dd></div>
                  <div><dt className="inline text-slate-500">Page evidence: </dt><dd className="inline">{detail.pageEvidence}</dd></div>
                  <div><dt className="inline text-slate-500">Digital coworker: </dt><dd className="inline">{detail.coworker}</dd></div>
                  <div><dt className="inline text-slate-500">Latest result: </dt><dd className="inline">{detail.latestResult}</dd></div>
                  <div className="sm:col-span-2">
                    <dt className="inline text-slate-500">Inputs: </dt>
                    <dd className="inline">{detail.inputs.join(" · ")}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>

          {/* ------------------------ Operating objective --------------------- */}
          <div className="order-2 rounded-lg border border-slate-200 bg-slate-50 p-3 md:col-span-2 xl:order-none xl:col-span-3">
            <h3 className="text-[12px] font-semibold text-slate-900">Current Operating Objective</h3>
            <p className="mt-1 text-[11.5px] leading-relaxed text-slate-700">{guideObjective.primary}</p>

            <dl className="mt-2 divide-y divide-slate-200 rounded border border-slate-200 bg-white px-2">
              {objectiveFacts.map((f) => (
                <div key={f.label} className="flex items-baseline justify-between gap-2 py-0.5">
                  <dt className="text-[10.5px] text-slate-500">{f.label}</dt>
                  <dd className="text-right text-[11px] font-semibold text-slate-900">{f.value}</dd>
                </div>
              ))}
            </dl>

            {mode === "expanded" && (
              <>
                <h4 className="mt-2 text-[11px] font-semibold text-slate-800">Current condition</h4>
                <ul className="mt-0.5 space-y-0.5 text-[11px] text-slate-700">
                  {guideObjective.conditions.map((c) => (
                    <li key={c} className="flex gap-1.5">
                      <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />{c}
                    </li>
                  ))}
                </ul>
                <h4 className="mt-2 text-[11px] font-semibold text-slate-800">Next action</h4>
                <p className="text-[11px] text-slate-700">{guideObjective.nextAction}</p>
              </>
            )}
          </div>

          {/* ------------------------------ Actions --------------------------- */}
          <div className="order-4 flex flex-wrap items-center gap-1.5 md:col-span-2 xl:order-none xl:col-span-12">
            <GuideAction onClick={onShowMap}>Show on Map</GuideAction>
            <GuideAction onClick={onViewRisks}>View At-Risk Links</GuideAction>
            <GuideAction onClick={onRunScenario}>Run Chennai Scenario</GuideAction>
            {mode === "expanded" && (
              <>
                <GuideAction onClick={onOpenEvidence}>Open Evidence</GuideAction>
                <GuideAction onClick={onViewCoworkers}>View Digital Coworkers</GuideAction>
              </>
            )}
            <GuideAction onClick={viewOperatingMethod}>View Operating Method</GuideAction>
          </div>
        </div>
      )}
    </section>
  );
}
