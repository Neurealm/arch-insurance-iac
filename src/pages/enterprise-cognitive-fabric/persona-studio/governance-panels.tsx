/**
 * Team Persona Construction — Prompt 2 governance panels.
 * Reuses the Prompt 1 Panel shell and primitives (Pill, Row, Drawer).
 */
import { useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import {
  AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, Clock, GitCompare, PauseCircle,
  RefreshCw, ShieldCheck, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Panel } from "../command-center/panels";
import { Pill, type Tone } from "./primitives";
import {
  APPROVAL_ACTIONS, APPROVAL_STAGES, CONFLICT_ACTIONS, DRIFT_ACTIONS, REVIEW_ACTIONS,
  VERSION_ACTIONS, conflictSummary, coverageData, coverageDimensions, coverageMetrics,
  downstreamUsage, driftSummary, impactPreview, personaActivity, publishDestinations,
  readinessMetrics, reviewSummary,
  type ApprovalStage, type CoverageDimension, type PersonaActivity, type PersonaApproval,
  type PersonaConflict, type PersonaDrift, type PersonaReview, type PersonaVersion,
} from "./governance-data";

const severityTone = (s: string): Tone =>
  s === "Critical" || s === "High" ? "red" : s === "Medium" ? "amber" : "slate";

const statusTone = (s: string): Tone => {
  if (["Approved", "Resolved", "Published", "Healthy", "Accepted", "Refreshed"].includes(s)) return "green";
  if (["Open", "In Review", "Under Review", "Detected", "Pending", "Publishing", "Paused"].includes(s)) return "amber";
  if (["Overdue", "Escalated", "Blocked", "Rejected"].includes(s)) return "red";
  return "blue";
};

export function StateNotice({ state, message, actionLabel, onAction }: {
  state: string; message: string; actionLabel?: string; onAction?: () => void;
}) {
  return (
    <div role="status" className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11.5px] text-slate-700">
      <Pill label={state} tone={statusTone(state)} />
      <span>{message}</span>
      {actionLabel && onAction && (
        <Button size="sm" variant="outline" className="ml-auto h-6 text-[10.5px]" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-1.5 p-1" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
    </div>
  );
}

function SummaryChips({ items, onSelect, active }: {
  items: { id: string; label: string; value: number }[];
  onSelect?: (id: string) => void;
  active?: string | null;
}) {
  return (
    <div className="mb-2 flex flex-wrap gap-1.5">
      {items.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSelect?.(s.id)}
          aria-pressed={active === s.id}
          className={cn(
            "rounded-md border px-2 py-1 text-[10.5px] font-medium",
            active === s.id ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50",
          )}
        >
          {s.label} <span className="font-semibold">{s.value}</span>
        </button>
      ))}
    </div>
  );
}

/* --------------------------- validation queue ---------------------------- */

