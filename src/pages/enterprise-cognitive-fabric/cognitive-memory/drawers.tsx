/** Enterprise Cognitive Memory — record and indexing detail drawers. */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Drawer, Pill, Row } from "../persona-studio/primitives";
import { memTone } from "./panels";
import { indexingFailures, type MemoryIndexingJob, type MemoryRecord } from "./data";

const recordTabs = ["Overview", "Structured Record", "Evidence", "Relationships", "Ownership", "Access", "Consumers", "Versions", "Decisions", "Outcomes", "History"] as const;

function List({ label, items }: { label: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="border-b border-slate-100 py-1 last:border-0">
      <p className="text-[11px] text-slate-500">{label}</p>
      <ul className="mt-0.5 list-disc pl-4 text-[11.5px] text-slate-800">
        {items.map((i) => <li key={i}>{i}</li>)}
      </ul>
    </div>
  );
}

export function RecordDrawer({ open, onOpenChange, record, initialTab, onOpenWorkbench, onOpenGraph, onExport, onNavigate }: {
  open: boolean; onOpenChange: (v: boolean) => void; record: MemoryRecord | null;
  initialTab?: string;
  onOpenWorkbench: () => void; onOpenGraph: () => void; onExport: (r: MemoryRecord) => void;
  onNavigate: (target: "persona" | "decision" | "outcome") => void;
}) {
  const [tab, setTab] = useState<string>(initialTab ?? "Overview");
  if (!record) return null;
  const s = record.structured;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} wide title={record.title}
      description={`${record.id} · ${record.recordType} · quality ${record.qualityScore} · ${record.authorityLevel} · ${record.approvalState} · ${record.confidence}% confidence · ${record.freshnessStatus}`}>
      <div className="flex flex-wrap gap-1" role="tablist" aria-label="Memory record tabs">
        {recordTabs.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)}
            className={cn("rounded px-2 py-1 text-[10.5px]", tab === t ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{t}</button>
        ))}
      </div>

      <div className="mt-2">
        {tab === "Overview" && (
          <dl>
            <Row label="Description" value={record.description} />
            <Row label="Memory Type" value={record.recordType} />
            <Row label="Memory Layer" value={record.memoryLayer} />
            <Row label="Domain" value={record.knowledgeDomains.join(", ")} />
            <Row label="Business Purpose" value={record.businessPurpose} />
            <Row label="Status" value={<Pill label={record.reviewState} tone={memTone(record.reviewState)} />} />
            <Row label="Authority" value={<Pill label={record.authorityLevel} tone={memTone(record.authorityLevel)} />} />
            <Row label="Approval" value={<Pill label={record.approvalState} tone={memTone(record.approvalState)} />} />
            <Row label="Quality" value={`${record.qualityScore} / 100`} />
            <Row label="Confidence" value={`${record.confidence}%`} />
            <Row label="Freshness" value={<Pill label={record.freshnessStatus} tone={memTone(record.freshnessStatus)} />} />
          </dl>
        )}

        {tab === "Structured Record" && (
          <div>
            {s?.condition && (
              <dl>
                <Row label="Subject" value={s.condition.subject} />
                <Row label="Operator" value={s.condition.operator} />
                <Row label="Value" value={s.condition.value} />
                <Row label="Unit" value={s.condition.unit} />
                <Row label="Baseline" value={s.condition.baseline} />
                <Row label="Target" value={s.condition.target} />
                <Row label="Threshold" value={s.condition.threshold} />
                <Row label="Effective Date" value={s.condition.effectiveDate} />
                <Row label="Owner" value={record.owner} />
                <List label="Teams" items={s.condition.teams} />
                <List label="Systems" items={s.condition.systems} />
                <List label="Dependencies" items={s.condition.dependencies} />
                <List label="Risks" items={s.condition.risks} />
                <List label="Controls" items={s.condition.controls} />
              </dl>
            )}
            {s?.persona && (
              <dl>
                <Row label="Mission" value={s.persona.mission} />
                <List label="Capabilities" items={s.persona.capabilities} />
                <List label="Products" items={s.persona.products} />
                <List label="Services" items={s.persona.services} />
                <List label="Customers" items={s.persona.customers} />
                <List label="Objectives" items={s.persona.objectives} />
                <List label="Metrics" items={s.persona.metrics} />
                <List label="Constraints" items={s.persona.constraints} />
                <List label="Dependencies" items={s.persona.dependencies} />
                <List label="Risks" items={s.persona.risks} />
                <List label="Decision Logic" items={s.persona.decisionLogic} />
                <List label="How This Team Thinks" items={s.persona.howThisTeamThinks} />
              </dl>
            )}
            {s?.decision && (
              <dl>
                <Row label="Decision Statement" value={s.decision.decisionStatement} />
                <List label="Alternatives" items={s.decision.alternatives} />
                <Row label="Selected Option" value={s.decision.selectedOption} />
                <List label="Expected Outcomes" items={s.decision.expectedOutcomes} />
                <List label="Approvers" items={s.decision.approvers} />
                <List label="Affected Personas" items={s.decision.affectedPersonas} />
                <List label="Conditions" items={s.decision.conditions} />
                <List label="Evidence" items={s.decision.evidence} />
              </dl>
            )}
            {s?.outcome && (
              <dl>
                <Row label="Expected Result" value={s.outcome.expectedResult} />
                <Row label="Observed Result" value={s.outcome.observedResult} />
                <Row label="Variance" value={s.outcome.variance} />
                <Row label="Customer Impact" value={s.outcome.customerImpact} />
                <Row label="Operational Impact" value={s.outcome.operationalImpact} />
                <List label="Lessons" items={s.outcome.lessons} />
              </dl>
            )}
            {s?.learning && (
              <dl>
                <Row label="Observed Outcome" value={s.learning.observedOutcome} />
                <Row label="Validated Lesson" value={s.learning.validatedLesson} />
                <List label="Conditions Updated" items={s.learning.conditionsUpdated} />
                <List label="Controls Updated" items={s.learning.controlsUpdated} />
                <List label="Persona Sections Updated" items={s.learning.personaSectionsUpdated} />
                <List label="Confidence Changes" items={s.learning.confidenceChanges} />
              </dl>
            )}
            {s?.entity && (
              <dl>{Object.entries(s.entity).map(([k, v]) => <Row key={k} label={k} value={v} />)}</dl>
            )}
            {!s && (
              <dl>
                <Row label="Record Type" value={record.recordType} />
                <Row label="Canonical Layer" value={record.memoryLayer} />
                <Row label="Source Records" value={record.sourceRecordIds.join(", ") || "—"} />
                <Row label="Structured detail" value="This record type carries layer native structure rather than a typed statement." />
              </dl>
            )}
          </div>
        )}

        {tab === "Evidence" && (
          <ul className="space-y-1.5">
            {record.evidence.map((e) => (
              <li key={e.id} className="rounded-lg border border-slate-200 p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11.5px] font-semibold text-slate-900">{e.id} — {e.sourceArtifact}</span>
                  <Pill label={e.authority} tone={memTone(e.authority)} />
                </div>
                <blockquote className="mt-1 border-l-2 border-blue-300 pl-2 text-[11px] italic text-slate-700">“{e.passage}”</blockquote>
                <p className="mt-1 text-[10px] text-slate-500">Confidence {e.confidence}% · {e.hash} · captured {e.capturedAt} · {e.permissions}</p>
              </li>
            ))}
          </ul>
        )}

        {tab === "Relationships" && (
          <dl>
            <Row label="Total relationships" value={record.relationshipCount} />
            <List label="Teams" items={record.teamIds} />
            <List label="Services" items={record.serviceIds} />
            <List label="Systems" items={record.systemIds} />
            <List label="Products" items={record.productIds} />
            <List label="Customer Journeys" items={record.customerJourneyIds} />
            <List label="Source Records" items={record.sourceRecordIds} />
            <Row label="Conditions, Personas, Decisions, Outcomes" value="Traversable in the Enterprise Context Graph" />
            <Button size="sm" variant="outline" className="mt-1.5 h-7 text-[11px]" onClick={onOpenGraph}>Open Context Graph</Button>
          </dl>
        )}

        {tab === "Ownership" && (
          <dl>
            <Row label="Record Owner" value={record.owner} />
            <Row label="Business Owner" value={record.businessOwner} />
            <Row label="Technical Owner" value={record.technicalOwner} />
            <Row label="Data Steward" value={record.dataSteward} />
            <Row label="Security Owner" value={record.securityOwner} />
          </dl>
        )}

        {tab === "Access" && (
          <dl>
            <Row label="Classification" value={<Pill label={record.accessClassification} tone={record.accessClassification === "Restricted" ? "red" : "slate"} />} />
            <List label="Approved Consumers" items={record.approvedConsumers} />
            <List label="Restricted Consumers" items={record.restrictedConsumers} />
            <Row label="Regulatory Scope" value={record.regulatoryScope} />
            <Row label="Data Residency" value={record.dataResidency} />
            <Row label="Access simulation" value="Available in Prompt 2" />
          </dl>
        )}

        {tab === "Consumers" && (
          <dl>
            <List label="Applications" items={["Cognitive Intake", "Decision Intelligence"]} />
            <List label="Agents" items={["Impact Evaluation Agent", "Readiness Assessment Agent"]} />
            <List label="Impact Evaluations" items={["EVAL 2048"]} />
            <List label="Decisions" items={["DEC 4812"]} />
            <List label="Search Services" items={["Enterprise Semantic Search"]} />
            <Row label="MCP Services" value="Placeholder — delivered in Prompt 2" />
            <Row label="Reuse count" value={record.reuseCount} />
          </dl>
        )}

        {tab === "Versions" && (
          <ul className="space-y-1">
            {record.versions.map((v) => (
              <li key={v.version} className="rounded border border-slate-200 px-1.5 py-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-semibold text-slate-900">{v.version}</span>
                  <Pill label={v.state} tone={memTone(v.state)} />
                </div>
                <p className="text-[10.5px] text-slate-600">{v.effectivePeriod} — {v.summary}</p>
              </li>
            ))}
          </ul>
        )}

        {tab === "Decisions" && (
          <dl>
            <Row label="Linked decisions" value="DEC 4812 — Approve limited retry increase" />
            <Row label="Decision date" value="2026-04-03" />
            <Row label="Decision status" value={<Pill label="Approved with Conditions" tone="amber" />} />
            <Button size="sm" variant="outline" className="mt-1.5 h-7 text-[11px]" onClick={() => onNavigate("decision")}>Open Related Decision</Button>
          </dl>
        )}

        {tab === "Outcomes" && (
          <dl>
            <Row label="Linked outcomes" value="OUT 3284 — Checkout completion improved 1.8%" />
            <Row label="Variance" value="+0.3% completion; duplicate authorization variance unfavourable" />
            <Button size="sm" variant="outline" className="mt-1.5 h-7 text-[11px]" onClick={() => onNavigate("outcome")}>Open Related Outcome</Button>
          </dl>
        )}

        {tab === "History" && (
          <dl>
            <Row label="Created" value={record.createdAt} />
            <Row label="Updated" value={record.updatedAt} />
            <Row label="Published" value={record.publishedAt} />
            <Row label="Last source update" value={record.lastSourceUpdate} />
            <Row label="Effective date" value={record.effectiveDate} />
            <Row label="Expiration date" value={record.expirationDate ?? "—"} />
            <Row label="Index status" value={<Pill label={record.indexStatus} tone={memTone(record.indexStatus)} />} />
          </dl>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-2">
        <Button size="sm" className="h-7 text-[11px]" onClick={onOpenWorkbench}>Open in Memory Workbench</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setTab("Evidence")}>Open Evidence</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onOpenGraph}>Open Context Graph</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onNavigate("persona")}>Open Related Persona</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onExport(record)}>Export Record</Button>
      </div>
      <p className="mt-1 text-[10px] text-slate-400">
        Curation, merge, supersession, retention, legal hold, and publishing actions are delivered in Prompt 2.
      </p>
    </Drawer>
  );
}

