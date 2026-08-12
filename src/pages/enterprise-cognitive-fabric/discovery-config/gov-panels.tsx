/* Discovery Configuration — Prompt 2 governance panels. */

import { useMemo, useState } from "react";
import {
  AlertTriangle, ArrowRight, CheckCircle2, ClipboardCheck, Clock, GitCompare, History,
  Lock, RotateCcw, ShieldAlert, Signal, TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Panel, StatusBadge } from "../command-center/panels";
import { fmt, type DiscoveryPreview, type DraftState } from "./data";
import {
  accessChecks, conflictTypes, driftTypes, impactDetail, impactTabs, materialityTriggers,
  protectedControls, seedAccessValidations, seedComparison, seedEnvironments, seedInheritance,
  seedOwnership, seedPrecheck, seedPublishing, seedResidency, seedRuntimeCompatibility,
  stateTone, validationCategories,
  type ActivityEvent, type ComparisonRow, type DiscoveryConfigurationApproval,
  type DiscoveryConfigurationAuditEvent, type DiscoveryConfigurationDrift,
  type DiscoveryConfigurationException, type DiscoveryConfigurationImpact,
  type DiscoveryConfigurationNotification, type DiscoveryConfigurationReview,
  type DiscoveryConfigurationValidation, type DiscoveryConfigurationVersion,
  type DiscoveryRuleConflict, type DiscoveryValidationResult, type ImpactTab, type ScenarioState,
} from "./gov-data";

const th = "whitespace-nowrap px-2 py-1.5 text-left font-medium";
const td = "px-2 py-1.5 align-top";

function Tone({ children }: { children: string }) {
  return <StatusBadge tone={stateTone(children)}>{children}</StatusBadge>;
}

/* ---------------------------------------------------- 1. validation summary */

