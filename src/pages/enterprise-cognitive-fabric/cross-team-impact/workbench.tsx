/** Signature Cross Team Impact Workbench — four synchronized regions. */

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pill } from "../persona-studio/primitives";
import { Panel, ctiTone } from "./panels";
import {
  buildPairMatrix, conditionById, coordinationActionsFor, ctiPersonas, dependenciesFor,
  evidenceState, governanceActive, mitigationCandidates, pairCell, personaById, personaScore,
  proposedChange, quarterEnd, sharedConditions, sharedContext, workbenchIntersections,
  enterpriseSummary,
  type CtiAnalysisState,
} from "./data";

export function CrossTeamWorkbench({
  state, onState, selectedPersonaId, onSelectPersona, selectedDependencyId, onSelectDependency,
  selectedConditionId, onSelectCondition, onOpenCell,
}: {
  state: CtiAnalysisState;
  onState: (s: CtiAnalysisState) => void;
  selectedPersonaId: string | null;
  onSelectPersona: (id: string) => void;
  selectedDependencyId: string | null;
  onSelectDependency: (id: string | null) => void;
  selectedConditionId: string | null;
  onSelectCondition: (id: string | null) => void;
  onOpenCell: (a: string, b: string) => void;
}) {
  const deps = dependenciesFor(state);
  const actions = coordinationActionsFor(state);
  const pairs = buildPairMatrix(state);
  const evidence = evidenceState(state);
  const summary = enterpriseSummary(state);
  const gov = governanceActive(state);

  const dependencyPersonas = selectedDependencyId
    ? deps.find((d) => d.id === selectedDependencyId)?.affectedPersonaIds ?? []
    : [];
  const conditionPersonas = selectedConditionId ? conditionById(selectedConditionId).personaIds : [];
  const highlightPersona = (id: string) =>
    selectedPersonaId === id || dependencyPersonas.includes(id) || conditionPersonas.includes(id);

  return (
    <Panel id="panel-workbench" title="Cross Team Impact Workbench"
      subtitle={`${proposedChange.title} · CTA 3001 · selections stay synchronized across all four regions`}
      actions={
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col text-[9.5px] uppercase tracking-wide text-slate-500">
            Traffic Exposure
            <span className="flex items-center gap-1.5">
              <input type="range" min={1} max={100} value={state.maxTraffic}
                aria-label="Maximum traffic exposure"
                onChange={(e) => onState({ ...state, maxTraffic: Number(e.target.value) })}
                className="w-32" />
              <span className="text-[11px] font-semibold normal-case tracking-normal text-slate-800">{state.maxTraffic}%</span>
            </span>
          </label>
          <label className="flex flex-col text-[9.5px] uppercase tracking-wide text-slate-500">
            Deployment Timing
            <select value={state.deploymentTiming}
              onChange={(e) => onState({ ...state, deploymentTiming: e.target.value as CtiAnalysisState["deploymentTiming"] })}
              className="h-6 rounded border border-slate-200 bg-white px-1 text-[11px] normal-case tracking-normal">
              <option>Standard window</option>
              <option>Quarter end window</option>
              <option>Maintenance window</option>
            </select>
          </label>
          <label className="flex items-center gap-1 text-[10.5px] text-slate-600">
            <input type="checkbox" checked={state.fraudLossEvidence}
              onChange={(e) => onState({ ...state, fraudLossEvidence: e.target.checked })} />
            Fraud loss evidence
          </label>
          <label className="flex items-center gap-1 text-[10.5px] text-slate-600">
            <input type="checkbox" checked={state.idempotencyEvidence}
              onChange={(e) => onState({ ...state, idempotencyEvidence: e.target.checked })} />
            Idempotency evidence
          </label>
          <label className="flex items-center gap-1 text-[10.5px] text-slate-600">
            <input type="checkbox" checked={state.dependencyLoadEvidence}
              onChange={(e) => onState({ ...state, dependencyLoadEvidence: e.target.checked })} />
            Dependency load evidence
          </label>
        </div>
      }>
      <div className="grid gap-2 xl:grid-cols-2 2xl:grid-cols-4">
        {/* ------------------------------------- region 1 */}
        <section aria-label="Change and Persona impact summary" className="rounded-lg border border-slate-200 bg-white p-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">1 · Change and Persona Impact</h3>
          <dl className="mt-1 space-y-0.5 text-[10.5px] text-slate-600">
            <div><dt className="inline font-medium text-slate-700">Proposed change · </dt><dd className="inline">{proposedChange.proposedState}</dd></div>
            <div><dt className="inline font-medium text-slate-700">Traffic exposure · </dt><dd className="inline">{state.maxTraffic}%</dd></div>
            <div><dt className="inline font-medium text-slate-700">Rollout · </dt><dd className="inline">{proposedChange.rollout}</dd></div>
            <div><dt className="inline font-medium text-slate-700">Primary systems · </dt><dd className="inline">{proposedChange.primarySystems.join(", ")}</dd></div>
            <div><dt className="inline font-medium text-slate-700">Customer journey · </dt><dd className="inline">{proposedChange.customerJourney}</dd></div>
          </dl>
          <ul className="mt-2 space-y-1">
            {ctiPersonas.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => onSelectPersona(p.id)} aria-pressed={selectedPersonaId === p.id}
                  className={cn("w-full rounded border p-1.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    highlightPersona(p.id) ? "border-blue-400 bg-blue-50/70" : "border-slate-200 hover:border-blue-200")}>
                  <span className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-800">{p.name}</span>
                    <span className="text-[13px] font-bold text-slate-900">{personaScore(p.id, state)}</span>
                  </span>
                  <span className="mt-0.5 block text-[10px] text-emerald-700">Benefit · {p.primaryBenefit}</span>
                  <span className="block text-[10px] text-red-700">Risk · {p.primaryRisk}</span>
                  <span className="mt-1 flex flex-wrap gap-1">
                    <Pill label={p.highestSeverity} tone={ctiTone(p.highestSeverity)} />
                    {(p.reviewRequired || (p.id === "PER 4106" && gov)) && <Pill label="Review Required" tone="amber" />}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* ------------------------------------- region 2 */}
        <section aria-label="Shared enterprise context" className="rounded-lg border border-slate-200 bg-white p-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">2 · Shared Enterprise Context</h3>
          <div className="mt-1 space-y-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Shared Systems</p>
              <div className="mt-0.5 flex flex-wrap gap-1">
                {sharedContext.systems.map((s) => <span key={s} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600">{s}</span>)}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Shared Dependencies</p>
              <div className="mt-0.5 flex flex-wrap gap-1">
                {deps.map((d) => (
                  <button key={d.id} type="button" aria-pressed={selectedDependencyId === d.id}
                    onClick={() => onSelectDependency(selectedDependencyId === d.id ? null : d.id)}
                    className={cn("rounded border px-1.5 py-0.5 text-[10px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                      selectedDependencyId === d.id ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200")}>
                    {d.dependencyName}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Shared Conditions</p>
              <div className="mt-0.5 flex flex-wrap gap-1">
                {sharedConditions.map((c) => (
                  <button key={c.id} type="button" aria-pressed={selectedConditionId === c.id}
                    onClick={() => onSelectCondition(selectedConditionId === c.id ? null : c.id)}
                    className={cn("rounded border px-1.5 py-0.5 text-[10px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                      selectedConditionId === c.id ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200")}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Shared Risks</p>
              <div className="mt-0.5 flex flex-wrap gap-1">
                {sharedContext.risks.map((r) => <span key={r} className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] text-red-700">{r}</span>)}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Shared Controls</p>
              <div className="mt-0.5 flex flex-wrap gap-1">
                {sharedContext.controls.map((c) => <span key={c} className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700">{c}</span>)}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------- region 3 */}
        <section aria-label="Intersections and conflicts" className="rounded-lg border border-slate-200 bg-white p-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">3 · Intersections and Conflicts</h3>
          <ul className="mt-1 space-y-1">
            {workbenchIntersections.map((x) => {
              const cell = pairCell(pairs, x.personaIds[0], x.personaIds[1]);
              const related = x.personaIds.some((p) => highlightPersona(p));
              const govPair = x.personaIds.includes("PER 4106");
              return (
                <li key={x.id}>
                  <button type="button" onClick={() => onOpenCell(x.personaIds[0], x.personaIds[1])}
                    className={cn("w-full rounded border p-1.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                      related ? "border-blue-400 bg-blue-50/70" : "border-slate-200 hover:border-blue-200")}>
                    <span className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-semibold text-slate-800">{x.label}</span>
                      <Pill label={cell ? cell.severity : x.alignment} tone={cell ? ctiTone(String(cell.severity)) : x.tone} />
                    </span>
                    <span className="mt-0.5 block text-[10px] text-slate-600">{x.kind} · {x.detail}</span>
                    {govPair && (
                      <span className="mt-0.5 block text-[10px] text-fuchsia-700">
                        {gov ? `Governance active at ${state.maxTraffic}% traffic${quarterEnd(state) ? " and quarter end window" : ""}` : `Governance inactive at ${state.maxTraffic}% traffic`}
                      </span>
                    )}
                    {x.personaIds.includes("PER 4103") && !state.fraudLossEvidence && (
                      <span className="mt-0.5 block text-[10px] text-red-700">Evidence gap · fraud loss analysis missing</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ------------------------------------- region 4 */}
        <section aria-label="Coordination summary" className="rounded-lg border border-slate-200 bg-white p-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">4 · Coordination Summary</h3>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Required Coordination Actions</p>
          <ol className="mt-0.5 space-y-1">
            {actions.map((a, i) => (
              <li key={a.id} className={cn("rounded border p-1.5",
                a.participatingTeamIds.some((p) => highlightPersona(p)) ? "border-blue-300 bg-blue-50/60" : "border-slate-200")}>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-semibold text-slate-800">{i + 1}. {a.title}</span>
                  <Pill label={a.status} tone={ctiTone(a.status)} />
                </div>
                <p className="text-[10px] text-slate-600">Owner {a.primaryOwner} · with {a.participatingTeamIds.map((p) => personaById(p).short).join(", ")} · before {a.requiredBefore}</p>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Shared Mitigations</p>
          <div className="mt-0.5 flex flex-wrap gap-1">
            {mitigationCandidates.map((m) => <span key={m.id} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600">{m.title}</span>)}
          </div>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Evidence State</p>
          <div className="mt-0.5 flex flex-wrap gap-1">
            {evidence.map((e) => <Pill key={e.id} label={`${e.label.split(" ").slice(0, 3).join(" ")} · ${e.status}`} tone={ctiTone(e.status)} />)}
          </div>
          <p className="mt-2 rounded border border-slate-200 bg-slate-50 p-1.5 text-[10.5px] text-slate-700">
            {summary.finding}
          </p>
          <Button size="sm" variant="outline" className="mt-1.5 h-6 text-[10px]" disabled>
            Prepare Decision Intelligence Package (Prompt 2)
          </Button>
        </section>
      </div>
    </Panel>
  );
}
