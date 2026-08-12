/** Cloud FinOps Persona Attribute Store — panels. */
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pill, Row, type Tone } from "../persona-studio/primitives";
import { Panel } from "../persona-library/panels";
import {
  applicabilityIndex, attributeById, canonicalRecord, contractExample, contractFields,
  decompositionStages, fopDisplay, graphEdges, graphNodes, personaIdentity, policyBindings,
  publicationDestinations, relevanceValues, schemaSql, schemaTables, sourceDocument,
  validationDimensions, validationIssues, workTypeMappings,
  type ActivityEntry, type PersonaAttribute, type PolicyBinding, type RetrievalCandidate,
  type StoreKpi, type ValidationIssue,
} from "./data";

export const toneForState = (s: string): Tone =>
  ["Valid", "Approved", "Published", "Bound", "Healthy", "Structured", "Resolved"].includes(s) ? "green"
    : ["Warning", "Review Required", "Attention", "In Review", "Acknowledged", "Open"].includes(s) ? "amber"
      : ["Critical", "Blocked", "Unresolved", "Risk"].includes(s) ? "red"
        : ["Draft", "Superseded", "Low"].includes(s) ? "slate" : "blue";

/* --------------------------------- KPIs ---------------------------------- */

export function KpiRow({ kpis, active, onSelect }: {
  kpis: StoreKpi[]; active: string | null; onSelect: (k: StoreKpi) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7" role="list" aria-label="Attribute store key metrics">
      {kpis.map((k) => (
        <button
          key={k.id} type="button" role="listitem" title={k.tooltip}
          onClick={() => onSelect(k)}
          aria-pressed={active === k.id}
          className={cn(
            "rounded-xl border bg-white p-2.5 text-left shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            active === k.id ? "border-blue-400 ring-1 ring-blue-300" : "border-slate-200 hover:border-blue-300",
          )}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{k.label}</span>
            <Pill label={k.status} tone={toneForState(k.status)} />
          </div>
          <div className="mt-1 text-[19px] font-semibold leading-none text-slate-900">{k.value}</div>
          <p className="mt-1 line-clamp-2 text-[10.5px] text-slate-500">{k.support}</p>
          <p className="mt-0.5 text-[10px] text-slate-400">{k.trend}</p>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ Source panel ------------------------------ */

export function SourceDocumentPanel({ spotlight, onRunDecomposition, onOpenStructure }: {
  spotlight?: boolean; onRunDecomposition: () => void; onOpenStructure: () => void;
}) {
  return (
    <Panel
      id="panel-source" spotlight={spotlight}
      title="Source Stakeholder Attribute Sheet"
      subtitle="Human readable persona artifact — parsed, hashed, and version tracked"
      actions={
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onOpenStructure}>View Parsed Structure</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]">Compare Source Version</Button>
          <Button size="sm" className="h-7 text-[11px]" onClick={onRunDecomposition}>Run Decomposition</Button>
        </div>
      }
    >
      <div className="grid gap-3 lg:grid-cols-3">
        <dl className="lg:col-span-1">
          <Row label="Document" value={sourceDocument.name} />
          <Row label="Version" value={sourceDocument.version} />
          <Row label="Persona ID" value={sourceDocument.personaId} />
          <Row label="Pages" value={sourceDocument.pages} />
          <Row label="Source Type" value={sourceDocument.sourceType} />
          <Row label="Status" value={<Pill label={sourceDocument.status} tone="green" />} />
        </dl>
        <dl className="lg:col-span-1">
          <Row label="Source Hash" value={<span className="font-mono text-[10.5px]">{sourceDocument.hash}</span>} />
          <Row label="Created" value={sourceDocument.created} />
          <Row label="Owner" value={sourceDocument.owner} />
          <Row label="Evidence Provenance" value={sourceDocument.provenanceState} />
          <Row label="Access Classification" value={sourceDocument.accessClassification} />
          <Row label="Mission" value={<span className="text-[11px] font-normal">{personaIdentity.mission}</span>} />
        </dl>
        <div className="lg:col-span-1">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Parsed sections ({sourceDocument.sections.length})</p>
          <ul className="flex flex-wrap gap-1">
            {sourceDocument.sections.map((s) => (
              <li key={s}><Pill label={s} tone="slate" /></li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}

/* --------------------------- Decomposition panel -------------------------- */

export function DecompositionPanel({ spotlight, onInspect, running }: {
  spotlight?: boolean; onInspect: (stageId: string) => void; running?: boolean;
}) {
  return (
    <Panel
      id="panel-decomposition" spotlight={spotlight}
      title="Persona Attribute Decomposition"
      subtitle="Source Sections → Candidate Statements → Attribute Classification → Atomic Records → Evidence → Applicability → Policy Resolution → Relationships → Validation"
      actions={running ? <Pill label="Decomposition running" tone="blue" /> : <Pill label="Decomposition complete" tone="green" />}
    >
      <p className="sr-only">
        Decomposition pipeline text summary: {decompositionStages.map((s) => `${s.name}: ${s.processed} processed, ${s.accepted} accepted, ${s.needsReview} needing review`).join("; ")}.
      </p>
      <ol className="grid gap-2 md:grid-cols-4 xl:grid-cols-8">
        {decompositionStages.map((s, i) => (
          <li key={s.id}>
            <button
              type="button" onClick={() => onInspect(s.id)}
              className="h-full w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-left hover:border-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-400">Stage {i + 1}</span>
              <div className="text-[11.5px] font-semibold text-slate-900">{s.name}</div>
              <div className="mt-1 text-[17px] font-semibold leading-none text-slate-900">{s.processed}</div>
              <div className="mt-1 text-[10px] text-slate-500">
                Accepted {s.accepted} · Review {s.needsReview} · Rejected {s.rejected}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400">Confidence {(s.confidence * 100).toFixed(0)}%</div>
            </button>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

/* ----------------------------- Attribute registry ------------------------- */

export interface RegistryFilters {
  search: string; category: string; type: string; severity: string; response: string;
  evidence: string; policy: string; applicability: string; confidence: string; validation: string; version: string;
}

export const emptyFilters: RegistryFilters = {
  search: "", category: "All", type: "All", severity: "All", response: "All",
  evidence: "All", policy: "All", applicability: "All", confidence: "All", validation: "All", version: "All",
};

export function AttributeRegistryPanel({
  attributes, filters, onFilters, onOpen, density, onDensity, spotlight, onExport, hidden, onToggleColumn,
}: {
  attributes: PersonaAttribute[]; filters: RegistryFilters; onFilters: (f: RegistryFilters) => void;
  onOpen: (a: PersonaAttribute) => void; density: "compact" | "standard"; onDensity: (d: "compact" | "standard") => void;
  spotlight?: boolean; onExport: () => void; hidden: Set<string>; onToggleColumn: (k: string) => void;
}) {
  const [showColumns, setShowColumns] = useState(false);
  const pad = density === "compact" ? "py-1" : "py-2";
  const set = (patch: Partial<RegistryFilters>) => onFilters({ ...filters, ...patch });

  const columns: { key: string; label: string; get: (a: PersonaAttribute) => React.ReactNode }[] = [
    { key: "id", label: "Attribute ID", get: (a) => <span className="font-mono text-[10.5px] font-semibold text-slate-900">{a.id}</span> },
    { key: "category", label: "Category", get: (a) => a.category },
    { key: "name", label: "Attribute Name", get: (a) => <span className="font-medium text-slate-900">{a.name}</span> },
    { key: "type", label: "Attribute Type", get: (a) => a.primaryType },
    { key: "statement", label: "Statement", get: (a) => <span className="line-clamp-2">{a.statement}</span> },
    { key: "subject", label: "Subject", get: (a) => <span className="font-mono text-[10px]">{a.subject}</span> },
    { key: "condition", label: "Condition", get: (a) => <span className="line-clamp-1 font-mono text-[10px]">{a.conditionExpression}</span> },
    { key: "operator", label: "Operator", get: (a) => a.operator },
    { key: "base", label: "Base Value", get: (a) => a.baseValue ?? "—" },
    { key: "target", label: "Target Value", get: (a) => a.targetValue ?? "—" },
    { key: "policy", label: "Policy Variable", get: (a) => a.policyVariable ? <span className="font-mono text-[10px]">{a.policyVariable}</span> : "—" },
    { key: "severity", label: "Severity", get: (a) => <Pill label={a.severity} tone={toneForState(a.severity)} /> },
    { key: "response", label: "Default Response", get: (a) => a.defaultResponse },
    { key: "evidence", label: "Evidence Requirement", get: (a) => `${a.evidence.filter((e) => e.required).length} required · ${a.evidence.length} total` },
    { key: "worktypes", label: "Work Type Applicability", get: (a) => <span className="line-clamp-1">{a.applicability.workTypes.join(", ")}</span> },
    { key: "section", label: "Persona Section", get: (a) => a.provenance.sourceSection },
    { key: "confidence", label: "Confidence", get: (a) => a.confidence.toFixed(2) },
    { key: "validation", label: "Validation State", get: (a) => <Pill label={a.validationState} tone={toneForState(a.validationState)} /> },
    { key: "version", label: "Version", get: (a) => a.version },
  ];
  const visible = columns.filter((c) => !hidden.has(c.key));

  return (
    <Panel
      id="panel-registry" spotlight={spotlight}
      title="Cloud FinOps Attribute Registry"
      subtitle={`${attributes.length} individually addressable atomic attributes match the current filters`}
      actions={
        <div className="flex flex-wrap items-center gap-1.5">
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setShowColumns((v) => !v)} aria-expanded={showColumns}>Column Selector</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onDensity(density === "compact" ? "standard" : "compact")}>
            Density: {density === "compact" ? "Compact" : "Standard"}
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onExport}>Export Current View</Button>
        </div>
      }
    >
      <div className="mb-2 flex flex-wrap items-end gap-2">
        <label className="flex min-w-[220px] flex-1 flex-col gap-0.5">
          <span className="sr-only">Search attributes</span>
          <input
            value={filters.search} onChange={(e) => set({ search: e.target.value })}
            placeholder="Search attributes, statements, policy variables, work types"
            className="h-7 w-full rounded-md border border-slate-200 bg-white px-2 text-[11.5px] text-slate-700 focus:border-blue-400 focus:outline-none"
          />
        </label>
        {([
          ["category", ["All", ...Array.from(new Set(attributes.map((a) => a.category))).sort()]],
          ["type", ["All", ...Array.from(new Set(attributes.map((a) => a.primaryType))).sort()]],
          ["severity", ["All", "Critical", "High", "Medium", "Low"]],
          ["response", ["All", "Blocked", "Approval Required", "Evidence Required", "Review Required", "Advisory", "Informational", "Exception Required", "Reassessment Required"]],
          ["evidence", ["All", "Has required evidence", "No required evidence"]],
          ["policy", ["All", "Bound", "Unbound", "Unresolved"]],
          ["applicability", ["All", ...workTypeMappings.map((w) => w.workType)]],
          ["confidence", ["All", "≥ 0.95", "0.90 – 0.95", "< 0.90"]],
          ["validation", ["All", "Valid", "Warning", "Review Required"]],
          ["version", ["All", "1.0"]],
        ] as [keyof RegistryFilters, string[]][]).map(([key, options]) => (
          <label key={key} className="flex flex-col gap-0.5">
            <span className="text-[9.5px] font-medium uppercase tracking-wide text-slate-500">{key}</span>
            <select
              value={filters[key] as string} onChange={(e) => set({ [key]: e.target.value } as Partial<RegistryFilters>)}
              className={cn("h-7 max-w-[150px] rounded-md border px-1.5 text-[11px] text-slate-700 focus:border-blue-400 focus:outline-none",
                filters[key] !== "All" ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white")}
            >
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        ))}
        <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => onFilters(emptyFilters)}>Clear</Button>
      </div>

      {showColumns && (
        <div className="mb-2 flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
          {columns.map((c) => (
            <label key={c.key} className="flex items-center gap-1 text-[10.5px] text-slate-600">
              <input type="checkbox" checked={!hidden.has(c.key)} onChange={() => onToggleColumn(c.key)} />
              {c.label}
            </label>
          ))}
        </div>
      )}

      {attributes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-[12px] text-slate-500">
          No attributes match the current filters.
          <Button size="sm" variant="outline" className="ml-2 h-6 text-[11px]" onClick={() => onFilters(emptyFilters)}>Clear filters</Button>
        </div>
      ) : (
        <>
          <div className="hidden max-h-[520px] overflow-auto rounded-lg border border-slate-200 md:block">
            <table className="w-full text-left text-[11px]">
              <caption className="sr-only">Cloud FinOps attribute registry, {attributes.length} rows</caption>
              <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                <tr>
                  {visible.map((c) => <th key={c.key} scope="col" className="whitespace-nowrap px-2 py-1.5 font-semibold">{c.label}</th>)}
                  <th scope="col" className="px-2 py-1.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attributes.map((a) => (
                  <tr
                    key={a.id}
                    id={`row-${a.id}`}
                    className={cn(
                      "cursor-pointer align-top",
                      a.id === "FOP-081" || a.id === "FOP-082"
                        ? "bg-amber-100 hover:bg-amber-200"
                        : "hover:bg-slate-50",
                    )}
                    onClick={() => onOpen(a)}
                  >
                    {visible.map((c) => (
                      <td key={c.key} className={cn("max-w-[240px] px-2 text-slate-700", pad)}>{c.get(a)}</td>
                    ))}
                    <td className={cn("whitespace-nowrap px-2", pad)} onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onOpen(a)} aria-label={`Open ${a.id} ${a.name}`}>Open</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-2 md:hidden" aria-label="Attribute cards">
            {attributes.map((a) => (
              <li key={a.id}>
                <button type="button" onClick={() => onOpen(a)} className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-left hover:border-blue-300">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-semibold text-slate-900">{a.id}</span>
                    <Pill label={a.validationState} tone={toneForState(a.validationState)} />
                  </div>
                  <div className="text-[12px] font-semibold text-slate-900">{a.name}</div>
                  <p className="mt-0.5 text-[11px] text-slate-600">{a.statement}</p>
                  <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-slate-500">
                    <span>{a.category}</span><span>{a.primaryType}</span><span>{a.severity}</span><span>{a.defaultResponse}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </Panel>
  );
}

/* --------------------------- Attribute detail ----------------------------- */

export function AttributeDetail({ attribute, onBind }: { attribute: PersonaAttribute; onBind: (v: string) => void }) {
  const binding = policyBindings.find((p) => p.variable === attribute.policyVariable);
  const json = useMemo(() => JSON.stringify(canonicalRecord(attribute), null, 2), [attribute]);
  const [copied, setCopied] = useState(false);

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <Pill label={attribute.category} tone="blue" />
        <Pill label={attribute.primaryType} tone="slate" />
        <Pill label={attribute.status} tone={toneForState(attribute.status)} />
        <Pill label={`Confidence ${attribute.confidence.toFixed(2)}`} tone="slate" />
        <Pill label={`v${attribute.version}`} tone="slate" />
      </div>
      <Tabs defaultValue="definition">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-slate-100">
          {["definition", "logic", "evidence", "applicability", "relationships", "policy", "provenance", "usage", "history", "canonical"].map((t) => (
            <TabsTrigger key={t} value={t} className="text-[11px] capitalize">{t === "canonical" ? "Canonical Record" : t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="definition" className="mt-2">
          <dl>
            <Row label="Statement" value={<span className="font-normal">{attribute.statement}</span>} />
            <Row label="Purpose" value={<span className="font-normal">{attribute.purpose}</span>} />
            <Row label="Why FinOps cares" value={<span className="font-normal">{attribute.whyFinOpsCares}</span>} />
            <Row label="Default response" value={attribute.defaultResponse} />
            <Row label="Severity" value={<Pill label={attribute.severity} tone={toneForState(attribute.severity)} />} />
            <Row label="Secondary types" value={attribute.secondaryTypes.join(", ") || "—"} />
          </dl>
        </TabsContent>

        <TabsContent value="logic" className="mt-2">
          <dl>
            <Row label="Subject" value={<span className="font-mono text-[11px]">{attribute.subject}</span>} />
            <Row label="Predicate" value={<span className="font-mono text-[11px]">{attribute.predicate}</span>} />
            <Row label="Operator" value={attribute.operator} />
            <Row label="Base value" value={String(attribute.baseValue ?? "null")} />
            <Row label="Target value" value={String(attribute.targetValue ?? "null")} />
            <Row label="Threshold" value={attribute.policyVariable ? `Policy bound — ${attribute.policyVariable}` : "Not threshold bound"} />
            <Row label="Unit" value={attribute.unit ?? "—"} />
            <Row label="Condition expression" value={<span className="font-mono text-[10.5px]">{attribute.conditionExpression}</span>} />
            <Row label="Required state" value={attribute.requiredState} />
            <Row label="Exception behavior" value={attribute.exceptionBehavior} />
            <Row label="Evaluation priority" value={attribute.evaluationPriority} />
          </dl>
        </TabsContent>

        <TabsContent value="evidence" className="mt-2">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
              <tr><th scope="col" className="px-2 py-1">Evidence</th><th scope="col" className="px-2 py-1">Required</th><th scope="col" className="px-2 py-1">Authority</th><th scope="col" className="px-2 py-1">Freshness</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attribute.evidence.map((e) => (
                <tr key={e.id}>
                  <td className="px-2 py-1 font-mono text-[10.5px]">{e.evidenceType}</td>
                  <td className="px-2 py-1">{e.required ? "Required" : "Preferred"}</td>
                  <td className="px-2 py-1">{e.authorityPreference}</td>
                  <td className="px-2 py-1">{e.freshnessRequirement ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[11px] text-slate-500">Missing evidence response: {attribute.defaultResponse === "Blocked" ? "Blocked" : "Evidence Required"}</p>
        </TabsContent>

        <TabsContent value="applicability" className="mt-2">
          <dl>
            {Object.entries(attribute.applicability).map(([k, v]) => (
              <Row key={k} label={k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())} value={<span className="font-normal">{(v as string[]).join(", ")}</span>} />
            ))}
          </dl>
        </TabsContent>

        <TabsContent value="relationships" className="mt-2">
          <ul className="space-y-1">
            {attribute.relationships.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 rounded border border-slate-200 px-2 py-1 text-[11px]">
                <span><Pill label={r.relationshipType} tone="blue" /> <span className="ml-1 font-mono text-[10.5px]">{r.targetId}</span></span>
                <span className="text-slate-500">{r.targetType} · {r.confidence.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="policy" className="mt-2">
          {attribute.policyVariable ? (
            <dl>
              <Row label="Policy variable" value={<span className="font-mono text-[11px]">{attribute.policyVariable}</span>} />
              <Row label="Current value" value={binding ? `${binding.currentValue} ${binding.unit}` : "Unresolved"} />
              <Row label="Effective date" value={binding?.effectiveDate ?? "—"} />
              <Row label="Policy owner" value={binding?.owner ?? "—"} />
              <Row label="Policy version" value={binding?.version ?? "—"} />
              <Row label="Source" value={binding?.authority ?? "—"} />
              <Row label="Status" value={<Pill label={binding?.status ?? "Unresolved"} tone={toneForState(binding?.status ?? "Unresolved")} />} />
            </dl>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 p-3 text-[11.5px] text-slate-600">
              This attribute has no organization specific numeric threshold. Bind a policy variable only if the enterprise defines one.
              <div className="mt-2 flex flex-wrap gap-1.5">
                {policyBindings.slice(0, 4).map((p) => (
                  <Button key={p.variable} size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onBind(p.variable)}>Bind {p.variable}</Button>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="provenance" className="mt-2">
          <dl>
            <Row label="Source artifact" value={attribute.provenance.sourceArtifactName} />
            <Row label="Source page" value={attribute.provenance.sourcePage ?? "—"} />
            <Row label="Source section" value={attribute.provenance.sourceSection} />
            <Row label="Source statement" value={<span className="font-normal">{attribute.provenance.sourceStatement}</span>} />
            <Row label="Source version" value={attribute.provenance.sourceVersion} />
            <Row label="Content hash" value={<span className="font-mono text-[10.5px]">{attribute.provenance.sourceHash}</span>} />
          </dl>
        </TabsContent>

        <TabsContent value="usage" className="mt-2">
          <dl>
            <Row label="Retrieval count" value={attribute.usage.retrievalCount} />
            <Row label="Impact evaluations" value={attribute.usage.impactEvaluations} />
            <Row label="Decisions using attribute" value={attribute.usage.decisionsUsing} />
            <Row label="Last queried" value={attribute.usage.lastQueried} />
          </dl>
        </TabsContent>

        <TabsContent value="history" className="mt-2">
          <ol className="space-y-1">
            {attribute.history.map((h) => (
              <li key={h.version} className="rounded border border-slate-200 px-2 py-1 text-[11px]">
                <span className="font-semibold">v{h.version}</span> · {h.date} · {h.author}
                <div className="text-slate-600">{h.change}</div>
              </li>
            ))}
          </ol>
        </TabsContent>

        <TabsContent value="canonical" className="mt-2">
          <div className="mb-1.5 flex flex-wrap gap-1.5">
            <Button
              size="sm" variant="outline" className="h-6 text-[10.5px]"
              onClick={() => { void navigator.clipboard?.writeText(json); setCopied(true); }}
            >{copied ? "Copied" : "Copy JSON"}</Button>
            <Button
              size="sm" variant="outline" className="h-6 text-[10.5px]"
              onClick={() => {
                const blob = new Blob([json], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = `${attribute.id}.json`; a.click();
                URL.revokeObjectURL(url);
              }}
            >Download JSON</Button>
            <Button size="sm" variant="ghost" className="h-6 text-[10.5px]">View Schema</Button>
          </div>
          <pre
            tabIndex={0} aria-label={`Canonical JSON record for ${attribute.id}`}
            className="max-h-[420px] overflow-auto rounded-lg border border-slate-200 bg-slate-900 p-2.5 font-mono text-[10.5px] leading-relaxed text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >{json}</pre>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ------------------------------ Policy registry --------------------------- */

export function PolicyRegistryPanel({ bindings, onBind, spotlight }: {
  bindings: PolicyBinding[]; onBind: (variable: string, value: string) => void; spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-policy" spotlight={spotlight}
      title="Policy Variable Registry"
      subtitle="Organization specific thresholds are never hard coded into the persona — attributes bind to governed policy variables resolved at evaluation time"
    >
      <div className="overflow-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-[11px]">
          <caption className="sr-only">Policy variable registry</caption>
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>
              {["Policy Variable", "Description", "Current Value", "Unit", "Owner", "Authority", "Effective Date", "Version", "Bound Attributes", "Status", "Actions"].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bindings.map((p) => (
              <tr key={p.variable} className="align-top">
                <td className="px-2 py-1.5 font-mono text-[10.5px] font-semibold text-slate-900">{p.variable}</td>
                <td className="max-w-[240px] px-2 py-1.5 text-slate-600">{p.description}</td>
                <td className="px-2 py-1.5">
                  {p.currentValue}
                  {p.demoValue && <span className="ml-1"><Pill label="DEMO POLICY VALUE" tone="amber" /></span>}
                </td>
                <td className="px-2 py-1.5">{p.unit}</td>
                <td className="px-2 py-1.5">{p.owner}</td>
                <td className="px-2 py-1.5">{p.authority}</td>
                <td className="px-2 py-1.5">{p.effectiveDate}</td>
                <td className="px-2 py-1.5">{p.version}</td>
                <td className="px-2 py-1.5 font-mono text-[10px]">{p.boundAttributes.join(", ") || "—"}</td>
                <td className="px-2 py-1.5"><Pill label={p.status} tone={toneForState(p.status)} /></td>
                <td className="whitespace-nowrap px-2 py-1.5">
                  <div className="flex gap-1">
                    {p.status === "Unresolved"
                      ? <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onBind(p.variable, "Bound")}>Bind Attribute</Button>
                      : <Button size="sm" variant="ghost" className="h-6 text-[10.5px]" onClick={() => onBind(p.variable, "Unresolved")}>Unbind</Button>}
                    <Button size="sm" variant="ghost" className="h-6 text-[10.5px]">Open Policy</Button>
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

/* --------------------------- Work type matrix ----------------------------- */

export function WorkTypeMatrixPanel({ onSelect, selected, spotlight }: {
  onSelect: (workType: string) => void; selected: string | null; spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-worktype" spotlight={spotlight}
      title="Cloud FinOps Work Type Trigger Matrix"
      subtitle="Narrows eighty attributes to the candidate subset likely to matter for a type of work"
    >
      <div className="max-h-[420px] overflow-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-[11px]">
          <caption className="sr-only">Work type trigger matrix</caption>
          <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>
              {["Work Type", "Minimum Attribute Set", "Primary Categories", "Typical Evidence", "Typical FinOps Relevance", "Default Review Posture", "Triggered"].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {workTypeMappings.map((m) => (
              <tr
                key={m.workType}
                className={cn("cursor-pointer align-top hover:bg-slate-50", selected === m.workType && "bg-blue-50")}
                onClick={() => onSelect(m.workType)}
              >
                <td className="px-2 py-1.5 font-medium text-slate-900">{m.workType}</td>
                <td className="max-w-[200px] px-2 py-1.5 font-mono text-[10px]">{m.minimumAttributeSet.join(" · ")}</td>
                <td className="px-2 py-1.5">{m.primaryCategories.join(", ")}</td>
                <td className="px-2 py-1.5">{m.typicalEvidence.join(", ")}</td>
                <td className="max-w-[220px] px-2 py-1.5 text-slate-600">{m.relevance}</td>
                <td className="px-2 py-1.5"><Pill label={m.reviewPosture} tone={toneForState(m.reviewPosture)} /></td>
                <td className="px-2 py-1.5">{m.triggeredAttributes.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* --------------------------- Applicability index -------------------------- */

export function ApplicabilityIndexPanel({ onSelect, spotlight }: { onSelect: (ids: string[]) => void; spotlight?: boolean }) {
  return (
    <Panel
      id="panel-applicability" spotlight={spotlight}
      title="Applicability Index"
      subtitle="Fast routing layer used to retrieve candidate attributes — not to declare final impact"
    >
      <div className="grid gap-2 md:grid-cols-3">
        {applicabilityIndex.map((e) => (
          <button
            key={`${e.dimension}-${e.value}`} type="button" onClick={() => onSelect(e.attributes)}
            className="rounded-lg border border-slate-200 bg-white p-2 text-left hover:border-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-400">{e.dimension}</span>
            <div className="text-[12px] font-semibold text-slate-900">{e.value}</div>
            <p className="text-[10.5px] text-slate-500">{e.note}</p>
            <p className="mt-1 font-mono text-[10px] text-slate-600">{e.attributes.join(" · ")}</p>
          </button>
        ))}
      </div>
    </Panel>
  );
}

/* -------------------------------- Graph ----------------------------------- */

export function RelationshipGraphPanel({ spotlight, onSelectAttribute }: {
  spotlight?: boolean; onSelectAttribute: (id: string) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [directOnly, setDirectOnly] = useState(false);
  const edges = directOnly ? graphEdges.filter((e) => e.from !== "persona") : graphEdges;
  const radius = 150;
  const positioned = graphNodes.map((n, i) => {
    if (n.id === "persona") return { ...n, x: 300, y: 190 };
    const others = graphNodes.length - 1;
    const angle = ((i - 1) / others) * Math.PI * 2;
    return { ...n, x: 300 + Math.cos(angle) * radius * (n.kind === "Category" ? 1 : 1.55), y: 190 + Math.sin(angle) * radius * (n.kind === "Category" ? 0.75 : 1.05) };
  });
  const pos = (id: string) => positioned.find((p) => p.id === id)!;

  return (
    <Panel
      id="panel-graph" spotlight={spotlight}
      title="Cloud FinOps Attribute Context Graph"
      subtitle="Relationship reasoning layer — a projection of the canonical records, not the canonical store"
      actions={
        <div className="flex flex-wrap items-center gap-1.5">
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}>Zoom in</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}>Zoom out</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { setZoom(1); setDirectOnly(false); }}>Reset</Button>
          <label className="flex items-center gap-1 text-[10.5px] text-slate-600">
            <input type="checkbox" checked={directOnly} onChange={() => setDirectOnly((v) => !v)} />
            Show only direct relationships
          </label>
        </div>
      }
    >
      <p className="sr-only">
        Graph text summary: the Cloud FinOps Persona applies to twelve categories. {graphEdges.filter((e) => e.from !== "persona").map((e) => `${e.from} ${e.type} ${e.to}`).join("; ")}.
      </p>
      <div className="overflow-auto rounded-lg border border-slate-200 bg-slate-50">
        <svg viewBox="0 0 600 380" width={600 * zoom} height={380 * zoom} role="img" aria-label="Cloud FinOps attribute context graph">
          {edges.map((e, i) => {
            const a = pos(e.from); const b = pos(e.to);
            if (!a || !b) return null;
            return (
              <g key={i}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#cbd5e1" strokeWidth={1} />
                <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 2} fontSize={7} fill="#94a3b8" textAnchor="middle">{e.type}</text>
              </g>
            );
          })}
          {positioned.map((n) => (
            <g key={n.id} onClick={() => n.kind === "Attribute" && onSelectAttribute(n.id)} style={{ cursor: n.kind === "Attribute" ? "pointer" : "default" }}>
              <circle
                cx={n.x} cy={n.y} r={n.kind === "Persona" ? 26 : n.kind === "Category" ? 15 : 12}
                fill={n.kind === "Persona" ? "#1d4ed8" : n.kind === "Category" ? "#dbeafe" : n.kind === "Policy" ? "#fef3c7" : n.kind === "Evidence" ? "#dcfce7" : "#e2e8f0"}
                stroke="#94a3b8"
              />
              <text x={n.x} y={n.y + (n.kind === "Persona" ? 40 : 26)} fontSize={8} textAnchor="middle" fill={n.kind === "Persona" ? "#1e293b" : "#475569"}>
                {n.label.length > 30 ? `${n.label.slice(0, 30)}…` : n.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </Panel>
  );
}

/* ------------------------------- Simulator -------------------------------- */

export function RetrievalSimulatorPanel({ candidates, onRun, spotlight, onOpenAttribute }: {
  candidates: RetrievalCandidate[] | null;
  onRun: (input: { workType: string; environment: string; scaleDirection: string; architectureChange: string; recurringSpendChange: string; commitmentInteraction: string; work: string }) => void;
  spotlight?: boolean; onOpenAttribute: (id: string) => void;
}) {
  const [work, setWork] = useState(
    "Increase Kubernetes worker node retention and baseline capacity across production clusters to support peak commerce traffic.",
  );
  const [workType, setWorkType] = useState("Kubernetes Change");
  const [environment, setEnvironment] = useState("Production");
  const [scaleDirection, setScaleDirection] = useState("Increase");
  const [architectureChange, setArchitectureChange] = useState("Yes");
  const [recurringSpendChange, setRecurringSpendChange] = useState("Yes");
  const [commitmentInteraction, setCommitmentInteraction] = useState("Unknown");

  const sel = (label: string, value: string, options: string[], onChange: (v: string) => void) => (
    <label className="flex flex-col gap-0.5">
      <span className="text-[9.5px] font-medium uppercase tracking-wide text-slate-500">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-7 rounded-md border border-slate-200 bg-white px-1.5 text-[11px] text-slate-700 focus:border-blue-400 focus:outline-none">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );

  return (
    <Panel
      id="panel-simulator" spotlight={spotlight}
      title="Persona Attribute Retrieval Simulator"
      subtitle="Candidate retrieval is not final impact determination"
    >
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-[11px] font-medium text-amber-800" role="note">
        Candidate Retrieval ≠ Final Impact Determination. Retrieved attributes are inputs to Persona Impact Analysis.
      </div>
      <div className="mt-2 grid gap-2 lg:grid-cols-3">
        <label className="lg:col-span-3 flex flex-col gap-0.5">
          <span className="text-[9.5px] font-medium uppercase tracking-wide text-slate-500">Proposed work</span>
          <textarea
            value={work} onChange={(e) => setWork(e.target.value)} rows={2}
            className="w-full rounded-md border border-slate-200 p-2 text-[11.5px] text-slate-700 focus:border-blue-400 focus:outline-none"
          />
        </label>
        {sel("Work Type", workType, workTypeMappings.map((w) => w.workType), setWorkType)}
        {sel("Environment", environment, ["Production", "Preproduction", "Development"], setEnvironment)}
        {sel("Scale Direction", scaleDirection, ["Increase", "Decrease", "None"], setScaleDirection)}
        {sel("Architecture Change", architectureChange, ["Yes", "No"], setArchitectureChange)}
        {sel("Recurring Spend Change", recurringSpendChange, ["Yes", "No"], setRecurringSpendChange)}
        {sel("Commitment Interaction", commitmentInteraction, ["Unknown", "Yes", "No"], setCommitmentInteraction)}
      </div>
      <div className="mt-2">
        <Button
          size="sm" className="h-7 text-[11px]"
          onClick={() => onRun({ work, workType, environment, scaleDirection, architectureChange, recurringSpendChange, commitmentInteraction })}
        >Run Candidate Retrieval</Button>
      </div>

      {candidates && (
        <div className="mt-2 overflow-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-[11px]">
            <caption className="sr-only">Candidate attributes retrieved</caption>
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>{["Attribute", "Name", "Retrieval Reason", "Applicability Match", "Semantic Match", "Relationship Match", "Priority", "Confidence", ""].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 font-semibold">{h}</th>))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {candidates.map((c) => (
                <tr key={c.id}>
                  <td className="px-2 py-1 font-mono text-[10.5px] font-semibold">{c.id}</td>
                  <td className="px-2 py-1">{c.name}</td>
                  <td className="px-2 py-1 text-slate-600">{c.reason}</td>
                  <td className="px-2 py-1">{c.applicabilityMatch}</td>
                  <td className="px-2 py-1 text-slate-500">{c.semanticMatch}</td>
                  <td className="px-2 py-1">{c.relationshipMatch}</td>
                  <td className="px-2 py-1"><Pill label={c.priority} tone={c.priority === "P1" ? "red" : c.priority === "P2" ? "amber" : "slate"} /></td>
                  <td className="px-2 py-1">{c.confidence.toFixed(2)}</td>
                  <td className="px-2 py-1"><Button size="sm" variant="ghost" className="h-6 text-[10.5px]" onClick={() => onOpenAttribute(c.id)}>Open</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

/* ------------------------------- Contract --------------------------------- */

export function EvaluationContractPanel({ spotlight }: { spotlight?: boolean }) {
  return (
    <Panel
      id="panel-contract" spotlight={spotlight}
      title="Cloud FinOps Persona Evaluation Contract"
      subtitle="The output shape the stored persona exposes to downstream ECF evaluation"
    >
      <div className="grid gap-3 lg:grid-cols-2">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Contract fields</p>
          <ul className="flex flex-wrap gap-1">{contractFields.map((f) => <li key={f}><Pill label={f} tone="slate" /></li>)}</ul>
          <p className="mb-1 mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Allowed relevance values</p>
          <ul className="flex flex-wrap gap-1">{relevanceValues.map((v) => <li key={v}><Pill label={v} tone={toneForState(v)} /></li>)}</ul>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Contract preview</p>
          <dl>
            <Row label="Work item" value={contractExample.workItem} />
            <Row label="FinOps relevance" value={<Pill label={contractExample.relevance} tone="amber" />} />
            <Row label="Primary reason" value={<span className="font-normal">{contractExample.reason}</span>} />
            <Row label="Triggered attributes" value={<span className="font-mono text-[10.5px]">{contractExample.triggered.join(" · ")}</span>} />
            <Row label="Primary impact" value={contractExample.primaryImpact.join(", ")} />
            <Row label="Required evidence" value={<span className="font-normal">{contractExample.requiredEvidence.join(", ")}</span>} />
            <Row label="Required reviewers" value={<span className="font-normal">{contractExample.reviewers.join(", ")}</span>} />
            <Row label="Proceed condition" value={<span className="font-normal">{contractExample.proceedCondition}</span>} />
            <Row label="Post implementation observation" value={<span className="font-normal">{contractExample.observation}</span>} />
          </dl>
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------ Architecture ------------------------------ */

const archLayers = [
  { title: "HUMAN SOURCE", items: ["Cloud FinOps Stakeholder Attribute Sheet"], note: "Human readable artifact", tone: "slate" as Tone },
  { title: "DECOMPOSITION", items: ["Sections", "Statements", "Attributes"], note: "Atomicity resolution", tone: "blue" as Tone },
  { title: "CANONICAL ATTRIBUTE STORE", items: ["Structured JSON Records", "Persona Metadata", "Applicability", "Policy Bindings", "Evidence", "Provenance", "Version"], note: "Canonical Store: Structured Records", tone: "green" as Tone },
  { title: "RETRIEVAL INDEXES", items: ["Applicability Index", "Semantic Vector Index", "Context Graph"], note: "Vector Index: Retrieval Aid · Context Graph: Relationship Reasoning", tone: "amber" as Tone },
  { title: "GOVERNED ACCESS", items: ["API", "MCP Context Services", "Agent Retrieval"], note: "MCP: Access Contract — not storage", tone: "blue" as Tone },
  { title: "CONSUMERS", items: ["Cognitive Intake", "Persona Impact Analysis", "Cross Team Impact Analysis", "Decision Intelligence", "Organizational Learning"], note: "Downstream evaluation", tone: "slate" as Tone },
];

export function StoreArchitecturePanel({ spotlight }: { spotlight?: boolean }) {
  return (
    <Panel id="panel-architecture" spotlight={spotlight} title="Persona Attribute Store Architecture" subtitle="Canonical structured records with retrieval aids layered above them">
      <ol className="space-y-1.5">
        {archLayers.map((l, i) => (
          <li key={l.title}>
            <div className="rounded-lg border border-slate-200 bg-white p-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-semibold tracking-wide text-slate-900">{l.title}</span>
                <Pill label={l.note} tone={l.tone} />
              </div>
              <div className="mt-1 flex flex-wrap gap-1">{l.items.map((it) => <Pill key={it} label={it} tone="slate" />)}</div>
            </div>
            {i < archLayers.length - 1 && <div aria-hidden className="py-0.5 text-center text-[12px] text-slate-400">↓</div>}
          </li>
        ))}
      </ol>
    </Panel>
  );
}

export function StorageSchemaPanel() {
  return (
    <Panel id="panel-schema" title="Storage Schema" subtitle="Conceptual PostgreSQL / JSONB target — no live database required for the demo">
      <div className="mb-2 flex flex-wrap gap-1">{schemaTables.map((t) => <Pill key={t} label={t} tone="slate" />)}</div>
      <pre tabIndex={0} aria-label="Example SQL schema" className="max-h-[320px] overflow-auto rounded-lg border border-slate-200 bg-slate-900 p-2.5 font-mono text-[10.5px] leading-relaxed text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{schemaSql}</pre>
      <p className="mt-1.5 text-[11px] text-slate-500">
        <span className="font-semibold">embedding VECTOR</span> is an optional retrieval index. It is not canonical knowledge.
      </p>
    </Panel>
  );
}

/* ------------------------------- Validation ------------------------------- */

export function ValidationPanel({ issues, onResolve, onOpenAttribute, spotlight }: {
  issues: ValidationIssue[]; onResolve: (id: string, status: ValidationIssue["status"]) => void;
  onOpenAttribute: (id: string) => void; spotlight?: boolean;
}) {
  const critical = issues.filter((i) => i.severity === "Critical" && i.status !== "Resolved").length;
  return (
    <Panel
      id="panel-validation" spotlight={spotlight}
      title="Persona Attribute Store Validation"
      subtitle={`${issues.filter((i) => i.status !== "Resolved").length} open warnings · ${critical} critical errors`}
    >
      <div className="mb-2 grid gap-1.5 md:grid-cols-3 xl:grid-cols-4">
        {validationDimensions.map((d) => (
          <div key={d.name} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10.5px] font-medium text-slate-700">{d.name}</span>
              <Pill label={d.state} tone={toneForState(d.state)} />
            </div>
            <div className="text-[11px] text-slate-500">{d.result}</div>
          </div>
        ))}
      </div>
      <div className="overflow-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-[11px]">
          <caption className="sr-only">Validation issues</caption>
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>{["Issue ID", "Attribute", "Issue Type", "Severity", "Description", "Recommended Action", "Owner", "Status", "Actions"].map((h) => (
              <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 font-semibold">{h}</th>))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {issues.map((i) => (
              <tr key={i.id} className="align-top">
                <td className="px-2 py-1.5 font-mono text-[10.5px]">{i.id}</td>
                <td className="px-2 py-1.5 font-mono text-[10.5px]">{i.attribute}</td>
                <td className="px-2 py-1.5">{i.issueType}</td>
                <td className="px-2 py-1.5"><Pill label={i.severity} tone={toneForState(i.severity)} /></td>
                <td className="max-w-[260px] px-2 py-1.5 text-slate-600">{i.description}</td>
                <td className="px-2 py-1.5">{i.recommendedAction}</td>
                <td className="px-2 py-1.5">{i.owner}</td>
                <td className="px-2 py-1.5"><Pill label={i.status} tone={toneForState(i.status)} /></td>
                <td className="whitespace-nowrap px-2 py-1.5">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-6 text-[10.5px]" onClick={() => onOpenAttribute(i.attribute)}>Open Attribute</Button>
                    <Button size="sm" variant="ghost" className="h-6 text-[10.5px]" onClick={() => onResolve(i.id, "Acknowledged")}>Acknowledge</Button>
                    <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onResolve(i.id, "Resolved")}>Resolve</Button>
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

/* ------------------------------ Publication ------------------------------- */

export function PublicationPanel({ status, unresolved, criticalErrors, onPublish, publishStep, spotlight, publishedAt }: {
  status: string; unresolved: number; criticalErrors: number; onPublish: () => void;
  publishStep: number | null; spotlight?: boolean; publishedAt?: string;
}) {
  return (
    <Panel
      id="panel-publication" spotlight={spotlight}
      title="Persona Attribute Store Publication Preview"
      subtitle={criticalErrors > 0 ? "Publishing blocked — critical validation errors present" : "Ready with warnings"}
      actions={
        <Button size="sm" className="h-7 text-[11px]" disabled={criticalErrors > 0 || publishStep !== null} onClick={onPublish}>
          {publishStep !== null ? "Publishing…" : "Publish Attribute Store"}
        </Button>
      }
    >
      <div className="grid gap-3 lg:grid-cols-2">
        <dl>
          <Row label="Persona" value="Cloud FinOps Technologist" />
          <Row label="Persona ID" value="FINOPS CLOUD 001" />
          <Row label="Persona version" value="1.0" />
          <Row label="Attribute store version" value="1.0" />
          <Row label="Atomic attributes" value="80" />
          <Row label="Evidence mappings" value="143" />
          <Row label="Applicability mappings" value="218" />
          <Row label="Relationships" value="426" />
          <Row label="Work type mappings" value="27" />
          <Row label="Policy bindings" value="34" />
          <Row label="Unresolved policy bindings" value={unresolved} />
          <Row label="Validation score" value="96 / 100" />
          <Row label="Publication state" value={<Pill label={status} tone={toneForState(status)} />} />
          {publishedAt && <Row label="Published at" value={publishedAt} />}
        </dl>
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Destinations</p>
          <ul className="flex flex-wrap gap-1">{publicationDestinations.map((d) => <li key={d}><Pill label={d} tone="blue" /></li>)}</ul>
          {publishStep !== null && (
            <ol className="mt-2 space-y-0.5" aria-live="polite">
              {["Validate Persona", "Validate 80 Attributes", "Validate Evidence Mapping", "Validate Applicability", "Validate Policy Bindings", "Validate Relationships", "Validate Provenance", "Create Attribute Store Version", "Build Applicability Index", "Create Semantic Index Placeholder Metadata", "Create Graph Projection", "Publish Context Service Contract", "Complete"].map((s, i) => (
                <li key={s} className={cn("text-[11px]", i < publishStep ? "text-emerald-700" : i === publishStep ? "font-semibold text-blue-700" : "text-slate-400")}>
                  {i < publishStep ? "✓ " : i === publishStep ? "→ " : "· "}{s}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </Panel>
  );
}

/* -------------------------------- Activity -------------------------------- */

export function ActivityPanel({ activity }: { activity: ActivityEntry[] }) {
  return (
    <Panel id="panel-activity" title="Recent Persona Attribute Activity" subtitle="Local demo activity log">
      <ol className="space-y-1">
        {activity.map((a, i) => (
          <li key={`${a.time}-${i}`} className="flex gap-2 border-b border-slate-100 py-1 text-[11px] last:border-0">
            <span className="w-16 shrink-0 text-slate-400">{a.time}</span>
            <span className="text-slate-700">{a.text}</span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

export { attributeById };
