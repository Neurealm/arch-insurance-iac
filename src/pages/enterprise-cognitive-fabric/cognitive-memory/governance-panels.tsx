/**
 * Enterprise Cognitive Memory — Prompt 2 governance, access, publishing,
 * usage and learning panels. Presentation only; all state is owned by the page.
 */

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pill, Row, FilterSelect, type Tone } from "../persona-studio/primitives";
import { Panel, EmptyState, PanelSkeleton } from "./panels";
import {
  governanceMetrics, governanceDimensions, governanceReviews, governanceQueueFilters,
  governanceActions, conflictSummary, memoryConflicts, driftSummary, memoryDrifts, driftActions,
  retentionMetrics, retentionRows, legalHolds, retentionActions, accessSummary, accessMatrix,
  accessConflictSeed, accessPolicies, publishDestinations, memoryServices, usageMetrics,
  topReusedRecords, learningFlowStages, learningLoop, memoryActivities, qualityDetail,
  qualityRecalculationTriggers, operationalStateExplanations,
  type MemoryGovernanceReview, type MemoryConflict, type MemoryDrift, type GovernanceDimension,
  type RetentionRow, type PublishDestination, type MemoryService, type MemoryActivity,
} from "./governance-data";

const tone = (s: string): Tone => {
  if (["Healthy", "Validated", "Resolved", "Active", "Operational", "Success", "Current", "Allowed", "Published", "Accepted"].includes(s)) return "green";
  if (["Warning", "Review Required", "Pending", "Publishing", "Under Review", "In Review", "Acknowledged", "Aging", "Minor", "Archive Due", "Deletion Review", "Exception", "Medium", "Restricted", "Derived Only"].includes(s)) return "amber";
  if (["Critical", "Conflict", "Blocked", "Failed", "Denied", "High", "Escalated", "Material", "Legal Hold"].includes(s)) return "red";
  if (["Paused", "Low", "Dismissed", "Archived", "Nonmaterial"].includes(s)) return "slate";
  return "blue";
};

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th scope="col" className={cn("whitespace-nowrap px-2 py-1.5 text-left font-semibold text-slate-600", className)}>{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-2 py-1.5 align-top text-slate-700", className)}>{children}</td>;
}