export function ValidationQueuePanel({
  reviews, loading, onAction, activeSummary, onSummary, spotlight,
}: {
  reviews: PersonaReview[];
  loading?: boolean;
  onAction: (r: PersonaReview, action: string) => void;
  activeSummary: string | null;
  onSummary: (id: string) => void;
  spotlight?: boolean;
}) {
  const head = ["Review ID", "Persona", "Review Type", "Reason", "Priority", "Assigned Reviewer",
    "Dependency Teams", "Due Date", "Age", "Quality Impact", "Downstream Impact", "Status", "Actions"];
  return (
    <Panel
      id="panel-validation-queue"
      title="Persona Validation Queue"
      subtitle="Human review required before a Persona can be approved or published"
      spotlight={spotlight}
    >
      <div className="px-4 pb-3">
        <SummaryChips items={reviewSummary} onSelect={onSummary} active={activeSummary} />
        {loading ? <TableSkeleton /> : reviews.length === 0 ? (
          <StateNotice state="Empty" message="No reviews match the current filters. Clear the filters to see the full queue." />
        ) : (
          <div className="max-h-80 overflow-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-[11px]">
              <caption className="sr-only">Persona validation queue with {reviews.length} reviews</caption>
              <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                <tr>{head.map((h) => <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <th scope="row" className="whitespace-nowrap px-2 py-1.5 text-left font-medium text-slate-800">{r.id}</th>
                    <td className="whitespace-nowrap px-2 py-1.5 text-slate-700">{r.personaName}</td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-slate-700">{r.reviewType}</td>
                    <td className="max-w-[240px] px-2 py-1.5 text-slate-600">{r.reason}</td>
                    <td className="px-2 py-1.5"><Pill label={r.priority} tone={severityTone(r.priority)} /></td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{r.assignedReviewer}</td>
                    <td className="max-w-[180px] px-2 py-1.5 text-slate-600">{r.dependencyTeams.join(", ") || "—"}</td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{r.dueDate}</td>
                    <td className="px-2 py-1.5 text-slate-600">{r.age}</td>
                    <td className="px-2 py-1.5 text-slate-600">-{r.qualityImpact}</td>
                    <td className="max-w-[180px] px-2 py-1.5 text-slate-600">{r.downstreamImpact}</td>
                    <td className="px-2 py-1.5"><Pill label={r.status} tone={statusTone(r.status)} /></td>
                    <td className="px-2 py-1.5">
                      <div className="flex flex-wrap gap-1">
                        {REVIEW_ACTIONS.map((a) => (
                          <button
                            key={a}
                            type="button"
                            onClick={() => onAction(r, a)}
                            className="rounded border border-slate-200 px-1 py-0.5 text-[9px] text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Panel>
  );
}

/* ----------------------- conflict and gap analysis ----------------------- */

export function ConflictAnalysisPanel({
  conflicts, loading, onAction, spotlight,
}: {
  conflicts: PersonaConflict[];
  loading?: boolean;
  onAction: (c: PersonaConflict, action: string) => void;
  spotlight?: boolean;
}) {
  const head = ["Persona", "Section", "Issue Type", "Condition or Relationship A", "Condition or Relationship B",
    "Severity", "Authority", "Confidence", "Affected Teams", "Downstream Impact", "Owner", "Recommended Action", "Status", "Actions"];
  const critical = conflicts.filter((c) => c.severity === "Critical" && c.reviewStatus !== "Resolved").length;
  return (
    <Panel
      id="panel-conflicts"
      title="Persona Conflict and Gap Analysis"
      subtitle="Conflicting rules, missing owners, stale evidence and incomplete dependencies"
      spotlight={spotlight}
      degraded={critical ? `${critical} critical conflict${critical === 1 ? "" : "s"} blocking publication` : null}
    >
      <div className="px-4 pb-3">
        <SummaryChips items={conflictSummary} />
        {critical > 0 && (
          <div className="mb-2 flex items-start gap-1.5 rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-[11px] text-red-800">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              Blocked: dependent Personas cannot publish while a critical authority conflict is unresolved.
              Remediation: open the comparison, select the authoritative record or define applicability.
            </span>
          </div>
        )}
        {loading ? <TableSkeleton /> : conflicts.length === 0 ? (
          <StateNotice state="Healthy" message="No conflicts or gaps are open for the current filters." />
        ) : (
          <div className="max-h-80 overflow-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-[11px]">
              <caption className="sr-only">Persona conflict and gap analysis with {conflicts.length} records</caption>
              <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                <tr>{head.map((h) => <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {conflicts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <th scope="row" className="whitespace-nowrap px-2 py-1.5 text-left font-medium text-slate-800">{c.personaName}</th>
                    <td className="whitespace-nowrap px-2 py-1.5 text-slate-700">{c.sectionName}</td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-slate-700">{c.conflictType}</td>
                    <td className="max-w-[220px] px-2 py-1.5 text-slate-600">{c.a.statement}</td>
                    <td className="max-w-[220px] px-2 py-1.5 text-slate-600">{c.b.statement}</td>
                    <td className="px-2 py-1.5"><Pill label={c.severity} tone={severityTone(c.severity)} /></td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{c.authorityA} vs {c.authorityB}</td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{c.confidenceA} / {c.confidenceB}</td>
                    <td className="max-w-[180px] px-2 py-1.5 text-slate-600">{c.affectedTeams}</td>
                    <td className="max-w-[200px] px-2 py-1.5 text-slate-600">{c.businessImpact}</td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{c.owner}</td>
                    <td className="max-w-[220px] px-2 py-1.5 text-slate-600">{c.recommendedResolution}</td>
                    <td className="px-2 py-1.5"><Pill label={c.reviewStatus} tone={statusTone(c.reviewStatus)} /></td>
                    <td className="px-2 py-1.5">
                      <div className="flex flex-wrap gap-1">
                        {CONFLICT_ACTIONS.map((a) => (
                          <button
                            key={a}
                            type="button"
                            onClick={() => onAction(c, a)}
                            className="rounded border border-slate-200 px-1 py-0.5 text-[9px] text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Panel>
  );
}

/* ---------------------------- approval workflow --------------------------- */

export function ApprovalWorkflowPanel({
  chain, currentStage, onAction, spotlight,
}: {
  chain: PersonaApproval[];
  currentStage: ApprovalStage;
  onAction: (action: string) => void;
  spotlight?: boolean;
}) {
  const index = APPROVAL_STAGES.indexOf(currentStage);
  return (
    <Panel
      id="panel-approval"
      title="Team Approval Workflow"
      subtitle={`Payments Platform version 3.4 · current stage ${currentStage}`}
      spotlight={spotlight}
    >
      <div className="px-4 pb-3">
        <p className="sr-only">
          Approval chain progress: stage {index + 1} of {APPROVAL_STAGES.length}, currently {currentStage}.
        </p>
        <ol className="mb-2 flex flex-wrap items-stretch gap-1.5">
          {APPROVAL_STAGES.map((s, i) => {
            const state = i < index ? "Approved" : i === index ? "In Progress" : "Not Started";
            return (
              <li key={s} className="flex items-center gap-1.5">
                <div className={cn(
                  "min-w-[118px] rounded-md border px-2 py-1.5",
                  state === "Approved" ? "border-emerald-200 bg-emerald-50"
                    : state === "In Progress" ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white",
                )}>
                  <div className="text-[10.5px] font-semibold text-slate-800">{s}</div>
                  <div className="text-[9.5px] text-slate-600">{state}</div>
                </div>
                {i < APPROVAL_STAGES.length - 1 && <ChevronRight className="h-3 w-3 text-slate-400" aria-hidden />}
              </li>
            );
          })}
        </ol>

        <div className="overflow-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-[11px]">
            <caption className="sr-only">Payments Platform approval chain</caption>
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>{["Stage", "Approver", "Role", "Status", "Submitted", "Completed"].map((h) => (
                <th key={h} scope="col" className="px-2 py-1.5 font-semibold">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {chain.map((a) => (
                <tr key={a.id}>
                  <th scope="row" className="px-2 py-1.5 text-left font-medium text-slate-800">{a.approvalStage}</th>
                  <td className="px-2 py-1.5 text-slate-700">{a.approverId}</td>
                  <td className="px-2 py-1.5 text-slate-600">{a.approverRole}</td>
                  <td className="px-2 py-1.5"><Pill label={a.status} tone={statusTone(a.status)} /></td>
                  <td className="px-2 py-1.5 text-slate-600">{a.submittedAt ? new Date(a.submittedAt).toLocaleString() : "—"}</td>
                  <td className="px-2 py-1.5 text-slate-600">{a.completedAt ? new Date(a.completedAt).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {APPROVAL_ACTIONS.map((a) => (
            <Button key={a} size="sm" variant={a === "Approve" ? "default" : "outline"} className="h-7 text-[10.5px]" onClick={() => onAction(a)}>
              {a === "Approve" && <ShieldCheck className="mr-1 h-3 w-3" aria-hidden />}{a}
            </Button>
          ))}
        </div>
      </div>
    </Panel>
  );
}

/* ---------------------------- version history ----------------------------- */

export function VersionHistoryPanel({
  versions, onAction, spotlight,
}: {
  versions: PersonaVersion[];
  onAction: (v: PersonaVersion, action: string) => void;
  spotlight?: boolean;
}) {
  const head = ["Version", "Status", "Created", "Effective", "Expiration", "Author", "Approvers", "Quality",
    "Completeness", "Confidence", "Conditions +", "Conditions -", "Relationships", "Decision Logic", "Risks", "Evidence", "Actions"];
  return (
    <Panel id="panel-versions" title="Persona Version History" subtitle="Every governed change to the Payments Platform operating model" spotlight={spotlight}>
      <div className="px-4 pb-3 overflow-auto">
        <table className="w-full text-left text-[11px]">
          <caption className="sr-only">Persona version history</caption>
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>{head.map((h) => <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {versions.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50">
                <th scope="row" className="px-2 py-1.5 text-left font-medium text-slate-800">Version {v.version}</th>
                <td className="px-2 py-1.5"><Pill label={v.status} tone={v.status === "Published" ? "green" : v.status === "Draft" ? "blue" : "slate"} /></td>
                <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{v.createdAt}</td>
                <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{v.effectiveDate}</td>
                <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{v.expirationDate}</td>
                <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{v.createdBy}</td>
                <td className="max-w-[160px] px-2 py-1.5 text-slate-600">{v.approvedBy}</td>
                <td className="px-2 py-1.5 text-slate-700">{v.qualityScore}</td>
                <td className="px-2 py-1.5 text-slate-700">{v.completenessScore}</td>
                <td className="px-2 py-1.5 text-slate-700">{v.confidence}</td>
                <td className="px-2 py-1.5 text-emerald-700">+{v.conditionsAdded}</td>
                <td className="px-2 py-1.5 text-red-700">-{v.conditionsRemoved}</td>
                <td className="px-2 py-1.5 text-slate-600">{v.relationshipsChanged}</td>
                <td className="px-2 py-1.5 text-slate-600">{v.decisionLogicChanged ? "Changed" : "Unchanged"}</td>
                <td className="px-2 py-1.5 text-slate-600">{v.risksChanged ? "Changed" : "Unchanged"}</td>
                <td className="px-2 py-1.5 text-slate-600">{v.evidenceChanged ? "Changed" : "Unchanged"}</td>
                <td className="px-2 py-1.5">
                  <div className="flex flex-wrap gap-1">
                    {VERSION_ACTIONS.map((a) => (
                      <button key={a} type="button" onClick={() => onAction(v, a)} className="rounded border border-slate-200 px-1 py-0.5 text-[9px] text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
                        {a}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* --------------------------------- drift ---------------------------------- */

export function DriftPanel({
  drift, onAction, spotlight,
}: {
  drift: PersonaDrift[];
  onAction: (d: PersonaDrift, action: string) => void;
  spotlight?: boolean;
}) {
  const head = ["Persona", "Drift Type", "Changed Record", "Previous Value", "Current Value", "Materiality",
    "Detected", "Affected Sections", "Downstream Impact", "Status", "Actions"];
  return (
    <Panel id="panel-drift" title="Persona Drift and Freshness" subtitle="Source changes that may invalidate an existing Persona or decision" spotlight={spotlight}>
      <div className="px-4 pb-3">
        <SummaryChips items={driftSummary} />
        {drift.length === 0 ? (
          <StateNotice state="Healthy" message="No drift has been detected against the current Persona portfolio." />
        ) : (
          <div className="max-h-72 overflow-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-[11px]">
              <caption className="sr-only">Persona drift records</caption>
              <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                <tr>{head.map((h) => <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drift.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <th scope="row" className="whitespace-nowrap px-2 py-1.5 text-left font-medium text-slate-800">{d.personaName}</th>
                    <td className="whitespace-nowrap px-2 py-1.5 text-slate-700">{d.driftType}</td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{d.changedRecordType} {d.changedRecordId}</td>
                    <td className="max-w-[180px] px-2 py-1.5 text-slate-600">{d.previousValue}</td>
                    <td className="max-w-[180px] px-2 py-1.5 text-slate-600">{d.currentValue}</td>
                    <td className="px-2 py-1.5"><Pill label={d.materiality} tone={d.materiality === "Material" ? "red" : d.materiality === "Minor" ? "amber" : "slate"} /></td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{d.detectedAt}</td>
                    <td className="max-w-[160px] px-2 py-1.5 text-slate-600">{d.affectedSections}</td>
                    <td className="max-w-[200px] px-2 py-1.5 text-slate-600">{d.downstreamImpact}</td>
                    <td className="px-2 py-1.5"><Pill label={d.status} tone={statusTone(d.status)} /></td>
                    <td className="px-2 py-1.5">
                      <div className="flex flex-wrap gap-1">
                        {DRIFT_ACTIONS.map((a) => (
                          <button key={a} type="button" onClick={() => onAction(d, a)} className="rounded border border-slate-200 px-1 py-0.5 text-[9px] text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
                            {a}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Panel>
  );
}

/* -------------------------------- coverage -------------------------------- */

export function CoveragePanel({ onCategory, spotlight }: { onCategory: (name: string) => void; spotlight?: boolean }) {
  const [dimension, setDimension] = useState<CoverageDimension>("Business Unit");
  const data = coverageData[dimension];
  return (
    <Panel id="panel-coverage-map" title="Enterprise Persona Coverage" subtitle="Ranked Persona coverage across the enterprise" spotlight={spotlight}>
      <div className="px-4 pb-3">
        <div className="mb-2 flex flex-wrap gap-1.5" role="tablist" aria-label="Coverage dimension">
          {coverageDimensions.map((d) => (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={dimension === d}
              onClick={() => setDimension(d)}
              className={cn("rounded-md border px-2 py-1 text-[10.5px] font-medium",
                dimension === d ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="lg:col-span-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 30, right: 12, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10 }} />
                <RTooltip formatter={(v: number) => [`${v}% covered`, "Coverage"]} />
                <Bar dataKey="covered" radius={[0, 3, 3, 0]} isAnimationActive={false} onClick={(e: { name?: string }) => e?.name && onCategory(e.name)}>
                  {data.map((d) => (
                    <Cell key={d.name} fill={d.covered >= 90 ? "#059669" : d.covered >= 80 ? "#2563eb" : "#d97706"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-1">
            {coverageMetrics.map((m) => (
              <li key={m.label} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1 text-[11px]">
                <span className="text-slate-600">{m.label}</span>
                <span className="font-semibold text-slate-800">{m.value}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {data.map((d) => (
            <button key={d.name} type="button" onClick={() => onCategory(d.name)}
              className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
              {d.name} · {d.covered}% · {d.teams} teams
            </button>
          ))}
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------- publishing ------------------------------- */

export function PublishingPanel({
  onPublish, onRepublish, onHistory, onPause, publishingState, spotlight,
}: {
  onPublish: () => void;
  onRepublish: () => void;
  onHistory: () => void;
  onPause: () => void;
  publishingState: string;
  spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-publishing"
      title="Persona Publishing and Distribution"
      subtitle="Approved Personas are distributed to governed downstream services"
      spotlight={spotlight}
      degraded={publishingState === "Blocked" ? "Decision Intelligence distribution blocked by access policy" : null}
    >
      <div className="px-4 pb-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          <Button size="sm" className="h-7 text-[10.5px]" onClick={onPublish}><Upload className="mr-1 h-3 w-3" aria-hidden /> Publish Approved Persona</Button>
          <Button size="sm" variant="outline" className="h-7 text-[10.5px]" onClick={onRepublish}>Republish Selected Version</Button>
          <Button size="sm" variant="outline" className="h-7 text-[10.5px]" onClick={onHistory}>View Publishing History</Button>
          <Button size="sm" variant="outline" className="h-7 text-[10.5px]" onClick={onPause}><PauseCircle className="mr-1 h-3 w-3" aria-hidden /> Pause Distribution</Button>
          <span className="ml-auto self-center text-[10.5px] text-slate-500">Distribution state: {publishingState}</span>
        </div>
        <div className="overflow-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-[11px]">
            <caption className="sr-only">Publishing destinations</caption>
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>{["Destination", "Ready", "Pending", "Blocked", "Last Published", "Status", "Version", "Access Policy"].map((h) => (
                <th key={h} scope="col" className="px-2 py-1.5 font-semibold">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {publishDestinations.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <th scope="row" className="px-2 py-1.5 text-left font-medium text-slate-800">{d.name}</th>
                  <td className="px-2 py-1.5 text-slate-700">{d.ready}</td>
                  <td className="px-2 py-1.5 text-slate-600">{d.pending}</td>
                  <td className={cn("px-2 py-1.5", d.blocked ? "font-medium text-red-700" : "text-slate-600")}>{d.blocked}</td>
                  <td className="px-2 py-1.5 text-slate-600">{d.lastPublished}</td>
                  <td className="px-2 py-1.5"><Pill label={d.status} tone={statusTone(d.status)} /></td>
                  <td className="px-2 py-1.5 text-slate-600">{d.version}</td>
                  <td className="px-2 py-1.5"><Pill label={d.accessPolicyStatus} tone={statusTone(d.accessPolicyStatus)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Panel>
  );
}

/* -------------------------------- readiness ------------------------------- */

export function ReadinessPanel({
  onProceed, onLibrary, readinessDelta, spotlight,
}: {
  onProceed: () => void;
  onLibrary: () => void;
  readinessDelta: number;
  spotlight?: boolean;
}) {
  const toneClass: Record<string, string> = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    red: "border-red-200 bg-red-50 text-red-800",
    blue: "border-blue-200 bg-blue-50 text-blue-800",
  };
  return (
    <Panel id="panel-readiness" title="Persona Readiness and Downstream Use" subtitle="What the enterprise can rely on today" spotlight={spotlight}>
      <div className="px-4 pb-3">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {readinessMetrics.map((m) => (
            <div key={m.label} className={cn("rounded-md border px-2 py-1.5", toneClass[m.tone])}>
              <div className="text-[16px] font-bold leading-none">{Math.max(0, m.value + (m.label.startsWith("Approved") ? readinessDelta : 0))}</div>
              <div className="mt-1 text-[10px] leading-tight">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-2 grid gap-2 lg:grid-cols-5">
          {downstreamUsage.map((u) => (
            <div key={u.label} className="rounded-md border border-slate-200 px-2 py-1.5">
              <div className="text-[14px] font-semibold text-slate-900">{u.value}</div>
              <div className="text-[10px] text-slate-600">{u.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">Next Stage</div>
          <div className="text-[14px] font-bold text-slate-900">Cognitive Intake</div>
          <p className="mt-0.5 max-w-3xl text-[11.5px] text-slate-700">
            Evaluate incoming work for evidence completeness, business condition readiness, and applicability before
            selecting Team Personas for impact analysis
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Button size="sm" className="h-7 text-[11px]" onClick={onProceed}>
              Proceed to Cognitive Intake <ArrowRight className="ml-1 h-3 w-3" aria-hidden />
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onLibrary}>Open Team Persona Library</Button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* ----------------------------- impact preview ----------------------------- */

export function ImpactPreviewPanel({ onOpenFull, spotlight }: { onOpenFull: () => void; spotlight?: boolean }) {
  const levelTone = (l: string): Tone => (l === "High" ? "red" : l === "Medium" ? "amber" : "green");
  return (
    <Panel id="panel-impact-preview" title="Persona Impact Preview" subtitle="How the Payments Platform Persona would evaluate a proposed change" spotlight={spotlight}>
      <div className="px-4 pb-3 text-[11.5px]">
        <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5">
          <div className="font-semibold text-slate-900">{impactPreview.changeTitle}</div>
          <div className="text-slate-600">{impactPreview.changeSummary}</div>
        </div>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {impactPreview.reactions.map((r) => (
            <li key={r.label} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1">
              <span className="text-slate-700">{r.label}</span>
              <Pill label={r.level} tone={levelTone(r.level)} />
            </li>
          ))}
        </ul>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Approval required</div>
            <div className="text-slate-800">{impactPreview.approvalRequired}</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Required reviewers</div>
            <ul className="list-inside list-disc text-slate-700">
              {impactPreview.requiredReviewers.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Recommended evidence</div>
            <ul className="list-inside list-disc text-slate-700">
              {impactPreview.recommendedEvidence.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </div>
        </div>
        <Button size="sm" variant="outline" className="mt-2 h-7 text-[11px]" onClick={onOpenFull}>Open Full Persona Impact Analysis</Button>
      </div>
    </Panel>
  );
}

/* -------------------------------- activity -------------------------------- */

export function ActivityPanel({
  headline, onOpen, spotlight,
}: {
  headline: string;
  onOpen: (a: PersonaActivity) => void;
  spotlight?: boolean;
}) {
  const rows = useMemo(() => {
    if (headline === personaActivity[0].description) return personaActivity;
    return [{ ...personaActivity[0], id: "ACT-0", description: headline, timestamp: "Now" }, ...personaActivity];
  }, [headline]);
  return (
    <Panel id="panel-activity" title="Recent Persona Activity" subtitle="Construction, review, approval, drift and publishing events" spotlight={spotlight}>
      <div className="px-4 pb-3 max-h-72 overflow-auto">
        <table className="w-full text-left text-[11px]">
          <caption className="sr-only">Recent persona activity</caption>
          <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>{["Timestamp", "Action", "Persona", "Team", "Section", "Result", "Owner", "Audit ID"].map((h) => (
              <th key={h} scope="col" className="px-2 py-1.5 font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((a) => (
              <tr key={a.id} className="cursor-pointer hover:bg-slate-50" onClick={() => onOpen(a)}
                tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") onOpen(a); }}>
                <td className="whitespace-nowrap px-2 py-1.5 text-slate-600"><Clock className="mr-1 inline h-3 w-3" aria-hidden />{a.timestamp}</td>
                <th scope="row" className="whitespace-nowrap px-2 py-1.5 text-left font-medium text-slate-800">{a.action}</th>
                <td className="whitespace-nowrap px-2 py-1.5 text-slate-700">{a.personaName}</td>
                <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{a.team}</td>
                <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{a.section}</td>
                <td className="px-2 py-1.5"><Pill label={a.result} tone={statusTone(a.result)} /></td>
                <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{a.owner}</td>
                <td className="whitespace-nowrap px-2 py-1.5 text-slate-500">{a.auditId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* --------------------------- demo story overlay --------------------------- */

export function DemoStoryOverlay({
  step, total, caption, notes, showNotes, onToggleNotes, onNext, onPrev, onExit,
}: {
  step: number; total: number; caption: string; notes: string; showNotes: boolean;
  onToggleNotes: () => void; onNext: () => void; onPrev: () => void; onExit: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-label="Demo story"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-slate-900/95 px-4 py-3 text-white shadow-2xl"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2">
        <div className="flex items-center gap-2 text-[10.5px] text-slate-300">
          <span>Step {step + 1} of {total}</span>
          <div className="h-1 flex-1 rounded bg-slate-700">
            <div className="h-1 rounded bg-blue-400 transition-all motion-reduce:transition-none" style={{ width: `${((step + 1) / total) * 100}%` }} />
          </div>
        </div>
        <p className="text-[13px] font-medium leading-snug">{caption}</p>
        {showNotes && <p className="rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-[11px] text-slate-200">Presenter notes: {notes}</p>}
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="outline" className="h-7 border-slate-600 bg-transparent text-[11px] text-white hover:bg-slate-800" onClick={onPrev} disabled={step === 0}>Previous</Button>
          <Button size="sm" className="h-7 text-[11px]" onClick={onNext}>{step === total - 1 ? "Finish" : "Next"}</Button>
          <Button size="sm" variant="outline" className="h-7 border-slate-600 bg-transparent text-[11px] text-white hover:bg-slate-800" onClick={onToggleNotes}>
            {showNotes ? "Hide" : "Show"} Presenter Notes
          </Button>
          <Button size="sm" variant="outline" className="h-7 border-slate-600 bg-transparent text-[11px] text-white hover:bg-slate-800" onClick={onExit}>Exit Story</Button>
        </div>
      </div>
    </div>
  );
}

export function ScenarioBanner({ scenario, text, onReset }: { scenario: string; text: string; onReset: () => void }) {
  return (
    <div role="status" className="flex flex-wrap items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11.5px] text-blue-900">
      <RefreshCw className="h-3.5 w-3.5" aria-hidden />
      <span className="font-semibold">{scenario}</span>
      <span>{text}</span>
      <Button size="sm" variant="outline" className="ml-auto h-6 text-[10.5px]" onClick={onReset}>Reset Demo Data</Button>
    </div>
  );
}

export { GitCompare, CheckCircle2 };