const jobTabs = ["Summary", "Queue", "Failures", "Coverage", "Outputs", "Dependencies", "Logs"] as const;

export function IndexingDrawer({ open, onOpenChange, job, paused, onPause, onResume, onRetry, onReindex, onOpenExplorer, onViewLogs }: {
  open: boolean; onOpenChange: (v: boolean) => void; job: MemoryIndexingJob | null; paused: boolean;
  onPause: () => void; onResume: () => void; onRetry: () => void; onReindex: () => void;
  onOpenExplorer: () => void; onViewLogs: () => void;
}) {
  const [tab, setTab] = useState<string>("Summary");
  if (!job) return null;
  const failures = indexingFailures.filter((f) => f.jobId === job.id);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} wide title={`${job.id} — ${job.memoryLayer}`}
      description={`${job.scope} · ${paused ? "Paused" : job.status} · coverage ${job.coverage}%`}>
      <div className="flex flex-wrap gap-1" role="tablist" aria-label="Indexing job tabs">
        {jobTabs.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)}
            className={cn("rounded px-2 py-1 text-[10.5px]", tab === t ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{t}</button>
        ))}
      </div>

      <div className="mt-2">
        {tab === "Summary" && (
          <dl>
            <Row label="Layer" value={job.memoryLayer} />
            <Row label="Scope" value={job.scope} />
            <Row label="Status" value={<Pill label={paused ? "Paused" : job.status} tone={memTone(paused ? "Paused" : job.status)} />} />
            <Row label="Records" value={job.recordCount.toLocaleString()} />
            <Row label="Indexed" value={job.indexedCount.toLocaleString()} />
            <Row label="Pending" value={job.pendingCount.toLocaleString()} />
            <Row label="Failed" value={job.failedCount} />
            <Row label="Coverage" value={`${job.coverage}%`} />
            <Row label="Throughput" value={job.throughput} />
            <Row label="Average Duration" value={job.averageDuration} />
            <Row label="P95 Duration" value={job.p95Duration} />
            <Row label="Owner" value={job.owner} />
            <Row label="Configuration Version" value={job.configurationVersion} />
          </dl>
        )}
        {tab === "Queue" && (
          <table className="w-full text-left text-[11px]">
            <thead className="text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="py-1">Batch</th><th>Records</th><th>Status</th></tr></thead>
            <tbody>
              {[1, 2, 3, 4].map((i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="py-1">BATCH {job.id.split(" ")[1]}-{i}</td>
                  <td>{Math.round(job.pendingCount / 4).toLocaleString()}</td>
                  <td><Pill label={i === 2 && job.status === "Warning" ? "Warning" : "Running"} tone={memTone(i === 2 && job.status === "Warning" ? "Warning" : "Running")} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "Failures" && (
          failures.length ? (
            <table className="w-full text-left text-[11px]">
              <thead className="text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="py-1">Record</th><th>Reason</th><th>Severity</th><th>Retryable</th></tr></thead>
              <tbody>
                {failures.map((f) => (
                  <tr key={f.id} className="border-t border-slate-100">
                    <td className="py-1">{f.record}</td><td>{f.reason}</td>
                    <td><Pill label={f.severity} tone={memTone(f.severity)} /></td>
                    <td>{f.retryable ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="text-[11px] text-slate-500">No failures recorded for this job.</p>
        )}
        {tab === "Coverage" && (
          <dl>
            <Row label="Coverage" value={`${job.coverage}%`} />
            <Row label="Indexed share" value={`${Math.round((job.indexedCount / job.recordCount) * 100)}%`} />
            <Row label="Pending share" value={`${Math.round((job.pendingCount / job.recordCount) * 100)}%`} />
            <Row label="Target coverage" value="96%" />
          </dl>
        )}
        {tab === "Outputs" && (
          <dl>
            <Row label="Semantic Records" value={job.indexedCount.toLocaleString()} />
            <Row label="Graph Relationships" value={Math.round(job.indexedCount * 1.4).toLocaleString()} />
            <Row label="Search Facets" value="Memory type, domain, owner, freshness, authority" />
            <Row label="Access Filters" value="Classification and data residency" />
            <Row label="Evidence Links" value={Math.round(job.indexedCount * 0.8).toLocaleString()} />
          </dl>
        )}
        {tab === "Dependencies" && (
          <dl>
            <Row label="Upstream" value="Validate Quality & Freshness stage" />
            <Row label="Downstream" value="Publish Memory Services, Search Services" />
            <Row label="Blocking" value={job.status === "Warning" ? "Speaker attribution service" : "None"} />
          </dl>
        )}
        {tab === "Logs" && (
          <pre className="max-h-[240px] overflow-auto rounded bg-slate-900 p-2 text-[10px] text-slate-100">
{`${job.startedAt}  job ${job.id} started scope=${job.scope}
${job.startedAt}  layer=${job.memoryLayer} config=${job.configurationVersion}
+00:14:02  indexed=${Math.round(job.indexedCount * 0.4).toLocaleString()} throughput=${job.throughput}
+00:52:11  access filters applied classification=record-level
${job.status === "Warning" ? "+01:22:40  WARN speaker attribution incomplete for 412 records" : "+01:22:40  INFO coverage on target"}
+${job.elapsedTime}  indexed=${job.indexedCount.toLocaleString()} pending=${job.pendingCount.toLocaleString()} coverage=${job.coverage}%`}
          </pre>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-2">
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={paused ? onResume : onPause}>{paused ? "Resume" : "Pause"}</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onRetry}>Retry</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onReindex}>Reindex</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onOpenExplorer}>Open Memory Explorer</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onViewLogs}>View Logs</Button>
      </div>
    </Drawer>
  );
}

export function QualityDrawer({ open, onOpenChange, dimensionKey }: {
  open: boolean; onOpenChange: (v: boolean) => void; dimensionKey: string | null;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="Memory Quality Detail"
      description="Dimension level detail for the composite memory trust score">
      {dimensionKey ? (
        <dl>
          <Row label="Dimension" value={dimensionKey} />
          <Row label="Scoring" value="Deterministic composite of record level checks across the filtered memory population." />
          <Row label="Remediation" value="Curation, refresh, and drift workflows are delivered in Prompt 2." />
        </dl>
      ) : <p className="text-[11px] text-slate-500">Select a quality dimension.</p>}
    </Drawer>
  );
}
