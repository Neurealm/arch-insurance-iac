/** Persona Impact Analysis — signature four region workbench. */

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pill, Row } from "../persona-studio/primitives";
import { Panel } from "../cognitive-memory/panels";
import { piaTone } from "./panels";
import {
  conditionById, evaluatePersona, evidenceById, impactEvidence, impactPersonas, mitigations,
  personaById, proposalRelatedServices, proposalSystems, recommendations, requiredReviewers,
  scorePersona, type ImpactCondition, type ImpactEvidence, type PersonaImpactFinding,
  type ProposalState,
} from "./data";

const pct = (n: number) => `${Math.round(n)}%`;

const directionTone = (d: string) =>
  d === "Positive" ? "green" : d === "Negative" ? "red" : d === "Review Required" ? "amber" : d === "Mixed" ? "blue" : "slate";

export function ImpactWorkbench({
  proposal, onProposal, personaId, onPersona, selectedFindingId, onSelectFinding,
  selectedConditionId, onSelectCondition, onOpenEvidence, onOpenCondition,
}: {
  proposal: ProposalState;
  onProposal: (p: ProposalState) => void;
  personaId: string;
  onPersona: (id: string) => void;
  selectedFindingId: string | null;
  onSelectFinding: (id: string | null) => void;
  selectedConditionId: string | null;
  onSelectCondition: (id: string | null) => void;
  onOpenEvidence: (e: ImpactEvidence) => void;
  onOpenCondition: (c: ImpactCondition) => void;
}) {
  const persona = personaById(personaId);
  const findings = useMemo(() => evaluatePersona(personaId, proposal), [personaId, proposal]);
  const score = useMemo(() => scorePersona(personaId, proposal), [personaId, proposal]);
  const selectedFinding = findings.find((f) => f.id === selectedFindingId) ?? null;
  const set = (patch: Partial<ProposalState>) => onProposal({ ...proposal, ...patch });

  const highlighted = (f: PersonaImpactFinding) =>
    (selectedFindingId === f.id) || (!!selectedConditionId && f.conditionIds.includes(selectedConditionId));

  const evidenceForPersona = impactEvidence.filter((e) =>
    findings.some((f) => f.evidenceReferenceIds.includes(e.id)) || e.personaIds.includes(personaId));

  const personaMitigations = mitigations.filter((m) => m.personaId === personaId);
  const personaRecommendations = recommendations.filter((r) => r.personaId === personaId);
  const missingEvidence = [
    !proposal.fraudLossEvidence && "Fraud Loss Analysis",
    !proposal.dependencyStressEvidence && "Regional Dependency Stress Test",
    !proposal.idempotencyEvidence && "Idempotency Test Results",
  ].filter(Boolean) as string[];

  return (
    <Panel id="panel-workbench" title="Persona Impact Analysis Workbench"
      subtitle="EVAL 2048 · Checkout Retry Policy Update · one change evaluated through the selected Team Persona"
      actions={
        <div className="flex flex-wrap items-center gap-1">
          {impactPersonas.map((p) => (
            <button key={p.id} type="button" onClick={() => { onPersona(p.id); onSelectFinding(null); }}
              aria-pressed={personaId === p.id}
              className={cn("rounded border px-1.5 py-0.5 text-[10.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                personaId === p.id ? "border-blue-400 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}>
              {p.name}
            </button>
          ))}
        </div>
      }>
      <div className="grid gap-2 xl:grid-cols-4">
        {/* ------------------------------------------------ region 1 -- */}
        <section aria-label="Proposed change" className="rounded-lg border border-slate-200 bg-white p-2">
          <h3 className="text-[11.5px] font-semibold text-slate-800">1 · Proposed Change</h3>
          <p className="text-[10px] text-slate-500">Governed Intake Package PKG 5521 v4</p>
          <dl className="mt-1.5">
            <Row label="Work Item" value="Checkout Retry Policy Update" />
            <Row label="Intent" value={proposal.intent} />
            <Row label="Current State" value={proposal.currentState} />
            <Row label="Proposed State" value={proposal.proposedState} />
            <Row label="Primary Systems" value={proposalSystems.join(", ")} />
            <Row label="Related Services" value={proposalRelatedServices.join(", ")} />
            <Row label="Customer Journey" value="Checkout" />
          </dl>

          <div className="mt-2 space-y-1.5 rounded border border-slate-200 bg-slate-50 p-2">
            <p className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Demo proposal state</p>
            <label className="block text-[10.5px] text-slate-600">
              Initial scope · {proposal.initialTraffic}% traffic
              <input type="range" min={1} max={25} value={proposal.initialTraffic} className="w-full"
                onChange={(e) => set({ initialTraffic: Number(e.target.value) })} />
            </label>
            <label className="block text-[10.5px] text-slate-600">
              Maximum planned scope · {proposal.maxTraffic}% traffic
              <input type="range" min={1} max={40} value={proposal.maxTraffic} className="w-full"
                onChange={(e) => set({ maxTraffic: Number(e.target.value) })} />
            </label>
            <label className="flex flex-col gap-0.5 text-[10.5px] text-slate-600">
              Deployment timing
              <select value={proposal.deploymentTiming}
                onChange={(e) => set({ deploymentTiming: e.target.value as ProposalState["deploymentTiming"] })}
                className="h-7 rounded border border-slate-200 bg-white px-1.5 text-[11px]">
                <option>Standard window</option>
                <option>Quarter end window</option>
              </select>
            </label>
            {([
              ["progressiveRollout", "Progressive rollout"],
              ["idempotencyEvidence", "Idempotency test evidence"],
              ["rollbackThreshold", "Rollback threshold defined"],
              ["fraudLossEvidence", "Fraud loss analysis attached"],
              ["dependencyStressEvidence", "Regional dependency stress test attached"],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-1.5 text-[10.5px] text-slate-600">
                <input type="checkbox" checked={proposal[key]} onChange={(e) => set({ [key]: e.target.checked } as Partial<ProposalState>)} />
                {label}
              </label>
            ))}
          </div>

          <p className="mt-2 rounded border border-amber-200 bg-amber-50 p-1.5 text-[10.5px] text-slate-700">
            <span className="font-semibold">Governance condition. </span>
            Changes above 10% traffic require Payments Reliability and Fraud Engineering approval.
            {" "}Currently {proposal.maxTraffic > 10 ? "activated" : "not activated"}.
          </p>
          <p className="mt-1 text-[10.5px] text-slate-500">
            Missing evidence: {missingEvidence.join(", ") || "None"}
          </p>
        </section>

        {/* ------------------------------------------------ region 2 -- */}
        <section aria-label="Selected persona context" className="rounded-lg border border-slate-200 bg-white p-2">
          <div className="flex items-start justify-between gap-1.5">
            <div>
              <h3 className="text-[11.5px] font-semibold text-slate-800">2 · {persona.name} Context</h3>
              <p className="text-[10px] text-slate-500">Approved Persona {persona.version} · owner {persona.owner}</p>
            </div>
            <Pill label={persona.freshness} tone={piaTone(persona.freshness)} />
          </div>
          <dl className="mt-1.5">
            <Row label="Mission" value={persona.mission} />
            <Row label="Persona Version" value={persona.version} />
            <Row label="Quality" value={persona.quality} />
            <Row label="Confidence" value={pct(persona.confidence)} />
            <Row label="Risk Appetite" value={persona.riskAppetite} />
          </dl>
          {([
            ["Decision Priorities", persona.decisionPriorities],
            ["Success Criteria", persona.successCriteria],
            ["Constraints", persona.constraints],
            ["Dependencies", persona.dependencies],
            ["Risks", persona.risks],
            ["Controls", persona.controls],
            ["Preferred Evidence", persona.preferredEvidence],
            ["Approval Requirements", persona.approvalRequirements],
            ["Common Tradeoffs", persona.commonTradeoffs],
          ] as const).map(([label, items]) => {
            const active = selectedFinding?.personaSections.includes(label);
            return (
              <div key={label} className={cn("mt-1.5 rounded border p-1.5",
                active ? "border-blue-400 bg-blue-50/70" : "border-slate-200 bg-slate-50")}>
                <p className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <ul className="mt-0.5 space-y-0.5 text-[10.5px] text-slate-700">
                  {items.map((i) => <li key={i}>· {i}</li>)}
                </ul>
              </div>
            );
          })}
          <p className="mt-1.5 text-[10px] text-slate-500">Escalation philosophy: {persona.escalationPhilosophy}</p>
        </section>

        {/* ------------------------------------------------ region 3 -- */}
        <section aria-label="Impact analysis" className="rounded-lg border border-slate-200 bg-white p-2">
          <h3 className="text-[11.5px] font-semibold text-slate-800">3 · Impact Analysis</h3>
          <p className="text-[10px] text-slate-500">{findings.length} evaluated impact dimensions for {persona.name}</p>
          <ul className="mt-1.5 space-y-1.5">
            {findings.map((f, i) => (
              <li key={f.id}>
                <button type="button" onClick={() => onSelectFinding(selectedFindingId === f.id ? null : f.id)}
                  aria-pressed={selectedFindingId === f.id}
                  className={cn("w-full rounded border p-1.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    highlighted(f) ? "border-blue-400 bg-blue-50/70" : "border-slate-200 bg-white hover:border-blue-300")}>
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[9.5px] uppercase tracking-wide text-slate-500">Dimension {i + 1}</span>
                    <Pill label={f.impactDimension} tone="blue" />
                    <Pill label={f.direction} tone={directionTone(f.direction)} />
                    <Pill label={f.severity} tone={piaTone(f.severity)} />
                    {f.reviewRequired && <Pill label="Review Required" tone="amber" />}
                  </div>
                  <p className="mt-0.5 text-[11.5px] font-semibold text-slate-800">{f.title}</p>
                  <p className="text-[10.5px] text-slate-600">{f.description}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Confidence {pct(f.confidence)} · score contribution {f.impactScoreContribution > 0 ? "+" : ""}{f.impactScoreContribution}
                    {f.conditionIds.length ? ` · conditions ${f.conditionIds.join(", ")}` : ""}
                    {f.evidenceReferenceIds.length ? ` · evidence ${f.evidenceReferenceIds.join(", ")}` : " · evidence gap"}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-2 rounded border border-slate-200 bg-slate-50 p-2">
            <div className="flex items-baseline justify-between">
              <span className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Persona Impact Score</span>
              <Pill label={score.classification} tone={score.score >= 70 ? "red" : score.score >= 60 ? "amber" : "blue"} />
            </div>
            <p className="text-[24px] font-bold leading-none text-slate-900">{score.score} <span className="text-[11px] font-medium text-slate-500">/ 100</span></p>
            <Progress value={score.score} className="mt-1 h-1.5" />
            <p className="mt-1 text-[10.5px] text-slate-600">
              Material impact requiring mitigation and cross team review is indicated above 60. Confidence {pct(score.confidence)}.
            </p>
            <dl className="mt-1">
              <Row label="Positive Contribution" value={score.positiveContribution} />
              <Row label="Negative Contribution" value={score.negativeContribution} />
              <Row label="Governance Contribution" value={score.governanceContribution} />
              <Row label="Dependency Contribution" value={score.dependencyContribution} />
              <Row label="Risk Contribution" value={score.riskContribution} />
              <Row label="Evidence Confidence" value={pct(score.evidenceConfidence)} />
            </dl>
            <p className="mt-1 text-[10px] text-slate-500">
              The score expresses magnitude of meaningful change, not certainty. Every point traces to a listed finding.
            </p>
          </div>
        </section>

        {/* ------------------------------------------------ region 4 -- */}
        <section aria-label="Evidence and recommendation" className="rounded-lg border border-slate-200 bg-white p-2">
          <h3 className="text-[11.5px] font-semibold text-slate-800">4 · Evidence & Recommendation</h3>
          <p className="text-[10px] text-slate-500">Traceability for every impact conclusion</p>

          <p className="mt-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Supporting conditions</p>
          <ul className="space-y-1">
            {Array.from(new Set(findings.flatMap((f) => f.conditionIds))).map((id) => {
              const c = conditionById(id);
              if (!c) return null;
              return (
                <li key={id}>
                  <button type="button"
                    onClick={() => { onSelectCondition(selectedConditionId === id ? null : id); onOpenCondition(c); }}
                    className={cn("w-full rounded border p-1.5 text-left text-[10.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                      selectedConditionId === id ? "border-blue-400 bg-blue-50/70" : "border-slate-200 bg-white hover:border-blue-300")}>
                    <span className="font-medium text-slate-800">{c.id}</span> · {c.statement}
                    <span className="block text-[10px] text-slate-500">{c.conditionType} · {c.authority} · confidence {pct(c.confidence)}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="mt-2 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Supporting evidence</p>
          <ul className="space-y-1">
            {evidenceForPersona.map((e) => {
              const provided = e.id === "EVD 7706" ? proposal.fraudLossEvidence
                : e.id === "EVD 7707" ? proposal.dependencyStressEvidence
                  : e.id === "EVD 7704" ? proposal.idempotencyEvidence : e.status === "Provided";
              return (
                <li key={e.id}>
                  <button type="button" onClick={() => onOpenEvidence(e)}
                    className="w-full rounded border border-slate-200 bg-white p-1.5 text-left text-[10.5px] hover:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    <span className="font-medium text-slate-800">{e.id}</span> · {e.name}
                    <Pill label={provided ? "Provided" : "Missing"} tone={provided ? "green" : "red"} />
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-2 rounded border border-blue-200 bg-blue-50 p-2 text-[11px] text-slate-700">
            <p className="font-semibold">Recommendation</p>
            <p>
              Proceed only through segmented rollout with validated idempotency, fraud loss monitoring, dependency
              health validation, and joint approval before traffic exceeds 10%.
            </p>
          </div>

          <p className="mt-2 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Required mitigations</p>
          <ul className="space-y-0.5 text-[10.5px] text-slate-700">
            {(personaMitigations.length ? personaMitigations : mitigations).map((m) => (
              <li key={m.id}>· {m.title} <span className="text-slate-500">({m.status}, {m.owner})</span></li>
            ))}
          </ul>

          <p className="mt-2 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Required reviewers</p>
          <div className="flex flex-wrap gap-1">{requiredReviewers.map((r) => <Pill key={r} label={r} tone="blue" />)}</div>

          <p className="mt-2 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Evidence still needed</p>
          <ul className="space-y-0.5 text-[10.5px] text-slate-700">
            {missingEvidence.length ? missingEvidence.map((m) => <li key={m}>· {m}</li>) : <li>· None outstanding</li>}
          </ul>

          {personaRecommendations.length > 0 && (
            <>
              <p className="mt-2 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">Persona recommendations</p>
              <ul className="space-y-0.5 text-[10.5px] text-slate-700">
                {personaRecommendations.map((r) => <li key={r.id}>· {r.title} <span className="text-slate-500">({r.recommendationType})</span></li>)}
              </ul>
            </>
          )}

          {selectedFinding && (
            <div className="mt-2 rounded border border-slate-200 bg-slate-50 p-2 text-[10.5px] text-slate-700">
              <p className="font-semibold text-slate-800">Trace · {selectedFinding.title}</p>
              <p>Persona sections: {selectedFinding.personaSections.join(", ") || "None"}</p>
              <p>Conditions: {selectedFinding.conditionIds.join(", ") || "None"}</p>
              <p>
                Evidence: {selectedFinding.evidenceReferenceIds.map((id) => evidenceById(id)?.name ?? id).join(", ") || "Evidence gap"}
              </p>
              <p>Dependencies: {selectedFinding.dependencyIds.join(", ") || "None"}</p>
            </div>
          )}
        </section>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onSelectFinding(null)}>Clear Finding Selection</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onSelectCondition(null)}>Clear Condition Highlight</Button>
      </div>
    </Panel>
  );
}
