/** Persona Validation — signature four-region Validation Workbench. */

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pill } from "../persona-studio/primitives";
import { Panel, validationTone } from "./panels";
import {
  defaultWorkbenchSection, personaSections, reviewerDecisionActions, workbenchAnalysis,
  workbenchConditions, type WorkbenchCondition,
} from "./data";

export interface WorkbenchState {
  sectionId: string;
  excluded: string[];
  authoritative: string | null;
  extraEvidence: number;
  owner: string;
  approvedSections: string[];
  statementOverride: Record<string, string>;
}

export const initialWorkbenchState: WorkbenchState = {
  sectionId: "approval-requirements", excluded: [], authoritative: null, extraEvidence: 0,
  owner: "Jane Smith", approvedSections: [], statementOverride: {},
};

export function ValidationWorkbench({
  state, onState, onDecision, onAnnounce, spotlight, highlightConflict,
}: {
  state: WorkbenchState; onState: (s: WorkbenchState) => void;
  onDecision: (action: string, detail: string) => void; onAnnounce: (msg: string) => void;
  spotlight?: boolean; highlightConflict?: boolean;
}) {
  const [focusCondition, setFocusCondition] = useState<string | null>(null);
  const [focusEvidence, setFocusEvidence] = useState<string | null>(null);
  const [comments, setComments] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("2026-08-10");
  const [applicability, setApplicability] = useState("All checkout traffic");
  const [acknowledged, setAcknowledged] = useState(false);
  const [editing, setEditing] = useState(false);

  const section = defaultWorkbenchSection(state.sectionId);
  const conditions = useMemo(
    () => workbenchConditions.filter((c) => c.sectionId === state.sectionId),
    [state.sectionId],
  );
  const active = conditions.filter((c) => !state.excluded.includes(c.id));

  const approved = state.approvedSections.includes(state.sectionId);
  const statement = state.statementOverride[state.sectionId] ?? (
    state.authoritative === "COND 100489"
      ? "Retry policy changes affecting more than 20 percent of checkout traffic require Payments Platform approval."
      : section.statement
  );

  /* deterministic recalculation from reviewer decisions */
  const evidenceCoverage = Math.min(100, section.completeness + state.extraEvidence * 3);
  const confidence = Math.min(100, section.confidence
    + (state.excluded.length > 0 ? 9 : 0)
    + (state.authoritative ? 5 : 0)
    + (approved ? 2 : 0));
  const quality = Math.min(100, section.quality + (state.excluded.length ? 6 : 0) + (state.authoritative ? 3 : 0));
  const ownershipConfidence = state.owner === "Jane Smith" ? 94 : 88;
  const conflictOpen = active.filter((c) => c.status === "Conflict").length > 1;

  const apply = (patch: Partial<WorkbenchState>, message: string) => {
    onState({ ...state, ...patch });
    onAnnounce(message);
  };

  const decide = (action: string) => {
    switch (action) {
      case "Approve Section":
        apply({ approvedSections: Array.from(new Set([...state.approvedSections, state.sectionId])) },
          `${section.persona} ${state.sectionId} section approved`);
        break;
      case "Edit Persona Section": setEditing(true); onAnnounce("Section editing enabled"); break;
      case "Select Authoritative Condition":
        apply({ authoritative: focusCondition ?? active[0]?.id ?? null, excluded: conditions.filter((c) => c.id !== (focusCondition ?? active[0]?.id)).map((c) => c.id) },
          "Authoritative condition selected and conflicting record excluded");
        break;
      case "Merge Conditions": apply({ authoritative: active[0]?.id ?? null }, "Conditions merged into a single approval requirement"); break;
      case "Exclude Condition":
        apply({ excluded: Array.from(new Set([...state.excluded, focusCondition ?? conditions[conditions.length - 1]?.id ?? ""])) },
          "Condition excluded, quality and confidence recalculated");
        break;
      case "Request Additional Evidence": apply({ extraEvidence: state.extraEvidence + 1 }, "Additional evidence requested, coverage recalculated"); break;
      case "Change Owner": apply({ owner: state.owner === "Jane Smith" ? "Payments Reliability" : "Jane Smith" }, "Section owner changed, ownership confidence recalculated"); break;
      default: onAnnounce(`${action} recorded for ${state.sectionId}`);
    }
    onDecision(action, `${section.persona} · ${state.sectionId}`);
  };

  return (
    <Panel
      id="panel-workbench" title="Persona Validation Workbench" spotlight={spotlight || highlightConflict}
      subtitle={`${section.persona} — trace every Persona field to approved conditions and exact evidence`}
      actions={<Pill label={approved ? "Approved" : section.reviewStatus} tone={validationTone(approved ? "Approved" : section.reviewStatus)} />}
    >
      <div className="grid gap-2 xl:grid-cols-4">
        {/* REGION 1 */}
        <section aria-label="Persona section" className="rounded-lg border border-slate-200 bg-white p-2">
          <h3 className="text-[12px] font-semibold text-slate-900">Persona Section</h3>
          <label className="mt-1 block text-[10px] uppercase tracking-wide text-slate-500" htmlFor="wb-section">Section</label>
          <select
            id="wb-section" value={state.sectionId}
            onChange={(e) => { onState({ ...state, sectionId: e.target.value }); setFocusCondition(null); setFocusEvidence(null); }}
            className="h-7 w-full rounded-md border border-slate-200 px-1.5 text-[11.5px] text-slate-800 focus:border-blue-400 focus:outline-none"
          >
            {personaSections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {editing ? (
            <textarea
              aria-label="Edit Persona section statement" rows={4}
              defaultValue={statement}
              onBlur={(e) => { onState({ ...state, statementOverride: { ...state.statementOverride, [state.sectionId]: e.target.value } }); setEditing(false); onAnnounce("Persona section updated, source evidence preserved"); }}
              className="mt-1.5 w-full rounded border border-blue-300 p-2 text-[11.5px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <blockquote className={cn("mt-1.5 rounded border p-2 text-[11.5px] leading-snug", highlightConflict ? "border-amber-300 bg-amber-50 text-amber-900" : "border-slate-200 bg-slate-50 text-slate-800")}>
              {statement}
            </blockquote>
          )}
          <dl className="mt-1.5 space-y-0.5 text-[10.5px] text-slate-600">
            {[
              ["Persona", section.persona], ["Section Owner", state.owner],
              ["Current Quality", String(quality)], ["Completeness", `${section.completeness}%`],
              ["Confidence", `${confidence}%`], ["Freshness", section.freshness],
              ["Review Status", approved ? "Approved" : section.reviewStatus],
              ["Supporting Conditions", String(active.length || section.conditionCount)],
              ["Evidence Records", String(section.evidenceCount + state.extraEvidence)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 border-b border-slate-100 pb-0.5">
                <dt>{k}</dt><dd className="font-medium text-slate-800">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* REGION 2 */}
        <section aria-label="Conditions and evidence" className="rounded-lg border border-slate-200 bg-white p-2">
          <h3 className="text-[12px] font-semibold text-slate-900">Conditions and Evidence</h3>
          {conditions.length === 0 ? (
            <p className="mt-2 text-[11px] text-slate-500">No conditions are mapped to this section. Request evidence to begin validation.</p>
          ) : (
            <ul className="mt-1.5 space-y-1.5">
              {conditions.map((c) => {
                const excluded = state.excluded.includes(c.id);
                const selected = focusCondition === c.id;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => { setFocusCondition(selected ? null : c.id); setFocusEvidence(selected ? null : c.id); onAnnounce(`${c.label} selected. Persona field and exact evidence highlighted.`); }}
                      aria-pressed={selected}
                      className={cn("w-full rounded border p-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                        excluded ? "border-slate-200 bg-slate-100 opacity-60"
                          : selected ? "border-blue-500 bg-blue-50"
                            : c.status === "Conflict" ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white")}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-slate-900">{c.label} · {c.id}</span>
                        <Pill label={excluded ? "Excluded" : c.status} tone={validationTone(excluded ? "Draft" : c.status)} />
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-700">{c.statement}</p>
                      <dl className="mt-1 grid grid-cols-2 gap-x-2 text-[10px] text-slate-600">
                        <div className="flex justify-between"><dt>Type</dt><dd>{c.conditionType}</dd></div>
                        <div className="flex justify-between"><dt>Owner</dt><dd>{c.owner}</dd></div>
                        <div className="flex justify-between"><dt>Authority</dt><dd>{c.authority}</dd></div>
                        <div className="flex justify-between"><dt>Confidence</dt><dd>{c.confidence}%</dd></div>
                        <div className="flex justify-between"><dt>Freshness</dt><dd>{c.freshness}</dd></div>
                        <div className="flex justify-between"><dt>Evidence</dt><dd>{c.evidenceCount}</dd></div>
                        <div className="flex justify-between"><dt>Effective</dt><dd>{c.effectiveDate}</dd></div>
                        <div className="flex justify-between"><dt>Permissions</dt><dd>{c.permissions}</dd></div>
                      </dl>
                      <div className={cn("mt-1 rounded border p-1.5", focusEvidence === c.id ? "border-blue-400 bg-white" : "border-slate-200 bg-slate-50")}>
                        <span className="block text-[9.5px] uppercase tracking-wide text-slate-500">{c.artifact}</span>
                        <span className={cn("text-[11px] italic", focusEvidence === c.id ? "bg-yellow-100 text-slate-900" : "text-slate-600")}>“{c.passage}”</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* REGION 3 */}
        <section aria-label="Validation analysis" className="rounded-lg border border-slate-200 bg-white p-2">
          <h3 className="text-[12px] font-semibold text-slate-900">Validation Analysis</h3>
          <dl className="mt-1.5 space-y-0.5 text-[10.5px] text-slate-600">
            {[
              ["Section Completeness", `${section.completeness}%`],
              ["Evidence Coverage", `${evidenceCoverage}%`],
              ["Authority Confidence", `${confidence}%`],
              ["Ownership Confidence", `${ownershipConfidence}%`],
              ["Freshness", section.freshness],
              ["Conflict Status", conflictOpen ? "Open" : "Resolved"],
              ["Dependency Validation", section.sectionId === "dependencies" ? "Pending" : "Not required"],
              ["Decision Logic Consistency", conflictOpen ? "Inconsistent" : "Consistent"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 border-b border-slate-100 pb-0.5">
                <dt>{k}</dt><dd className="font-medium text-slate-800">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-2 rounded border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-900">
            <p className="font-semibold">{workbenchAnalysis.conflictType}</p>
            <p>Primary record: {workbenchAnalysis.primaryRecord}</p>
            <p>Supporting record: {workbenchAnalysis.supportingRecord}</p>
            <p className="mt-1"><strong>Suggested resolution:</strong> {workbenchAnalysis.recommendedResolution}</p>
          </div>
          <div className="mt-2">
            <h4 className="text-[10px] uppercase tracking-wide text-slate-500">Potential downstream impact</h4>
            <ul className="mt-0.5 list-disc pl-4 text-[10.5px] text-slate-700">
              {workbenchAnalysis.downstream.map((d) => <li key={d}>{d}</li>)}
            </ul>
          </div>
        </section>

        {/* REGION 4 */}
        <section aria-label="Reviewer decision" className="rounded-lg border border-slate-200 bg-white p-2">
          <h3 className="text-[12px] font-semibold text-slate-900">Reviewer Decision</h3>
          <dl className="mt-1 space-y-0.5 text-[10.5px] text-slate-600">
            <div className="flex justify-between"><dt>Reviewer</dt><dd className="font-medium text-slate-800">Jane Smith</dd></div>
            <div className="flex justify-between"><dt>Role</dt><dd className="font-medium text-slate-800">Persona Owner</dd></div>
            <div className="flex justify-between"><dt>Required approval</dt><dd className="font-medium text-slate-800">Team Owner</dd></div>
          </dl>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {reviewerDecisionActions.map((a) => (
              <Button key={a} size="sm" variant={a === "Approve Section" ? "default" : "outline"}
                className="h-6 text-[10px]" onClick={() => decide(a)}>{a}</Button>
            ))}
            <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => decide("Change Owner")}>Change Owner</Button>
          </div>
          <label className="mt-2 block text-[10px] uppercase tracking-wide text-slate-500" htmlFor="wb-comments">Reviewer comments</label>
          <textarea id="wb-comments" rows={2} value={comments} onChange={(e) => setComments(e.target.value)}
            className="w-full rounded border border-slate-200 p-1.5 text-[11px] focus:border-blue-400 focus:outline-none" />
          <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
            <label className="text-[10px] uppercase tracking-wide text-slate-500">
              Effective date
              <input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)}
                className="mt-0.5 h-7 w-full rounded border border-slate-200 px-1.5 text-[11px] text-slate-800" />
            </label>
            <label className="text-[10px] uppercase tracking-wide text-slate-500">
              Applicability
              <input value={applicability} onChange={(e) => setApplicability(e.target.value)}
                className="mt-0.5 h-7 w-full rounded border border-slate-200 px-1.5 text-[11px] text-slate-800" />
            </label>
          </div>
          <label className="mt-1.5 flex items-start gap-1.5 text-[10.5px] text-slate-700">
            <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} className="mt-0.5" />
            I acknowledge the downstream impact of this decision on 2 active evaluations and 1 release decision.
          </label>
        </section>
      </div>
    </Panel>
  );
}
