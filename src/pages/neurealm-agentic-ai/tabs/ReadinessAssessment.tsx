import { useEffect, useMemo, useState } from "react";
import { SectionCard, StatusPill } from "../components/primitives";
import { readinessCategories } from "../data";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip,
} from "recharts";

export type ReadinessResult = { score: number; stage: string };

const stageFor = (score: number) =>
  score <= 40 ? "Foundation Required" :
  score <= 60 ? "Pilot Ready with Gaps" :
  score <= 80 ? "Platform MVP Ready" :
  "Production Scale Ready";

const toneFor = (score: number) =>
  score <= 40 ? "rose" : score <= 60 ? "amber" : score <= 80 ? "indigo" : "emerald";

const startingPoint = (score: number) =>
  score <= 40 ? "Landing zone + identity + governance foundation before any agent workload." :
  score <= 60 ? "Guided pilot with 1–2 low-risk agents, tight HITL, and evaluation harness." :
  score <= 80 ? "Platform MVP with 3–5 agents across two domains, private endpoints, and observability." :
  "Scale-out across domains, multi-region, and continuous model + agent evaluation.";

const risksFor = (score: number) =>
  score <= 40 ? [
    "No enforced landing zone increases operational and security risk.",
    "Data classification gaps expose sensitive information to agents.",
    "Absence of HITL policy leads to unbounded agent authority.",
  ] : score <= 60 ? [
    "Integration fragility from ad-hoc connectors.",
    "Insufficient evaluation harness for model regressions.",
    "Undefined ownership between platform and business teams.",
  ] : score <= 80 ? [
    "Cost governance not yet automated at agent level.",
    "Runbook coverage lags feature velocity.",
  ] : [
    "Complacency risk: keep raising the bar with red-teaming and evaluation.",
  ];

const nextActionsFor = (score: number) =>
  score <= 40 ? ["Stand up Azure landing zone", "Adopt Entra ID + Conditional Access", "Publish AI use policy"] :
  score <= 60 ? ["Select two pilot use cases", "Deploy Neurealm platform MVP", "Instrument evaluation + HITL"] :
  score <= 80 ? ["Onboard 3 domains", "Automate DR runbooks", "Introduce cost per-outcome telemetry"] :
  ["Expand multi-region", "Formalize AI governance board", "Introduce continuous red-teaming"];

export default function ReadinessAssessment({ onReadinessChange }: {
  onReadinessChange?: (r: ReadinessResult) => void;
}) {
  const [scores, setScores] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(readinessCategories.map((c) => [c.id, c.questions.map(() => 3)]))
  );

  const catAverages = useMemo(() =>
    readinessCategories.map((c) => {
      const s = scores[c.id];
      const avg = s.reduce((a, b) => a + b, 0) / s.length;
      return { id: c.id, name: c.name.replace(" Readiness", ""), avg, pct: Math.round((avg / 5) * 100) };
    }), [scores]);

  const overall = useMemo(() =>
    Math.round(catAverages.reduce((a, c) => a + c.pct, 0) / catAverages.length), [catAverages]);

  const stage = stageFor(overall);
  const tone = toneFor(overall);

  useEffect(() => {
    onReadinessChange?.({ score: overall, stage });
  }, [overall, stage, onReadinessChange]);

  const setScore = (catId: string, qi: number, val: number) => {
    setScores((s) => ({ ...s, [catId]: s[catId].map((v, i) => (i === qi ? val : v)) }));
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-4">
      <SectionCard title="Readiness questionnaire" subtitle="Score each item 1 (not started) to 5 (production-ready)">
        <div className="space-y-3">
          {readinessCategories.map((c) => (
            <div key={c.id} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[13px] font-semibold text-slate-900">{c.name}</div>
                <StatusPill tone="indigo">
                  {Math.round(((scores[c.id].reduce((a, b) => a + b, 0) / scores[c.id].length) / 5) * 100)}%
                </StatusPill>
              </div>
              <div className="space-y-2">
                {c.questions.map((q, qi) => (
                  <div key={q} className="grid grid-cols-[1fr_auto] gap-3 items-center">
                    <div className="text-[12px] text-slate-700">{q}</div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button key={v}
                          onClick={() => setScore(c.id, qi, v)}
                          className={`h-6 w-6 rounded-md text-[11px] font-semibold border transition ${
                            scores[c.id][qi] === v
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                          }`}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="space-y-4">
        <SectionCard title="Overall readiness">
          <div className="text-center">
            <div className="text-5xl font-bold text-slate-900">{overall}</div>
            <div className="text-[11px] text-slate-500 mt-1">out of 100</div>
            <div className="mt-2"><StatusPill tone={tone}>{stage}</StatusPill></div>
          </div>
          <div className="h-64 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={catAverages}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: "#475569" }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar dataKey="pct" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.25} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Recommendation">
          <div>
            <div className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">Suggested starting point</div>
            <p className="text-[13px] text-slate-700 mt-1">{startingPoint(overall)}</p>
          </div>
          <div className="mt-3">
            <div className="text-[11px] font-semibold text-rose-600 uppercase tracking-wide">Key risks</div>
            <ul className="mt-1 space-y-1">
              {risksFor(overall).map((r) => (
                <li key={r} className="text-[12.5px] text-slate-700 flex gap-1.5"><span className="text-rose-400">•</span>{r}</li>
              ))}
            </ul>
          </div>
          <div className="mt-3">
            <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide">Suggested next actions</div>
            <ul className="mt-1 space-y-1">
              {nextActionsFor(overall).map((a) => (
                <li key={a} className="text-[12.5px] text-slate-700 flex gap-1.5"><span className="text-emerald-500">→</span>{a}</li>
              ))}
            </ul>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