export function MiniMetric({ label, value, detail, status, onClick, active }: {
  label: string; value: string; detail?: string; status?: string; onClick?: () => void; active?: boolean;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className={cn(
        "rounded-lg border bg-white p-2 text-left shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        active ? "border-blue-400 ring-1 ring-blue-200" : "border-slate-200",
        onClick && "hover:border-blue-300",
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-[16px] font-bold text-slate-900">{value}</p>
      {detail && <p className="text-[10.5px] text-slate-500">{detail}</p>}
      {status && <div className="mt-1"><Pill label={status} tone={tone(status)} /></div>}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* Governance overview                                                 */
/* ------------------------------------------------------------------ */

export function GovernanceOverviewPanel({ onDimension, activeDimension, loading }: {
  onDimension: (d: GovernanceDimension) => void;
  activeDimension: string | null;
  loading?: boolean;
}) {
  return (
    <Panel id="panel-governance" title="Memory Governance Overview"
      subtitle="Ownership, authority, evidence, access, freshness, retention, versioning, approval and linkage health">
      {loading ? <PanelSkeleton rows={5} /> : (
        <>
          <div className="grid gap-1.5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
            {governanceMetrics.map((m) => (
              <MiniMetric key={m.id} label={m.name} value={m.value} detail={m.detail} status={m.status} />
            ))}
          </div>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[880px] text-[11px]">
              <caption className="sr-only">Governance dimensions with score, target, affected records, trend, owner and status</caption>
              <thead className="bg-slate-50">
                <tr><Th>Dimension</Th><Th>Score</Th><Th>Target</Th><Th>Affected Records</Th><Th>Trend</Th><Th>Owner</Th><Th>Status</Th><Th>Action</Th></tr>
              </thead>
              <tbody>
                {governanceDimensions.map((d) => (
                  <tr key={d.id} className={cn("border-t border-slate-100", activeDimension === d.id && "bg-blue-50")}>
                    <Td className="font-medium text-slate-800">{d.name}</Td>
                    <Td>
                      <div className="flex items-center gap-1.5">
                        <span className={cn("font-semibold", d.score >= d.target ? "text-emerald-700" : "text-amber-700")}>{d.score.toFixed(1)}</span>
                        <span className="h-1.5 w-16 overflow-hidden rounded bg-slate-100" aria-hidden>
                          <span className={cn("block h-full", d.score >= d.target ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${d.score}%` }} />
                        </span>
                      </div>
                    </Td>
                    <Td>{d.target}</Td>
                    <Td>{d.affectedRecords}</Td>
                    <Td>{d.trend === "up" ? "▲ improving" : d.trend === "down" ? "▼ declining" : "▬ flat"}</Td>
                    <Td>{d.owner}</Td>
                    <Td><Pill label={d.status} tone={tone(d.status)} /></Td>
                    <Td>
                      <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onDimension(d)}>
                        Filter Queue
                      </Button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Governance queue                                                    */
/* ------------------------------------------------------------------ */

export interface QueueFilters {
  memoryType: string; issueType: string; severity: string; owner: string;
  authority: string; access: string; status: string; dueDate: string; downstreamImpact: string;
}

export const defaultQueueFilters: QueueFilters = {
  memoryType: "All", issueType: "All", severity: "All", owner: "All",
  authority: "All", access: "All", status: "All", dueDate: "All", downstreamImpact: "All",
};

export function GovernanceQueuePanel({
  reviews, filters, onFilters, search, onSearch, onAction, onOpen, loading,
}: {
  reviews: MemoryGovernanceReview[];
  filters: QueueFilters;
  onFilters: (f: QueueFilters) => void;
  search: string;
  onSearch: (v: string) => void;
  onAction: (a: string, r: MemoryGovernanceReview) => void;
  onOpen: (r: MemoryGovernanceReview) => void;
  loading?: boolean;
}) {
  const rows = useMemo(() => reviews.filter((r) => {
    const f = filters;
    if (f.memoryType !== "All" && r.memoryType !== f.memoryType) return false;
    if (f.issueType !== "All" && r.issueType !== f.issueType) return false;
    if (f.severity !== "All" && r.severity !== f.severity) return false;
    if (f.owner !== "All" && r.owner !== f.owner) return false;
    if (f.authority !== "All" && r.authority !== f.authority) return false;
    if (f.access !== "All" && r.accessClassification !== f.access) return false;
    if (f.status !== "All" && r.status !== f.status) return false;
    if (f.downstreamImpact !== "All" && r.downstreamImpact !== f.downstreamImpact) return false;
    if (search && !`${r.id} ${r.memoryRecord} ${r.issueType} ${r.owner}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [reviews, filters, search]);

  const set = (k: keyof QueueFilters, v: string) => onFilters({ ...filters, [k]: v });

  return (
    <Panel id="panel-governance-queue" title="Memory Governance Queue"
      subtitle={`${rows.length} of ${reviews.length} reviews`}>
      <div className="flex flex-wrap items-end gap-1.5">
        <label className="flex flex-col gap-0.5">
          <span className="text-[9.5px] font-medium uppercase tracking-wide text-slate-500">Search</span>
          <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search reviews"
            aria-label="Search governance queue"
            className="h-7 w-44 rounded-md border border-slate-200 px-2 text-[11px] focus:border-blue-400 focus:outline-none" />
        </label>
        <FilterSelect label="Memory Type" value={filters.memoryType} options={[...governanceQueueFilters.memoryType]} onChange={(v) => set("memoryType", v)} />
        <FilterSelect label="Issue Type" value={filters.issueType} options={[...governanceQueueFilters.issueType]} onChange={(v) => set("issueType", v)} />
        <FilterSelect label="Severity" value={filters.severity} options={[...governanceQueueFilters.severity]} onChange={(v) => set("severity", v)} />
        <FilterSelect label="Owner" value={filters.owner} options={[...governanceQueueFilters.owner]} onChange={(v) => set("owner", v)} />
        <FilterSelect label="Authority" value={filters.authority} options={[...governanceQueueFilters.authority]} onChange={(v) => set("authority", v)} />
        <FilterSelect label="Access" value={filters.access} options={[...governanceQueueFilters.access]} onChange={(v) => set("access", v)} />
        <FilterSelect label="Status" value={filters.status} options={[...governanceQueueFilters.status]} onChange={(v) => set("status", v)} />
        <FilterSelect label="Due Date" value={filters.dueDate} options={[...governanceQueueFilters.dueDate]} onChange={(v) => set("dueDate", v)} />
        <FilterSelect label="Downstream Impact" value={filters.downstreamImpact} options={[...governanceQueueFilters.downstreamImpact]} onChange={(v) => set("downstreamImpact", v)} />
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { onFilters(defaultQueueFilters); onSearch(""); }}>Clear</Button>
      </div>

      {loading ? <PanelSkeleton rows={5} /> : rows.length === 0 ? (
        <EmptyState message="No governance reviews match the current filters" hint="Clear filters to see the full queue" />
      ) : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[1400px] text-[11px]">
            <caption className="sr-only">Memory governance queue</caption>
            <thead className="bg-slate-50">
              <tr>
                <Th>Review ID</Th><Th>Memory Record</Th><Th>Memory Type</Th><Th>Issue Type</Th><Th>Severity</Th>
                <Th>Owner</Th><Th>Authority</Th><Th>Access Classification</Th><Th>Affected Consumers</Th>
                <Th>Downstream Impact</Th><Th>Age</Th><Th>Due</Th><Th>Recommended Action</Th><Th>Status</Th><Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <Td>
                    <button type="button" onClick={() => onOpen(r)}
                      className="font-medium text-blue-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                      {r.id}
                    </button>
                  </Td>
                  <Td className="font-medium text-slate-800">{r.memoryRecord}</Td>
                  <Td>{r.memoryType}</Td>
                  <Td>{r.issueType}</Td>
                  <Td><Pill label={r.severity} tone={tone(r.severity)} /></Td>
                  <Td>{r.owner}</Td>
                  <Td>{r.authority}</Td>
                  <Td>{r.accessClassification}</Td>
                  <Td>{r.affectedConsumers}</Td>
                  <Td><Pill label={r.downstreamImpact} tone={tone(r.downstreamImpact)} /></Td>
                  <Td>{r.age}</Td>
                  <Td>{r.dueDate}</Td>
                  <Td>{r.recommendedAction}</Td>
                  <Td><Pill label={r.status} tone={tone(r.status)} /></Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onOpen(r)}>Open</Button>
                      <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onAction(r.recommendedAction, r)}>
                        {r.recommendedAction}
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-1.5 text-[10.5px] text-slate-500">
        Available actions: {governanceActions.join(" · ")}
      </p>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Conflicts                                                           */
/* ------------------------------------------------------------------ */

export function ConflictsPanel({ conflicts, onOpen, onResolve, loading }: {
  conflicts: MemoryConflict[];
  onOpen: (c: MemoryConflict) => void;
  onResolve: (c: MemoryConflict, option: string) => void;
  loading?: boolean;
}) {
  return (
    <Panel id="panel-conflicts" title="Memory Conflicts &amp; Ambiguities"
      subtitle="Competing authority, values, effective dates, ownership, access, relationships and applicability">
      <div className="grid gap-1.5 sm:grid-cols-4 xl:grid-cols-8">
        {conflictSummary.map((s) => <MiniMetric key={s.label} label={s.label} value={s.value} />)}
      </div>
      {loading ? <PanelSkeleton rows={4} /> : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[1500px] text-[11px]">
            <caption className="sr-only">Memory conflicts</caption>
            <thead className="bg-slate-50">
              <tr>
                <Th>Record A</Th><Th>Record B</Th><Th>Conflict Type</Th><Th>Memory Type</Th>
                <Th>Authority A</Th><Th>Authority B</Th><Th>Confidence A</Th><Th>Confidence B</Th>
                <Th>Evidence Agreement</Th><Th>Affected Teams</Th><Th>Affected Personas</Th><Th>Affected Decisions</Th>
                <Th>Severity</Th><Th>Recommended Resolution</Th><Th>Status</Th><Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {conflicts.map((c) => (
                <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <Td className="font-medium text-slate-800">{c.recordATitle}<div className="text-[10px] text-slate-500">{c.recordAStatement}</div></Td>
                  <Td className="font-medium text-slate-800">{c.recordBTitle}<div className="text-[10px] text-slate-500">{c.recordBStatement}</div></Td>
                  <Td>{c.conflictType}</Td>
                  <Td>{c.memoryType}</Td>
                  <Td>{c.authorityA}</Td><Td>{c.authorityB}</Td>
                  <Td>{c.confidenceA}%</Td><Td>{c.confidenceB}%</Td>
                  <Td>{c.evidenceAgreement}</Td>
                  <Td>{c.affectedTeamIds.join(", ") || "—"}</Td>
                  <Td>{c.affectedPersonaIds.join(", ") || "—"}</Td>
                  <Td>{c.affectedDecisionIds.join(", ") || "—"}</Td>
                  <Td><Pill label={c.severity} tone={tone(c.severity)} /></Td>
                  <Td>{c.recommendedResolution}</Td>
                  <Td>
                    <Pill label={c.reviewStatus} tone={tone(c.reviewStatus)} />
                    {c.resolution && <div className="mt-0.5 text-[10px] text-emerald-700">{c.resolution}</div>}
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onOpen(c)}>Open Comparison</Button>
                      <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onResolve(c, c.recommendedResolution)}>Resolve</Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Drift                                                               */
/* ------------------------------------------------------------------ */

export function DriftPanel({ drifts, onAction, onOpen, loading }: {
  drifts: MemoryDrift[];
  onAction: (a: string, d: MemoryDrift) => void;
  onOpen: (d: MemoryDrift) => void;
  loading?: boolean;
}) {
  const [category, setCategory] = useState("All");
  const rows = drifts.filter((d) => category === "All" || d.driftType === category);

  return (
    <Panel id="panel-drift" title="Memory Drift &amp; Freshness"
      subtitle="Source, condition, ownership, authority, access, relationship, policy, metric, threshold and outcome drift"
      actions={
        <FilterSelect label="Drift Category" value={category}
          options={["All", ...new Set(drifts.map((d) => d.driftType))]} onChange={setCategory} />
      }>
      <div className="grid gap-1.5 sm:grid-cols-4 xl:grid-cols-7">
        {driftSummary.map((s) => <MiniMetric key={s.label} label={s.label} value={s.value} />)}
      </div>
      {loading ? <PanelSkeleton rows={4} /> : rows.length === 0 ? (
        <EmptyState message="No drift in this category" />
      ) : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[1400px] text-[11px]">
            <caption className="sr-only">Memory drift records</caption>
            <thead className="bg-slate-50">
              <tr>
                <Th>Memory Record</Th><Th>Drift Type</Th><Th>Previous Value</Th><Th>Current Value</Th><Th>Materiality</Th>
                <Th>Affected Relationships</Th><Th>Affected Personas</Th><Th>Affected Evaluations</Th><Th>Affected Decisions</Th>
                <Th>Detected</Th><Th>Owner</Th><Th>Status</Th><Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <Td className="font-medium text-slate-800">{d.memoryRecord}<div className="text-[10px] text-slate-500">{d.id}</div></Td>
                  <Td>{d.driftType}</Td>
                  <Td className="text-slate-500">{d.previousValue}</Td>
                  <Td className="font-medium text-slate-800">{d.currentValue}</Td>
                  <Td><Pill label={d.materiality} tone={tone(d.materiality)} /></Td>
                  <Td>{d.affectedRelationshipIds.length}</Td>
                  <Td>{d.affectedPersonaIds.join(", ") || "—"}</Td>
                  <Td>{d.affectedEvaluationIds.join(", ") || "—"}</Td>
                  <Td>{d.affectedDecisionIds.join(", ") || "—"}</Td>
                  <Td>{d.detectedAt}</Td>
                  <Td>{d.owner}</Td>
                  <Td><Pill label={d.status} tone={tone(d.status)} /></Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onOpen(d)}>Open Comparison</Button>
                      <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onAction(d.recommendedAction, d)}>{d.recommendedAction}</Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-1.5 text-[10.5px] text-slate-500">Drift actions: {driftActions.join(" · ")}</p>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Access & policy                                                     */
/* ------------------------------------------------------------------ */

export function AccessPanel({ onOpenPolicy, onOpenConflict }: {
  onOpenPolicy: (id: string) => void;
  onOpenConflict: () => void;
}) {
  return (
    <Panel id="panel-access" title="Memory Access &amp; Policy Enforcement"
      subtitle="Classification, inheritance, derived knowledge rules and regional restrictions">
      <div className="grid gap-1.5 sm:grid-cols-3 xl:grid-cols-6">
        {accessSummary.map((s) => <MiniMetric key={s.label} label={s.label} value={s.value} />)}
      </div>

      <div className="mt-2 grid gap-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-[11px]">
            <caption className="sr-only">Access matrix</caption>
            <thead className="bg-slate-50">
              <tr>
                <Th>Memory Type</Th><Th>Classification</Th><Th>Approved Consumer Type</Th><Th>Restricted Consumer Type</Th>
                <Th>Evidence Inheritance</Th><Th>Derived Knowledge Rule</Th><Th>Regional Restrictions</Th><Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {accessMatrix.map((r, i) => (
                <tr key={`${r.memoryType}-${r.classification}-${i}`} className="border-t border-slate-100">
                  <Td>{r.memoryType}</Td>
                  <Td><Pill label={r.classification} tone={r.classification === "Public" ? "green" : r.classification === "Internal" ? "blue" : r.classification === "Confidential" ? "amber" : "red"} /></Td>
                  <Td>{r.approvedConsumerType}</Td>
                  <Td>{r.restrictedConsumerType}</Td>
                  <Td>{r.evidenceInheritance}</Td>
                  <Td>{r.derivedKnowledgeRule}</Td>
                  <Td>{r.regionalRestrictions}</Td>
                  <Td><Pill label={r.status} tone={tone(r.status)} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-2">
          <div className="rounded-lg border border-red-200 bg-red-50 p-2">
            <p className="text-[11px] font-semibold text-red-800">Seeded access conflict</p>
            <p className="text-[11px] text-slate-700">{accessConflictSeed.record} · {accessConflictSeed.recordId}</p>
            <dl className="mt-1">
              <Row label="Approved" value={accessConflictSeed.approved.join(", ")} />
              <Row label="Requested by" value={accessConflictSeed.requestedBy} />
            </dl>
            <ul className="mt-1 list-disc pl-4 text-[10.5px] text-slate-700">
              {accessConflictSeed.results.map((r) => <li key={r}>{r}</li>)}
            </ul>
            <Button size="sm" variant="outline" className="mt-1.5 h-6 text-[10.5px]" onClick={onOpenConflict}>Open Access Conflict</Button>
          </div>

          <div className="rounded-lg border border-slate-200 p-2">
            <p className="text-[11px] font-semibold text-slate-800">Access policies</p>
            <ul className="mt-1 space-y-1">
              {accessPolicies.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2">
                  <button type="button" onClick={() => onOpenPolicy(p.id)}
                    className="text-left text-[11px] text-blue-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    {p.id} · {p.name}
                  </button>
                  <Pill label={p.status} tone={tone(p.status)} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Retention & legal hold                                              */
/* ------------------------------------------------------------------ */

export function RetentionPanel({ rows, onAction, loading }: {
  rows: RetentionRow[];
  onAction: (a: string, r: RetentionRow) => void;
  loading?: boolean;
}) {
  return (
    <Panel id="panel-retention" title="Retention &amp; Legal Hold"
      subtitle="Retention policies, archive eligibility, deletion review and legal holds. No seeded data is physically deleted.">
      <div className="grid gap-1.5 sm:grid-cols-3 xl:grid-cols-6">
        {retentionMetrics.map((m) => <MiniMetric key={m.label} label={m.label} value={m.value} />)}
      </div>
      {loading ? <PanelSkeleton rows={4} /> : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[1200px] text-[11px]">
            <caption className="sr-only">Retention records</caption>
            <thead className="bg-slate-50">
              <tr>
                <Th>Record</Th><Th>Memory Type</Th><Th>Retention Policy</Th><Th>Created</Th><Th>Effective Until</Th>
                <Th>Archive Date</Th><Th>Deletion Eligibility</Th><Th>Legal Hold</Th><Th>Owner</Th><Th>Status</Th><Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <Td className="font-medium text-slate-800">{r.record}<div className="text-[10px] text-slate-500">{r.recordId}</div></Td>
                  <Td>{r.memoryType}</Td><Td>{r.retentionPolicy}</Td><Td>{r.created}</Td><Td>{r.effectiveUntil}</Td>
                  <Td>{r.archiveDate}</Td><Td>{r.deletionEligibility}</Td>
                  <Td>{r.legalHold ? <Pill label="Legal Hold" tone="red" /> : "—"}</Td>
                  <Td>{r.owner}</Td>
                  <Td><Pill label={r.status} tone={tone(r.status)} /></Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="outline" className="h-6 text-[10.5px]" disabled={r.legalHold}
                        onClick={() => onAction("Archive", r)}>Archive</Button>
                      <Button size="sm" variant="outline" className="h-6 text-[10.5px]"
                        onClick={() => onAction(r.legalHold ? "Release Legal Hold" : "Place Legal Hold", r)}>
                        {r.legalHold ? "Release Hold" : "Place Hold"}
                      </Button>
                      <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onAction("Extend Retention", r)}>Extend</Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-2 rounded-lg border border-slate-200 p-2">
        <p className="text-[11px] font-semibold text-slate-800">Active legal holds</p>
        <ul className="mt-1 space-y-0.5 text-[11px] text-slate-700">
          {legalHolds.map((h) => (
            <li key={h.id}>
              <span className="font-medium">{h.id}</span> · {h.name} · {h.memoryRecordIds.length} records · {h.owner} · effective {h.effectiveDate}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-1.5 text-[10.5px] text-slate-500">Retention actions: {retentionActions.join(" · ")}</p>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Publishing                                                          */
/* ------------------------------------------------------------------ */

export function PublishingPanel({ destinations, onPublish, onRepublish, onPause, onHistory }: {
  destinations: PublishDestination[];
  onPublish: () => void;
  onRepublish: (d: PublishDestination) => void;
  onPause: (d: PublishDestination) => void;
  onHistory: (d: PublishDestination) => void;
}) {
  return (
    <Panel id="panel-publishing" title="Memory Publishing &amp; Services"
      subtitle="Approved memory published to governed consumers"
      actions={<Button size="sm" className="h-7 text-[11px]" onClick={onPublish}>Publish Approved Records</Button>}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-[11px]">
          <caption className="sr-only">Publishing destinations</caption>
          <thead className="bg-slate-50">
            <tr>
              <Th>Destination</Th><Th>Ready Records</Th><Th>Published</Th><Th>Pending</Th><Th>Blocked</Th>
              <Th>Last Published</Th><Th>Version</Th><Th>Access Validation</Th><Th>Status</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {destinations.map((d) => (
              <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50">
                <Td className="font-medium text-slate-800">{d.name}</Td>
                <Td>{d.readyRecords}</Td><Td>{d.published}</Td><Td>{d.pending}</Td>
                <Td className={d.blocked !== "0" ? "font-medium text-red-700" : ""}>{d.blocked}</Td>
                <Td>{d.lastPublished}</Td><Td>{d.version}</Td>
                <Td><Pill label={d.accessValidation} tone={tone(d.accessValidation)} /></Td>
                <Td><Pill label={d.status} tone={tone(d.status)} /></Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onRepublish(d)}>Republish</Button>
                    <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onPause(d)}>{d.status === "Paused" ? "Resume" : "Pause"}</Button>
                    <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onHistory(d)}>History</Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* MCP context services                                                */
/* ------------------------------------------------------------------ */

export function McpServicesPanel({ onOpen, onTest, onPolicy, onAudit }: {
  onOpen: (s: MemoryService) => void;
  onTest: (s: MemoryService) => void;
  onPolicy: (s: MemoryService) => void;
  onAudit: (s: MemoryService) => void;
}) {
  return (
    <Panel id="panel-mcp" title="MCP Context Services"
      subtitle="MCP is the governed access contract to Enterprise Cognitive Memory — not the storage engine, crawler, or normalization system">
      <div className="grid gap-1.5 md:grid-cols-2 xl:grid-cols-3">
        {memoryServices.map((s) => (
          <article key={s.id} className="rounded-lg border border-slate-200 bg-white p-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11.5px] font-semibold text-slate-900">{s.name}</p>
                <p className="text-[10px] text-slate-500">{s.id}</p>
              </div>
              <Pill label={s.status} tone={tone(s.status)} />
            </div>
            <p className="mt-1 text-[10.5px] text-slate-600">{s.description}</p>
            <dl className="mt-1">
              <Row label="Approved Memory Types" value={s.approvedMemoryTypes.join(", ")} />
              <Row label="Access Policy" value={s.accessPolicyId} />
              <Row label="Average Latency" value={s.averageLatency} />
              <Row label="Success Rate" value={s.successRate} />
              <Row label="Last Invocation" value={s.lastInvocation} />
            </dl>
            <div className="mt-1.5 flex flex-wrap gap-1">
              <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onOpen(s)}>Open Detail</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onTest(s)}>Test Synthetic Request</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onPolicy(s)}>Access Policy</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onAudit(s)}>Audit History</Button>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Usage & reuse                                                       */
/* ------------------------------------------------------------------ */

export function UsagePanel({ onOpenRecord }: { onOpenRecord: (id: string) => void }) {
  return (
    <Panel id="panel-usage" title="Memory Use &amp; Reuse" subtitle="How organizational memory is consumed across humans, services and agents">
      <div className="grid gap-1.5 sm:grid-cols-4 xl:grid-cols-7">
        {usageMetrics.map((m) => <MiniMetric key={m.label} label={m.label} value={m.value} detail={m.detail || undefined} />)}
      </div>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[860px] text-[11px]">
          <caption className="sr-only">Top reused memory records</caption>
          <thead className="bg-slate-50">
            <tr><Th>Record</Th><Th>Reuse Count</Th><Th>Consumer Type</Th><Th>Decision Impact</Th><Th>Outcome Linkage</Th><Th>Quality</Th><Th>Freshness</Th></tr>
          </thead>
          <tbody>
            {topReusedRecords.map((r) => (
              <tr key={r.recordId} className="border-t border-slate-100 hover:bg-slate-50">
                <Td>
                  <button type="button" onClick={() => onOpenRecord(r.recordId)}
                    className="font-medium text-blue-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    {r.record}
                  </button>
                </Td>
                <Td>{r.reuseCount}</Td><Td>{r.consumerType}</Td>
                <Td><Pill label={r.decisionImpact} tone={tone(r.decisionImpact)} /></Td>
                <Td>{r.outcomeLinkage}</Td><Td>{r.quality}</Td>
                <Td><Pill label={r.freshness} tone={tone(r.freshness)} /></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Decision & outcome learning                                         */
/* ------------------------------------------------------------------ */

export function LearningPanel({ onOpenRecord, onOpenPointInTime }: {
  onOpenRecord: (id: string) => void;
  onOpenPointInTime: () => void;
}) {
  return (
    <Panel id="panel-learning" title="Decision &amp; Outcome Learning"
      subtitle="Memory context → evaluation → decision → execution → observed outcome → learning → future memory update">
      <ol className="flex flex-wrap items-center gap-1" aria-label="Learning loop stages">
        {learningFlowStages.map((s, i) => (
          <li key={s} className="flex items-center gap-1">
            <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10.5px] font-medium text-slate-700">{s}</span>
            {i < learningFlowStages.length - 1 && <span aria-hidden className="text-slate-400">→</span>}
          </li>
        ))}
      </ol>
      <p className="sr-only">
        Text summary of the learning loop: memory context feeds an impact evaluation, which supports a decision,
        which is executed, producing an observed outcome, which produces a learning record, which updates future memory only.
      </p>

      <div className="mt-2 grid gap-2 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 p-2">
          <p className="text-[11px] font-semibold text-slate-800">Memory context at decision</p>
          <ul className="mt-1 space-y-0.5">
            {learningLoop.memoryContext.map((c) => (
              <li key={c}><button type="button" onClick={() => onOpenRecord(c)}
                className="text-left text-[11px] text-blue-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{c}</button></li>
            ))}
          </ul>
          <dl className="mt-1"><Row label="Evaluation" value={learningLoop.evaluation} /><Row label="Decision" value={learningLoop.decision} /><Row label="Execution" value={learningLoop.execution} /></dl>
        </div>

        <div className="rounded-lg border border-slate-200 p-2">
          <p className="text-[11px] font-semibold text-slate-800">Expected vs observed</p>
          <div className="mt-1 grid gap-1 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Expected</p>
              <ul className="list-disc pl-4 text-[11px] text-slate-700">{learningLoop.expected.map((e) => <li key={e}>{e}</li>)}</ul>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Observed</p>
              <ul className="list-disc pl-4 text-[11px] text-slate-700">{learningLoop.observed.map((e) => <li key={e}>{e}</li>)}</ul>
            </div>
          </div>
          <div className="mt-1.5 rounded border border-amber-200 bg-amber-50 p-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-800">Learning</p>
            <p className="text-[11px] text-slate-800">{learningLoop.learning}</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-2">
          <p className="text-[11px] font-semibold text-slate-800">Future memory update</p>
          <ul className="mt-1 list-disc pl-4 text-[11px] text-slate-700">
            {learningLoop.futureUpdates.map((u) => <li key={u}>{u}</li>)}
          </ul>
          <div className="mt-1.5 rounded border border-blue-200 bg-blue-50 p-1.5">
            <p className="text-[10.5px] text-blue-900">{learningLoop.immutabilityNote}</p>
          </div>
          <Button size="sm" variant="outline" className="mt-1.5 h-6 text-[10.5px]" onClick={onOpenPointInTime}>
            Verify historical context unchanged
          </Button>
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Recent activity                                                     */
/* ------------------------------------------------------------------ */

export function ActivityPanel({ activities, onOpen }: {
  activities: MemoryActivity[];
  onOpen: (a: MemoryActivity) => void;
}) {
  return (
    <Panel id="panel-activity" title="Recent Memory Activity" subtitle="Audited memory events across governance, publishing, access and learning">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-[11px]">
          <caption className="sr-only">Recent memory activity</caption>
          <thead className="bg-slate-50">
            <tr><Th>Timestamp</Th><Th>Action</Th><Th>Record</Th><Th>Memory Type</Th><Th>Domain</Th><Th>Result</Th><Th>Owner</Th><Th>Audit ID</Th></tr>
          </thead>
          <tbody>
            {activities.map((a) => (
              <tr key={a.id} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50" onClick={() => onOpen(a)}>
                <Td>{a.timestamp}</Td>
                <Td className="font-medium text-slate-800">{a.action}</Td>
                <Td>
                  <button type="button" onClick={(e) => { e.stopPropagation(); onOpen(a); }}
                    className="text-left text-blue-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    {a.description}
                  </button>
                  <div className="text-[10px] text-slate-500">{a.memoryRecordId}</div>
                </Td>
                <Td>{a.memoryType}</Td><Td>{a.domain}</Td>
                <Td><Pill label={a.result} tone={tone(a.result)} /></Td>
                <Td>{a.owner}</Td><Td>{a.auditId}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Quality detail (extended)                                           */
/* ------------------------------------------------------------------ */

export function QualityDetailBody({ dimensionName, current, target, trend, onRecalculate }: {
  dimensionName: string; current: string; target: string; trend: string;
  onRecalculate: (trigger: string) => void;
}) {
  const d = qualityDetail;
  return (
    <div className="space-y-2 text-[11px]">
      <dl>
        <Row label="Metric Definition" value={d.definition} />
        <Row label="Current" value={current} />
        <Row label="Target" value={target} />
        <Row label="Trend" value={trend} />
      </dl>

      <div className="grid gap-2 sm:grid-cols-3">
        {[
          { title: "Memory Type Distribution", rows: d.memoryTypeDistribution },
          { title: "Domain Distribution", rows: d.domainDistribution },
          { title: "Owner Distribution", rows: d.ownerDistribution },
        ].map((b) => (
          <div key={b.title} className="rounded border border-slate-200 p-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{b.title}</p>
            <dl className="mt-0.5">{b.rows.map((r) => <Row key={r.label} label={r.label} value={r.value} />)}</dl>
          </div>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Top Failure Causes</p>
          <ul className="list-disc pl-4 text-slate-700">{d.topFailureCauses.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Recommended Actions</p>
          <ul className="list-disc pl-4 text-slate-700">{d.recommendedActions.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      </div>

      <dl>
        <Row label="Affected Consumers" value={d.affectedConsumers.join(", ")} />
        <Row label="Affected Personas" value={d.affectedPersonas.join(", ")} />
        <Row label="Affected Evaluations" value={d.affectedEvaluations.join(", ")} />
        <Row label="Affected Decisions" value={d.affectedDecisions.join(", ")} />
        <Row label="Affected Learning Records" value={d.affectedLearningRecords.join(", ")} />
      </dl>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Recent Changes</p>
        <ul className="text-slate-700">{d.recentChanges.map((c) => <li key={c.when}>{c.when} — {c.what}</li>)}</ul>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Recalculate {dimensionName} after</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {qualityRecalculationTriggers.map((t) => (
            <Button key={t} size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onRecalculate(t)}>{t}</Button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Operational state banner                                            */
/* ------------------------------------------------------------------ */

export function StateBanner({ state, message, toneName, onDismiss }: {
  state: string; message: string; toneName: "green" | "amber" | "red" | "blue"; onDismiss?: () => void;
}) {
  const map = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    red: "border-red-200 bg-red-50 text-red-900",
    blue: "border-blue-200 bg-blue-50 text-blue-900",
  } as const;
  const explanation = operationalStateExplanations[state];
  return (
    <div role="status" className={cn("flex flex-wrap items-start justify-between gap-2 rounded-lg border px-2.5 py-1.5", map[toneName])}>
      <div>
        <p className="text-[11.5px] font-semibold">{state} · {message}</p>
        {explanation && (
          <p className="text-[10.5px]">
            {explanation.meaning} Affected consumers: {explanation.consumers}. Remediation: {explanation.remediation}
          </p>
        )}
      </div>
      {onDismiss && <Button size="sm" variant="outline" className="h-6 bg-white/70 text-[10.5px]" onClick={onDismiss}>Reset Demo Data</Button>}
    </div>
  );
}
