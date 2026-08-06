/**
 * Prompt 2 panels for Business Condition Extraction: review queue, conflict and
 * gap analysis, taxonomy administration, versioning, approvals, publishing,
 * activity, operational states, scenario banner, and demo story overlay.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { Metric, Panel, SimpleTable, StatusPill, nf, type Density } from "./panels";
import {
  approvalStages, approvalsSeed, approvalRequirementDrivers, activitySeed, conditionTypeDefinitions,
  conflictGapSummary, conflictRows, conditionVersions, demoSteps, operationalStateCopy, publishDestinations,
  reviewCategoryCounts, reviewCategories, reviewSummary, type ConditionReview, type ConflictRow,
  type ConditionVersion, type DemoStep, type ExtractionActivity, type PublishDestination,
} from "./governance-data";

/* ---------------------------------------------------------- shared states */

export function LoadingSkeleton({ rows = 4, label = "Loading" }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-live="polite" aria-label={label} className="space-y-1.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-6 animate-pulse rounded bg-slate-100" />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function StateNotice({ state, action, onAction }: { state: string; action?: string; onAction?: () => void }) {
  const copy = operationalStateCopy[state] ?? { title: state, detail: "" };
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center">
      <p className="text-[12px] font-semibold text-slate-800">{copy.title}</p>
      <p className="mx-auto mt-0.5 max-w-md text-[11.5px] text-slate-600">{copy.detail}</p>
      {action && onAction && (
        <Button size="sm" variant="outline" className="mt-2 h-7 text-[11px]" onClick={onAction}>{action}</Button>
      )}
    </div>
  );
}

const priorityTone = (p: string) =>
  p === "Critical" ? "border-red-200 bg-red-50 text-red-700"
    : p === "High" ? "border-amber-200 bg-amber-50 text-amber-800"
      : p === "Medium" ? "border-blue-200 bg-blue-50 text-blue-700"
        : "border-slate-200 bg-slate-50 text-slate-600";

const severityTone = (s: string) =>
  s.startsWith("High") ? "border-red-200 bg-red-50 text-red-700"
    : s.startsWith("Medium") ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-slate-200 bg-slate-50 text-slate-600";

export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center rounded border px-1.5 py-0.5 text-[10.5px] font-medium", className)}>{children}</span>;
}

/* ------------------------------------------------------------ review queue */

