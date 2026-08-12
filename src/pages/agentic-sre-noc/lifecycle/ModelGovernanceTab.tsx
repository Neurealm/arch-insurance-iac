/**
 * AIM-005 — Model Governance tab.
 */

import * as React from "react";
import {
  candidateReleaseGates,
  governanceRecord,
  modelApprovals,
  modelEvidenceRecords,
  modelLimitations,
  modelTimeline,
  modelVersions,
} from "./lifecycleFixtures";
import { calculateValidationGateStatus } from "./lifecycleCalculations";
import {
  exportGovernanceSummary, exportModelActivity, exportReleaseGateReport, exportVersionComparison,
} from "./lifecycleExport";
import { ComparisonBar, GateBadge, LifecycleButton, LifecycleSection, LifecycleStat, LifecycleStateFrame } from "./LifecyclePrimitives";
import type {
  GovernanceNote, ModelLifecycleActivity, ModelPromotionDecision, ModelRollbackDecision,
} from "./lifecycleTypes";
import type { ModelVersionComparison } from "./lifecycleCalculations";
import type { GovernanceReadiness } from "./lifecycleTypes";
import type { LifecyclePanelState } from "./useLifecycleState";

export interface ModelGovernanceTabProps {
  panelState: LifecyclePanelState;
  activeVersion: string;
  rollbackVersion: string;
  selectedVersion: string;
  comparisonVersion: string;
  onSelectedVersionChange: (version: string) => void;
  onComparisonVersionChange: (version: string) => void;
  comparison: ModelVersionComparison;
  readiness: GovernanceReadiness;
  promotion: ModelPromotionDecision;
  rollback: ModelRollbackDecision;
  onPromote: (version: string) => void;
  onRollback: () => void;
  notes: GovernanceNote[];
  onAddNote: (note: string) => void;
  activity: ModelLifecycleActivity[];
  activityQuery: string;
  onActivityQueryChange: (query: string) => void;
  activityGroup: "None" | "Version" | "Event type";
  onActivityGroupChange: (group: "None" | "Version" | "Event type") => void;
  selectedTimelineEventId: string | null;
  onSelectTimelineEvent: (id: string | null) => void;
  onNotify: (message: string) => void;
  onRetry: () => void;
}

