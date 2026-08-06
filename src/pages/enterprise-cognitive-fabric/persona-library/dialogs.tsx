/** Team Persona Library — drawers, dialogs, wizards and overlays. */

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Drawer, Pill, Row } from "../persona-studio/primitives";
import { statusTone } from "./panels";
import {
  comparisonInsights, comparisonRows, evidenceLineage, libraryPersonas, searchCategories,
  exampleQueries, versionDiff, versionDownstream,
  type LibraryNotification, type LibraryPersona, type QualityDimension,
  type RelationshipEdge, type RelationshipNode, type StoryStep,
} from "./data";

export const PERSONA_TABS = [
  "Overview", "Mission & Scope", "Capabilities", "Products & Services", "Customers & Stakeholders",
  "Objectives & Metrics", "Constraints & Guardrails", "Dependencies", "Risks & Controls",
  "How This Team Thinks", "Evidence", "Usage", "Versions", "Audit History",
] as const;
export type PersonaTab = typeof PERSONA_TABS[number];

const List = ({ title, items }: { title: string; items: string[] }) => (
  <div className="rounded-lg border border-slate-200 p-2">
    <h4 className="text-[11px] font-semibold text-slate-800">{title}</h4>
    {items.length === 0 ? <p className="text-[11px] text-slate-500">Not recorded.</p> : (
      <ul className="mt-1 list-disc pl-4 text-[11.5px] text-slate-600">{items.map((i) => <li key={i}>{i}</li>)}</ul>
    )}
  </div>
);