export function ReviewQueuePanel({
  reviews, density, loading, categoryFilter, onCategoryFilter, onOpen, onAction, search, onSearch,
}: {
  reviews: ConditionReview[]; density: Density; loading?: boolean;
  categoryFilter: string; onCategoryFilter: (c: string) => void;
  onOpen: (r: ConditionReview) => void; onAction: (action: string, r: ConditionReview) => void;
  search: string; onSearch: (s: string) => void;
}) {
  const filtered = useMemo(() => reviews.filter((r) => {
    const catOk = categoryFilter === "All" || r.reviewType === categoryFilter
      || (categoryFilter === "Conflict Resolution" && !!r.conflictId);
    const q = search.trim().toLowerCase();
    const hit = !q || `${r.id} ${r.conditionCandidate} ${r.reason} ${r.assignedReviewer}`.toLowerCase().includes(q);
    return catOk && hit;
  }), [reviews, categoryFilter, search]);

  return (
    <Panel id="panel-reviews" title="Human Review Queue"
      subtitle="Accountable human validation for high impact or uncertain conditions"
      actions={
        <>
          <Input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search reviews"
            aria-label="Search reviews" className="h-7 w-40 text-[11px]" />
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onCategoryFilter("All")}>All categories</Button>
        </>
      }>
      {loading ? <LoadingSkeleton rows={5} label="Loading review queue" /> : (
        <>
          <div className="grid gap-1.5 sm:grid-cols-3 xl:grid-cols-6">
            {reviewSummary.map((s) => (
              <Metric key={s.label} label={s.label} value={nf(s.value)} tone={s.tone} />
            ))}
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {reviewCategories.map((c) => (
              <button key={c} type="button" onClick={() => onCategoryFilter(categoryFilter === c ? "All" : c)}
                aria-pressed={categoryFilter === c}
                className={cn("rounded border px-1.5 py-0.5 text-[10.5px]",
                  categoryFilter === c ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
                {c} · {reviewCategoryCounts[c]}
              </button>
            ))}
          </div>

          <div className="mt-2">
            {filtered.length === 0 ? <StateNotice state="Empty" action="Clear category filter" onAction={() => { onCategoryFilter("All"); onSearch(""); }} /> : (
              <SimpleTable density={density}
                headers={["Review ID", "Condition Candidate", "Review Type", "Reason", "Priority", "Assigned Reviewer", "Due Date", "Age", "Affected Teams", "Downstream Impact", "Status", "Actions"]}
                empty="No reviews"
                rows={filtered.map((r) => [
                  <span className="font-mono text-[11px]">{r.id}</span>,
                  <span className="font-medium text-slate-800">{r.conditionCandidate}</span>,
                  r.reviewType, r.reason,
                  <Tag className={priorityTone(r.priority)}>{r.priority}</Tag>,
                  r.assignedReviewer,
                  <span className={cn(r.dueDate.includes("Two Hours") && "font-semibold text-red-700")}>{r.dueDate}</span>,
                  r.age, r.affectedTeams.join(", "), r.downstreamImpact,
                  <StatusPill status={r.status} />,
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" className="h-6 px-2 text-[10.5px]" onClick={(e) => { e.stopPropagation(); onOpen(r); }}>Open Review</Button>
                    <Button size="sm" variant="outline" className="h-6 px-2 text-[10.5px]" onClick={(e) => { e.stopPropagation(); onAction("Approve", r); }}>Approve</Button>
                    <Button size="sm" variant="outline" className="h-6 px-2 text-[10.5px]" onClick={(e) => { e.stopPropagation(); onAction("Reassign", r); }}>Reassign</Button>
                    <Button size="sm" variant="outline" className="h-6 px-2 text-[10.5px]" onClick={(e) => { e.stopPropagation(); onAction("Escalate", r); }}>Escalate</Button>
                  </div>,
                ])}
                onRowClick={(i) => onOpen(filtered[i])} />
            )}
          </div>
        </>
      )}
    </Panel>
  );
}

/* --------------------------------------------------- conflict & gap analysis */

export function ConflictGapPanel({
  rows, density, issueFilter, onIssueFilter, onOpenComparison, onAction, loading,
}: {
  rows: ConflictRow[]; density: Density; issueFilter: string; onIssueFilter: (s: string) => void;
  onOpenComparison: (row: ConflictRow) => void; onAction: (action: string, row: ConflictRow) => void; loading?: boolean;
}) {
  const filtered = issueFilter === "All" ? rows : rows.filter((r) => r.issueType === issueFilter);
  return (
    <Panel id="panel-conflicts" title="Conflict & Gap Analysis"
      subtitle="Contradictions, missing fields, ambiguity, and staleness detected before downstream use"
      actions={<Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onIssueFilter("All")}>All issues</Button>}>
      {loading ? <LoadingSkeleton rows={5} label="Loading conflict analysis" /> : (
        <>
          <div className="grid gap-1.5 sm:grid-cols-3 xl:grid-cols-9">
            {conflictGapSummary.map((s) => (
              <button key={s.label} type="button" onClick={() => onIssueFilter(issueFilter === s.issue ? "All" : s.issue)}
                aria-pressed={issueFilter === s.issue} className="text-left">
                <Metric label={s.label} value={nf(s.value)} tone={s.tone} sub={issueFilter === s.issue ? "Filtered" : undefined} />
              </button>
            ))}
          </div>

          <p className="mt-2 rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-800">
            {operationalStateCopy.Conflict.detail}
          </p>

          <div className="mt-2">
            {filtered.length === 0 ? <StateNotice state="Empty" action="Show all issues" onAction={() => onIssueFilter("All")} /> : (
              <SimpleTable density={density}
                headers={["Condition", "Issue Type", "Conflicting Condition or Missing Field", "Severity", "Authority", "Confidence", "Affected Teams", "Downstream Impact", "Owner", "Age", "Recommended Action", "Status", "Actions"]}
                empty="No conflicts"
                rows={filtered.map((c) => [
                  <span className="font-medium text-slate-800">{c.condition}</span>,
                  c.issueType, c.detail,
                  <Tag className={severityTone(c.severity)}>{c.severity}</Tag>,
                  c.authority, `${c.confidence}%`, c.affectedTeams.join(", "), c.downstreamImpact, c.owner, c.age,
                  c.recommendedAction,
                  <StatusPill status={c.status} />,
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" className="h-6 px-2 text-[10.5px]" onClick={(e) => { e.stopPropagation(); onOpenComparison(c); }}>Open Comparison</Button>
                    <Button size="sm" variant="outline" className="h-6 px-2 text-[10.5px]" onClick={(e) => { e.stopPropagation(); onAction("Assign", c); }}>Assign</Button>
                    <Button size="sm" variant="outline" className="h-6 px-2 text-[10.5px]" onClick={(e) => { e.stopPropagation(); onAction("Acknowledge", c); }}>Acknowledge</Button>
                    <Button size="sm" variant="outline" className="h-6 px-2 text-[10.5px]" onClick={(e) => { e.stopPropagation(); onAction("Create Review Task", c); }}>Create Review Task</Button>
                    <Button size="sm" variant="outline" className="h-6 px-2 text-[10.5px]" onClick={(e) => { e.stopPropagation(); onAction("Create Incident", c); }}>Create Incident</Button>
                  </div>,
                ])}
                onRowClick={(i) => onOpenComparison(filtered[i])} />
            )}
          </div>
        </>
      )}
    </Panel>
  );
}