export function ModelGovernanceTab(props: ModelGovernanceTabProps) {
  const {
    panelState, activeVersion, rollbackVersion, selectedVersion, comparisonVersion,
    onSelectedVersionChange, onComparisonVersionChange, comparison, readiness, promotion, rollback,
    onPromote, onRollback, notes, onAddNote, activity, activityQuery, onActivityQueryChange,
    activityGroup, onActivityGroupChange, selectedTimelineEventId, onSelectTimelineEvent, onNotify, onRetry,
  } = props;

  const [noteDraft, setNoteDraft] = React.useState("");

  const filteredActivity = React.useMemo(() => {
    const query = activityQuery.trim().toLowerCase();
    if (!query) return activity;
    return activity.filter((entry) =>
      [entry.event, entry.version, entry.actor, entry.result, entry.scope, entry.changeRecord]
        .join(" ").toLowerCase().includes(query),
    );
  }, [activity, activityQuery]);

  const groupedActivity = React.useMemo(() => {
    if (activityGroup === "None") return [{ key: "All activity", entries: filteredActivity }];
    const keyOf = (entry: ModelLifecycleActivity) => (activityGroup === "Version" ? entry.version : entry.event);
    const groups = new Map<string, ModelLifecycleActivity[]>();
    filteredActivity.forEach((entry) => {
      const key = keyOf(entry);
      groups.set(key, [...(groups.get(key) ?? []), entry]);
    });
    return Array.from(groups, ([key, entries]) => ({ key, entries }));
  }, [filteredActivity, activityGroup]);

  const selectedTimelineEvent = modelTimeline.find((event) => event.id === selectedTimelineEventId) ?? null;

  const frame = (
    <LifecycleStateFrame
      state={panelState}
      title="Model Governance"
      errorMessage="Model governance record could not be loaded"
      onRetry={onRetry}
      heightClass="min-h-[240px]"
    />
  );
  if (panelState !== "ready") return <div data-testid="lifecycle-tab-governance">{frame}</div>;

  return (
    <div className="space-y-3" data-testid="lifecycle-tab-governance">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-slate-900">Model Governance</h3>
        <div className="flex flex-wrap items-center gap-1">
          <LifecycleButton onClick={() => onNotify(exportGovernanceSummary(activeVersion, rollbackVersion).message)}>
            Export Governance Summary
          </LifecycleButton>
          <LifecycleButton onClick={() => onNotify(exportReleaseGateReport().message)}>Export Release Gate Report</LifecycleButton>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
        <LifecycleStat label="Active version" value={activeVersion} hint={governanceRecord.status} tone="positive" />
        <LifecycleStat label="Rollback version" value={rollbackVersion} hint={`Ready in ${rollback.estimatedMinutes} min`} />
        <LifecycleStat label="Candidate" value={governanceRecord.candidateVersion} hint={promotion.eligible ? "Eligible" : "Blocked"} tone={promotion.eligible ? "positive" : "warning"} />
        <LifecycleStat label="Governance readiness" value={`${readiness.scorePct}%`} hint={`${readiness.passedGates} of ${readiness.totalGates} gates`} />
        <LifecycleStat label="Model owner" value={governanceRecord.owner} hint={`Approved ${governanceRecord.approvalDate}`} />
        <LifecycleStat label="Next review" value={governanceRecord.nextReview} />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <LifecycleSection
          title="Version comparison"
          description="Compare two model versions across accuracy, warning time, false positives, coverage and cost."
          testId="version-comparison"
          actions={
            <>
              <label className="flex items-center gap-1 text-[10.5px] text-slate-500">
                <span className="sr-only">Base version</span>
                <select
                  aria-label="Base version"
                  value={selectedVersion}
                  onChange={(event) => onSelectedVersionChange(event.target.value)}
                  className="rounded border border-slate-200 bg-white px-1.5 py-1 text-[10.5px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {modelVersions.map((version) => <option key={version.id} value={version.version}>{version.version}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-1 text-[10.5px] text-slate-500">
                <span className="sr-only">Comparison version</span>
                <select
                  aria-label="Comparison version"
                  value={comparisonVersion}
                  onChange={(event) => onComparisonVersionChange(event.target.value)}
                  className="rounded border border-slate-200 bg-white px-1.5 py-1 text-[10.5px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {modelVersions.map((version) => <option key={version.id} value={version.version}>{version.version}</option>)}
                </select>
              </label>
              <LifecycleButton onClick={() => onNotify(exportVersionComparison(comparison).message)}>Export Version Comparison</LifecycleButton>
            </>
          }
        >
          <table className="w-full text-left text-[10.5px]">
            <caption className="sr-only">Model version comparison</caption>
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                <th scope="col" className="py-1">Metric</th>
                <th scope="col" className="py-1">{comparison.baseVersion}</th>
                <th scope="col" className="py-1">{comparison.candidateVersion}</th>
                <th scope="col" className="py-1">Delta</th>
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((row) => (
                <tr key={row.label} className="border-t border-slate-100">
                  <th scope="row" className="py-1 font-medium text-slate-900">{row.label}</th>
                  <td className="py-1 text-slate-700">{row.baseValue}{row.unit}</td>
                  <td className="py-1 text-slate-700">{row.candidateValue}{row.unit}</td>
                  <td className={`py-1 font-medium ${row.improved ? "text-emerald-700" : "text-amber-700"}`}>
                    {row.delta > 0 ? "+" : ""}{row.delta}{row.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-1 text-[10.5px] text-slate-600">{comparison.verdict}. {comparison.improvedCount} metrics improved, {comparison.regressedCount} regressed.</p>
        </LifecycleSection>

        <LifecycleSection
          title="Candidate release gates"
          description="Every gate the candidate must pass before promotion, with measured value, evidence and reviewer."
          testId="candidate-gates"
        >
          <div className="max-h-60 overflow-auto rounded border border-slate-200">
            <table className="w-full text-left text-[10.5px]">
              <caption className="sr-only">Candidate release gates</caption>
              <thead className="sticky top-0 bg-slate-50">
                <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-1.5 py-1">Gate</th>
                  <th scope="col" className="px-1.5 py-1">Target</th>
                  <th scope="col" className="px-1.5 py-1">Actual</th>
                  <th scope="col" className="px-1.5 py-1">Status</th>
                  <th scope="col" className="px-1.5 py-1">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {candidateReleaseGates.map((gate) => (
                  <tr key={gate.id} className="border-t border-slate-100">
                    <th scope="row" className="px-1.5 py-1 font-medium text-slate-900">{gate.label}</th>
                    <td className="px-1.5 py-1 text-slate-700">{gate.target}</td>
                    <td className="px-1.5 py-1 text-slate-900">{gate.actualValue}{gate.unit === "%" ? "%" : gate.unit === "min" ? " min" : ""}</td>
                    <td className="px-1.5 py-1"><GateBadge status={calculateValidationGateStatus(gate)} /></td>
                    <td className="px-1.5 py-1 text-slate-600">{gate.evidence}, {gate.reviewer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LifecycleSection>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <LifecycleSection
          title="Promotion decision"
          description="What must be true before the candidate can be promoted. Promotion here is a local demonstration only."
          testId="promotion-decision"
          actions={
            <LifecycleButton
              tone="primary"
              disabled={!promotion.eligible || activeVersion === governanceRecord.candidateVersion}
              onClick={() => onPromote(governanceRecord.candidateVersion)}
              title={promotion.eligible ? "Promote candidate in the local demonstration" : "Promotion is blocked"}
            >
              Promote candidate
            </LifecycleButton>
          }
        >
          <ol className="space-y-1">
            {promotion.steps.map((step) => (
              <li key={step.key} className="flex items-start gap-1.5 rounded border border-slate-200 bg-slate-50/70 px-2 py-1">
                <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${step.passed ? "bg-emerald-500" : "bg-rose-500"}`} aria-hidden />
                <span className="text-[10.5px]">
                  <span className="font-semibold text-slate-900">{step.label}. </span>
                  <span className="text-slate-600">{step.detail}</span>
                </span>
              </li>
            ))}
          </ol>
          {promotion.blockers.length > 0 && (
            <p className="mt-1 rounded border border-rose-200 bg-rose-50 p-2 text-[10.5px] text-rose-800">
              <span className="font-semibold">Blockers. </span>{promotion.blockers.join("; ")}
            </p>
          )}
          {promotion.warnings.length > 0 && (
            <p className="mt-1 rounded border border-amber-200 bg-amber-50 p-2 text-[10.5px] text-amber-900">
              <span className="font-semibold">Warnings. </span>{promotion.warnings.join("; ")}
            </p>
          )}
          <p className="mt-1 text-[10.5px] text-slate-600">
            Required approvers: {promotion.requiredApprovers.join(", ") || "All approvals recorded"}.
          </p>
        </LifecycleSection>

        <LifecycleSection
          title="Rollback readiness"
          description="Whether the previous version can be restored, and what would be validated afterwards."
          testId="rollback-readiness"
          actions={
            <LifecycleButton
              tone="danger"
              disabled={!rollback.ready}
              onClick={onRollback}
              title={rollback.ready ? "Roll back in the local demonstration" : "Rollback is not available"}
            >
              Roll back to {rollbackVersion}
            </LifecycleButton>
          }
        >
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            <LifecycleStat label="Ready" value={rollback.ready ? "Yes" : "No"} tone={rollback.ready ? "positive" : "negative"} />
            <LifecycleStat label="Estimated time" value={`${rollback.estimatedMinutes} min`} />
            <LifecycleStat label="Approver" value={rollback.requiredApprover} />
          </div>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[10.5px] text-slate-700">
            {rollback.validationPlan.map((item) => <li key={item}>{item}</li>)}
          </ul>
          {rollback.blockers.length > 0 && (
            <p className="mt-1 text-[10.5px] text-rose-700">Blockers: {rollback.blockers.join("; ")}</p>
          )}
          <ul className="mt-1 space-y-0.5">
            {governanceRecord.rollbackReadiness.map((item) => (
              <li key={item.item} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1 text-[10.5px]">
                <span className="text-slate-700">{item.item}</span>
                <span className={item.ready ? "font-medium text-emerald-700" : "font-medium text-amber-700"}>{item.value}</span>
              </li>
            ))}
          </ul>
        </LifecycleSection>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <LifecycleSection
          title="Review records"
          description="Security, explainability and operational reviews behind the active model."
          testId="review-records"
        >
          {([
            ["Security review", governanceRecord.securityReview],
            ["Explainability review", governanceRecord.explainabilityReview],
            ["Operational review", governanceRecord.operationalReview],
          ] as const).map(([label, items]) => (
            <div key={label} className="mb-2 last:mb-0">
              <h5 className="text-[11px] font-semibold text-slate-900">{label}</h5>
              <ul className="mt-0.5 space-y-0.5">
                {items.map((item) => (
                  <li key={item.item} className="flex items-center justify-between gap-2 rounded border border-slate-200 px-2 py-1 text-[10.5px]">
                    <span className="text-slate-700">{item.item}, {item.value}</span>
                    <GateBadge status={item.status} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </LifecycleSection>

        <LifecycleSection
          title="Approvals, risks and required actions"
          description="Who approved what, which risks remain open and what must still be done."
          testId="approvals-risks"
        >
          <div className="max-h-40 overflow-auto rounded border border-slate-200">
            <table className="w-full text-left text-[10.5px]">
              <caption className="sr-only">Model approvals</caption>
              <thead className="sticky top-0 bg-slate-50">
                <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-1.5 py-1">Approval</th>
                  <th scope="col" className="px-1.5 py-1">Approver</th>
                  <th scope="col" className="px-1.5 py-1">Decision</th>
                  <th scope="col" className="px-1.5 py-1">Conditions</th>
                </tr>
              </thead>
              <tbody>
                {modelApprovals.map((approval) => (
                  <tr key={approval.id} className="border-t border-slate-100">
                    <th scope="row" className="px-1.5 py-1 font-medium text-slate-900">{approval.approvalType}</th>
                    <td className="px-1.5 py-1 text-slate-700">{approval.approver}</td>
                    <td className="px-1.5 py-1 text-slate-700">{approval.decision}</td>
                    <td className="px-1.5 py-1 text-slate-600">{approval.conditions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h5 className="mt-2 text-[11px] font-semibold text-slate-900">Open risks</h5>
          <ul className="mt-0.5 space-y-0.5 text-[10.5px]">
            {governanceRecord.openRisks.map((risk) => (
              <li key={risk.id} className="rounded border border-slate-200 px-2 py-1">
                <span className="font-medium text-slate-900">{risk.risk}. </span>
                <span className="text-slate-600">{risk.severity} severity, {risk.owner}, {risk.state}</span>
              </li>
            ))}
          </ul>

          <h5 className="mt-2 text-[11px] font-semibold text-slate-900">Required actions</h5>
          <ul className="mt-0.5 space-y-0.5 text-[10.5px]">
            {governanceRecord.requiredActions.map((action) => (
              <li key={action.id} className="rounded border border-slate-200 px-2 py-1">
                <span className="font-medium text-slate-900">{action.action}. </span>
                <span className="text-slate-600">{action.owner}, due {action.due}</span>
              </li>
            ))}
          </ul>
        </LifecycleSection>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <LifecycleSection
          title="Model version timeline"
          description="Training, validation, approval, promotion and rollback-test history. Select an event for its detail."
          testId="model-timeline"
        >
          <ol className="space-y-1">
            {modelTimeline.map((event) => (
              <li key={event.id}>
                <button
                  type="button"
                  aria-pressed={selectedTimelineEventId === event.id}
                  onClick={() => onSelectTimelineEvent(selectedTimelineEventId === event.id ? null : event.id)}
                  className={`w-full rounded border px-2 py-1 text-left text-[10.5px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    selectedTimelineEventId === event.id ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <span className="font-semibold text-slate-900">{event.at}, {event.version}, {event.title}</span>
                </button>
              </li>
            ))}
          </ol>
          {selectedTimelineEvent && (
            <p className="mt-1 rounded border border-blue-200 bg-blue-50/60 p-2 text-[10.5px] text-slate-700">
              {selectedTimelineEvent.detail}
            </p>
          )}
        </LifecycleSection>

        <LifecycleSection
          title="Lifecycle activity"
          description="A searchable record of every lifecycle event, with actor, result, evidence and change record."
          testId="lifecycle-activity"
          actions={
            <>
              <label className="flex items-center gap-1 text-[10.5px] text-slate-500">
                <span className="sr-only">Search activity</span>
                <input
                  type="search"
                  aria-label="Search lifecycle activity"
                  value={activityQuery}
                  onChange={(event) => onActivityQueryChange(event.target.value)}
                  placeholder="Search activity"
                  className="w-32 rounded border border-slate-200 px-1.5 py-1 text-[10.5px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </label>
              <label className="flex items-center gap-1 text-[10.5px] text-slate-500">
                <span className="sr-only">Group activity</span>
                <select
                  aria-label="Group lifecycle activity"
                  value={activityGroup}
                  onChange={(event) => onActivityGroupChange(event.target.value as "None" | "Version" | "Event type")}
                  className="rounded border border-slate-200 bg-white px-1.5 py-1 text-[10.5px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {["None", "Version", "Event type"].map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <LifecycleButton onClick={() => onNotify(exportModelActivity(filteredActivity).message)}>Export Model Activity</LifecycleButton>
            </>
          }
        >
          {filteredActivity.length === 0 ? (
            <div className="rounded border border-dashed border-slate-200 bg-slate-50/60 p-3 text-center text-[10.5px] text-slate-600">
              No lifecycle activity matches this search.
              <div className="mt-1 flex justify-center">
                <LifecycleButton onClick={() => onActivityQueryChange("")}>Clear search</LifecycleButton>
              </div>
            </div>
          ) : (
            <div className="max-h-60 space-y-2 overflow-auto pr-1">
              {groupedActivity.map((group) => (
                <div key={group.key}>
                  {activityGroup !== "None" && (
                    <h5 className="text-[11px] font-semibold text-slate-900">{group.key}</h5>
                  )}
                  <ul className="mt-0.5 space-y-0.5">
                    {group.entries.map((entry) => (
                      <li key={entry.id} className="rounded border border-slate-200 px-2 py-1 text-[10.5px]">
                        <span className="font-semibold text-slate-900">{entry.at}, {entry.event}, {entry.version}. </span>
                        <span className="text-slate-600">{entry.result} Actor {entry.actor}, scope {entry.scope}, evidence {entry.evidence}, change {entry.changeRecord}, {entry.status}.</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </LifecycleSection>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <LifecycleSection
          title="Limitations, evidence and retirement"
          description="What the model must not be used for, the evidence pack behind it, and the conditions that would retire it."
          testId="limitations-evidence"
        >
          <ul className="space-y-0.5 text-[10.5px]">
            {modelLimitations.map((limitation) => (
              <li key={limitation.id} className="rounded border border-slate-200 px-2 py-1">
                <span className="font-medium text-slate-900">{limitation.limitation}. </span>
                <span className="text-slate-600">{limitation.scope} Mitigation: {limitation.mitigation}</span>
              </li>
            ))}
          </ul>

          <h5 className="mt-2 text-[11px] font-semibold text-slate-900">Evidence pack</h5>
          <ul className="mt-0.5 space-y-0.5 text-[10.5px]">
            {modelEvidenceRecords.map((record) => (
              <li key={record.id} className="flex flex-wrap items-center justify-between gap-1 rounded border border-slate-200 px-2 py-1">
                <span className="text-slate-700">{record.artifact}, {record.kind}, {record.owner}, {record.producedOn}</span>
                <span className={record.status === "Complete" ? "font-medium text-emerald-700" : "font-medium text-amber-700"}>{record.status}</span>
              </li>
            ))}
          </ul>

          <h5 className="mt-2 text-[11px] font-semibold text-slate-900">Retirement conditions</h5>
          <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-[10.5px] text-slate-700">
            {governanceRecord.retirementConditions.map((condition) => <li key={condition}>{condition}</li>)}
          </ul>
        </LifecycleSection>

        <LifecycleSection
          title="Governance notes"
          description="Reviewer notes recorded against this model. Notes are local to this demonstration."
          testId="governance-notes"
        >
          <form
            className="flex flex-wrap items-center gap-1"
            onSubmit={(event) => {
              event.preventDefault();
              if (!noteDraft.trim()) return;
              onAddNote(noteDraft);
              setNoteDraft("");
            }}
          >
            <label className="flex-1">
              <span className="sr-only">Governance note</span>
              <input
                type="text"
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="Add a governance note"
                className="w-full rounded border border-slate-200 px-1.5 py-1 text-[10.5px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              />
            </label>
            <LifecycleButton type="submit" disabled={!noteDraft.trim()}>Add note</LifecycleButton>
          </form>
          <ul className="mt-1 max-h-40 space-y-0.5 overflow-auto pr-1 text-[10.5px]">
            {notes.map((note) => (
              <li key={note.id} className="rounded border border-slate-200 px-2 py-1">
                <span className="font-medium text-slate-900">{note.at}, {note.author}. </span>
                <span className="text-slate-600">{note.note}</span>
              </li>
            ))}
          </ul>

          <h5 className="mt-2 text-[11px] font-semibold text-slate-900">Ownership</h5>
          <ul className="mt-0.5 space-y-0.5">
            {governanceRecord.ownership.map((owner) => (
              <li key={owner.role}>
                <ComparisonBar label={`${owner.role}, ${owner.name}`} valuePct={100} color="#64748b" />
              </li>
            ))}
          </ul>
        </LifecycleSection>
      </div>
    </div>
  );
}
