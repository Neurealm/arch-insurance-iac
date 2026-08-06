/** Signature Cross Team Impact Matrix — Persona by dimension and Persona by Persona. */

import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pill, Row } from "../persona-studio/primitives";
import { Panel, ctiTone } from "./panels";
import {
  buildDimensionMatrix, buildPairMatrix, conditionById, ctiPersonas, evidenceById,
  impactDimensions, pairCell, personaById, severityRank,
  type CrossTeamImpactMatrixCell, type CtiAnalysisState, type ImpactDimension,
} from "./data";

export type MatrixMode = "persona-dimension" | "persona-persona";

const directionGlyph: Record<string, string> = {
  Positive: "+", Negative: "−", Neutral: "=", Mixed: "±", "Review Required": "!",
};

function cellClasses(cell?: CrossTeamImpactMatrixCell) {
  if (!cell) return "border-slate-100 bg-slate-50/60 text-slate-300";
  if (cell.direction === "Positive") {
    return severityRank(cell.severity as never) >= 2
      ? "border-emerald-300 bg-emerald-100 text-emerald-900" : "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (cell.direction === "Review Required") return "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-800";
  if (cell.direction === "Mixed") return "border-amber-300 bg-amber-50 text-amber-800";
  if (cell.direction === "Neutral") return "border-slate-200 bg-white text-slate-500";
  switch (cell.severity) {
    case "Critical": return "border-red-400 bg-red-200 text-red-900";
    case "High": return "border-red-300 bg-red-100 text-red-800";
    case "Medium": return "border-orange-200 bg-orange-50 text-orange-800";
    default: return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

export function CrossTeamImpactMatrix({
  state, mode, onMode, selectedCellId, onSelectCell, selectedPersonaId, onSelectPersona,
  focusDependencyId, focusConditionId,
}: {
  state: CtiAnalysisState;
  mode: MatrixMode;
  onMode: (m: MatrixMode) => void;
  selectedCellId: string | null;
  onSelectCell: (c: CrossTeamImpactMatrixCell | null) => void;
  selectedPersonaId: string | null;
  onSelectPersona: (id: string) => void;
  focusDependencyId?: string | null;
  focusConditionId?: string | null;
}) {
  const [materialOnly, setMaterialOnly] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);
  const [showOpportunities, setShowOpportunities] = useState(false);
  const [showCriticalDeps, setShowCriticalDeps] = useState(false);
  const [showGovernance, setShowGovernance] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const dimCells = useMemo(() => buildDimensionMatrix(state), [state]);
  const pairCells = useMemo(() => buildPairMatrix(state), [state]);

  const passesFilter = (c?: CrossTeamImpactMatrixCell) => {
    if (!c) return false;
    if (materialOnly && severityRank(c.severity as never) < 1) return false;
    if (showConflicts && !c.conflictId) return false;
    if (showOpportunities && !c.opportunityId) return false;
    if (showCriticalDeps && !c.dependencyIds.length) return false;
    if (showGovernance && c.rowPersonaId !== "PER 4106" && c.columnPersonaId !== "PER 4106") return false;
    return true;
  };

  const highlighted = (c?: CrossTeamImpactMatrixCell) => {
    if (!c) return false;
    if (focusDependencyId && c.dependencyIds.includes(focusDependencyId)) return true;
    if (focusConditionId && c.conditionIds.includes(focusConditionId)) return true;
    return false;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const buttons = Array.from(gridRef.current?.querySelectorAll<HTMLButtonElement>("button[data-cell]") ?? []);
    const active = document.activeElement as HTMLButtonElement | null;
    const idx = active ? buttons.indexOf(active) : -1;
    const cols = mode === "persona-dimension" ? impactDimensions.length : ctiPersonas.length;
    let next = idx;
    if (e.key === "ArrowRight") next = idx + 1;
    if (e.key === "ArrowLeft") next = idx - 1;
    if (e.key === "ArrowDown") next = idx + cols;
    if (e.key === "ArrowUp") next = idx - cols;
    if (next >= 0 && next < buttons.length) buttons[next].focus();
  };

  const filterChips: [string, boolean, (v: boolean) => void][] = [
    ["Show Only Material Cells", materialOnly, setMaterialOnly],
    ["Show Conflicts", showConflicts, setShowConflicts],
    ["Show Opportunities", showOpportunities, setShowOpportunities],
    ["Show Critical Dependencies", showCriticalDeps, setShowCriticalDeps],
    ["Show Governance", showGovernance, setShowGovernance],
  ];

  return (
    <Panel id="panel-matrix" title="Cross Team Impact Matrix"
      subtitle="Local impacts become enterprise consequences when they intersect — every Persona keeps its own row"
      actions={
        <div className="flex flex-wrap items-center gap-1">
          <div className="flex rounded-md border border-slate-200 bg-white p-0.5" role="tablist" aria-label="Matrix mode">
            {([["persona-dimension", "Persona × Dimension"], ["persona-persona", "Persona × Persona"]] as const).map(([id, label]) => (
              <button key={id} role="tab" aria-selected={mode === id} type="button" onClick={() => { onMode(id); onSelectCell(null); }}
                className={cn("rounded px-2 py-1 text-[10.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  mode === id ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100")}>
                {label}
              </button>
            ))}
          </div>
          {filterChips.map(([label, value, set]) => (
            <button key={label} type="button" onClick={() => set(!value)} aria-pressed={value}
              className={cn("rounded border px-1.5 py-0.5 text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                value ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
              {label}
            </button>
          ))}
          <Button size="sm" variant="outline" className="h-6 text-[10px]"
            onClick={() => { setMaterialOnly(false); setShowConflicts(false); setShowOpportunities(false); setShowCriticalDeps(false); setShowGovernance(false); }}>
            Clear Matrix Filters
          </Button>
        </div>
      }>
      <div className="overflow-x-auto rounded border border-slate-200" ref={gridRef} onKeyDown={onKeyDown}>
        <table className="w-full min-w-[1080px] border-collapse text-left">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-slate-50 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Team Persona</th>
              {(mode === "persona-dimension" ? [...impactDimensions] : ctiPersonas.map((p) => p.short)).map((h) => (
                <th key={h} scope="col" className="px-1 py-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ctiPersonas.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <th scope="row" className="sticky left-0 z-10 bg-white px-2 py-1 text-left">
                  <button type="button" onClick={() => onSelectPersona(p.id)}
                    className={cn("text-[11px] font-semibold underline-offset-2 hover:underline",
                      selectedPersonaId === p.id ? "text-blue-700" : "text-slate-800")}>
                    {p.name}
                  </button>
                </th>
                {mode === "persona-dimension"
                  ? impactDimensions.map((d: ImpactDimension) => {
                    const cell = dimCells.find((c) => c.rowPersonaId === p.id && c.impactDimension === d);
                    const dim = cell ? !passesFilter(cell) : true;
                    return (
                      <td key={d} className="p-0.5">
                        <button data-cell type="button" disabled={!cell}
                          aria-label={cell ? `${p.name} ${d}: ${cell.direction} ${cell.severity}` : `${p.name} ${d}: no material impact`}
                          onClick={() => cell && onSelectCell(cell)}
                          className={cn("h-11 w-full rounded border px-1 text-[9.5px] leading-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                            cellClasses(cell), dim && "opacity-30",
                            highlighted(cell) && "ring-2 ring-blue-500",
                            selectedCellId === cell?.id && "ring-2 ring-slate-900")}>
                          {cell ? (
                            <>
                              <span className="block text-[12px] font-bold">{directionGlyph[cell.direction]}</span>
                              <span className="block font-semibold">{cell.severity === "None" ? "—" : cell.severity}</span>
                              <span className="block opacity-70">{cell.confidence}%</span>
                            </>
                          ) : "·"}
                        </button>
                      </td>
                    );
                  })
                  : ctiPersonas.map((q) => {
                    const cell = p.id === q.id ? undefined : pairCell(pairCells, p.id, q.id);
                    const dim = cell ? !passesFilter(cell) : true;
                    return (
                      <td key={q.id} className="p-0.5">
                        {p.id === q.id ? (
                          <div className="h-11 w-full rounded border border-slate-100 bg-slate-100" aria-hidden />
                        ) : (
                          <button data-cell type="button" disabled={!cell}
                            aria-label={cell ? `${p.name} and ${q.name}: ${cell.direction} ${cell.severity}` : `${p.name} and ${q.name}: no intersection`}
                            onClick={() => cell && onSelectCell(cell)}
                            className={cn("h-11 w-full rounded border px-1 text-[9.5px] leading-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                              cellClasses(cell), dim && "opacity-30",
                              highlighted(cell) && "ring-2 ring-blue-500",
                              selectedCellId === cell?.id && "ring-2 ring-slate-900")}>
                            {cell ? (
                              <>
                                <span className="block font-semibold">{cell.severity}</span>
                                <span className="block opacity-80">{cell.conflictId ? "Conflict" : cell.opportunityId ? "Opportunity" : "Intersection"}</span>
                                <span className="block opacity-70">{cell.coordinationRequired ? "Coordination" : "Monitor"}</span>
                              </>
                            ) : "·"}
                          </button>
                        )}
                      </td>
                    );
                  })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded border border-emerald-300 bg-emerald-100" /> Positive</span>
        <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded border border-amber-300 bg-amber-50" /> Mixed</span>
        <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded border border-red-300 bg-red-100" /> Negative</span>
        <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded border border-fuchsia-300 bg-fuchsia-50" /> Review Required</span>
        <span>Arrow keys navigate cells · Enter or click opens the cell explanation</span>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------ cell detail -- */

export function MatrixCellDetail({
  cell, onOpenPersona, onOpenCondition, onOpenEvidence, onOpenWorkbench, onClose,
}: {
  cell: CrossTeamImpactMatrixCell | null;
  onOpenPersona: (id: string) => void;
  onOpenCondition: (id: string) => void;
  onOpenEvidence: (id: string) => void;
  onOpenWorkbench: () => void;
  onClose: () => void;
}) {
  if (!cell) {
    return (
      <Panel id="panel-cell" title="Matrix Cell Detail" subtitle="Select any matrix cell to see why the intersection exists">
        <p className="rounded border border-dashed border-slate-200 p-4 text-center text-[11.5px] text-slate-500">
          No cell selected. Every material cell is explainable — pick one from the matrix above.
        </p>
      </Panel>
    );
  }
  const a = personaById(cell.rowPersonaId);
  const b = cell.columnPersonaId ? personaById(cell.columnPersonaId) : null;
  return (
    <Panel id="panel-cell" title="Matrix Cell Detail"
      subtitle={b ? `${a.name} ↔ ${b.name}` : `${a.name} · ${cell.impactDimension}`}
      actions={
        <div className="flex flex-wrap gap-1">
          <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={onOpenWorkbench}>Open Workbench</Button>
          <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onOpenPersona(a.id)}>Open {a.short}</Button>
          {b && <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onOpenPersona(b.id)}>Open {b.short}</Button>}
          <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={onClose}>Clear</Button>
        </div>
      }>
      <p className="text-[12px] text-slate-700">{cell.summary}</p>
      <div className="mt-2 grid gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
        <Row label="Impact Direction" value={<Pill label={cell.direction} tone={ctiTone(cell.direction)} />} />
        <Row label="Severity" value={<Pill label={String(cell.severity)} tone={ctiTone(String(cell.severity))} />} />
        <Row label="Confidence" value={`${cell.confidence}%`} />
        <Row label="Coordination Required" value={<Pill label={cell.coordinationRequired ? "Yes" : "No"} tone={cell.coordinationRequired ? "amber" : "green"} />} />
        <Row label="Conflict State" value={cell.conflictId ? <Pill label={cell.conflictId} tone="red" /> : <Pill label="None" tone="green" />} />
        <Row label="Opportunity State" value={cell.opportunityId ? <Pill label={cell.opportunityId} tone="green" /> : <Pill label="None" tone="slate" />} />
      </div>
      <div className="mt-2 grid gap-2 xl:grid-cols-3">
        <div className="rounded border border-slate-200 bg-white p-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Shared Conditions</h3>
          <ul className="mt-1 space-y-0.5">
            {cell.conditionIds.length ? cell.conditionIds.map((c) => (
              <li key={c}>
                <button onClick={() => onOpenCondition(c)} className="text-left text-[11px] text-blue-700 underline-offset-2 hover:underline">
                  {conditionById(c).label}
                </button>
              </li>
            )) : <li className="text-[11px] text-slate-400">No condition applies</li>}
          </ul>
        </div>
        <div className="rounded border border-slate-200 bg-white p-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Shared Dependencies</h3>
          <ul className="mt-1 space-y-0.5">
            {cell.dependencyIds.length ? cell.dependencyIds.map((d) => <li key={d} className="text-[11px] text-slate-700">{d}</li>)
              : <li className="text-[11px] text-slate-400">No shared dependency</li>}
          </ul>
        </div>
        <div className="rounded border border-slate-200 bg-white p-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Shared Evidence</h3>
          <ul className="mt-1 space-y-0.5">
            {cell.evidenceReferenceIds.length ? cell.evidenceReferenceIds.map((e) => (
              <li key={e}>
                <button onClick={() => onOpenEvidence(e)} className="text-left text-[11px] text-blue-700 underline-offset-2 hover:underline">
                  {evidenceById(e).label}
                </button>
              </li>
            )) : <li className="text-[11px] text-red-600">Evidence gap</li>}
          </ul>
        </div>
      </div>
      <p className="mt-2 rounded border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-600">
        Recommendation · {cell.conflictId
          ? "Require the associated coordination action and joint evidence before rollout expands beyond the governance threshold."
          : cell.opportunityId
            ? "Capture the measured benefit at each rollout stage so the opportunity is provable for future work."
            : "Monitor this intersection through the shared dependency health signals during rollout."}
        {" "}Prompt 2 adds coordination and mitigation workflow from this panel.
      </p>
    </Panel>
  );
}