export function PersonaDetailDrawer({ persona, tab, onTab, onClose, onAction, spotlightThinking, spotlightEvidence }: {
  persona: LibraryPersona | null; tab: PersonaTab; onTab: (t: PersonaTab) => void;
  onClose: () => void; onAction: (action: string, p: LibraryPersona) => void;
  spotlightThinking?: boolean; spotlightEvidence?: boolean;
}) {
  if (!persona) return null;
  const p = persona;
  const t = p.thinking;
  return (
    <Drawer
      open={!!persona} onOpenChange={(v) => { if (!v) onClose(); }} wide
      title={`${p.teamName} — ${p.id}`}
      description={p.mission}
    >
      <div className="flex flex-wrap gap-1.5">
        <Pill label={p.constructionStatus} tone={statusTone(p.constructionStatus)} />
        <Pill label={p.approvalState} tone={statusTone(p.approvalState)} />
        <Pill label={`Quality ${p.qualityScore}`} tone="blue" />
        <Pill label={`Completeness ${p.completenessScore}%`} tone="blue" />
        <Pill label={`Confidence ${p.confidence}%`} tone="blue" />
        <Pill label={p.freshnessStatus} tone={statusTone(p.freshnessStatus)} />
      </div>

      <div className="flex flex-wrap gap-1" role="tablist" aria-label="Persona detail sections">
        {PERSONA_TABS.map((x) => (
          <button
            key={x} type="button" role="tab" aria-selected={tab === x} onClick={() => onTab(x)}
            className={cn(
              "rounded border px-1.5 py-0.5 text-[10.5px]",
              tab === x ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50",
              ((x === "How This Team Thinks" && spotlightThinking) || (x === "Evidence" && spotlightEvidence)) && "ring-2 ring-blue-500",
            )}
          >{x}</button>
        ))}
      </div>

      <div className="space-y-2">
        {tab === "Overview" && (
          <dl className="rounded-lg border border-slate-200 p-2">
            <Row label="Team" value={p.teamName} />
            <Row label="Business unit" value={p.businessUnit} />
            <Row label="Knowledge domains" value={p.knowledgeDomains.join(", ")} />
            <Row label="Primary mission" value={p.mission} />
            <Row label="Persona owner" value={p.personaOwner} />
            <Row label="Team owner" value={p.teamOwner} />
            <Row label="Technical owner" value={p.technicalOwner} />
            <Row label="Approval state" value={p.approvalState} />
            <Row label="Quality" value={`${p.qualityScore} / 100`} />
            <Row label="Completeness" value={`${p.completenessScore}%`} />
            <Row label="Confidence" value={`${p.confidence}%`} />
            <Row label="Freshness" value={p.freshnessStatus} />
            <Row label="Conditions" value={p.conditionCount} />
            <Row label="Dependencies" value={p.dependencyCount} />
            <Row label="Latest review" value={p.audit[2]?.at ?? "—"} />
            <Row label="Current version" value={`${p.version} · ${p.versionStatus}`} />
          </dl>
        )}

        {tab === "Mission & Scope" && (
          <>
            <List title="Mission" items={[p.mission]} />
            <List title="Business responsibilities" items={p.responsibilities} />
            <List title="Operating boundaries" items={p.boundaries} />
            <List title="Explicit exclusions" items={p.exclusions} />
            <List title="Critical capabilities" items={p.capabilities.filter((c) => c.criticality === "Critical").map((c) => c.name)} />
          </>
        )}

        {tab === "Capabilities" && (
          <table className="w-full text-left text-[11px]">
            <caption className="sr-only">Capabilities</caption>
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
              <tr>{["Capability", "Kind", "Criticality", "Owner", "Supporting conditions"].map((h) => <th key={h} scope="col" className="px-2 py-1 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {p.capabilities.map((c) => (
                <tr key={c.name}>
                  <th scope="row" className="px-2 py-1 text-left font-medium text-slate-800">{c.name}</th>
                  <td className="px-2 py-1 text-slate-600">{c.kind}</td>
                  <td className="px-2 py-1 text-slate-600">{c.criticality}</td>
                  <td className="px-2 py-1 text-slate-600">{c.owner}</td>
                  <td className="px-2 py-1 text-slate-600">{c.conditions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "Products & Services" && (
          <>
            <List title="Products" items={p.products} />
            <div className="rounded-lg border border-slate-200 p-2">
              <h4 className="text-[11px] font-semibold text-slate-800">Services and service levels</h4>
              <ul className="mt-1 space-y-1 text-[11.5px] text-slate-600">
                {p.services.map((s) => <li key={s.name}>{s.name} — {s.criticality} — {s.slo}</li>)}
              </ul>
            </div>
            <List title="APIs" items={p.apis} />
            <List title="Systems" items={p.systems} />
            <List title="Data products" items={p.dataProducts} />
          </>
        )}

        {tab === "Customers & Stakeholders" && (
          <>
            <List title="Internal customers" items={p.internalCustomers} />
            <List title="External customers" items={p.externalCustomers} />
            <List title="Executive stakeholders" items={p.stakeholders} />
            <List title="Regulatory stakeholders" items={p.regulatoryStakeholders} />
            <List title="Partners" items={p.partners} />
            <List title="Customer journeys" items={p.customerJourneys} />
          </>
        )}

        {tab === "Objectives & Metrics" && (
          <>
            <List title="Business objectives" items={p.objectives} />
            <List title="Key results" items={p.keyResults} />
            <List title="Service level objectives" items={p.serviceLevelObjectives} />
            <table className="w-full text-left text-[11px]">
              <caption className="sr-only">Metrics with baselines, targets and thresholds</caption>
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
                <tr>{["KPI", "Baseline", "Target", "Warning threshold", "Critical threshold"].map((h) => <th key={h} scope="col" className="px-2 py-1 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {p.metrics.map((m) => (
                  <tr key={m.name}>
                    <th scope="row" className="px-2 py-1 text-left font-medium text-slate-800">{m.name}</th>
                    <td className="px-2 py-1 text-slate-600">{m.baseline}</td>
                    <td className="px-2 py-1 text-slate-600">{m.target}</td>
                    <td className="px-2 py-1 text-slate-600">{m.warning}</td>
                    <td className="px-2 py-1 text-slate-600">{m.critical}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {tab === "Constraints & Guardrails" && (
          <>
            <List title="Policies" items={p.policies} />
            <List title="Constraints" items={p.constraints} />
            <List title="Cost guardrails" items={p.costGuardrails} />
            <List title="Compliance obligations" items={p.complianceObligations} />
            <List title="Operational windows" items={p.operationalWindows} />
            <List title="Change restrictions" items={p.changeRestrictions} />
            <List title="Approval requirements" items={p.approvalRequirements} />
          </>
        )}

        {tab === "Dependencies" && (
          <table className="w-full text-left text-[11px]">
            <caption className="sr-only">Dependencies</caption>
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
              <tr>{["Dependency", "Type", "Direction", "Criticality", "Relationship confidence"].map((h) => <th key={h} scope="col" className="px-2 py-1 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {p.dependencies.map((d) => (
                <tr key={d.name}>
                  <th scope="row" className="px-2 py-1 text-left font-medium text-slate-800">{d.name}</th>
                  <td className="px-2 py-1 text-slate-600">{d.type}</td>
                  <td className="px-2 py-1 text-slate-600">{d.direction}</td>
                  <td className="px-2 py-1 text-slate-600">{d.criticality}</td>
                  <td className="px-2 py-1 text-slate-600">{d.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "Risks & Controls" && (
          <div className="space-y-2">
            {p.risks.map((r) => (
              <div key={r.risk} className="rounded-lg border border-slate-200 p-2">
                <h4 className="text-[11.5px] font-semibold text-slate-900">{r.risk}</h4>
                <dl className="mt-1">
                  <Row label="Failure mode" value={r.failureMode} />
                  <Row label="Control" value={r.control} />
                  <Row label="Mitigation" value={r.mitigation} />
                  <Row label="Escalation trigger" value={r.escalationTrigger} />
                  <Row label="Recovery expectation" value={r.recovery} />
                </dl>
              </div>
            ))}
          </div>
        )}

        {tab === "How This Team Thinks" && (
          <div id="persona-thinking" className={cn("space-y-2 rounded-lg", spotlightThinking && "ring-2 ring-blue-500 ring-offset-2")}>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-[11.5px] text-blue-900">
              Primary mission: {p.mission}
            </div>
            <List title="Decision priorities" items={t.decisionPriorities} />
            <List title="Success criteria" items={t.successCriteria} />
            <List title="Failure modes" items={t.failureModes} />
            <List title="Common tradeoffs" items={t.commonTradeoffs} />
            <List title="Preferred evidence" items={t.preferredEvidence} />
            <List title="Escalation philosophy" items={t.escalationPhilosophy} />
            <List title="Risk appetite" items={t.riskAppetite} />
          </div>
        )}

        {tab === "Evidence" && (
          <div className="space-y-2">
            {p.evidence.map((e) => (
              <div key={e.conditionId} className="rounded-lg border border-slate-200 p-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-semibold text-slate-900">{e.conditionId}</span>
                  <Pill label={e.freshness} tone={statusTone(e.freshness)} />
                </div>
                <p className="text-[11.5px] text-slate-700">{e.statement}</p>
                <p className="mt-1 border-l-2 border-slate-300 pl-2 text-[11px] italic text-slate-600">“{e.passage}”</p>
                <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-slate-500">
                  <span>{e.artifact}</span><span>Authority {e.authority}</span><span>Confidence {e.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Usage" && (
          <dl className="rounded-lg border border-slate-200 p-2">
            <Row label="Active impact evaluations" value={p.usage.impactEvaluations} />
            <Row label="Incoming work evaluated" value={p.usage.incomingWork} />
            <Row label="Decisions referencing Persona" value={p.usage.decisionReferences.toLocaleString()} />
            <Row label="Cognitive search retrievals" value={p.usage.searchRetrievals.toLocaleString()} />
            <Row label="Context graph relationships" value={p.usage.graphRelationships.toLocaleString()} />
            <Row label="Last used" value={p.usage.lastUsedAt} />
          </dl>
        )}

        {tab === "Versions" && (
          <table className="w-full text-left text-[11px]">
            <caption className="sr-only">Version history</caption>
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
              <tr>{["Version", "Status", "Effective date", "Change summary", "Approved by"].map((h) => <th key={h} scope="col" className="px-2 py-1 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {p.versions.map((v) => (
                <tr key={v.version}>
                  <th scope="row" className="px-2 py-1 text-left font-medium text-slate-800">{v.version}</th>
                  <td className="px-2 py-1"><Pill label={v.status} tone={statusTone(v.status)} /></td>
                  <td className="px-2 py-1 text-slate-600">{v.effectiveDate}</td>
                  <td className="px-2 py-1 text-slate-600">{v.changeSummary}</td>
                  <td className="px-2 py-1 text-slate-600">{v.approvedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "Audit History" && (
          <ul className="space-y-1">
            {p.audit.map((a) => (
              <li key={a.auditId} className="rounded border border-slate-200 p-2 text-[11px] text-slate-700">
                <span className="font-medium">{a.at}</span> · {a.action} · {a.actor} · {a.result} · <span className="text-slate-500">{a.auditId}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 border-t border-slate-200 pt-2">
        {["Open in Persona Construction", "Create Draft Version", "Request Review", "Refresh Persona", "Compare",
          "Open Related Conditions", "Open Context Graph", "Open Impact Analysis", "Export Persona"].map((a) => (
          <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction(a, p)}>{a}</Button>
        ))}
      </div>
    </Drawer>
  );
}

/* ---------------------------- quality detail ------------------------------ */

export function QualityDetailDrawer({ dimension, onClose, onFilter }: {
  dimension: QualityDimension | null; onClose: () => void; onFilter: () => void;
}) {
  if (!dimension) return null;
  const d = dimension;
  return (
    <Drawer open={!!dimension} onOpenChange={(v) => { if (!v) onClose(); }} title={`${d.name} — quality detail`} description={d.definition}>
      <dl className="rounded-lg border border-slate-200 p-2">
        <Row label="Current score" value={d.score} />
        <Row label="Target" value={d.target} />
        <Row label="Trend" value={d.trend.join(" → ")} />
        <Row label="Affected Personas" value={d.affected} />
        <Row label="Persona distribution" value={`${d.affected} below target, ${9 - Math.min(9, d.affected)} at or above target`} />
        <Row label="Business unit distribution" value="Commerce Engineering 3 · Risk Technology 2 · Customer Experience 2" />
        <Row label="Domain distribution" value="Payments 3 · Identity 2 · Customer Experience 2" />
      </dl>
      <List title="Affected Persona sections" items={["Constraints & Guardrails", "Dependencies", "How This Team Thinks"]} />
      <List title="Top causes" items={d.causes} />
      <List title="Evidence gaps" items={["Two constraints lack an approved condition", "One dependency lacks provenance"]} />
      <List title="Condition gaps" items={["Cost guardrail conditions not extracted for 3 teams"]} />
      <List title="Recommended actions" items={d.actions} />
      <List title="Recent changes" items={["Quality recalculated after the latest publication", "Two conditions superseded this week"]} />
      <List title="Affected active evaluations" items={["EVAL 2048 Checkout Retry Evaluation", "EVAL 2071 Identity Latency Evaluation"]} />
      <Button size="sm" className="h-7 text-[11px]" onClick={onFilter}>Filter inventory to affected Personas</Button>
    </Drawer>
  );
}

/* ------------------------------ node drawers ------------------------------- */

export function RelationshipNodeDrawer({ node, edge, onClose }: {
  node: RelationshipNode | null; edge: RelationshipEdge | null; onClose: () => void;
}) {
  const open = !!node || !!edge;
  return (
    <Drawer
      open={open} onOpenChange={(v) => { if (!v) onClose(); }}
      title={node ? node.label : edge ? `${edge.type} relationship` : ""}
      description={node ? node.summary : "Supporting conditions and evidence for this relationship"}
    >
      {node && (
        <dl className="rounded-lg border border-slate-200 p-2">
          <Row label="Type" value={node.kind} />
          <Row label="Owner" value={node.owner} />
          <Row label="Criticality" value={node.criticality} />
          <Row label="Confidence" value={`${node.confidence}%`} />
        </dl>
      )}
      {edge && (
        <>
          <dl className="rounded-lg border border-slate-200 p-2">
            <Row label="Relationship" value={edge.type} />
            <Row label="Direction" value={edge.direction} />
            <Row label="Critical" value={edge.critical ? "Yes" : "No"} />
            <Row label="Customer impact" value={edge.customerImpact ? "Yes" : "No"} />
            <Row label="Evidence" value={edge.evidence} />
          </dl>
          <List title="Supporting conditions" items={edge.conditions} />
        </>
      )}
    </Drawer>
  );
}

export function LineageNodeDrawer({ node, onClose }: {
  node: typeof evidenceLineage[number] | null; onClose: () => void;
}) {
  if (!node) return null;
  return (
    <Drawer open onOpenChange={(v) => { if (!v) onClose(); }} title={`${node.recordId} — ${node.stage}`} description={node.title}>
      <dl className="rounded-lg border border-slate-200 p-2">
        <Row label="Record type" value={node.type} />
        <Row label="Owner" value={node.owner} />
        <Row label="Authority" value={node.authority} />
        <Row label="Confidence" value={`${node.confidence}%`} />
        <Row label="Freshness" value={node.freshness} />
        <Row label="Version" value={node.version} />
        <Row label="Access classification" value={node.classification} />
      </dl>
    </Drawer>
  );
}

/* ------------------------------- comparison -------------------------------- */

export function ComparisonDialog({ open, onOpenChange, selectedIds, onSelectedIds, onAction }: {
  open: boolean; onOpenChange: (v: boolean) => void; selectedIds: string[];
  onSelectedIds: (ids: string[]) => void; onAction: (a: string) => void;
}) {
  const personas = libraryPersonas.filter((p) => selectedIds.includes(p.id));
  const toggle = (id: string) => {
    if (selectedIds.includes(id)) { if (selectedIds.length > 2) onSelectedIds(selectedIds.filter((x) => x !== id)); }
    else if (selectedIds.length < 4) onSelectedIds([...selectedIds, id]);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Persona Comparison</DialogTitle>
          <DialogDescription className="text-[12px]">
            Compare 2 to 4 Team Personas across operating model, decision logic and governance.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5">
          {libraryPersonas.map((p) => (
            <button
              key={p.id} type="button" aria-pressed={selectedIds.includes(p.id)} onClick={() => toggle(p.id)}
              className={cn("rounded border px-2 py-1 text-[10.5px]", selectedIds.includes(p.id) ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
            >{p.teamName}</button>
          ))}
        </div>

        <div className="mt-2 space-y-1">
          {comparisonInsights.map((i, idx) => (
            <p key={idx} className={cn("rounded border px-2 py-1 text-[11.5px]",
              i.tone === "red" ? "border-red-200 bg-red-50 text-red-800"
                : i.tone === "amber" ? "border-amber-200 bg-amber-50 text-amber-800"
                  : i.tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-blue-200 bg-blue-50 text-blue-800")}
            >{i.text}</p>
          ))}
        </div>

        <div className="mt-2 overflow-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-[11px]">
            <caption className="sr-only">Persona comparison matrix</caption>
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-2 py-1.5 font-semibold">Attribute</th>
                {personas.map((p) => <th key={p.id} scope="col" className="px-2 py-1.5 font-semibold">{p.teamName}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonRows.map((r) => {
                const values = personas.map((p) => r.get(p));
                const shared = values.length > 1 && values.every((v) => v === values[0]);
                return (
                  <tr key={r.label} className={shared ? "bg-emerald-50/40" : undefined}>
                    <th scope="row" className="whitespace-nowrap px-2 py-1.5 text-left font-medium text-slate-800">{r.label}</th>
                    {values.map((v, i) => <td key={i} className="max-w-[280px] px-2 py-1.5 align-top text-slate-600">{v}</td>)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <DialogFooter className="flex-wrap gap-1.5">
          {["Open Shared Conditions", "Open Dependency Paths", "Open Cross Team Impact Matrix", "Export Comparison"].map((a) => (
            <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction(a)}>{a}</Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- version comparison ---------------------------- */

export function VersionComparisonDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [from, setFrom] = useState("v3.3");
  const [to, setTo] = useState("v3.4");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Persona Version Comparison</DialogTitle>
          <DialogDescription className="text-[12px]">Payments Platform {from} versus {to}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2 text-[11px]">
          <label className="flex items-center gap-1">Previous
            <select value={from} onChange={(e) => setFrom(e.target.value)} className="h-6 rounded border border-slate-200 px-1">
              {["v3.2", "v3.3"].map((v) => <option key={v}>{v}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-1">Current
            <select value={to} onChange={(e) => setTo(e.target.value)} className="h-6 rounded border border-slate-200 px-1">
              {["v3.4", "v3.5"].map((v) => <option key={v}>{v}</option>)}
            </select>
          </label>
        </div>
        <div className="overflow-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-[11px]">
            <caption className="sr-only">Version differences</caption>
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>{["Section", "Previous", "Current", "Change"].map((h) => <th key={h} scope="col" className="px-2 py-1.5 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {versionDiff.map((r) => (
                <tr key={r.section} className={r.change === "Unchanged" ? undefined : "bg-amber-50/40"}>
                  <th scope="row" className="px-2 py-1.5 text-left font-medium text-slate-800">{r.section}</th>
                  <td className="px-2 py-1.5 text-slate-600">{r.previous}</td>
                  <td className="px-2 py-1.5 text-slate-600">{r.current}</td>
                  <td className="px-2 py-1.5">
                    <Pill
                      label={r.change}
                      tone={r.change === "Added" ? "green" : r.change === "Removed" ? "red" : r.change === "Changed" ? "amber" : "slate"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
          <h4 className="text-[11px] font-semibold text-slate-800">Downstream impact</h4>
          <ul className="mt-1 list-disc pl-4 text-[11.5px] text-slate-600">{versionDownstream.map((d) => <li key={d}>{d}</li>)}</ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ refresh wizard ----------------------------- */

const REFRESH_STEPS = [
  "Loading Current Persona", "Loading Changed Conditions", "Comparing State", "Refreshing Persona Sections",
  "Rebuilding Relationships", "Recalculating Quality", "Assessing Downstream Impact", "Creating Draft Version", "Completed",
];

export function RefreshPersonaDialog({ open, onOpenChange, personaName, onComplete }: {
  open: boolean; onOpenChange: (v: boolean) => void; personaName: string; onComplete: () => void;
}) {
  const [step, setStep] = useState(1);
  const [scope, setScope] = useState("All Changed Conditions");
  const [options, setOptions] = useState<string[]>(["Preserve Approved Manual Edits", "Recalculate Quality"]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => { if (!open) { setStep(1); setProgress(0); setDone(false); } }, [open]);
  useEffect(() => {
    if (step !== 4 || done) return;
    const timer = window.setInterval(() => {
      setProgress((p) => {
        if (p >= REFRESH_STEPS.length - 1) { window.clearInterval(timer); setDone(true); return p; }
        return p + 1;
      });
    }, 320);
    return () => window.clearInterval(timer);
  }, [step, done]);

  const toggleOption = (o: string) =>
    setOptions((s) => s.includes(o) ? s.filter((x) => x !== o) : [...s, o]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Refresh Persona — {personaName}</DialogTitle>
          <DialogDescription className="text-[12px]">Step {step} of 4</DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <fieldset className="space-y-1.5">
            <legend className="text-[11.5px] font-semibold text-slate-800">Refresh scope</legend>
            {["All Changed Conditions", "Selected Conditions", "Relationships Only", "Ownership Only", "Evidence Only", "Full Persona Rebuild"].map((s) => (
              <label key={s} className="flex items-center gap-2 text-[11.5px] text-slate-700">
                <input type="radio" name="scope" checked={scope === s} onChange={() => setScope(s)} />{s}
              </label>
            ))}
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className="space-y-1.5">
            <legend className="text-[11.5px] font-semibold text-slate-800">Options</legend>
            {["Preserve Approved Manual Edits", "Preserve Known Exceptions", "Reevaluate Conflicts", "Recalculate Dependencies",
              "Recalculate Quality", "Recalculate Freshness", "Recalculate Downstream Impact"].map((o) => (
              <label key={o} className="flex items-center gap-2 text-[11.5px] text-slate-700">
                <Checkbox checked={options.includes(o)} onCheckedChange={() => toggleOption(o)} aria-label={o} />{o}
              </label>
            ))}
          </fieldset>
        )}

        {step === 3 && (
          <dl className="rounded-lg border border-slate-200 p-2">
            <Row label="Changed conditions" value="14" />
            <Row label="Affected sections" value="Service Levels, Approval Requirements, Dependencies" />
            <Row label="Relationships" value="6 relationships recalculated" />
            <Row label="Potential conflicts" value="1 latency conflict with Identity Engineering" />
            <Row label="Potential version change" value="Draft v3.5" />
            <Row label="Affected evaluations" value="2" />
            <Row label="Affected decisions" value="1" />
            <Row label="Scope" value={scope} />
            <Row label="Options" value={options.join(", ") || "None"} />
          </dl>
        )}

        {step === 4 && (
          <div className="space-y-2">
            <Progress value={(progress / (REFRESH_STEPS.length - 1)) * 100} aria-label="Refresh progress" />
            <ol className="space-y-1 text-[11.5px]">
              {REFRESH_STEPS.map((s, i) => (
                <li key={s} className={cn("flex items-center gap-2", i <= progress ? "text-slate-800" : "text-slate-400")}>
                  <span aria-hidden>{i < progress ? "✓" : i === progress ? "•" : "○"}</span>{s}
                </li>
              ))}
            </ol>
            {done && (
              <dl className="rounded-lg border border-emerald-200 bg-emerald-50 p-2">
                <Row label="Sections updated" value="3" />
                <Row label="Conditions added" value="9" />
                <Row label="Conditions removed" value="2" />
                <Row label="Relationships changed" value="6" />
                <Row label="Conflicts created" value="1" />
                <Row label="Review tasks created" value="2" />
                <Row label="Evaluations flagged" value="2" />
                <Row label="Draft version" value="v3.5" />
              </dl>
            )}
          </div>
        )}

        <DialogFooter className="flex-wrap gap-1.5">
          {step > 1 && step < 4 && <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setStep(step - 1)}>Back</Button>}
          {step < 4 && <Button size="sm" className="h-7 text-[11px]" onClick={() => setStep(step + 1)}>{step === 3 ? "Execute" : "Next"}</Button>}
          {step === 4 && done && (
            <>
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { onComplete(); onOpenChange(false); }}>Open Updated Persona</Button>
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { onComplete(); onOpenChange(false); }}>Compare Version</Button>
              <Button size="sm" className="h-7 text-[11px]" onClick={() => { onComplete(); onOpenChange(false); }}>Submit for Review</Button>
              <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => onOpenChange(false)}>Close</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------- export ---------------------------------- */

const EXPORT_OPTIONS = [
  "Include Mission", "Include Capabilities", "Include Products & Services", "Include Customers",
  "Include Objectives & Metrics", "Include Constraints", "Include Dependencies", "Include Risks & Controls",
  "Include Decision Logic", "Include How This Team Thinks", "Include Conditions", "Include Evidence References",
  "Include Quality", "Include Confidence", "Include Freshness", "Include Versions", "Include Approval History", "Include Usage",
];

export function ExportLibraryDialog({ open, onOpenChange, rows, selected, onExport }: {
  open: boolean; onOpenChange: (v: boolean) => void; rows: LibraryPersona[]; selected: LibraryPersona[];
  onExport: (format: string, scope: string, options: string[], data: LibraryPersona[]) => void;
}) {
  const [format, setFormat] = useState("CSV");
  const [scope, setScope] = useState("Current Filtered View");
  const [options, setOptions] = useState<string[]>(["Include Mission", "Include Decision Logic", "Include Quality"]);

  const data = useMemo(() => {
    if (scope === "Selected Personas") return selected;
    if (scope === "Approved Personas") return libraryPersonas.filter((p) => p.constructionStatus === "Approved");
    if (scope === "Review Required") return libraryPersonas.filter((p) => p.constructionStatus === "Review Required");
    if (scope === "Draft Personas") return libraryPersonas.filter((p) => p.constructionStatus === "Draft");
    if (scope === "Full Persona Library") return libraryPersonas;
    return rows;
  }, [scope, rows, selected]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Export Library</DialogTitle>
          <DialogDescription className="text-[12px]">Generate a local export of approved Persona context.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-[11.5px] text-slate-700">Format
            <select value={format} onChange={(e) => setFormat(e.target.value)} className="mt-0.5 h-7 w-full rounded border border-slate-200 px-1 text-[11.5px]">
              {["CSV", "JSON", "YAML", "PDF Summary", "Presentation Snapshot"].map((f) => <option key={f}>{f}</option>)}
            </select>
          </label>
          <label className="text-[11.5px] text-slate-700">Scope
            <select value={scope} onChange={(e) => setScope(e.target.value)} className="mt-0.5 h-7 w-full rounded border border-slate-200 px-1 text-[11.5px]">
              {["Current Persona", "Selected Personas", "Current Filtered View", "Approved Personas", "Review Required",
                "Draft Personas", "Persona Quality Summary", "Relationship Summary", "Persona Usage Summary", "Full Persona Library"]
                .map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <fieldset className="grid gap-1 sm:grid-cols-2">
          <legend className="text-[11.5px] font-semibold text-slate-800">Options</legend>
          {EXPORT_OPTIONS.map((o) => (
            <label key={o} className="flex items-center gap-2 text-[11px] text-slate-700">
              <Checkbox
                checked={options.includes(o)} aria-label={o}
                onCheckedChange={() => setOptions((s) => s.includes(o) ? s.filter((x) => x !== o) : [...s, o])}
              />{o}
            </label>
          ))}
        </fieldset>
        <DialogFooter>
          <span className="mr-auto text-[11px] text-slate-500">{data.length} Personas in scope</span>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-7 text-[11px]" onClick={() => { onExport(format, scope, options, data); onOpenChange(false); }}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ global search ------------------------------ */

export function GlobalSearchDialog({ open, onOpenChange, onOpenPersona }: {
  open: boolean; onOpenChange: (v: boolean) => void; onOpenPersona: (p: LibraryPersona) => void;
}) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("Team Personas");
  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    return libraryPersonas
      .filter((p) => !query || [p.teamName, p.mission, p.id, ...p.services.map((s) => s.name), ...p.dependencies.map((d) => d.name),
        ...p.thinking.decisionPriorities, p.freshnessStatus, p.approvalState].join(" ").toLowerCase().includes(query))
      .slice(0, 12);
  }, [q]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Search the Team Persona Library</DialogTitle>
          <DialogDescription className="text-[12px]">Search Personas, teams, services, conditions, evidence and decisions.</DialogDescription>
        </DialogHeader>
        <input
          value={q} onChange={(e) => setQ(e.target.value)} autoFocus aria-label="Search query"
          placeholder="Personas dependent on Identity Services"
          className="h-8 w-full rounded-md border border-slate-200 px-2 text-[12px] focus:border-blue-400 focus:outline-none"
        />
        <div className="flex flex-wrap gap-1">
          {searchCategories.map((c) => (
            <button
              key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)}
              className={cn("rounded border px-1.5 py-0.5 text-[10px]", category === c ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600")}
            >{c}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1 text-[10.5px] text-slate-500">
          {exampleQueries.map((e) => (
            <button key={e} type="button" onClick={() => setQ(e)} className="rounded border border-dashed border-slate-300 px-1.5 py-0.5 hover:bg-slate-50">{e}</button>
          ))}
        </div>
        <div className="overflow-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-[11px]">
            <caption className="sr-only">Search results</caption>
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>{["Result Type", "Persona or Record", "Team", "Relevant Section", "Status", "Quality", "Confidence", "Freshness", "Action"].map((h) => (
                <th key={h} scope="col" className="px-2 py-1.5 font-semibold">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <th scope="row" className="px-2 py-1.5 text-left font-medium text-slate-800">{category}</th>
                  <td className="px-2 py-1.5 text-slate-700">{p.id}</td>
                  <td className="px-2 py-1.5 text-slate-700">{p.teamName}</td>
                  <td className="px-2 py-1.5 text-slate-600">{category === "Dependencies" ? "Dependencies" : "Overview"}</td>
                  <td className="px-2 py-1.5"><Pill label={p.constructionStatus} tone={statusTone(p.constructionStatus)} /></td>
                  <td className="px-2 py-1.5 text-slate-600">{p.qualityScore}</td>
                  <td className="px-2 py-1.5 text-slate-600">{p.confidence}%</td>
                  <td className="px-2 py-1.5 text-slate-600">{p.freshnessStatus}</td>
                  <td className="px-2 py-1.5">
                    <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => { onOpenPersona(p); onOpenChange(false); }}>Open</Button>
                  </td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr><td colSpan={9} className="px-2 py-3 text-center text-[11.5px] text-slate-500">No records match this query.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ notifications ------------------------------ */

export function NotificationDrawer({ open, onOpenChange, notifications, onMarkAll, onMarkRead, onAction }: {
  open: boolean; onOpenChange: (v: boolean) => void; notifications: LibraryNotification[];
  onMarkAll: () => void; onMarkRead: (id: string) => void; onAction: (n: LibraryNotification, action: string) => void;
}) {
  const [filter, setFilter] = useState("All");
  const categories = ["All", ...Array.from(new Set(notifications.map((n) => n.category)))];
  const rows = notifications.filter((n) => filter === "All" || n.category === filter);
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="Notifications" description="Persona lifecycle and governance events">
      <div className="flex flex-wrap items-center gap-1.5">
        <Bell className="h-3.5 w-3.5 text-slate-500" aria-hidden />
        <select aria-label="Filter notifications" value={filter} onChange={(e) => setFilter(e.target.value)} className="h-6 rounded border border-slate-200 px-1 text-[10.5px]">
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <Button size="sm" variant="outline" className="ml-auto h-6 text-[10.5px]" onClick={onMarkAll}>Mark all read</Button>
      </div>
      <ul className="space-y-1.5">
        {rows.map((n) => (
          <li key={n.id} className={cn("rounded border p-2 text-[11px]", n.read ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50/50")}>
            <div className="flex items-center justify-between gap-2">
              <Pill label={n.category} tone={n.tone} />
              <span className="text-[10px] text-slate-500">{n.at}</span>
            </div>
            <div className="mt-1 font-semibold text-slate-900">{n.title}</div>
            <div className="text-slate-600">{n.detail}</div>
            <div className="mt-1 flex flex-wrap gap-1">
              <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onMarkRead(n.id)}>Mark Read</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onAction(n, "Open Item")}>Open Item</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onAction(n, "Assign")}>Assign</Button>
              <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onAction(n, "Acknowledge")}>Acknowledge</Button>
            </div>
          </li>
        ))}
      </ul>
    </Drawer>
  );
}

/* -------------------------------- demo story ------------------------------- */

export function DemoStoryOverlay({ step, index, total, onNext, onPrev, onExit, notes, onToggleNotes }: {
  step: StoryStep; index: number; total: number; onNext: () => void; onPrev: () => void;
  onExit: () => void; notes: boolean; onToggleNotes: () => void;
}) {
  return (
    <div role="dialog" aria-label="Demo story" className="fixed bottom-4 left-1/2 z-50 w-[min(680px,92vw)] -translate-x-1/2 rounded-xl border border-slate-300 bg-white p-3 shadow-xl motion-safe:transition-all">
      <div className="flex items-center justify-between text-[10.5px] text-slate-500">
        <span>Step {index + 1} of {total}</span>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="h-6 text-[10.5px]" onClick={onToggleNotes} aria-pressed={notes}>Presenter Notes</Button>
          <Button size="sm" variant="ghost" className="h-6 text-[10.5px]" onClick={onExit}>Exit Story</Button>
        </div>
      </div>
      <div className="mt-1 h-1 w-full rounded bg-slate-100">
        <div className="h-1 rounded bg-blue-600 motion-safe:transition-all" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>
      <p className="mt-2 text-[12.5px] text-slate-800">{step.caption}</p>
      {notes && <p className="mt-1 rounded bg-slate-50 p-2 text-[11px] text-slate-600">{step.notes}</p>}
      <div className="mt-2 flex justify-end gap-1.5">
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onPrev} disabled={index === 0}>Previous</Button>
        <Button size="sm" className="h-7 text-[11px]" onClick={onNext} disabled={index === total - 1}>Next</Button>
      </div>
    </div>
  );
}

/* ------------------------------- bulk actions ------------------------------ */

export function BulkActionDialog({ open, onOpenChange, action, count, onConfirm }: {
  open: boolean; onOpenChange: (v: boolean) => void; action: string; count: number; onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px]">{action}</DialogTitle>
          <DialogDescription className="text-[12px]">
            {count} Personas selected. Downstream impact: {count * 2} impact evaluations and {count * 3} decision references may require reassessment.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-7 text-[11px]" onClick={() => { onConfirm(); onOpenChange(false); }}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
