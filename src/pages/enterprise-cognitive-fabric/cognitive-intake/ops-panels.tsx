/**
 * Cognitive Intake — Prompt 2 operational panels.
 *
 * Active Intake Jobs, Job Detail, Notifications, Recent Activity,
 * Intake Package History, Quality Detail, and the Demo Story overlay.
 */

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Drawer, Pill, Row, type Tone } from "../persona-studio/primitives";
import { Panel } from "../cognitive-memory/panels";
import { intakeTone } from "./panels";
import { decompositionQuality, stageName, type CognitiveIntakeActivity } from "./data";
import {
  jobStageLog, qualityDetail, type CognitiveIntakeJob, type CognitiveIntakeNotification,
  type CognitiveIntakePackageVersion, type CognitiveIntakeRuleActivation, type StoryStep,
} from "./ops-data";

/* ------------------------------------------------------- active intake jobs */

const jobColumns = [
  "Job ID", "Intake Item", "Work Type", "Current Stage", "Status", "Context Records",
  "Persona Candidates", "Conditions", "Evidence Coverage", "Gaps", "Started", "Elapsed",
  "Owner", "Warnings",
];

export function ActiveJobsPanel({
  jobs, loading, onOpen, onRunIntake,
}: {
  jobs: CognitiveIntakeJob[];
  loading?: boolean;
  onOpen: (job: CognitiveIntakeJob) => void;
  onRunIntake: () => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [sortKey, setSortKey] = useState<"id" | "elapsedTime" | "gapCount">("id");
  const [dir, setDir] = useState<"asc" | "desc">("asc");

  const rows = useMemo(() => {
    const f = jobs.filter((j) => {
      if (status !== "All" && j.status !== status) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return `${j.id} ${j.intakeTitle} ${j.workType} ${j.owner}`.toLowerCase().includes(q);
    });
    return [...f].sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey];
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv : String(av).localeCompare(String(bv));
      return dir === "asc" ? cmp : -cmp;
    });
  }, [jobs, query, status, sortKey, dir]);

  const sort = (k: typeof sortKey) => {
    if (k === sortKey) setDir(dir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setDir("asc"); }
  };

  return (
    <Panel id="panel-jobs" title="Active Intake Jobs"
      subtitle="Cognitive Intake orchestration currently executing against incoming work"
      actions={
        <>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search jobs"
            aria-label="Search active intake jobs"
            className="h-7 w-40 rounded-md border border-slate-200 px-2 text-[11px] focus:border-blue-400 focus:outline-none" />
          <label className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-500">
            <span className="sr-only sm:not-sr-only">Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter jobs by status"
              className="h-7 rounded-md border border-slate-200 px-1.5 text-[11px] text-slate-700">
              {["All", "Running", "Warning", "Paused", "Completed", "Failed"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onRunIntake}>Run Intake</Button>
        </>
      }>
      {loading ? (
        <div className="space-y-1.5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-7 w-full" />)}</div>
      ) : rows.length === 0 ? (
        <p className="py-6 text-center text-[12px] text-slate-500">No active intake jobs match the current filters.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[11px]">
            <caption className="sr-only">Active Cognitive Intake orchestration jobs</caption>
            <thead className="bg-slate-50">
              <tr>
                {jobColumns.map((c) => {
                  const key = c === "Job ID" ? "id" : c === "Elapsed" ? "elapsedTime" : c === "Gaps" ? "gapCount" : null;
                  return (
                    <th key={c} scope="col" className="whitespace-nowrap border-b border-slate-200 px-2 py-1 text-left font-semibold text-slate-600">
                      {key ? (
                        <button type="button" onClick={() => sort(key as typeof sortKey)}
                          aria-label={`Sort by ${c}`}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                          {c}{sortKey === key ? (dir === "asc" ? " ↑" : " ↓") : ""}
                        </button>
                      ) : c}
                    </th>
                  );
                })}
                <th scope="col" className="border-b border-slate-200 px-2 py-1 text-left font-semibold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((j) => (
                <tr key={j.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="whitespace-nowrap px-2 py-1 font-medium text-slate-800">{j.id}</td>
                  <td className="px-2 py-1 text-slate-700">{j.intakeTitle}</td>
                  <td className="whitespace-nowrap px-2 py-1 text-slate-600">{j.workType}</td>
                  <td className="whitespace-nowrap px-2 py-1 text-slate-600">{stageName(j.currentStageId)}</td>
                  <td className="px-2 py-1"><Pill label={j.status} tone={intakeTone(j.status)} /></td>
                  <td className="px-2 py-1 tabular-nums text-slate-700">{j.contextRecordCount}</td>
                  <td className="px-2 py-1 tabular-nums text-slate-700">{j.personaCandidateCount}</td>
                  <td className="px-2 py-1 tabular-nums text-slate-700">{j.conditionCount}</td>
                  <td className="px-2 py-1 tabular-nums text-slate-700">{j.evidenceCoverage}%</td>
                  <td className="px-2 py-1 tabular-nums text-slate-700">{j.gapCount}</td>
                  <td className="whitespace-nowrap px-2 py-1 text-slate-600">{j.startedAt}</td>
                  <td className="whitespace-nowrap px-2 py-1 text-slate-600">{j.elapsedTime}</td>
                  <td className="whitespace-nowrap px-2 py-1 text-slate-600">{j.owner}</td>
                  <td className="px-2 py-1 tabular-nums text-slate-700">{j.warningCount}</td>
                  <td className="px-2 py-1">
                    <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onOpen(j)}>Open Job</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------- job detail -- */

const jobTabs = ["Summary", "Stages", "Context", "Entities", "Personas", "Conditions", "Evidence", "Gaps", "Related Work", "Logs"] as const;

export function JobDetailDrawer({
  open, onOpenChange, job, onAction,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  job: CognitiveIntakeJob | null;
  onAction: (action: string, job: CognitiveIntakeJob) => void;
}) {
  const [tab, setTab] = useState<(typeof jobTabs)[number]>("Summary");
  if (!job) return null;
  const stages = jobStageLog(job);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} wide
      title={`${job.id} · ${job.intakeTitle}`}
      description={`${job.workType} · ${job.status} · ${stageName(job.currentStageId)}`}>
      <div className="flex flex-wrap gap-1" role="tablist" aria-label="Job detail sections">
        {jobTabs.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={cn("rounded px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              tab === t ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{t}</button>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 p-2">
        {tab === "Summary" && (
          <dl>
            <Row label="Job" value={job.id} />
            <Row label="Intake" value={job.intakeIds.join(", ")} />
            <Row label="Status" value={<Pill label={job.status} tone={intakeTone(job.status)} />} />
            <Row label="Current Stage" value={stageName(job.currentStageId)} />
            <Row label="Started" value={job.startedAt} />
            <Row label="Elapsed" value={job.elapsedTime} />
            <Row label="Expected Completion" value={job.estimatedCompletion} />
            <Row label="Records Retrieved" value={job.contextRecordCount} />
            <Row label="Personas" value={job.personaCandidateCount} />
            <Row label="Conditions" value={job.conditionCount} />
            <Row label="Evidence" value={`${job.evidenceCoverage}%`} />
            <Row label="Gaps" value={job.gapCount} />
            <Row label="Warnings" value={job.warningCount} />
            <Row label="Configuration" value={job.configurationVersion} />
          </dl>
        )}
        {tab === "Stages" && (
          <ol className="space-y-1">
            {stages.map((s) => (
              <li key={s.stage} className="flex items-start justify-between gap-2 rounded border border-slate-200 bg-slate-50 p-1.5">
                <div>
                  <p className="text-[11px] font-medium text-slate-800">{s.stage}</p>
                  <p className="text-[10.5px] text-slate-600">{s.detail}</p>
                </div>
                <Pill label={s.state} tone={intakeTone(s.state)} />
              </li>
            ))}
          </ol>
        )}
        {tab === "Context" && <p className="text-[11.5px] text-slate-700">{job.contextRecordCount} Enterprise Cognitive Memory records retrieved for {job.intakeTitle}, covering personas, business conditions, policies, prior decisions, outcomes, and learning records.</p>}
        {tab === "Entities" && <p className="text-[11.5px] text-slate-700">Entity resolution {job.currentStageId === "entities" ? "in progress" : "complete"} · {job.warningCount} warning(s) raised during canonical mapping.</p>}
        {tab === "Personas" && <p className="text-[11.5px] text-slate-700">{job.personaCandidateCount} candidate Team Personas identified. Persona impact scoring is not performed by Cognitive Intake.</p>}
        {tab === "Conditions" && <p className="text-[11.5px] text-slate-700">{job.conditionCount} approved Business Conditions matched to the decomposed change.</p>}
        {tab === "Evidence" && <p className="text-[11.5px] text-slate-700">Evidence coverage {job.evidenceCoverage}% across required evidence requirements.</p>}
        {tab === "Gaps" && <p className="text-[11.5px] text-slate-700">{job.gapCount} gap(s) detected and recorded explicitly on the Intake Package.</p>}
        {tab === "Related Work" && <p className="text-[11.5px] text-slate-700">Related work detection completed. Prior decisions and measured outcomes are linked to the intake record.</p>}
        {tab === "Logs" && (
          <pre className="max-h-64 overflow-auto rounded bg-slate-900 p-2 text-[10.5px] leading-relaxed text-slate-100">
{stages.map((s) => `${s.at}  [${s.state.toUpperCase()}]  ${s.stage} — ${s.detail}`).join("\n")}
          </pre>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {["Pause", "Resume", "Retry", "Restart from Stage", "Open Intake", "Open Workbench", "View Logs"].map((a) => (
          <Button key={a} size="sm" variant={a === "Open Workbench" ? "default" : "outline"} className="h-7 text-[11px]"
            onClick={() => onAction(a, job)}>{a}</Button>
        ))}
      </div>
    </Drawer>
  );
}

/* --------------------------------------------------------- notifications --- */

export function NotificationsDrawer({
  open, onOpenChange, items, onMarkRead, onMarkAllRead, onAcknowledge, onOpenItem, onAssign,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  items: CognitiveIntakeNotification[];
  onMarkRead: (n: CognitiveIntakeNotification) => void;
  onMarkAllRead: () => void;
  onAcknowledge: (n: CognitiveIntakeNotification) => void;
  onOpenItem: (n: CognitiveIntakeNotification) => void;
  onAssign: (n: CognitiveIntakeNotification) => void;
}) {
  const [filter, setFilter] = useState("All");
  const rows = items.filter((n) => filter === "All" || n.severity === filter || n.status === filter);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="Cognitive Intake Notifications"
      description="Operational signals generated by intake, clarification, evidence, rule activation, and routing events">
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <label className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-500">
          Filter
          <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter notifications"
            className="h-7 rounded-md border border-slate-200 px-1.5 text-[11px] text-slate-700">
            {["All", "Critical", "Warning", "Info", "Unread", "Read", "Acknowledged"].map((f) => <option key={f}>{f}</option>)}
          </select>
        </label>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onMarkAllRead}>Mark All Read</Button>
      </div>
      <ul className="space-y-1.5">
        {rows.length === 0 && <li className="py-6 text-center text-[12px] text-slate-500">No notifications match this filter.</li>}
        {rows.map((n) => (
          <li key={n.id} className={cn("rounded-lg border p-2", n.status === "Unread" ? "border-blue-200 bg-blue-50/40" : "border-slate-200 bg-white")}>
            <div className="flex flex-wrap items-start justify-between gap-1.5">
              <div>
                <p className="text-[11.5px] font-semibold text-slate-800">{n.title}</p>
                <p className="text-[11px] text-slate-600">{n.description}</p>
                <p className="text-[10px] text-slate-400">{n.createdAt} · {n.notificationType} · {n.owner} · {n.intakeId}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Pill label={n.severity} tone={n.severity === "Critical" ? "red" : n.severity === "Warning" ? "amber" : "blue"} />
                <Pill label={n.status} tone={n.status === "Unread" ? "blue" : "slate"} />
              </div>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onMarkRead(n)}>Mark Read</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onAcknowledge(n)}>Acknowledge</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onAssign(n)}>Assign</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onOpenItem(n)}>Open Item</Button>
            </div>
          </li>
        ))}
      </ul>
    </Drawer>
  );
}