/* -------------------------------------------------------- taxonomy admin */

export function TaxonomyAdminPanel({ selectedId, onSelect, onAction }: {
  selectedId: string; onSelect: (id: string) => void; onAction: (action: string, typeName: string) => void;
}) {
  const selected = conditionTypeDefinitions.find((t) => t.id === selectedId) ?? conditionTypeDefinitions[0];
  return (
    <Panel id="panel-taxonomy-admin" title="Condition Taxonomy Management"
      subtitle="Fourteen governed condition types · active version 3.6"
      actions={
        <>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction("Compare Versions", selected.name)}>Compare Versions</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction("Test Against Sample", selected.name)}>Test Against Sample</Button>
          <Button size="sm" className="h-7 text-[11px]" onClick={() => onAction("Create Condition Type", "New condition type")}>Create Condition Type</Button>
        </>
      }>
      <div className="grid gap-2 lg:grid-cols-[240px_minmax(0,1fr)]">
        <ul className="max-h-[320px] space-y-0.5 overflow-y-auto pr-1" aria-label="Condition types">
          {conditionTypeDefinitions.map((t) => (
            <li key={t.id}>
              <button type="button" onClick={() => onSelect(t.id)} aria-current={t.id === selected.id}
                className={cn("flex w-full items-center justify-between rounded px-2 py-1 text-left text-[11.5px]",
                  t.id === selected.id ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50")}>
                <span>{t.name}</span>
                <span className={cn("text-[10px]", t.id === selected.id ? "text-slate-300" : "text-slate-400")}>{t.status}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="rounded-lg border border-slate-200 p-2">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div>
              <h3 className="text-[12.5px] font-semibold text-slate-900">{selected.name}</h3>
              <p className="text-[11px] text-slate-500">{selected.definition}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {["View Type", "Edit Draft", "Clone", "Activate", "Deprecate"].map((a) => (
                <Button key={a} size="sm" variant="outline" className="h-6 px-2 text-[10.5px]" onClick={() => onAction(a, selected.name)}>{a}</Button>
              ))}
            </div>
          </div>

          <dl className="mt-2 grid gap-x-3 gap-y-1 text-[11px] sm:grid-cols-2 xl:grid-cols-3">
            {([
              ["Business purpose", selected.businessPurpose],
              ["Required fields", selected.requiredFields.join(", ")],
              ["Optional fields", selected.optionalFields.join(", ")],
              ["Allowed operators", selected.allowedOperators.join(" ")],
              ["Allowed value types", selected.allowedValueTypes.join(", ")],
              ["Supported units", selected.supportedUnits.join(", ")],
              ["Owner requirements", selected.ownerRequirements],
              ["Evidence requirements", selected.evidenceRequirements],
              ["Authority requirements", selected.authorityRequirements],
              ["Approval requirements", selected.approvalRequirements],
              ["Conflict rules", selected.conflictRules],
              ["Freshness rules", selected.freshnessRules],
              ["Extraction guidance", selected.extractionGuidance],
              ["Validation rules", selected.validationRules.join("; ")],
              ["Downstream uses", selected.downstreamUses.join(", ")],
              ["Example statements", selected.exampleStatements.join(" · ") || "—"],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] uppercase tracking-wide text-slate-500">{k}</dt>
                <dd className="text-slate-700">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Panel>
  );
}

/* -------------------------------------------------------- version history */

export function VersionHistoryPanel({ versions, selectedIds, onToggle, onAction, density }: {
  versions: ConditionVersion[]; selectedIds: string[]; onToggle: (id: string) => void;
  onAction: (action: string, v: ConditionVersion) => void; density: Density;
}) {
  return (
    <Panel id="panel-versions" title="Condition Version History"
      subtitle="COND-100422 · Payments API P95 latency threshold"
      actions={
        <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled={selectedIds.length !== 2}
          onClick={() => onAction("Compare", versions[0])}>Compare selected</Button>
      }>
      <SimpleTable density={density}
        headers={["", "Version", "Status", "Created", "Effective Date", "Expiration Date", "Owner", "Authority", "Approval", "Value Changes", "Owner Changes", "Evidence Changes", "Applicability Changes", "Downstream Consumers", "Actions"]}
        empty="No versions"
        rows={versions.map((v) => [
          <input type="checkbox" aria-label={`Select version ${v.version}`} checked={selectedIds.includes(v.id)}
            onChange={() => onToggle(v.id)} onClick={(e) => e.stopPropagation()} />,
          <span className="font-semibold text-slate-800">{v.version}</span>,
          <StatusPill status={v.status} />,
          v.changedAt, v.effectiveDate, v.expirationDate ?? "—", v.owner, v.authorityLevel, v.approval,
          v.valueChanges, v.ownerChanges, v.evidenceChanges, v.applicabilityChanges,
          v.downstreamConsumers.join(", "),
          <div className="flex flex-wrap gap-1">
            {["View", "Compare", "Restore as Draft", "Supersede", "Mark Historical", "Export"].map((a) => (
              <Button key={a} size="sm" variant="outline" className="h-6 px-2 text-[10.5px]"
                onClick={(e) => { e.stopPropagation(); onAction(a, v); }}>{a}</Button>
            ))}
          </div>,
        ])} />
    </Panel>
  );
}

/* ------------------------------------------------------ approval governance */

export function ApprovalGovernancePanel({ stage, onStage, onAction }: {
  stage: string; onStage: (s: string) => void; onAction: (action: string) => void;
}) {
  return (
    <Panel id="panel-approvals" title="Approval Governance"
      subtitle="Stage progression and the drivers that decide required approvals"
      actions={<Button size="sm" className="h-7 text-[11px]" onClick={() => onAction("Open Approval")}>Open Approval</Button>}>
      <ol className="flex flex-wrap items-center gap-1" aria-label="Approval stages">
        {approvalStages.map((s, i) => {
          const idx = approvalStages.indexOf(stage as typeof approvalStages[number]);
          const done = i < idx;
          return (
            <li key={s} className="flex items-center gap-1">
              <button type="button" onClick={() => onStage(s)} aria-current={s === stage}
                className={cn("rounded border px-1.5 py-1 text-[10.5px]",
                  s === stage ? "border-slate-900 bg-slate-900 text-white"
                    : done ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
                {done ? "✓ " : ""}{s}
              </button>
              {i < approvalStages.length - 1 && <ChevronRight className="h-3 w-3 text-slate-300" aria-hidden />}
            </li>
          );
        })}
      </ol>

      <div className="mt-2 grid gap-2 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-2">
          <p className="text-[11px] font-semibold text-slate-800">Approval requirement drivers</p>
          <ul className="mt-1 space-y-0.5 text-[11px] text-slate-600">
            {approvalRequirementDrivers.map((d) => (
              <li key={d.driver} className="flex items-start justify-between gap-2">
                <span className="text-slate-500">{d.driver}</span>
                <span className="text-right text-slate-700">{d.value} · <span className="text-slate-500">{d.requirement}</span></span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-slate-200 p-2">
          <p className="text-[11px] font-semibold text-slate-800">Approval records</p>
          <ul className="mt-1 space-y-1 text-[11px]">
            {approvalsSeed.map((a) => (
              <li key={a.id} className="rounded border border-slate-100 px-1.5 py-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10.5px] text-slate-500">{a.id}</span>
                  <StatusPill status={a.status} />
                </div>
                <p className="text-slate-700">{a.approvalStage} · {a.approverRole}</p>
                <p className="text-slate-500">{a.decision ?? "Awaiting decision"} — {a.comments}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------- publishing */

export function PublishingPanel({ destinations, pausedIds, onPublish, onRepublish, onPause, onHistory, publishState }: {
  destinations: PublishDestination[]; pausedIds: string[]; publishState: string;
  onPublish: () => void; onRepublish: () => void; onPause: (id: string) => void; onHistory: () => void;
}) {
  return (
    <Panel id="panel-publishing" title="Conditions Registry Publishing"
      subtitle="Nine destinations with access validation and version state"
      actions={
        <>
          <Button size="sm" className="h-7 text-[11px]" onClick={onPublish}>Publish Approved Conditions</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onRepublish}>Republish Selected Scope</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onHistory}>View Publishing History</Button>
        </>
      }>
      {publishState !== "Healthy" && (
        <p className="mb-2 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-800">
          Publishing state: {publishState}. {operationalStateCopy[publishState]?.detail ?? ""}
        </p>
      )}
      <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
        {destinations.map((d) => {
          const paused = pausedIds.includes(d.id);
          const state = paused ? "Paused" : d.state;
          return (
            <div key={d.id} className="rounded-lg border border-slate-200 p-2">
              <div className="flex items-start justify-between gap-1.5">
                <p className="text-[11.5px] font-semibold text-slate-800">{d.name}</p>
                <StatusPill status={state} />
              </div>
              <dl className="mt-1 grid grid-cols-2 gap-x-2 text-[10.5px] text-slate-600">
                <div><dt className="inline text-slate-500">Ready </dt><dd className="inline font-medium">{nf(d.ready)}</dd></div>
                <div><dt className="inline text-slate-500">Pending </dt><dd className="inline font-medium">{nf(d.pending)}</dd></div>
                <div><dt className="inline text-slate-500">Blocked </dt><dd className="inline font-medium">{nf(d.blocked)}</dd></div>
                <div><dt className="inline text-slate-500">Version </dt><dd className="inline font-medium">{d.version}</dd></div>
                <div><dt className="inline text-slate-500">Last published </dt><dd className="inline font-medium">{d.lastPublished}</dd></div>
                <div><dt className="inline text-slate-500">Access </dt><dd className="inline font-medium">{d.accessValidation}</dd></div>
              </dl>
              <p className="mt-0.5 text-[10.5px] text-slate-500">{d.status}</p>
              <Button size="sm" variant="outline" className="mt-1 h-6 px-2 text-[10.5px]" onClick={() => onPause(d.id)}>
                {paused ? "Resume Destination" : "Pause Destination"}
              </Button>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* --------------------------------------------------------------- activity */

export function ActivityPanel({ activity, onOpen, density }: {
  activity: ExtractionActivity[]; onOpen: (a: ExtractionActivity) => void; density: Density;
}) {
  return (
    <Panel id="panel-activity" title="Recent Extraction Activity" subtitle="Audited events across extraction, review, and publication">
      <SimpleTable density={density}
        headers={["Timestamp", "Action", "Condition or Job", "Source", "Team", "Result", "Owner", "Audit ID"]}
        empty="No recent activity"
        rows={activity.map((a) => [
          a.timestamp,
          <span className="font-medium text-slate-800">{a.action}</span>,
          <span>{a.description}<span className="block font-mono text-[10px] text-slate-400">{a.conditionId ?? a.jobId ?? a.candidateId ?? a.conflictId ?? "—"}</span></span>,
          a.sourceId, a.teamId, <StatusPill status={a.result} />, a.owner,
          <span className="font-mono text-[10.5px]">{a.auditId}</span>,
        ])}
        onRowClick={(i) => onOpen(activity[i])} />
    </Panel>
  );
}

/* -------------------------------------------------------- scenario banner */

export function ScenarioBanner({ label, message, state, onReset }: {
  label: string; message: string; state: string; onReset: () => void;
}) {
  return (
    <div role="status" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2">
      <div className="min-w-0">
        <p className="text-[11.5px] font-semibold text-blue-900">Demo scenario · {label}</p>
        <p className="text-[11px] text-blue-800">{message}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <Badge variant="outline" className="bg-white text-[10.5px]">{state}</Badge>
        <Button size="sm" variant="outline" className="h-7 bg-white text-[11px]" onClick={onReset}>Reset Demo Data</Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------- demo story overlay */

export function DemoStoryOverlay({ stepIndex, onNext, onPrev, onExit }: {
  stepIndex: number; onNext: () => void; onPrev: () => void; onExit: () => void;
}) {
  const step: DemoStep = demoSteps[stepIndex];
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [notes, setNotes] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = document.getElementById(step.target);
    if (el) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      const t = setTimeout(() => setRect(el.getBoundingClientRect()), reduce ? 0 : 420);
      return () => clearTimeout(t);
    }
    setRect(null);
  }, [step.target, stepIndex]);

  useEffect(() => { closeRef.current?.focus(); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit, onNext, onPrev]);

  return (
    <div className="pointer-events-none fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label={`Demo story step ${step.id} of ${demoSteps.length}`}>
      <div className="absolute inset-0 bg-slate-900/45" />
      {rect && (
        <div aria-hidden className="absolute rounded-xl ring-4 ring-blue-400"
          style={{
            top: Math.max(4, rect.top - 6), left: Math.max(4, rect.left - 6),
            width: rect.width + 12, height: rect.height + 12,
            boxShadow: "0 0 0 9999px rgba(15,23,42,0.45)", background: "transparent",
          }} />
      )}
      <div className="pointer-events-auto absolute bottom-4 left-1/2 w-[min(680px,94vw)] -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10.5px] uppercase tracking-wide text-slate-500">Step {step.id} of {demoSteps.length} · {step.title}</p>
            <p className="mt-0.5 text-[12.5px] text-slate-800">{step.caption}</p>
          </div>
          <Button ref={closeRef} size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label="Exit demo story" onClick={onExit}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {notes && <p className="mt-1.5 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600">Presenter notes: {step.notes}</p>}

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="h-1 w-full max-w-[240px] rounded bg-slate-200" aria-hidden>
            <div className="h-1 rounded bg-slate-900 transition-[width]" style={{ width: `${((stepIndex + 1) / demoSteps.length) * 100}%` }} />
          </div>
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setNotes((v) => !v)}>Presenter Notes</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onPrev} disabled={stepIndex === 0}>Previous</Button>
            <Button size="sm" className="h-7 text-[11px]" onClick={onNext}>{stepIndex === demoSteps.length - 1 ? "Finish" : "Next"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { conditionVersions, activitySeed, publishDestinations };