export function ValidationPanel({
  validation, running, onRun, onOpenResults, spotlight, blocked,
}: {
  validation: DiscoveryConfigurationValidation; running: boolean;
  onRun: () => void; onOpenResults: () => void; spotlight?: boolean; blocked: boolean;
}) {
  const summaryText =
    `Validation ${validation.status}. Score ${validation.validationScore} out of 100. ` +
    `${validation.passedCount} passed, ${validation.warningCount} warnings, ` +
    `${validation.reviewRequiredCount} review required, ${validation.blockedCount} blocked.`;

  return (
    <Panel
      id="panel-validation"
      title="Configuration Validation"
      subtitle="Validate the selected draft against enterprise scope, policy, ownership, residency, rule and processing requirements"
      spotlight={spotlight}
    >
      <p className="sr-only" role="status" aria-live="polite">{summaryText}</p>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" className="h-7 text-[11.5px]" onClick={onRun} disabled={running}>
          {running ? "Validating…" : "Validate Configuration"}
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={onOpenResults}>Open validation results</Button>
        <Tone>{running ? "Validation Running" : validation.status === "Failed" ? "Validation Failed" : validation.blockedCount ? "Blocked" : validation.reviewRequiredCount ? "Review Required" : "Passed"}</Tone>
        {blocked && <StatusBadge tone="red">Activation blocked</StatusBadge>}
        <span className="ml-auto text-[11px] text-slate-500">Started {validation.startedAt} · Completed {validation.completedAt || "—"}</span>
      </div>

      <div className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-lg border border-slate-200 p-2.5">
          <div className="text-[10.5px] uppercase tracking-wide text-slate-500">Validation score</div>
          <div className="text-[22px] font-bold text-slate-900">{validation.validationScore} <span className="text-[12px] font-medium text-slate-500">/ 100</span></div>
          <Progress value={validation.validationScore} className="mt-1.5 h-1.5" />
        </div>
        {[
          { label: "Passed", value: validation.passedCount, tone: "green" as const },
          { label: "Warnings", value: validation.warningCount, tone: "amber" as const },
          { label: "Review Required", value: validation.reviewRequiredCount, tone: "amber" as const },
          { label: "Blocked", value: validation.blockedCount, tone: validation.blockedCount ? ("red" as const) : ("slate" as const) },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border border-slate-200 p-2.5">
            <div className="text-[10.5px] uppercase tracking-wide text-slate-500">{c.label}</div>
            <div className="text-[22px] font-bold text-slate-900">{c.value}</div>
            <StatusBadge tone={c.tone}>{c.label}</StatusBadge>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <div className="text-[11px] font-semibold text-slate-700">Validation categories</div>
        <div className="mt-1 flex flex-wrap gap-1">
          {validationCategories.map((c) => (
            <span key={c} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10.5px] text-slate-600">{c}</span>
          ))}
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------- 2. validation results */

export function ValidationResultsPanel({
  results, onAction, spotlight,
}: {
  results: DiscoveryValidationResult[];
  onAction: (r: DiscoveryValidationResult, action: string) => void;
  spotlight?: boolean;
}) {
  const [category, setCategory] = useState("All");
  const [severity, setSeverity] = useState("All");
  const rows = results.filter(
    (r) => (category === "All" || r.category === category) && (severity === "All" || r.severity === severity));

  return (
    <Panel
      id="panel-validation-results"
      title="Configuration Validation Results"
      subtitle="Every validation finding with current state, expected state, recommended action and owner"
      spotlight={spotlight}
    >
      <div className="mb-2 flex flex-wrap gap-1.5">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-7 w-[210px] text-[11px]" aria-label="Validation category filter"><SelectValue /></SelectTrigger>
          <SelectContent className="max-h-64">
            {["All", ...Array.from(new Set(results.map((r) => r.category)))].map((c) => (
              <SelectItem key={c} value={c} className="text-[12px]">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className="h-7 w-[130px] text-[11px]" aria-label="Severity filter"><SelectValue /></SelectTrigger>
          <SelectContent>{["All", "Low", "Medium", "High", "Critical"].map((s) => <SelectItem key={s} value={s} className="text-[12px]">{s}</SelectItem>)}</SelectContent>
        </Select>
        <span className="self-center text-[11px] text-slate-500">{rows.length} findings</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] text-[11.5px]">
          <caption className="sr-only">Configuration validation results</caption>
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {["Validation ID", "Category", "Configuration Element", "Issue", "Severity", "Current State", "Expected State", "Affected Scope", "Recommended Action", "Owner", "Status", "Actions"]
                .map((h) => <th key={h} scope="col" className={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className={cn(td, "font-mono text-[10.5px] text-slate-600")}>{r.id}</td>
                <td className={td}>{r.category}</td>
                <td className={td}><span className="font-medium text-slate-800">{r.configurationElementType}</span><div className="font-mono text-[10px] text-slate-500">{r.configurationElementId}</div></td>
                <td className={cn(td, "max-w-[220px]")}>{r.issue}</td>
                <td className={td}><Tone>{r.severity}</Tone></td>
                <td className={td}>{r.currentState}</td>
                <td className={td}>{r.expectedState}</td>
                <td className={td}>{r.affectedScopeIds.join(", ")}</td>
                <td className={cn(td, "max-w-[200px]")}>{r.recommendedAction}</td>
                <td className={td}>{r.owner}</td>
                <td className={td}><Tone>{r.status}</Tone></td>
                <td className={cn(td, "whitespace-nowrap")}>
                  {["Open", "Resolve", "Accept Warning", "Create Exception", "Assign Owner", "Request Review"].map((a) => (
                    <Button key={a} size="sm" variant="ghost" className="h-6 px-1.5 text-[10.5px]" onClick={() => onAction(r, a)}>{a}</Button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------ 3. rule conflicts */

export function ConflictsPanel({
  conflicts, onResolve, spotlight,
}: {
  conflicts: DiscoveryRuleConflict[];
  onResolve: (c: DiscoveryRuleConflict) => void;
  spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-conflicts"
      title="Discovery Rule Conflicts"
      subtitle="Overlapping, unreachable and contradictory rules. Legitimate inheritance overrides are classified as valid, not conflicts."
      spotlight={spotlight}
    >
      <div className="mb-2 flex flex-wrap gap-1">
        {conflictTypes.map((c) => (
          <span key={c} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10.5px] text-slate-600">{c}</span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1020px] text-[11.5px]">
          <caption className="sr-only">Discovery rule conflicts</caption>
          <thead className="bg-slate-50 text-slate-500">
            <tr>{["Conflict", "Rule A", "Rule B", "Conflict Type", "Overlap Scope", "Severity", "Recommended Resolution", "Status", "Actions"].map((h) => <th key={h} scope="col" className={th}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {conflicts.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className={cn(td, "font-mono text-[10.5px]")}>{c.id}</td>
                <td className={td}><div className="font-medium text-slate-800">{c.ruleAName}</div><div className="font-mono text-[10px] text-slate-500">{c.ruleAId}</div></td>
                <td className={td}><div className="font-medium text-slate-800">{c.ruleBName}</div><div className="font-mono text-[10px] text-slate-500">{c.ruleBId}</div></td>
                <td className={td}>{c.conflictType}</td>
                <td className={td}>{c.overlapScope}</td>
                <td className={td}><Tone>{c.severity}</Tone></td>
                <td className={cn(td, "max-w-[240px]")}>{c.recommendedResolution}</td>
                <td className={td}><Tone>{c.status}</Tone>{c.resolution && <div className="mt-1 text-[10.5px] text-slate-500">{c.resolution}</div>}</td>
                <td className={td}>
                  <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onResolve(c)}>
                    {c.status === "Valid Override" ? "Review override" : "Resolve conflict"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ----------------------------------------- 4. permission / access validation */

export function AccessValidationPanel({ spotlight, onReview }: { spotlight?: boolean; onReview: (id: string) => void }) {
  return (
    <Panel
      id="panel-access"
      title="Discovery Access Policy Validation"
      subtitle="Permission preservation, restricted source behavior, derived record policy and classification inheritance"
      spotlight={spotlight}
    >
      <div className="mb-2 flex flex-wrap gap-1">
        {accessChecks.map((c) => <span key={c} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10.5px] text-slate-600">{c}</span>)}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-[11.5px]">
          <caption className="sr-only">Discovery access policy validation</caption>
          <thead className="bg-slate-50 text-slate-500">
            <tr>{["Source", "Access Classification", "Permission State", "Residency", "Derived Context Policy", "Result", "Notes", "Actions"].map((h) => <th key={h} scope="col" className={th}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {seedAccessValidations.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className={cn(td, "font-medium text-slate-800")}>{a.sourceName}</td>
                <td className={td}>{a.accessClassification}</td>
                <td className={td}>{a.sourcePermissionState}</td>
                <td className={td}>{a.residencyState}</td>
                <td className={td}>{a.derivedContextPolicy}</td>
                <td className={td}><Tone>{a.result === "Blocked by policy" ? "Valid" : a.result}</Tone>{a.result === "Blocked by policy" && <div className="mt-1 text-[10.5px] text-slate-500">Blocked by policy — expected</div>}</td>
                <td className={cn(td, "max-w-[220px]")}>{a.issues}</td>
                <td className={td}>
                  {a.result === "Review Required"
                    ? <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onReview(a.id)}>Open review</Button>
                    : <span className="text-[10.5px] text-slate-500">No action</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">
        Restricted synthetic content is never displayed. Personal content exclusion is expected behavior, not a validation error.
      </p>
    </Panel>
  );
}

/* ------------------------------------------------------- 5. data residency */

export function ResidencyPanel({ spotlight }: { spotlight?: boolean }) {
  return (
    <Panel
      id="panel-residency"
      title="Data Residency & Regional Policy"
      subtitle="Region, processing location, evidence location and derived context policy per source"
      spotlight={spotlight}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[940px] text-[11.5px]">
          <caption className="sr-only">Data residency and regional policy</caption>
          <thead className="bg-slate-50 text-slate-500">
            <tr>{["Source", "Region", "Classification", "Discovery Allowed", "Processing Region", "Evidence Region", "Derived Context Policy", "Status"].map((h) => <th key={h} scope="col" className={th}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {seedResidency.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className={cn(td, "font-medium text-slate-800")}>{r.source}</td>
                <td className={td}>{r.region}</td>
                <td className={td}>{r.classification}</td>
                <td className={td}>{r.discoveryAllowed}</td>
                <td className={td}>{r.processingRegion}</td>
                <td className={td}>{r.evidenceRegion}</td>
                <td className={td}>{r.derivedContextPolicy}</td>
                <td className={td}><Tone>{r.status}</Tone></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">
        Cross region movement is never simulated as a successful state. Undeclared residency restricts processing until reviewed.
      </p>
    </Panel>
  );
}

/* --------------------------------------------------------- 6. ownership */

export function OwnershipPanel({
  rows, onAction, spotlight,
}: { rows: typeof seedOwnership; onAction: (id: string, action: string) => void; spotlight?: boolean }) {
  const counts = {
    Confirmed: rows.filter((r) => r.status === "Confirmed").length,
    Pending: rows.filter((r) => r.status === "Pending").length,
    Missing: rows.filter((r) => r.status === "Missing").length,
  };
  return (
    <Panel
      id="panel-ownership"
      title="Discovery Ownership Validation"
      subtitle="Configuration, business unit, source, domain, policy, handoff and review ownership"
      spotlight={spotlight}
    >
      <div className="mb-2 flex flex-wrap gap-1.5">
        <StatusBadge tone="green">{counts.Confirmed} Confirmed</StatusBadge>
        <StatusBadge tone="amber">{counts.Pending} Pending</StatusBadge>
        <StatusBadge tone={counts.Missing ? "red" : "slate"}>{counts.Missing} Missing</StatusBadge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-[11.5px]">
          <caption className="sr-only">Discovery ownership validation</caption>
          <thead className="bg-slate-50 text-slate-500">
            <tr>{["Dimension", "Element", "Owner", "Status", "Actions"].map((h) => <th key={h} scope="col" className={th}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50">
                <td className={td}>{o.dimension}</td>
                <td className={cn(td, "font-medium text-slate-800")}>{o.element}</td>
                <td className={td}>{o.owner || <span className="text-slate-400">Unassigned</span>}</td>
                <td className={td}><Tone>{o.status}</Tone></td>
                <td className={cn(td, "whitespace-nowrap")}>
                  {o.status !== "Confirmed" && ["Assign Synthetic Owner", "Request Confirmation", "Create Review Task"].map((a) => (
                    <Button key={a} size="sm" variant="ghost" className="h-6 px-1.5 text-[10.5px]" onClick={() => onAction(o.id, a)}>{a}</Button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------- 7. change impact */

export function ChangeImpactPanel({
  impact, spotlight, onOpenComparison,
}: { impact: DiscoveryConfigurationImpact; spotlight?: boolean; onOpenComparison: () => void }) {
  const [tab, setTab] = useState<ImpactTab>("Scope Changes");
  const metrics: [string, string][] = [
    ["Sources Added", String(impact.sourcesAdded)],
    ["Sources Removed", String(impact.sourcesRemoved)],
    ["Sources Restricted", String(impact.sourcesRestricted)],
    ["Rule Changes", String(impact.rulesChanged)],
    ["Permission Changes", String(impact.permissionChanges)],
    ["Authority Changes", String(impact.authorityChanges)],
    ["Freshness Changes", String(impact.freshnessChanges)],
    ["Cadence Changes", String(impact.cadenceChanges)],
    ["Processing Handoff Changes", String(impact.processingChanges)],
    ["Projected Artifact Delta", `+${fmt(impact.projectedArtifactDelta)}`],
    ["Projected New Restricted Artifacts", `+${fmt(impact.restrictedArtifactDelta)}`],
    ["Projected Condition Eligible Delta", `+${fmt(impact.conditionEligibleDelta)}`],
    ["Projected Persona Relevant Delta", `+${fmt(impact.personaRelevantDelta)}`],
    ["Potential Downstream Reprocessing", `${fmt(impact.downstreamReprocessingEstimate)} artifacts`],
    ["Potentially Affected Team Personas", String(impact.affectedPersonaIds.length)],
    ["Potentially Affected Active Intakes", String(impact.affectedIntakeIds.length)],
    ["Potentially Affected Active Impact Evaluations", String(impact.affectedImpactEvaluationIds.length)],
    ["Historical Decisions Modified", String(impact.historicalDecisionModificationCount)],
  ];

  return (
    <Panel
      id="panel-impact"
      title="Configuration Change Impact"
      subtitle={`Active v${impact.fromVersion} versus Draft v${impact.toVersion} — projected discovery and downstream effect before activation`}
      spotlight={spotlight}
    >
      <p className="sr-only">
        {`Change impact from version ${impact.fromVersion} to ${impact.toVersion}: ` +
          metrics.map(([k, v]) => `${k} ${v}`).join(", ")}.
      </p>
      <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {metrics.map(([k, v]) => (
          <div
            key={k}
            className={cn("rounded-lg border p-2",
              k === "Historical Decisions Modified" ? "border-emerald-200 bg-emerald-50" : "border-slate-200")}
          >
            <div className="text-[10.5px] leading-tight text-slate-500">{k}</div>
            <div className="text-[15px] font-semibold text-slate-900">{v}</div>
            {k === "Historical Decisions Modified" && (
              <div className="text-[10px] text-emerald-700">Always zero — history is never rewritten</div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1" role="tablist" aria-label="Change impact detail">
        {impactTabs.map((t) => (
          <button
            key={t} type="button" role="tab" aria-selected={tab === t}
            className={cn("rounded-md border px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              tab === t ? "border-blue-300 bg-blue-50 font-medium text-blue-800" : "border-slate-200 bg-white text-slate-600")}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-2 space-y-1.5">
        {impactDetail[tab].map((d) => (
          <div key={d.label} className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 px-2 py-1.5">
            <span className="text-[11.5px] font-medium text-slate-800">{d.label}</span>
            <StatusBadge tone={d.change === "Removed" ? "red" : d.change === "Added" || d.change === "New Source" ? "green" : d.change === "Unchanged" || d.change === "No modification" ? "slate" : "amber"}>{d.change}</StatusBadge>
            <span className="text-[11px] text-slate-600">{d.note}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onOpenComparison}>
          <GitCompare className="mr-1 h-3.5 w-3.5" aria-hidden /> Open version comparison
        </Button>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">
        Activation triggers discovery and downstream reassessment. It never rewrites approved downstream records or historical decisions.
      </p>
    </Panel>
  );
}

/* --------------------------------------------------------- 8. review queue */

export function ReviewQueuePanel({
  reviews, selected, onSelect, onAction, spotlight,
}: {
  reviews: DiscoveryConfigurationReview[]; selected: string;
  onSelect: (id: string) => void; onAction: (r: DiscoveryConfigurationReview, action: string) => void;
  spotlight?: boolean;
}) {
  const [severity, setSeverity] = useState("All");
  const open = reviews.filter((r) => ["Open", "In Review", "Escalated"].includes(r.status));
  const rows = reviews.filter((r) => severity === "All" || r.severity === severity);
  const count = (s: string) => open.filter((r) => r.severity === s).length;

  return (
    <Panel
      id="panel-reviews"
      title="Discovery Configuration Review Queue"
      subtitle="Permission, residency, authority, cadence, ownership, rule and evidence reviews awaiting governance decisions"
      spotlight={spotlight}
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <StatusBadge tone="blue">Open Reviews {open.length}</StatusBadge>
        <StatusBadge tone="red">High {count("High")}</StatusBadge>
        <StatusBadge tone="amber">Medium {count("Medium")}</StatusBadge>
        <StatusBadge tone="slate">Low {count("Low")}</StatusBadge>
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className="h-7 w-[120px] text-[11px]" aria-label="Review severity filter"><SelectValue /></SelectTrigger>
          <SelectContent>{["All", "Low", "Medium", "High", "Critical"].map((s) => <SelectItem key={s} value={s} className="text-[12px]">{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1140px] text-[11.5px]">
          <caption className="sr-only">Discovery configuration review queue</caption>
          <thead className="bg-slate-50 text-slate-500">
            <tr>{["Review ID", "Configuration", "Version", "Review Type", "Issue", "Scope", "Severity", "Reviewer", "Due", "Status", "Actions"].map((h) => <th key={h} scope="col" className={th}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr
                key={r.id}
                className={cn("cursor-pointer hover:bg-slate-50", selected === r.id && "bg-blue-50/60")}
                onClick={() => onSelect(r.id)}
              >
                <td className={cn(td, "font-mono text-[10.5px]")}>{r.id}</td>
                <td className={td}>{r.configurationId === "DISC-CFG-001" ? "Enterprise Knowledge Discovery" : r.configurationId === "DISC-CFG-002" ? "Commerce Discovery" : "Identity Restricted Knowledge"}</td>
                <td className={td}>v{r.configurationVersion}</td>
                <td className={td}>{r.reviewType}</td>
                <td className={cn(td, "font-medium text-slate-800")}>{r.issue}</td>
                <td className={td}>{r.scope}</td>
                <td className={td}><Tone>{r.severity}</Tone></td>
                <td className={td}>{r.reviewer}</td>
                <td className={td}>{r.dueAt}</td>
                <td className={td}><Tone>{r.status}</Tone></td>
                <td className={cn(td, "whitespace-nowrap")} onClick={(e) => e.stopPropagation()}>
                  {["Open Review", "Assign", "Approve", "Approve with Conditions", "Request Changes", "Reject", "Escalate"].map((a) => (
                    <Button key={a} size="sm" variant="ghost" className="h-6 px-1.5 text-[10.5px]" onClick={() => { onSelect(r.id); onAction(r, a); }}>{a}</Button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------- 9. review workbench */

export function ReviewWorkbench({
  review, impact, preview, onAction, spotlight,
}: {
  review: DiscoveryConfigurationReview | null; impact: DiscoveryConfigurationImpact;
  preview: DiscoveryPreview; onAction: (action: string) => void; spotlight?: boolean;
}) {
  if (!review) {
    return (
      <Panel id="panel-review-workbench" title="Configuration Review Workbench" subtitle="Select a review to open the reviewer workbench" spotlight={spotlight}>
        <p className="text-[11.5px] text-slate-500">No review selected. Choose a review from the queue above.</p>
      </Panel>
    );
  }
  const region = "rounded-lg border border-slate-200 p-2.5";
  return (
    <Panel
      id="panel-review-workbench"
      title="Configuration Review Workbench"
      subtitle={`${review.id} · ${review.reviewType} · ${review.issue}`}
      spotlight={spotlight}
    >
      <div className="grid gap-2.5 lg:grid-cols-2 2xl:grid-cols-4">
        <div className={region}>
          <h3 className="text-[11.5px] font-semibold text-slate-800">Region 1 · Configuration Change</h3>
          <dl className="mt-1.5 space-y-1 text-[11px]">
            <div className="flex justify-between gap-2"><dt className="text-slate-500">Configuration</dt><dd className="text-slate-800">Enterprise Knowledge Discovery</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-slate-500">Version</dt><dd className="text-slate-800">v{review.configurationVersion} draft</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-slate-500">Change reason</dt><dd className="text-right text-slate-800">Customer Support pilot, transcript restrictions, freshness policy</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-slate-500">Requested</dt><dd className="text-slate-800">{review.requestedAt}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-slate-500">Due</dt><dd className="text-slate-800">{review.dueAt}</dd></div>
          </dl>
        </div>
        <div className={region}>
          <h3 className="text-[11.5px] font-semibold text-slate-800">Region 2 · Policy Context</h3>
          <ul className="mt-1.5 space-y-1 text-[11px] text-slate-700">
            <li><span className="text-slate-500">Permissions:</span> source ACL preserved, unknown permissions restrict by default</li>
            <li><span className="text-slate-500">Residency:</span> EU governed storage valid, Customer Support archive under review</li>
            <li><span className="text-slate-500">Authority:</span> architecture authoritative, transcripts contextual</li>
            <li><span className="text-slate-500">Scope:</span> {review.scope}</li>
          </ul>
        </div>
        <div className={region}>
          <h3 className="text-[11.5px] font-semibold text-slate-800">Region 3 · Preview &amp; Impact</h3>
          <ul className="mt-1.5 space-y-1 text-[11px] text-slate-700">
            <li><span className="text-slate-500">Source delta:</span> +{impact.sourcesAdded} added, {impact.sourcesRemoved} removed, {impact.sourcesRestricted} restricted</li>
            <li><span className="text-slate-500">Artifact delta:</span> +{fmt(impact.projectedArtifactDelta)} ({fmt(preview.discoverableArtifacts)} projected total)</li>
            <li><span className="text-slate-500">Downstream:</span> {fmt(impact.downstreamReprocessingEstimate)} artifacts may be reprocessed</li>
            <li><span className="text-slate-500">Warnings:</span> {preview.warnings.length} preview warnings</li>
          </ul>
        </div>
        <div className={region}>
          <h3 className="text-[11.5px] font-semibold text-slate-800">Region 4 · Reviewer Decision</h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {["Approve", "Approve with Conditions", "Request Changes", "Reject", "Create Exception", "Escalate"].map((a) => (
              <Button key={a} size="sm" variant={a === "Approve" ? "default" : "outline"} className="h-7 text-[11px]" onClick={() => onAction(a)}>{a}</Button>
            ))}
          </div>
          <p className="mt-2 text-[10.5px] text-slate-500">
            Comments are required for conditional approval, rejection, exception and override.
          </p>
          {review.decision && (
            <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-[11px]">
              <div><span className="text-slate-500">Decision:</span> {review.decision}</div>
              {review.conditions && <div><span className="text-slate-500">Conditions:</span> {review.conditions}</div>}
              {review.comments && <div><span className="text-slate-500">Comments:</span> {review.comments}</div>}
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}

/* -------------------------------------------------- 10. approval chain */

export function ApprovalChainPanel({
  approvals, onDecide, spotlight, approvalState,
}: {
  approvals: DiscoveryConfigurationApproval[];
  onDecide: (a: DiscoveryConfigurationApproval, action: string) => void;
  spotlight?: boolean; approvalState: string;
}) {
  return (
    <Panel
      id="panel-approvals"
      title="Configuration Approval Chain"
      subtitle="Approval stages derived from change materiality. Approved is not the same as Active."
      spotlight={spotlight}
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-slate-500">Approval state</span>
        <Tone>{approvalState}</Tone>
        <span className="text-[11px] text-slate-500">Additional approval triggered by:</span>
        {materialityTriggers.map((m) => <span key={m} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10.5px] text-slate-600">{m}</span>)}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] text-[11.5px]">
          <caption className="sr-only">Configuration approval chain</caption>
          <thead className="bg-slate-50 text-slate-500">
            <tr>{["Stage", "Reviewer", "Role", "Status", "Submitted", "Due", "Completed", "Comments", "Conditions", "Actions"].map((h) => <th key={h} scope="col" className={th}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {approvals.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className={cn(td, "font-medium text-slate-800")}>
                  {a.approvalStage}
                  {a.requiredBecause && <div className="text-[10px] text-slate-500">Required for {a.requiredBecause}</div>}
                </td>
                <td className={td}>{a.approver}</td>
                <td className={td}>{a.approverRole}</td>
                <td className={td}><Tone>{a.status}</Tone></td>
                <td className={td}>{a.submittedAt || "—"}</td>
                <td className={td}>{a.dueAt || "—"}</td>
                <td className={td}>{a.completedAt || "—"}</td>
                <td className={cn(td, "max-w-[200px]")}>{a.comments || "—"}</td>
                <td className={cn(td, "max-w-[180px]")}>{a.conditions || "—"}</td>
                <td className={cn(td, "whitespace-nowrap")}>
                  {a.status === "Pending" || a.status === "Not Started"
                    ? ["Approve", "Approve with Conditions", "Reject"].map((x) => (
                      <Button key={x} size="sm" variant="ghost" className="h-6 px-1.5 text-[10.5px]" onClick={() => onDecide(a, x)}>{x}</Button>
                    ))
                    : <span className="text-[10.5px] text-slate-500">Decided</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* -------------------------------------------------- 11. version history */

export function VersionHistoryPanel({
  versions, onOpen, onCompare, onClone, onExport, spotlight,
}: {
  versions: DiscoveryConfigurationVersion[];
  onOpen: (v: DiscoveryConfigurationVersion) => void;
  onCompare: (v: DiscoveryConfigurationVersion) => void;
  onClone: (v: DiscoveryConfigurationVersion) => void;
  onExport: (v: DiscoveryConfigurationVersion) => void;
  spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-versions"
      title="Discovery Configuration Version History"
      subtitle="Enterprise Knowledge Discovery — every version is preserved with its scope, policy and approval snapshot"
      spotlight={spotlight}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] text-[11.5px]">
          <caption className="sr-only">Discovery configuration version history</caption>
          <thead className="bg-slate-50 text-slate-500">
            <tr>{["Version", "Status", "Created", "Created By", "Change Reason", "Sources", "Rules", "Projected Volume", "Validation Score", "Approval State", "Effective Date", "Superseded Date", "Actions"].map((h) => <th key={h} scope="col" className={th}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {versions.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50">
                <td className={cn(td, "font-semibold text-slate-800")}>v{v.version}</td>
                <td className={td}><Tone>{v.status}</Tone></td>
                <td className={td}>{v.createdAt}</td>
                <td className={td}>{v.createdBy}</td>
                <td className={cn(td, "max-w-[260px]")}>{v.changeReason}</td>
                <td className={td}>{v.sources}</td>
                <td className={td}>{v.rules}</td>
                <td className={td}>{fmt(v.projectedVolume)}</td>
                <td className={td}>{v.validationScore}</td>
                <td className={td}><Tone>{v.approvalState}</Tone></td>
                <td className={td}>{v.effectiveDate || "—"}</td>
                <td className={td}>{v.supersededDate || "—"}</td>
                <td className={cn(td, "whitespace-nowrap")}>
                  <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10.5px]" onClick={() => onOpen(v)}>Open</Button>
                  <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10.5px]" onClick={() => onCompare(v)}>Compare</Button>
                  <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10.5px]" onClick={() => onClone(v)}>Clone</Button>
                  <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10.5px]" onClick={() => onExport(v)}>Export Metadata</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">Historical versions are preserved permanently and are never modified by activation or rollback.</p>
    </Panel>
  );
}

/* ------------------------------------------------ 12. version comparison */

export function VersionComparisonPanel({
  fromVersion, toVersion, versions, onFrom, onTo, onOpenElement, spotlight,
}: {
  fromVersion: string; toVersion: string; versions: DiscoveryConfigurationVersion[];
  onFrom: (v: string) => void; onTo: (v: string) => void;
  onOpenElement: (row: ComparisonRow) => void; spotlight?: boolean;
}) {
  const [state, setState] = useState("All");
  const rows = useMemo(() => seedComparison.filter((r) => state === "All" || r.state === state), [state]);
  const summary = useMemo(() => {
    const c: Record<string, number> = {};
    seedComparison.forEach((r) => { c[r.state] = (c[r.state] ?? 0) + 1; });
    return c;
  }, []);

  return (
    <Panel
      id="panel-comparison"
      title="Discovery Configuration Version Comparison"
      subtitle={`v${fromVersion} versus v${toVersion} across scope, sources, rules, policy, processing and validation`}
      spotlight={spotlight}
    >
      <p className="sr-only">
        {`Comparing version ${fromVersion} with version ${toVersion}. ` +
          Object.entries(summary).map(([k, v]) => `${v} ${k}`).join(", ")}.
      </p>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <Select value={fromVersion} onValueChange={onFrom}>
          <SelectTrigger className="h-7 w-[110px] text-[11px]" aria-label="Compare from version"><SelectValue /></SelectTrigger>
          <SelectContent>{versions.map((v) => <SelectItem key={v.id} value={v.version} className="text-[12px]">v{v.version}</SelectItem>)}</SelectContent>
        </Select>
        <ArrowRight className="h-3.5 w-3.5 text-slate-400" aria-hidden />
        <Select value={toVersion} onValueChange={onTo}>
          <SelectTrigger className="h-7 w-[110px] text-[11px]" aria-label="Compare to version"><SelectValue /></SelectTrigger>
          <SelectContent>{versions.map((v) => <SelectItem key={v.id} value={v.version} className="text-[12px]">v{v.version}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={state} onValueChange={setState}>
          <SelectTrigger className="h-7 w-[150px] text-[11px]" aria-label="Difference filter"><SelectValue /></SelectTrigger>
          <SelectContent>{["All", "Added", "Removed", "Changed", "Unchanged", "Restricted", "Material Change"].map((s) => <SelectItem key={s} value={s} className="text-[12px]">{s}</SelectItem>)}</SelectContent>
        </Select>
        {Object.entries(summary).map(([k, v]) => <StatusBadge key={k} tone={k === "Removed" ? "red" : k === "Added" ? "green" : k === "Unchanged" ? "slate" : k === "Material Change" ? "purple" : "amber"}>{k} {v}</StatusBadge>)}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-[11.5px]">
          <caption className="sr-only">Discovery configuration version comparison</caption>
          <thead className="bg-slate-50 text-slate-500">
            <tr>{["Dimension", "Element", `v${fromVersion}`, `v${toVersion}`, "Difference"].map((h) => <th key={h} scope="col" className={th}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr
                key={`${r.dimension}-${r.element}`}
                className={cn("hover:bg-slate-50", r.state !== "Unchanged" && "cursor-pointer")}
                onClick={() => r.state !== "Unchanged" && onOpenElement(r)}
              >
                <td className={td}>{r.dimension}</td>
                <td className={cn(td, "font-medium text-slate-800")}>{r.element}</td>
                <td className={td}>{r.from}</td>
                <td className={td}>{r.to}</td>
                <td className={td}>
                  <StatusBadge tone={r.state === "Removed" ? "red" : r.state === "Added" ? "green" : r.state === "Unchanged" ? "slate" : r.state === "Material Change" ? "purple" : "amber"}>{r.state}</StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ----------------------------------------------------- 13. inheritance */

export function InheritancePanel({
  overrides, onCreateOverride, onResetInherited, onRemoveOverride, spotlight,
}: {
  overrides: Record<string, string>;
  onCreateOverride: (id: string, value: string) => void;
  onResetInherited: (id: string) => void;
  onRemoveOverride: (id: string) => void;
  spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-inheritance"
      title="Configuration Inheritance"
      subtitle="Enterprise → Business Unit → Knowledge Domain → Source Platform → Specific Source. Protected enterprise controls cannot be overridden."
      spotlight={spotlight}
    >
      <div className="space-y-1.5">
        {seedInheritance.map((n) => {
          const locked = n.state === "Locked by Enterprise Policy" || n.state === "Cannot Override";
          const value = overrides[n.id] ?? n.cadence;
          return (
            <div key={n.id} className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 px-2 py-1.5"
              style={{ marginLeft: `${n.depth * 14}px` }}>
              {locked && <Lock className="h-3.5 w-3.5 text-slate-500" aria-hidden />}
              <span className="text-[10.5px] uppercase tracking-wide text-slate-500">{n.level}</span>
              <span className="text-[11.5px] font-medium text-slate-800">{n.label}</span>
              <StatusBadge tone={locked ? "purple" : n.state === "Conflict" ? "red" : n.state === "Explicit Override" ? "amber" : "slate"}>{n.state}</StatusBadge>
              <span className="text-[11px] text-slate-600">{value}</span>
              <span className="text-[10.5px] text-slate-500">{n.note}</span>
              <span className="ml-auto flex gap-1">
                {locked ? (
                  <span className="text-[10.5px] text-slate-500">Protected enterprise control</span>
                ) : (
                  <>
                    <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10.5px]" onClick={() => onCreateOverride(n.id, "Every 4 hours")}>Create Override</Button>
                    <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10.5px]" onClick={() => onRemoveOverride(n.id)}>Remove Draft Override</Button>
                    <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10.5px]" onClick={() => onResetInherited(n.id)}>Reset to Inherited</Button>
                  </>
                )}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        <span className="text-[11px] text-slate-500">Cannot be overridden at any level:</span>
        {protectedControls.map((p) => <span key={p} className="rounded border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[10.5px] text-violet-700">{p}</span>)}
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------ 14. exceptions */

export function ExceptionsPanel({
  exceptions, onCreate, onAction, spotlight,
}: {
  exceptions: DiscoveryConfigurationException[];
  onCreate: () => void;
  onAction: (e: DiscoveryConfigurationException, action: string) => void;
  spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-exceptions"
      title="Discovery Configuration Exceptions"
      subtitle="Time bounded, monitored and approved deviations from configured policy. All exceptions expire."
      spotlight={spotlight}
    >
      <div className="mb-2 flex flex-wrap gap-1.5">
        <Button size="sm" className="h-7 text-[11px]" onClick={onCreate}>Create Exception</Button>
        <StatusBadge tone="amber">{exceptions.filter((e) => e.status === "Active" || e.status === "Expiring").length} in force</StatusBadge>
        <StatusBadge tone="slate">{exceptions.filter((e) => e.status === "Expired").length} expired</StatusBadge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] text-[11.5px]">
          <caption className="sr-only">Discovery configuration exceptions</caption>
          <thead className="bg-slate-50 text-slate-500">
            <tr>{["Exception", "Configuration", "Scope", "Rule or Policy", "Reason", "Owner", "Approver", "Effective", "Expiration", "Monitoring", "Status", "Actions"].map((h) => <th key={h} scope="col" className={th}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {exceptions.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className={cn(td, "font-mono text-[10.5px]")}>{e.id}<div className="font-sans text-[10.5px] text-slate-600">{e.exceptionType}</div></td>
                <td className={td}>{e.configurationId} v{e.configurationVersion}</td>
                <td className={td}>{e.scope}</td>
                <td className={td}>{e.ruleId} · {e.policyType}</td>
                <td className={cn(td, "max-w-[200px]")}>{e.reason}</td>
                <td className={td}>{e.owner}</td>
                <td className={td}>{e.approver}</td>
                <td className={td}>{e.effectiveDate}</td>
                <td className={td}>{e.expirationDate}</td>
                <td className={cn(td, "max-w-[180px]")}>{e.monitoringRequirements}</td>
                <td className={td}><Tone>{e.status}</Tone></td>
                <td className={cn(td, "whitespace-nowrap")}>
                  {e.status !== "Expired" && ["Review", "Extend", "Expire Now"].map((a) => (
                    <Button key={a} size="sm" variant="ghost" className="h-6 px-1.5 text-[10.5px]" onClick={() => onAction(e, a)}>{a}</Button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------- 15. environment promotion */

export function EnvironmentPromotionPanel({
  promoted, onPromote, onScheduleProduction, canPromoteProduction, spotlight,
}: {
  promoted: Record<string, string>;
  onPromote: (env: string) => void;
  onScheduleProduction: () => void;
  canPromoteProduction: boolean;
  spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-promotion"
      title="Configuration Environment Promotion"
      subtitle="Draft → Validation → Preproduction Preview → Production Approval"
      spotlight={spotlight}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-[11.5px]">
          <caption className="sr-only">Configuration environment promotion</caption>
          <thead className="bg-slate-50 text-slate-500">
            <tr>{["Environment", "Version", "Validation", "Preview", "Approval", "Activation", "Status", "Actions"].map((h) => <th key={h} scope="col" className={th}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {seedEnvironments.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className={cn(td, "font-medium text-slate-800")}>{e.environment}</td>
                <td className={td}>{promoted[e.environment] ?? e.version}</td>
                <td className={td}>{e.validation}</td>
                <td className={td}>{e.preview}</td>
                <td className={td}>{e.approval}</td>
                <td className={td}>{e.activation}</td>
                <td className={td}><Tone>{e.status}</Tone></td>
                <td className={cn(td, "whitespace-nowrap")}>
                  {e.environment === "Validation" && <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onPromote("Validation")}>Promote to Validation</Button>}
                  {e.environment === "Preproduction" && <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onPromote("Preproduction")}>Promote to Preproduction</Button>}
                  {e.environment === "Production" && (
                    <Button size="sm" variant="outline" className="h-6 text-[10.5px]" disabled={!canPromoteProduction} onClick={onScheduleProduction}>
                      Schedule Production
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!canPromoteProduction && (
        <p className="mt-2 flex items-center gap-1 text-[11px] text-amber-700">
          <TriangleAlert className="h-3.5 w-3.5" aria-hidden /> Production promotion requires successful validation and all required approvals.
        </p>
      )}
    </Panel>
  );
}

/* ------------------------------------------------ 16. activation state */

export function ActivationPanel({
  activation, blocked, blockReason, executionStep, onActivate, onCancelSchedule, onReschedule, onRunValidation, spotlight,
}: {
  activation: { status: string; mode: string; scheduledAt: string; scope: string; rollbackOwner: string; rollbackVersion: string; activatedBy: string; completedAt: string };
  blocked: boolean; blockReason: string; executionStep: number;
  onActivate: () => void; onCancelSchedule: () => void; onReschedule: () => void; onRunValidation: () => void;
  spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-activation"
      title="Activation & Scheduled Activation"
      subtitle="Activation publishes the approved configuration to the discovery execution layer"
      spotlight={spotlight}
    >
      <p className="sr-only" role="status" aria-live="polite">Activation status {activation.status}.</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <Tone>{activation.status}</Tone>
        <StatusBadge tone="slate">Mode {activation.mode}</StatusBadge>
        {activation.scheduledAt && <StatusBadge tone="amber">Scheduled {activation.scheduledAt}</StatusBadge>}
        <StatusBadge tone="blue">Scope {activation.scope}</StatusBadge>
        <Button size="sm" className="ml-auto h-7 text-[11px]" onClick={onActivate} disabled={blocked}>Activate Configuration</Button>
        {activation.status === "Scheduled" && (
          <>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onReschedule}>Reschedule</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onCancelSchedule}>Cancel Schedule</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onRunValidation}>Run Validation</Button>
          </>
        )}
      </div>
      {blocked && (
        <p className="mt-2 flex items-start gap-1.5 rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-[11.5px] text-red-800">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> Activation blocked: {blockReason}
        </p>
      )}
      {executionStep > 0 && (
        <ol className="mt-2 grid gap-1 sm:grid-cols-2 xl:grid-cols-3">
          {["Lock Configuration Version", "Validate Policy", "Publish Configuration", "Update Discovery Scheduler",
            "Update Source Scope", "Update Rule Engine", "Update Permission Rules", "Update Processing Handoffs",
            "Create Activation Record", "Trigger Synthetic Discovery Job", "Completed"].map((s, i) => (
              <li key={s} className="flex items-center gap-1.5 text-[11px]">
                {i < executionStep
                  ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                  : <Clock className="h-3.5 w-3.5 text-slate-300" aria-hidden />}
                <span className={i < executionStep ? "text-slate-800" : "text-slate-400"}>{s}</span>
              </li>
            ))}
        </ol>
      )}
      <dl className="mt-2 grid gap-1 text-[11px] sm:grid-cols-3">
        <div><dt className="text-slate-500">Rollback version</dt><dd className="text-slate-800">{activation.rollbackVersion}</dd></div>
        <div><dt className="text-slate-500">Rollback owner</dt><dd className="text-slate-800">{activation.rollbackOwner}</dd></div>
        <div><dt className="text-slate-500">Activated by</dt><dd className="text-slate-800">{activation.activatedBy || "—"} {activation.completedAt && `· ${activation.completedAt}`}</dd></div>
      </dl>
    </Panel>
  );
}

/* ------------------------------------------------------- 17. rollback */

export function RollbackPanel({ onRollback, history, spotlight }: {
  onRollback: () => void;
  history: { id: string; fromVersion: string; toVersion: string; rollbackType: string; reason: string; owner: string; status: string; completedAt: string }[];
  spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-rollback"
      title="Configuration Rollback"
      subtitle="Return discovery behavior to a prior approved version. Historical versions are never modified."
      spotlight={spotlight}
    >
      <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onRollback}>
        <RotateCcw className="mr-1 h-3.5 w-3.5" aria-hidden /> Rollback Configuration
      </Button>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[820px] text-[11.5px]">
          <caption className="sr-only">Rollback history</caption>
          <thead className="bg-slate-50 text-slate-500">
            <tr>{["Rollback", "From", "To", "Type", "Reason", "Owner", "Status", "Completed"].map((h) => <th key={h} scope="col" className={th}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.length === 0 && (
              <tr><td className={cn(td, "text-slate-500")} colSpan={8}>No rollbacks recorded for the current configuration.</td></tr>
            )}
            {history.map((r) => (
              <tr key={r.id}>
                <td className={cn(td, "font-mono text-[10.5px]")}>{r.id}</td>
                <td className={td}>v{r.fromVersion}</td>
                <td className={td}>v{r.toVersion}</td>
                <td className={td}>{r.rollbackType}</td>
                <td className={cn(td, "max-w-[220px]")}>{r.reason}</td>
                <td className={td}>{r.owner}</td>
                <td className={td}><Tone>{r.status}</Tone></td>
                <td className={td}>{r.completedAt || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------- 18. drift */

export function DriftPanel({
  drift, onAction, spotlight,
}: {
  drift: DiscoveryConfigurationDrift[];
  onAction: (d: DiscoveryConfigurationDrift, action: string) => void;
  spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-drift"
      title="Discovery Configuration Drift"
      subtitle="Differences between approved configuration and observed synthetic operational state"
      spotlight={spotlight}
    >
      <div className="mb-2 flex flex-wrap gap-1">
        {driftTypes.map((d) => <span key={d} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10.5px] text-slate-600">{d}</span>)}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] text-[11.5px]">
          <caption className="sr-only">Discovery configuration drift</caption>
          <thead className="bg-slate-50 text-slate-500">
            <tr>{["Configuration", "Element", "Approved State", "Observed State", "Drift Type", "Severity", "Detected", "Owner", "Status", "Actions"].map((h) => <th key={h} scope="col" className={th}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {drift.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className={cn(td, "font-medium text-slate-800")}>{d.configurationName}<div className="text-[10px] text-slate-500">v{d.configurationVersion}</div></td>
                <td className={td}>{d.elementId}<div className="text-[10px] text-slate-500">{d.elementType}</div></td>
                <td className={td}>{d.approvedState}</td>
                <td className={td}>{d.observedState}</td>
                <td className={td}>{d.driftType}</td>
                <td className={td}><Tone>{d.severity}</Tone></td>
                <td className={td}>{d.detectedAt}</td>
                <td className={td}>{d.owner}</td>
                <td className={td}><Tone>{d.status}</Tone>{d.resolution && <div className="mt-1 text-[10.5px] text-slate-500">{d.resolution}</div>}</td>
                <td className={cn(td, "whitespace-nowrap")}>
                  {["Investigate", "Reconcile to Approved", "Create Configuration Change", "Accept Temporary Exception", "Escalate"].map((a) => (
                    <Button key={a} size="sm" variant="ghost" className="h-6 px-1.5 text-[10.5px]" onClick={() => onAction(d, a)}>{a}</Button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* -------------------------------------------- 19. runtime compatibility */

export function RuntimeCompatibilityPanel({ spotlight }: { spotlight?: boolean }) {
  return (
    <Panel
      id="panel-runtime"
      title="Discovery Runtime Compatibility"
      subtitle="Can the approved configuration be consumed by the discovery pipeline components"
      spotlight={spotlight}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-[11.5px]">
          <caption className="sr-only">Discovery runtime compatibility</caption>
          <thead className="bg-slate-50 text-slate-500">
            <tr>{["Component", "Check", "Result", "Notes"].map((h) => <th key={h} scope="col" className={th}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {seedRuntimeCompatibility.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className={cn(td, "font-medium text-slate-800")}>{r.component}</td>
                <td className={td}>{r.checkType}</td>
                <td className={td}><Tone>{r.status}</Tone></td>
                <td className={td}>{r.warning || r.blockingIssue || "Compatible with the current configuration version"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">
        Live connector connectivity is not simulated here. Connector operational state remains in Connector Health.
      </p>
    </Panel>
  );
}

/* ----------------------------------------------- 20. activation precheck */

export function PrecheckPanel({ onContinue, blocked, spotlight }: { onContinue: () => void; blocked: boolean; spotlight?: boolean }) {
  const critical = seedPrecheck.some((p) => p.state === "Unavailable");
  return (
    <Panel
      id="panel-precheck"
      title="Discovery Activation Precheck"
      subtitle="Synthetic dependency readiness before activation"
      spotlight={spotlight}
    >
      <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
        {seedPrecheck.map((p) => (
          <div key={p.id} className="flex items-start gap-1.5 rounded-md border border-slate-200 px-2 py-1.5">
            <Signal className={cn("mt-0.5 h-3.5 w-3.5", p.state === "Ready" ? "text-emerald-600" : p.state === "Warning" ? "text-amber-600" : "text-red-600")} aria-hidden />
            <div>
              <div className="text-[11.5px] font-medium text-slate-800">{p.dependency}</div>
              <Tone>{p.state}</Tone>
              <div className="text-[10.5px] text-slate-500">{p.note}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button size="sm" className="h-7 text-[11px]" onClick={onContinue} disabled={critical || blocked}>
          {critical ? "Block Activation" : "Continue"}
        </Button>
        <span className="text-[11px] text-slate-500">
          {critical ? "A critical dependency is unavailable. Activation is blocked." : "All dependencies ready except one warning within activation threshold."}
        </span>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------ 21. publishing history */

export function PublishingHistoryPanel({ onOpen, spotlight }: { onOpen: (id: string, kind: string) => void; spotlight?: boolean }) {
  return (
    <Panel
      id="panel-publishing"
      title="Configuration Publishing History"
      subtitle="Every publication, promotion, activation and rollback across environments"
      spotlight={spotlight}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] text-[11.5px]">
          <caption className="sr-only">Configuration publishing history</caption>
          <thead className="bg-slate-50 text-slate-500">
            <tr>{["Timestamp", "Configuration", "Version", "Environment", "Action", "Activated By", "Validation Result", "Approval Result", "Scope", "Trigger", "Status", "Audit ID", "Actions"].map((h) => <th key={h} scope="col" className={th}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {seedPublishing.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className={td}>{p.timestamp}</td>
                <td className={cn(td, "font-medium text-slate-800")}>{p.configuration}</td>
                <td className={td}>v{p.version}</td>
                <td className={td}>{p.environment}</td>
                <td className={td}>{p.action}</td>
                <td className={td}>{p.activatedBy}</td>
                <td className={td}>{p.validationResult}</td>
                <td className={td}>{p.approvalResult}</td>
                <td className={td}>{p.scope}</td>
                <td className={td}>{p.trigger}</td>
                <td className={td}><Tone>{p.status}</Tone></td>
                <td className={cn(td, "font-mono text-[10.5px]")}>{p.auditId}</td>
                <td className={cn(td, "whitespace-nowrap")}>
                  {["Open Event", "Open Version", "Open Audit"].map((a) => (
                    <Button key={a} size="sm" variant="ghost" className="h-6 px-1.5 text-[10.5px]" onClick={() => onOpen(p.id, a)}>{a}</Button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------- 22. audit history */

export function AuditHistoryPanel({ audit, spotlight }: { audit: DiscoveryConfigurationAuditEvent[]; spotlight?: boolean }) {
  const [action, setAction] = useState("All");
  const rows = audit.filter((a) => action === "All" || a.action === action);
  return (
    <Panel
      id="panel-audit"
      title="Discovery Configuration Audit History"
      subtitle="Immutable record of every configuration action, actor, element, state transition and reason"
      spotlight={spotlight}
    >
      <div className="mb-2 flex flex-wrap gap-1.5">
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="h-7 w-[220px] text-[11px]" aria-label="Audit action filter"><SelectValue /></SelectTrigger>
          <SelectContent className="max-h-64">
            {["All", ...Array.from(new Set(audit.map((a) => a.action)))].map((a) => <SelectItem key={a} value={a} className="text-[12px]">{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="self-center text-[11px] text-slate-500">{rows.length} events</span>
      </div>
      <div className="max-h-[360px] overflow-auto">
        <table className="w-full min-w-[1120px] text-[11.5px]">
          <caption className="sr-only">Discovery configuration audit history</caption>
          <thead className="sticky top-0 bg-slate-50 text-slate-500">
            <tr>{["Timestamp", "Actor", "Role", "Configuration", "Version", "Element", "Previous State", "New State", "Reason", "Audit ID"].map((h) => <th key={h} scope="col" className={th}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className={td}>{a.timestamp}</td>
                <td className={td}>{a.actor}</td>
                <td className={td}>{a.actorRole}</td>
                <td className={td}>{a.configurationId}</td>
                <td className={td}>v{a.configurationVersion}</td>
                <td className={td}>{a.action}<div className="text-[10px] text-slate-500">{a.elementType} · {a.elementId}</div></td>
                <td className={td}>{a.previousState}</td>
                <td className={td}>{a.newState}</td>
                <td className={cn(td, "max-w-[220px]")}>{a.reason}</td>
                <td className={cn(td, "font-mono text-[10.5px]")}>{a.auditId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------- 23. notifications */

export function NotificationsPanel({
  notifications, onAction, onMarkAll, spotlight,
}: {
  notifications: DiscoveryConfigurationNotification[];
  onAction: (n: DiscoveryConfigurationNotification, action: string) => void;
  onMarkAll: () => void; spotlight?: boolean;
}) {
  const [type, setType] = useState("All");
  const rows = notifications.filter((n) => type === "All" || n.type === type);
  const unread = notifications.filter((n) => n.status === "Unread").length;
  return (
    <Panel
      id="panel-notifications"
      title="Notifications"
      subtitle="Validation, review, approval, activation, rollback, drift and exception notifications"
      spotlight={spotlight}
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <StatusBadge tone={unread ? "blue" : "slate"}>{unread} unread</StatusBadge>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-7 w-[220px] text-[11px]" aria-label="Notification filter"><SelectValue /></SelectTrigger>
          <SelectContent className="max-h-64">
            {["All", ...Array.from(new Set(notifications.map((n) => n.type)))].map((t) => <SelectItem key={t} value={t} className="text-[12px]">{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onMarkAll}>Mark All Read</Button>
      </div>
      <ul className="space-y-1.5">
        {rows.map((n) => (
          <li key={n.id} className={cn("rounded-md border px-2 py-1.5", n.status === "Unread" ? "border-blue-200 bg-blue-50/40" : "border-slate-200")}>
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusBadge tone={stateTone(n.severity)}>{n.severity}</StatusBadge>
              <span className="text-[11.5px] font-medium text-slate-800">{n.title}</span>
              <span className="text-[10.5px] text-slate-500">{n.type} · {n.owner} · {n.createdAt}</span>
              <Tone>{n.status}</Tone>
              <span className="ml-auto flex gap-1">
                {["Open", "Mark Read", "Assign", "Acknowledge"].map((a) => (
                  <Button key={a} size="sm" variant="ghost" className="h-6 px-1.5 text-[10.5px]" onClick={() => onAction(n, a)}>{a}</Button>
                ))}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-600">{n.description}</p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* -------------------------------------------------- 24. recent activity */

export function ActivityPanel({ activity, spotlight }: { activity: ActivityEvent[]; spotlight?: boolean }) {
  return (
    <Panel
      id="panel-activity"
      title="Recent Discovery Configuration Activity"
      subtitle="Validation, review, approval, activation, rollback, drift and exception events"
      spotlight={spotlight}
    >
      <ol className="space-y-1">
        {activity.map((a) => (
          <li key={a.id} className="flex items-start gap-2 border-l-2 border-slate-200 pl-2 text-[11.5px]">
            <span className="w-16 shrink-0 text-slate-500">{a.time}</span>
            <StatusBadge tone="slate">{a.kind}</StatusBadge>
            <span className="text-slate-700">{a.text}</span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

/* --------------------------------------------------- 25. scenario banner */

export function ScenarioBanner({ scenario, state }: { scenario: string; state: ScenarioState }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2" role="status" aria-live="polite">
      <ClipboardCheck className="h-3.5 w-3.5 text-slate-500" aria-hidden />
      <span className="text-[11px] text-slate-500">Demo scenario</span>
      <StatusBadge tone="purple">{scenario}</StatusBadge>
      <Tone>{state.serviceState}</Tone>
      {state.activationBlocked && <StatusBadge tone="red">Activation blocked</StatusBadge>}
      <span className="text-[11px] text-slate-600">{state.note}</span>
      {state.blockReason && (
        <span className="flex items-center gap-1 text-[11px] text-red-700">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> {state.blockReason}
        </span>
      )}
    </div>
  );
}

/* --------------------------------------------------- 26. governance summary */

export function GovernanceSummaryPanel({
  state, draft, onFocus, spotlight,
}: { state: ScenarioState; draft: DraftState; onFocus: (id: string) => void; spotlight?: boolean }) {
  const items: { label: string; value: string; panel: string }[] = [
    { label: "Validation score", value: `${state.validationScore} / 100`, panel: "panel-validation" },
    { label: "Open reviews", value: String(state.openReviews), panel: "panel-reviews" },
    { label: "Approval state", value: state.approvalState, panel: "panel-approvals" },
    { label: "Activation", value: state.activationStatus, panel: "panel-activation" },
    { label: "Open drift", value: String(state.driftOpen), panel: "panel-drift" },
    { label: "Exceptions", value: state.exceptionState, panel: "panel-exceptions" },
    { label: "Rules in draft", value: String(draft.rules.length), panel: "panel-rules" },
    { label: "History", value: "5 versions preserved", panel: "panel-versions" },
  ];
  return (
    <Panel
      id="panel-governance-summary"
      title="Configuration Governance State"
      subtitle="Validated, reviewed, approved, activated and reversible"
      spotlight={spotlight}
    >
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((i) => (
          <button
            key={i.label} type="button" onClick={() => onFocus(i.panel)}
            className="rounded-lg border border-slate-200 p-2 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <div className="text-[10.5px] uppercase tracking-wide text-slate-500">{i.label}</div>
            <div className="text-[14px] font-semibold text-slate-900">{i.value}</div>
          </button>
        ))}
      </div>
      <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
        <History className="h-3.5 w-3.5" aria-hidden /> Approved is not Active. Activation is a separate governed step and every prior version stays preserved.
      </p>
    </Panel>
  );
}