export function NotificationsButton({ unread, onClick }: { unread: number; onClick: () => void }) {
  return (
    <Button size="sm" variant="outline" className="relative h-7 text-[11px]" onClick={onClick}
      aria-label={`Notifications, ${unread} unread`}>
      <Bell className="mr-1 h-3.5 w-3.5" aria-hidden /> Notifications
      {unread > 0 && <span className="ml-1 rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white">{unread}</span>}
    </Button>
  );
}

/* --------------------------------------------------------- recent activity */

export function RecentActivityPanel({
  rows, onOpen,
}: {
  rows: CognitiveIntakeActivity[];
  onOpen: (intakeId: string) => void;
}) {
  const [filter, setFilter] = useState("All");
  const visible = rows.filter((r) => filter === "All" || r.result === filter);
  return (
    <Panel id="panel-recent-activity" title="Recent Cognitive Intake Activity"
      subtitle="Governed audit trail of intake, clarification, evidence, rule activation, and routing events"
      actions={
        <label className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-500">
          Result
          <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter activity by result"
            className="h-7 rounded-md border border-slate-200 px-1.5 text-[11px] text-slate-700">
            {["All", "Success", "Warning", "Blocked"].map((f) => <option key={f}>{f}</option>)}
          </select>
        </label>
      }>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[11px]">
          <caption className="sr-only">Recent Cognitive Intake activity</caption>
          <thead className="bg-slate-50">
            <tr>
              {["Timestamp", "Action", "Intake", "Team", "Result", "Owner", "Audit ID", ""].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap border-b border-slate-200 px-2 py-1 text-left font-semibold text-slate-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="whitespace-nowrap px-2 py-1 tabular-nums text-slate-600">{r.timestamp}</td>
                <td className="whitespace-nowrap px-2 py-1 font-medium text-slate-800">{r.action}</td>
                <td className="whitespace-nowrap px-2 py-1 text-slate-600">{r.intakeId}</td>
                <td className="px-2 py-1 text-slate-600">{r.teamId}</td>
                <td className="px-2 py-1"><Pill label={r.result} tone={r.result === "Success" ? "green" : r.result === "Warning" ? "amber" : "red"} /></td>
                <td className="px-2 py-1 text-slate-600">{r.owner}</td>
                <td className="whitespace-nowrap px-2 py-1 font-mono text-[10px] text-slate-500">{r.auditId}</td>
                <td className="px-2 py-1">
                  <Button size="sm" variant="ghost" className="h-6 text-[10.5px]" onClick={() => onOpen(r.intakeId)}>Open</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mt-2 space-y-0.5">
        {visible.slice(0, 3).map((r) => (
          <li key={`d-${r.id}`} className="text-[11px] text-slate-600">{r.timestamp} — {r.description}</li>
        ))}
      </ul>
    </Panel>
  );
}

/* ------------------------------------------------------- package history --- */

export function PackageHistoryPanel({
  versions, onView, onCompare, onRestore,
}: {
  versions: CognitiveIntakePackageVersion[];
  onView: (v: CognitiveIntakePackageVersion) => void;
  onCompare: (a: CognitiveIntakePackageVersion, b: CognitiveIntakePackageVersion) => void;
  onRestore: (v: CognitiveIntakePackageVersion) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id].slice(-2));

  return (
    <Panel id="panel-package-history" title="Intake Package History"
      subtitle="Every package version is preserved. Historical versions are never overwritten."
      actions={
        <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled={selected.length !== 2}
          onClick={() => {
            const a = versions.find((v) => v.id === selected[0]);
            const b = versions.find((v) => v.id === selected[1]);
            if (a && b) onCompare(a, b);
          }}>Compare Selected</Button>
      }>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[11px]">
          <caption className="sr-only">Intake Package version history</caption>
          <thead className="bg-slate-50">
            <tr>
              {["", "Version", "Timestamp", "Context Records", "Personas", "Conditions", "Evidence Coverage", "Open Gaps", "Completeness", "Changed By", "Reason", "Actions"].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap border-b border-slate-200 px-2 py-1 text-left font-semibold text-slate-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {versions.map((v) => (
              <tr key={v.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-2 py-1">
                  <input type="checkbox" checked={selected.includes(v.id)} onChange={() => toggle(v.id)}
                    aria-label={`Select package version ${v.version} for comparison`} />
                </td>
                <td className="whitespace-nowrap px-2 py-1 font-medium text-slate-800">Package v{v.version}</td>
                <td className="whitespace-nowrap px-2 py-1 text-slate-600">{v.createdAt}</td>
                <td className="px-2 py-1 tabular-nums text-slate-700">{v.contextRecordIds.length}</td>
                <td className="px-2 py-1 tabular-nums text-slate-700">{v.personaCandidateIds.length}</td>
                <td className="px-2 py-1 tabular-nums text-slate-700">{v.conditionIds.length}</td>
                <td className="px-2 py-1 tabular-nums text-slate-700">{Math.max(0, 100 - v.missingEvidence.length * 20)}%</td>
                <td className="px-2 py-1 tabular-nums text-slate-700">{v.openQuestions.length}</td>
                <td className="px-2 py-1 tabular-nums font-medium text-slate-800">{v.packageCompleteness}%</td>
                <td className="whitespace-nowrap px-2 py-1 text-slate-600">{v.createdBy}</td>
                <td className="px-2 py-1 text-slate-600">{v.changeReason}</td>
                <td className="whitespace-nowrap px-2 py-1">
                  <Button size="sm" variant="ghost" className="h-6 text-[10.5px]" onClick={() => onView(v)}>View</Button>
                  <Button size="sm" variant="ghost" className="h-6 text-[10.5px]" onClick={() => onRestore(v)}>Restore as Draft</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------ rule activations --- */

export function RuleActivationPanel({
  activations, onOpenWorkbench,
}: {
  activations: CognitiveIntakeRuleActivation[];
  onOpenWorkbench: () => void;
}) {
  return (
    <Panel id="panel-rules" title="Enterprise Rule Activation"
      subtitle="Governed rules that became applicable because the proposal changed. Intake surfaces requirements; it does not approve them."
      actions={<Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onOpenWorkbench}>Open Workbench</Button>}>
      {activations.length === 0 ? (
        <p className="py-4 text-center text-[12px] text-slate-500">No enterprise rules are currently activated by the proposed change.</p>
      ) : (
        <ul className="space-y-1.5">
          {activations.map((a) => (
            <li key={a.id} className="rounded-lg border border-amber-200 bg-amber-50/50 p-2">
              <div className="flex flex-wrap items-start justify-between gap-1.5">
                <div>
                  <p className="text-[11.5px] font-semibold text-slate-800">{a.ruleType} · {a.status}</p>
                  <p className="text-[11px] text-slate-700">{a.governanceRequirement}</p>
                  <p className="text-[10.5px] text-slate-500">
                    {a.triggerField}: {a.previousValue} → {a.currentValue}
                    {a.conditionId ? ` · ${a.conditionId}` : ""} · {a.activatedAt}
                  </p>
                </div>
                <Pill label={a.status} tone={a.status === "Active" ? "amber" : a.status === "Resolved" ? "green" : "slate"} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------- quality detail ---- */

export function QualityDetailPanel({ recalcSignal }: { recalcSignal: number }) {
  const [dimension, setDimension] = useState("scope");
  const dim = decompositionQuality.dimensions.find((d) => d.id === dimension) ?? decompositionQuality.dimensions[3];
  const detail = qualityDetail[dimension] ?? qualityDetail.scope;
  const tone: Tone = dim.current >= dim.target ? "green" : "amber";

  return (
    <Panel id="panel-quality-detail" title="Change Decomposition Quality Detail"
      subtitle={`Recalculated on scope change, owner assignment, entity resolution, evidence addition, clarification, and context refresh · revision ${recalcSignal}`}
      actions={
        <label className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-500">
          Metric
          <select value={dimension} onChange={(e) => setDimension(e.target.value)} aria-label="Select quality metric"
            className="h-7 rounded-md border border-slate-200 px-1.5 text-[11px] text-slate-700">
            {Object.keys(qualityDetail).map((k) => (
              <option key={k} value={k}>{decompositionQuality.dimensions.find((d) => d.id === k)?.name ?? k}</option>
            ))}
          </select>
        </label>
      }>
      <div className="grid gap-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <p className="text-[11.5px] text-slate-700">{detail.definition}</p>
          <dl>
            <Row label="Current Score" value={<span className="tabular-nums">{dim.current}%</span>} />
            <Row label="Target" value={<span className="tabular-nums">{dim.target}%</span>} />
            <Row label="Trend" value={<Pill label={dim.trend} tone={tone} />} />
            <Row label="Affected Intakes" value={detail.affectedIntakes.join(", ")} />
          </dl>
          <Progress value={dim.current} className="h-1.5" aria-label={`${dim.name} score ${dim.current} percent`} />
        </div>
        <div className="space-y-1.5">
          <Distribution title="Work Type Distribution" items={detail.workTypeDistribution} />
          <Distribution title="Team Distribution" items={detail.teamDistribution} />
        </div>
        <div className="space-y-1.5">
          <Bullets title="Failure Causes" items={detail.failureCauses} />
          <Bullets title="Affected Package Sections" items={detail.affectedSections} />
          <Bullets title="Recommended Actions" items={detail.recommendedActions} />
          <Bullets title="Recent Changes" items={detail.recentChanges} />
        </div>
      </div>
    </Panel>
  );
}

function Distribution({ title, items }: { title: string; items: { label: string; value: number }[] }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <ul className="mt-1 space-y-1">
        {items.map((i) => (
          <li key={i.label} className="flex items-center gap-2">
            <span className="w-40 shrink-0 truncate text-[11px] text-slate-600">{i.label}</span>
            <Progress value={i.value} className="h-1.5 flex-1" aria-label={`${i.label} ${i.value} percent`} />
            <span className="w-8 text-right text-[10.5px] tabular-nums text-slate-700">{i.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Bullets({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <ul className="mt-0.5 list-disc pl-4">
        {items.map((i) => <li key={i} className="text-[11px] text-slate-700">{i}</li>)}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------ demo story --- */

export function DemoStoryOverlay({
  step, total, onNext, onPrev, onExit, reducedMotion, onToggleMotion,
}: {
  step: StoryStep;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
  reducedMotion: boolean;
  onToggleMotion: () => void;
}) {
  const [notes, setNotes] = useState(true);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-3"
      role="region" aria-label="Cognitive Intake demo story">
      <div className="pointer-events-auto w-full max-w-3xl rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-100 shadow-2xl">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-300">
              Demo Story · Step {step.id} of {total} · {step.title}
            </p>
            <p className="mt-0.5 text-[13px] leading-relaxed">{step.caption}</p>
          </div>
          <Button size="sm" variant="ghost" className="h-7 text-slate-200 hover:bg-slate-800" onClick={onExit} aria-label="Exit demo story">
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        {notes && <p className="mt-1.5 rounded bg-slate-800 p-1.5 text-[11px] text-slate-300">Presenter notes: {step.notes}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Progress value={(step.id / total) * 100} className="h-1.5 flex-1" aria-label={`Story progress step ${step.id} of ${total}`} />
          <Button size="sm" variant="outline" className="h-7 border-slate-600 bg-transparent text-[11px] text-slate-100 hover:bg-slate-800"
            onClick={onPrev} disabled={step.id === 1}>
            <ChevronLeft className="mr-1 h-3.5 w-3.5" aria-hidden /> Previous
          </Button>
          <Button size="sm" className="h-7 text-[11px]" onClick={onNext} disabled={step.id === total}>
            Next <ChevronRight className="ml-1 h-3.5 w-3.5" aria-hidden />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-[11px] text-slate-200 hover:bg-slate-800" onClick={() => setNotes(!notes)}>
            {notes ? "Hide" : "Show"} Presenter Notes
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-[11px] text-slate-200 hover:bg-slate-800" onClick={onToggleMotion}
            aria-pressed={reducedMotion}>
            Reduced Motion {reducedMotion ? "On" : "Off"}
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-[11px] text-slate-200 hover:bg-slate-800" onClick={onExit}>Exit Story</Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------- operational state */

export function OperationalStatePanel({
  state, clarifications, evidenceRequests, refreshProgress, blockingReason, routing, onSubmitWork, onRoute,
}: {
  state: string;
  clarifications: { id: string; question: string; assignedTo: string; status: string }[];
  evidenceRequests: { id: string; evidenceType: string; requestedFrom: string; status: string }[];
  refreshProgress: number;
  blockingReason: string | null;
  routing: { readinessAssessmentId: string; routedAt: string } | null;
  onSubmitWork: () => void;
  onRoute: () => void;
}) {
  return (
    <Panel id="panel-operational-state" title="Operational State"
      subtitle="Current intake posture and the action the state requires">
      <div className="flex flex-wrap items-center gap-1.5">
        <Pill label={state} tone={intakeTone(state)} />
        <span className="text-[11px] text-slate-600">
          {state === "Package Complete" ? "Structurally complete — routing available."
            : state === "Blocked" ? "Blocked — resolve the blocking condition before continuing."
              : state === "Routed to Readiness" ? "Handed to Cognitive Readiness Assessment."
                : "Intake in progress."}
        </span>
      </div>

      {state === "Loading" && (
        <div className="mt-2 space-y-1.5">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
      )}

      {state === "Empty" && (
        <div className="mt-2 rounded-lg border border-dashed border-slate-300 p-4 text-center">
          <p className="text-[12px] text-slate-600">No incoming work matches the current scope.</p>
          <Button size="sm" className="mt-2 h-7 text-[11px]" onClick={onSubmitWork}>Submit Work</Button>
        </div>
      )}

      {state === "Error" && (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-[11.5px] text-red-700" role="alert">
          Enterprise context retrieval failed. Retry the intake job or refresh enterprise context.
        </p>
      )}

      {state === "Needs Clarification" && (
        <ul className="mt-2 space-y-1">
          {clarifications.length === 0 && <li className="text-[11px] text-slate-500">No clarification tasks outstanding.</li>}
          {clarifications.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2 rounded border border-amber-200 bg-amber-50/50 p-1.5">
              <span className="text-[11px] text-slate-700">{c.question}</span>
              <span className="text-[10.5px] text-slate-600">{c.assignedTo} · {c.status}</span>
            </li>
          ))}
        </ul>
      )}

      {state === "Awaiting Evidence" && (
        <ul className="mt-2 space-y-1">
          {evidenceRequests.length === 0 && <li className="text-[11px] text-slate-500">No outstanding evidence requests.</li>}
          {evidenceRequests.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-2 rounded border border-amber-200 bg-amber-50/50 p-1.5">
              <span className="text-[11px] text-slate-700">{e.evidenceType}</span>
              <span className="text-[10.5px] text-slate-600">{e.requestedFrom} · {e.status}</span>
            </li>
          ))}
        </ul>
      )}

      {state === "Context Refreshing" && (
        <div className="mt-2">
          <Progress value={refreshProgress} className="h-1.5" aria-label={`Context refresh ${refreshProgress} percent complete`} />
          <p className="mt-1 text-[11px] text-slate-600">Enterprise Cognitive Memory refresh {refreshProgress}% complete.</p>
        </div>
      )}

      {state === "Package Complete" && (
        <Button size="sm" className="mt-2 h-7 text-[11px]" onClick={onRoute}>Proceed to Cognitive Readiness Assessment</Button>
      )}

      {state === "Blocked" && (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-[11.5px] text-red-700" role="alert">
          {blockingReason ?? "A blocking condition prevents this intake from progressing."}
        </p>
      )}

      {state === "Routed to Readiness" && routing && (
        <p className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-[11.5px] text-emerald-800">
          Routed at {routing.routedAt}. Readiness Assessment reference {routing.readinessAssessmentId}.
        </p>
      )}
    </Panel>
  );
}
