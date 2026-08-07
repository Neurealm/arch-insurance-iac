/** Team Persona Library — panels. Reuses ECF primitives and Tailwind conventions. */

import { Fragment, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Pill, type Tone } from "../persona-studio/primitives";
import {
  attentionItems as seedAttention, coverageCounts, coverageDimensions, coverageSummary,
  evidenceLineage, freshnessSummary, impactPreview, qualityDimensions, relationshipEdges,
  relationshipNodes, statusDistribution, topReused, usageMetrics,
  type AttentionItem, type LibraryActivity, type LibraryDrift, type LibraryKpi, type LibraryPersona,
  type LibraryView, type QualityDimension, type RelationshipEdge, type RelationshipNode, type RelationshipType,
} from "./data";

export type Density = "compact" | "standard" | "comfortable";

export const statusTone = (s: string): Tone =>
  ["Approved", "Current", "Healthy", "Published", "Resolved"].includes(s) ? "green"
    : ["Review Required", "Aging", "Owner Review", "Evidence Review", "Requested", "In Review", "Minor", "Medium"].includes(s) ? "amber"
      : ["Stale", "Conflict", "Conflict Review", "Material", "High", "Degraded"].includes(s) ? "red"
        : ["Draft", "None", "Low", "Superseded"].includes(s) ? "slate" : "blue";

export function Panel({ id, title, subtitle, actions, children, spotlight, className }: {
  id?: string; title: string; subtitle?: string; actions?: React.ReactNode;
  children: React.ReactNode; spotlight?: boolean; className?: string;
}) {
  return (
    <section
      id={id}
      aria-label={title}
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-3 shadow-sm",
        spotlight && "ring-2 ring-blue-500 ring-offset-2",
        className,
      )}
    >
      <header className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-[13px] font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-1.5">{actions}</div>}
      </header>
      {children}
    </section>
  );
}

export function LibraryKpiCard({ kpi, onClick, spotlight, valueOverride }: {
  kpi: LibraryKpi; onClick: () => void; spotlight?: boolean; valueOverride?: string;
}) {
  const tone = kpi.status === "Healthy" ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : kpi.status === "Attention" ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-red-200 bg-red-50 text-red-700";
  const last = kpi.trend[kpi.trend.length - 1];
  const prev = kpi.trend[kpi.trend.length - 2] ?? last;
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            className={cn(
              "w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-blue-300 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              spotlight && "ring-2 ring-blue-500 ring-offset-2",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-medium text-slate-500">{kpi.name}</span>
              <span className={cn("rounded border px-1.5 py-0.5 text-[9.5px] font-semibold", tone)}>{kpi.status}</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-[20px] font-bold leading-none text-slate-900">{valueOverride ?? kpi.value}</span>
              {kpi.change && <span className="text-[10.5px] font-medium text-emerald-600">{kpi.change}</span>}
              {kpi.target && <span className="text-[10.5px] text-slate-500">{kpi.target}</span>}
            </div>
            <p className="mt-1 text-[10.5px] text-slate-500">{kpi.context}</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {kpi.supporting.map((s) => (
                <span key={s.label} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9.5px] text-slate-600">
                  {s.value} {s.label}
                </span>
              ))}
            </div>
            <div className="mt-1.5 flex items-center gap-1 text-[9.5px] text-slate-500">
              <span aria-hidden>{last >= prev ? "▲" : "▼"}</span>
              <span>Trend {last >= prev ? "improving" : "declining"} over 8 periods</span>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[260px] text-[11px]">{kpi.tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ------------------------------- inventory -------------------------------- */

export const viewColumns: Record<LibraryView, { key: string; label: string; get: (p: LibraryPersona) => React.ReactNode; sort?: (p: LibraryPersona) => string | number }[]> = {
  portfolio: [
    { key: "id", label: "Persona ID", get: (p) => p.id, sort: (p) => p.id },
    { key: "team", label: "Team Name", get: (p) => p.teamName, sort: (p) => p.teamName },
    { key: "bu", label: "Business Unit", get: (p) => p.businessUnit, sort: (p) => p.businessUnit },
    { key: "mission", label: "Primary Mission", get: (p) => p.mission, sort: (p) => p.mission },
    { key: "status", label: "Persona Status", get: (p) => <Pill label={p.constructionStatus} tone={statusTone(p.constructionStatus)} />, sort: (p) => p.constructionStatus },
    { key: "approval", label: "Approval State", get: (p) => <Pill label={p.approvalState} tone={statusTone(p.approvalState)} />, sort: (p) => p.approvalState },
    { key: "quality", label: "Quality", get: (p) => p.qualityScore, sort: (p) => p.qualityScore },
    { key: "completeness", label: "Completeness", get: (p) => `${p.completenessScore}%`, sort: (p) => p.completenessScore },
    { key: "confidence", label: "Confidence", get: (p) => `${p.confidence}%`, sort: (p) => p.confidence },
    { key: "freshness", label: "Freshness", get: (p) => <Pill label={p.freshnessStatus} tone={statusTone(p.freshnessStatus)} />, sort: (p) => p.freshnessStatus },
    { key: "conditions", label: "Conditions", get: (p) => p.conditionCount, sort: (p) => p.conditionCount },
    { key: "dependencies", label: "Dependencies", get: (p) => p.dependencyCount, sort: (p) => p.dependencyCount },
    { key: "owner", label: "Owner", get: (p) => p.personaOwner, sort: (p) => p.personaOwner },
  ],
  "operating-model": [
    { key: "team", label: "Team", get: (p) => p.teamName, sort: (p) => p.teamName },
    { key: "mission", label: "Mission", get: (p) => p.mission, sort: (p) => p.mission },
    { key: "capabilities", label: "Capabilities", get: (p) => p.capabilities.length, sort: (p) => p.capabilities.length },
    { key: "products", label: "Products", get: (p) => p.products.join(", ") },
    { key: "services", label: "Services", get: (p) => p.services.map((s) => s.name).join(", ") },
    { key: "objectives", label: "Objectives", get: (p) => p.objectives.length, sort: (p) => p.objectives.length },
    { key: "constraints", label: "Constraints", get: (p) => p.constraints.length, sort: (p) => p.constraints.length },
    { key: "rules", label: "Decision Rules", get: (p) => p.decisionRules.length, sort: (p) => p.decisionRules.length },
    { key: "risks", label: "Risks", get: (p) => p.risks.length, sort: (p) => p.risks.length },
    { key: "owner", label: "Owner", get: (p) => p.personaOwner, sort: (p) => p.personaOwner },
    { key: "status", label: "Status", get: (p) => <Pill label={p.constructionStatus} tone={statusTone(p.constructionStatus)} />, sort: (p) => p.constructionStatus },
  ],
  relationship: [
    { key: "team", label: "Team", get: (p) => p.teamName, sort: (p) => p.teamName },
    { key: "upstream", label: "Upstream Teams", get: (p) => p.upstreamTeams.join(", ") },
    { key: "downstream", label: "Downstream Teams", get: (p) => p.downstreamTeams.join(", ") },
    { key: "services", label: "Critical Services", get: (p) => p.services.filter((s) => s.criticality.includes("Tier 0")).map((s) => s.name).join(", ") || "—" },
    { key: "systems", label: "Systems", get: (p) => p.systems.join(", ") },
    { key: "journeys", label: "Customer Journeys", get: (p) => p.customerJourneys.join(", ") },
    { key: "context", label: "Context Relationships", get: (p) => p.usage.graphRelationships.toLocaleString(), sort: (p) => p.usage.graphRelationships },
    { key: "evals", label: "Active Impact Evaluations", get: (p) => p.usage.impactEvaluations, sort: (p) => p.usage.impactEvaluations },
  ],
  governance: [
    { key: "id", label: "Persona ID", get: (p) => p.id, sort: (p) => p.id },
    { key: "team", label: "Team", get: (p) => p.teamName, sort: (p) => p.teamName },
    { key: "owner", label: "Persona Owner", get: (p) => p.personaOwner, sort: (p) => p.personaOwner },
    { key: "approval", label: "Approval State", get: (p) => <Pill label={p.approvalState} tone={statusTone(p.approvalState)} />, sort: (p) => p.approvalState },
    { key: "evidence", label: "Evidence Coverage", get: (p) => `${Math.min(99, p.completenessScore + 3)}%`, sort: (p) => p.completenessScore },
    { key: "authority", label: "Authority Confidence", get: (p) => `${p.confidence}%`, sort: (p) => p.confidence },
    { key: "quality", label: "Quality", get: (p) => p.qualityScore, sort: (p) => p.qualityScore },
    { key: "freshness", label: "Freshness", get: (p) => <Pill label={p.freshnessStatus} tone={statusTone(p.freshnessStatus)} />, sort: (p) => p.freshnessStatus },
    { key: "version", label: "Current Version", get: (p) => `${p.version} · ${p.versionStatus}`, sort: (p) => p.version },
    { key: "drift", label: "Drift", get: (p) => <Pill label={p.driftStatus} tone={statusTone(p.driftStatus)} />, sort: (p) => p.driftStatus },
    { key: "review", label: "Review Status", get: (p) => <Pill label={p.reviewStatus} tone={statusTone(p.reviewStatus)} />, sort: (p) => p.reviewStatus },
  ],
};

export function EmptyState({ message, actionLabel, onAction, secondaryLabel, onSecondary }: {
  message: string; actionLabel?: string; onAction?: () => void; secondaryLabel?: string; onSecondary?: () => void;
}) {
  return (
    <div role="status" className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <p className="text-[12px] text-slate-600">{message}</p>
      <div className="mt-2 flex justify-center gap-2">
        {actionLabel && onAction && <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onAction}>{actionLabel}</Button>}
        {secondaryLabel && onSecondary && <Button size="sm" className="h-7 text-[11px]" onClick={onSecondary}>{secondaryLabel}</Button>}
      </div>
    </div>
  );
}

export function PanelSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-1.5" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
    </div>
  );
}

export function InventoryPanel({
  personas, view, density, search, onSearch, onOpen, selected, onToggle, onToggleAll,
  sortKey, sortDir, onSort, hiddenColumns, page, pageSize, onPage, spotlight, loading,
  error, onRetry, onClearFilters, onCreate, toolbar,
}: {
  personas: LibraryPersona[]; view: LibraryView; density: Density; search: string;
  onSearch: (v: string) => void; onOpen: (p: LibraryPersona) => void; selected: Set<string>;
  onToggle: (id: string) => void; onToggleAll: () => void; sortKey: string; sortDir: "asc" | "desc";
  onSort: (k: string) => void; hiddenColumns: Set<string>; page: number; pageSize: number;
  onPage: (p: number) => void; spotlight?: boolean; loading?: boolean; error?: boolean;
  onRetry?: () => void; onClearFilters?: () => void; onCreate?: () => void; toolbar?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const columns = viewColumns[view].filter((c) => !hiddenColumns.has(c.key));
  const sorted = useMemo(() => {
    const col = viewColumns[view].find((c) => c.key === sortKey);
    if (!col?.sort) return personas;
    return [...personas].sort((a, b) => {
      const av = col.sort!(a); const bv = col.sort!(b);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [personas, sortKey, sortDir, view]);
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const rows = sorted.slice((page - 1) * pageSize, page * pageSize);
  const pad = density === "compact" ? "py-1" : density === "comfortable" ? "py-2.5" : "py-1.5";

  return (
    <Panel
      id="panel-inventory"
      title="Team Persona Library"
      subtitle={`${personas.length} Personas match the current filters`}
      spotlight={spotlight}
      actions={toolbar}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <label className="relative flex-1 min-w-[200px]">
          <span className="sr-only">Search Personas</span>
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search Personas, teams, services, systems"
            className="h-7 w-full rounded-md border border-slate-200 bg-white pl-7 pr-2 text-[11.5px] text-slate-700 focus:border-blue-400 focus:outline-none"
          />
        </label>
      </div>

      {loading ? <PanelSkeleton rows={6} />
        : error ? (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-[12px] text-red-700">
            The Persona inventory could not be loaded.
            {onRetry && <Button size="sm" variant="outline" className="ml-2 h-6 text-[11px]" onClick={onRetry}>Retry</Button>}
          </div>
        )
          : personas.length === 0 ? (
            <EmptyState
              message="No Personas match the current filters. Clear the filters or create a new Team Persona."
              actionLabel="Clear Filters" onAction={onClearFilters}
              secondaryLabel="Create Persona" onSecondary={onCreate}
            />
          ) : (
            <>
              {/* desktop table */}
              <div className="hidden overflow-auto rounded-lg border border-slate-200 md:block">
                <table className="w-full text-left text-[11px]">
                  <caption className="sr-only">Team Persona inventory, {personas.length} rows, {view} view</caption>
                  <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th scope="col" className="w-8 px-2 py-1.5">
                        <input
                          type="checkbox" aria-label="Select all Personas"
                          checked={selected.size > 0 && selected.size === personas.length}
                          onChange={onToggleAll}
                        />
                      </th>
                      {columns.map((c) => (
                        <th key={c.key} scope="col" className="whitespace-nowrap px-2 py-1.5 font-semibold">
                          <button type="button" onClick={() => onSort(c.key)} className="inline-flex items-center gap-1 hover:text-blue-700">
                            {c.label}
                            {sortKey === c.key && <span aria-hidden>{sortDir === "asc" ? "▲" : "▼"}</span>}
                          </button>
                        </th>
                      ))}
                      <th scope="col" className="px-2 py-1.5 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((p) => {
                      const isFinOps = p.teamName === "Cloud FinOps";
                      return (
                      <Fragment key={p.id}>
                        <tr
                          className={cn(
                            "cursor-pointer hover:bg-slate-50",
                            isFinOps && "border-l-4 border-l-amber-400 bg-amber-50/60 hover:bg-amber-50",
                          )}
                          onClick={() => onOpen(p)}
                        >
                          <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox" aria-label={`Select ${p.teamName}`}
                              checked={selected.has(p.id)} onChange={() => onToggle(p.id)}
                            />
                          </td>
                          {columns.map((c) => (
                            <td key={c.key} className={cn("max-w-[260px] px-2 text-slate-700", pad)}>
                              {c.get(p)}
                              {isFinOps && c.key === "team" && (
                                <Link
                                  to={ATTRIBUTE_STORE_ROUTE}
                                  onClick={(e) => e.stopPropagation()}
                                  className="ml-1.5 inline-flex items-center gap-1 rounded-full border border-amber-400 bg-amber-200 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-amber-900 hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                                  aria-label="Open Cloud FinOps Persona Attribute Store"
                                >
                                  Attribute Store
                                  <ArrowUpRight className="h-2.5 w-2.5" aria-hidden />
                                </Link>
                              )}
                            </td>
                          ))}
                          <td className={cn("whitespace-nowrap px-2", pad)} onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-1">
                              {isFinOps ? (
                                <Link
                                  to={ATTRIBUTE_STORE_ROUTE}
                                  className="inline-flex h-7 items-center gap-1 rounded-md border border-amber-500 bg-amber-300 px-2.5 text-[11px] font-semibold text-slate-900 shadow-sm hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                                  aria-label="Open Cloud FinOps Persona Attribute Store"
                                >
                                  Open Attribute Store
                                  <ArrowUpRight className="h-3 w-3" aria-hidden />
                                </Link>
                              ) : (
                                <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onOpen(p)}>Open</Button>
                              )}

                              <Button
                                size="sm" variant="ghost" className="h-6 text-[10.5px]"
                                aria-label={`Toggle summary for ${p.teamName}`}
                                onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                              >
                                {expanded === p.id ? <ChevronUp className="h-3 w-3" aria-hidden /> : <ChevronDown className="h-3 w-3" aria-hidden />}
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {expanded === p.id && (
                          <tr className="bg-slate-50">
                            <td colSpan={columns.length + 2} className="px-3 py-2 text-[11px] text-slate-600">
                              <span className="font-medium text-slate-800">Decision priorities: </span>
                              {p.thinking.decisionPriorities.join(" · ")}
                              <span className="ml-2 font-medium text-slate-800">Escalation: </span>
                              {p.thinking.escalationPhilosophy[0]}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* mobile cards */}
              <ul className="space-y-2 md:hidden" aria-label="Team Persona cards">
                {rows.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button" onClick={() => onOpen(p)}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-left hover:border-blue-300"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-semibold text-slate-900">{p.teamName}</span>
                        <Pill label={p.constructionStatus} tone={statusTone(p.constructionStatus)} />
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-600">{p.mission}</p>
                      <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-slate-500">
                        <span>{p.id}</span><span>Quality {p.qualityScore}</span>
                        <span>{p.completenessScore}% complete</span><span>{p.freshnessStatus}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                <span>{selected.size} selected · page {page} of {pages}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="h-6 text-[10.5px]" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button>
                  <Button size="sm" variant="outline" className="h-6 text-[10.5px]" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</Button>
                </div>
              </div>
            </>
          )}
    </Panel>
  );
}

/* -------------------------------- coverage -------------------------------- */

export function CoveragePanel({ onSelect, spotlight }: {
  onSelect: (key: string, value: string) => void; spotlight?: boolean;
}) {
  const dims = Object.keys(coverageDimensions);
  const [dim, setDim] = useState(dims[0]);
  const rows = coverageDimensions[dim];
  return (
    <Panel
      id="panel-coverage" title="Enterprise Persona Coverage"
      subtitle="Where governed Personas exist and where the enterprise is exposed" spotlight={spotlight}
      actions={
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Coverage dimension">
          {dims.map((d) => (
            <button
              key={d} type="button" role="tab" aria-selected={dim === d} onClick={() => setDim(d)}
              className={cn("rounded border px-1.5 py-0.5 text-[10.5px]", dim === d ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
            >{d}</button>
          ))}
        </div>
      }
    >
      <div className="grid gap-2 sm:grid-cols-4">
        {coverageSummary.map((c) => (
          <div key={c.label} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <div className="text-[10px] text-slate-500">{c.label}</div>
            <div className="text-[16px] font-bold text-slate-900">{c.value} percent</div>
          </div>
        ))}
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-4">
        {coverageCounts.map((c) => (
          <div key={c.label} className="rounded-lg border border-slate-200 p-2">
            <div className="text-[10px] text-slate-500">{c.label}</div>
            <div className="text-[14px] font-semibold text-slate-900">{c.value}</div>
          </div>
        ))}
      </div>
      <ul className="mt-3 space-y-1.5">
        {rows.map((r) => {
          const pct = Math.round((r.covered / r.total) * 100);
          return (
            <li key={r.name}>
              <button
                type="button" onClick={() => onSelect(r.filterKey, r.filterValue)}
                className="w-full rounded-md px-1 py-1 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-700">
                  <span>{r.name}</span>
                  <span className="text-slate-500">{r.covered} of {r.total} · {pct} percent</span>
                </div>
                <div className="mt-0.5 h-1.5 w-full rounded bg-slate-100">
                  <div className={cn("h-1.5 rounded", pct >= 90 ? "bg-emerald-500" : pct >= 80 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${pct}%` }} />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

/* --------------------------------- quality -------------------------------- */

export function QualityPanel({ onDimension, spotlight }: {
  onDimension: (d: QualityDimension) => void; spotlight?: boolean;
}) {
  return (
    <Panel id="panel-quality" title="Persona Quality & Trust" subtitle="Overall 92 / 100 against a target of 95" spotlight={spotlight}>
      <div className="overflow-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-[11px]">
          <caption className="sr-only">Persona quality dimensions</caption>
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>{["Dimension", "Current", "Target", "Variance", "Trend", "Affected Personas", "Status"].map((h) => (
              <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {qualityDimensions.map((d) => (
              <tr key={d.name} className="cursor-pointer hover:bg-slate-50" onClick={() => onDimension(d)}>
                <th scope="row" className="px-2 py-1.5 text-left font-medium text-slate-800">{d.name}</th>
                <td className="px-2 py-1.5 text-slate-700">{d.score}</td>
                <td className="px-2 py-1.5 text-slate-600">{d.target}</td>
                <td className={cn("px-2 py-1.5 font-medium", d.score >= d.target ? "text-emerald-700" : "text-amber-700")}>
                  {d.score - d.target > 0 ? "+" : ""}{d.score - d.target}
                </td>
                <td className="px-2 py-1.5 text-slate-600">{d.trend.join(" → ")}</td>
                <td className="px-2 py-1.5 text-slate-600">{d.affected}</td>
                <td className="px-2 py-1.5"><Pill label={d.status} tone={statusTone(d.status)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function StatusDistributionPanel({ onSelect, spotlight }: {
  onSelect: (status: string) => void; spotlight?: boolean;
}) {
  const total = statusDistribution.reduce((a, b) => a + b.value, 0);
  return (
    <Panel id="panel-status" title="Persona Status Distribution" subtitle={`${total} Personas across the lifecycle`} spotlight={spotlight}>
      <div className="flex h-3 w-full overflow-hidden rounded" role="img" aria-label={statusDistribution.map((s) => `${s.label} ${s.value}`).join(", ")}>
        {statusDistribution.map((s) => (
          <div
            key={s.label}
            className={cn(
              s.tone === "green" ? "bg-emerald-500" : s.tone === "amber" ? "bg-amber-500"
                : s.tone === "red" ? "bg-red-500" : s.tone === "blue" ? "bg-blue-500" : "bg-slate-400",
            )}
            style={{ width: `${(s.value / total) * 100}%` }}
          />
        ))}
      </div>
      <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {statusDistribution.map((s) => (
          <li key={s.label}>
            <button
              type="button" onClick={() => onSelect(s.status)}
              className="flex w-full items-center justify-between rounded border border-slate-200 px-2 py-1 text-[11px] text-slate-700 hover:border-blue-300 hover:bg-blue-50"
            >
              <span className="flex items-center gap-1.5"><Pill label={s.label} tone={s.tone} /></span>
              <span className="font-semibold">{s.value}</span>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ------------------------------ drift panel -------------------------------- */

export function DriftPanel({ drift, onAction, spotlight }: {
  drift: LibraryDrift[]; onAction: (d: LibraryDrift, action: string) => void; spotlight?: boolean;
}) {
  const head = ["Persona", "Drift Type", "Changed Record", "Previous Value", "Current Value", "Materiality", "Affected Section", "Detected", "Downstream Impact", "Status", "Actions"];
  return (
    <Panel id="panel-drift" title="Persona Freshness & Drift" subtitle="Personas whose source conditions have changed" spotlight={spotlight}>
      <div className="grid gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {freshnessSummary.map((f) => (
          <div key={f.label} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <div className="text-[10px] text-slate-500">{f.label}</div>
            <div className="text-[15px] font-bold text-slate-900">{f.value}</div>
          </div>
        ))}
      </div>
      {drift.length === 0 ? (
        <div className="mt-2"><EmptyState message="No drift is currently recorded against the Persona portfolio." /></div>
      ) : (
        <div className="mt-2 overflow-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-[11px]">
            <caption className="sr-only">Persona drift records</caption>
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>{head.map((h) => <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drift.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <th scope="row" className="whitespace-nowrap px-2 py-1.5 text-left font-medium text-slate-800">{d.personaName}</th>
                  <td className="whitespace-nowrap px-2 py-1.5 text-slate-700">{d.driftType}</td>
                  <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{d.changedRecord}</td>
                  <td className="px-2 py-1.5 text-slate-600">{d.previousValue}</td>
                  <td className="px-2 py-1.5 text-slate-600">{d.currentValue}</td>
                  <td className="px-2 py-1.5"><Pill label={d.materiality} tone={statusTone(d.materiality)} /></td>
                  <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{d.affectedSection}</td>
                  <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{d.detectedAt}</td>
                  <td className="px-2 py-1.5 text-slate-600">{d.downstreamImpact}</td>
                  <td className="px-2 py-1.5"><Pill label={d.status} tone={statusTone(d.status)} /></td>
                  <td className="whitespace-nowrap px-2 py-1.5">
                    <div className="flex gap-1">
                      {["Open Comparison", "Create Draft Version", "Refresh Persona", "Request Review", "Dismiss as Nonmaterial"].map((a) => (
                        <Button key={a} size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onAction(d, a)}>{a}</Button>
                      ))}
                    </div>
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

/* -------------------------- relationship explorer -------------------------- */

const RELATIONSHIP_TYPES: RelationshipType[] = [
  "DEPENDS ON", "PROVIDES TO", "CONSUMED BY", "APPROVED BY", "ESCALATES TO", "SUPPORTS", "MEASURED BY", "GOVERNED BY",
];

export function RelationshipExplorer({ onNode, onEdge, spotlight }: {
  onNode: (n: RelationshipNode) => void; onEdge: (e: RelationshipEdge) => void; spotlight?: boolean;
}) {
  const [type, setType] = useState<RelationshipType | "All">("All");
  const [showPersonas, setShowPersonas] = useState(true);
  const [showServices, setShowServices] = useState(true);
  const [showJourney, setShowJourney] = useState(true);
  const [direction, setDirection] = useState<"All" | "Upstream" | "Downstream">("All");
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [customerOnly, setCustomerOnly] = useState(false);
  const [zoom, setZoom] = useState(1);

  const kindVisible = (k: RelationshipNode["kind"]) =>
    k === "Persona" ? showPersonas : k === "Journey" ? showJourney : showServices;

  const edges = relationshipEdges.filter((e) => {
    if (type !== "All" && e.type !== type) return false;
    if (direction !== "All" && e.direction !== direction) return false;
    if (criticalOnly && !e.critical) return false;
    if (customerOnly && !e.customerImpact) return false;
    const a = relationshipNodes.find((n) => n.id === e.from);
    const b = relationshipNodes.find((n) => n.id === e.to);
    return !!a && !!b && kindVisible(a.kind) && kindVisible(b.kind);
  });
  const visibleIds = new Set(["payments", ...edges.flatMap((e) => [e.from, e.to])]);
  const nodes = relationshipNodes.filter((n) => visibleIds.has(n.id) && kindVisible(n.kind));

  const toggle = (label: string, value: boolean, set: (v: boolean) => void) => (
    <button
      key={label} type="button" aria-pressed={value} onClick={() => set(!value)}
      className={cn("rounded border px-1.5 py-0.5 text-[10.5px]", value ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
    >{label}</button>
  );

  return (
    <Panel
      id="panel-relationships" title="Persona Relationship Explorer"
      subtitle="Centered on Payments Platform. Select a node or relationship for supporting evidence."
      spotlight={spotlight}
      actions={
        <div className="flex flex-wrap items-center gap-1">
          <label className="flex items-center gap-1 text-[10.5px] text-slate-600">
            <span>Relationship</span>
            <select
              aria-label="Filter relationship type" value={type}
              onChange={(e) => setType(e.target.value as RelationshipType | "All")}
              className="h-6 rounded border border-slate-200 bg-white px-1 text-[10.5px]"
            >
              <option value="All">All</option>
              {RELATIONSHIP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          {toggle("Team Personas Only", !showServices && !showJourney, (v) => { setShowServices(!v); setShowJourney(!v); setShowPersonas(true); })}
          {toggle("Systems and Services", showServices, setShowServices)}
          {toggle("Customer Journey", showJourney, setShowJourney)}
          {toggle("Upstream", direction === "Upstream", (v) => setDirection(v ? "Upstream" : "All"))}
          {toggle("Downstream", direction === "Downstream", (v) => setDirection(v ? "Downstream" : "All"))}
          {toggle("Critical Relationships", criticalOnly, setCriticalOnly)}
          {toggle("Customer Impact Path", customerOnly, setCustomerOnly)}
          <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => setZoom(1)}>Zoom to Fit</Button>
          <Button
            size="sm" variant="outline" className="h-6 text-[10.5px]"
            onClick={() => { setType("All"); setShowPersonas(true); setShowServices(true); setShowJourney(true); setDirection("All"); setCriticalOnly(false); setCustomerOnly(false); setZoom(1); }}
          >Reset</Button>
          <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))} aria-label="Zoom in">+</Button>
          <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))} aria-label="Zoom out">−</Button>
        </div>
      }
    >
      <div className="relative h-[380px] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          {edges.map((e, i) => {
            const a = relationshipNodes.find((n) => n.id === e.from)!;
            const b = relationshipNodes.find((n) => n.id === e.to)!;
            return (
              <line
                key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={e.critical ? "#ef4444" : "#94a3b8"} strokeWidth={e.critical ? 0.35 : 0.22}
                strokeDasharray={e.direction === "Upstream" ? "1 0.6" : undefined}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0" style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
          {nodes.map((n) => (
            <button
              key={n.id} type="button" onClick={() => onNode(n)}
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border px-1.5 py-1 text-[10px] font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                n.id === "payments" ? "border-blue-500 bg-blue-600 text-white"
                  : n.kind === "Persona" ? "border-slate-300 bg-white text-slate-800"
                    : n.kind === "Journey" ? "border-violet-300 bg-violet-50 text-violet-800"
                      : "border-emerald-300 bg-emerald-50 text-emerald-800",
              )}
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 overflow-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-[11px]">
          <caption className="px-2 py-1 text-left text-[10.5px] text-slate-500">
            Accessible relationship summary: Payments Platform has {edges.length} visible relationships.
          </caption>
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>{["Source", "Relationship", "Target", "Direction", "Critical", "Customer Impact", "Supporting Conditions"].map((h) => (
              <th key={h} scope="col" className="px-2 py-1.5 font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {edges.map((e, i) => (
              <tr key={i} className="cursor-pointer hover:bg-slate-50" onClick={() => onEdge(e)}>
                <th scope="row" className="px-2 py-1.5 text-left font-medium text-slate-800">{relationshipNodes.find((n) => n.id === e.from)?.label}</th>
                <td className="px-2 py-1.5 text-slate-700">{e.type}</td>
                <td className="px-2 py-1.5 text-slate-700">{relationshipNodes.find((n) => n.id === e.to)?.label}</td>
                <td className="px-2 py-1.5 text-slate-600">{e.direction}</td>
                <td className="px-2 py-1.5 text-slate-600">{e.critical ? "Yes" : "No"}</td>
                <td className="px-2 py-1.5 text-slate-600">{e.customerImpact ? "Yes" : "No"}</td>
                <td className="px-2 py-1.5 text-slate-600">{e.conditions.join("; ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ---------------------------------- usage ---------------------------------- */

export function UsagePanel({ onPersona, spotlight }: { onPersona: (id: string) => void; spotlight?: boolean }) {
  return (
    <Panel id="panel-usage" title="Persona Usage & Reuse" subtitle="How approved Persona context is consumed across the enterprise" spotlight={spotlight}>
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {usageMetrics.map((m) => (
          <div key={m.label} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <div className="text-[10px] text-slate-500">{m.label}</div>
            <div className="text-[15px] font-bold text-slate-900">{m.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 overflow-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-[11px]">
          <caption className="sr-only">Most reused Personas</caption>
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>{["Persona", "Reuse Count", "Impact Evaluations", "Decision References", "Search Retrievals", "Last Used", "Quality", "Freshness"].map((h) => (
              <th key={h} scope="col" className="px-2 py-1.5 font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {topReused.map((r) => (
              <tr key={r.personaId} className="cursor-pointer hover:bg-slate-50" onClick={() => onPersona(r.personaId)}>
                <th scope="row" className="px-2 py-1.5 text-left font-medium text-slate-800">{r.persona}</th>
                <td className="px-2 py-1.5 text-slate-700">{r.reuse.toLocaleString()}</td>
                <td className="px-2 py-1.5 text-slate-600">{r.evaluations}</td>
                <td className="px-2 py-1.5 text-slate-600">{r.decisions.toLocaleString()}</td>
                <td className="px-2 py-1.5 text-slate-600">{r.retrievals.toLocaleString()}</td>
                <td className="px-2 py-1.5 text-slate-600">{r.lastUsed}</td>
                <td className="px-2 py-1.5 text-slate-600">{r.quality}</td>
                <td className="px-2 py-1.5"><Pill label={r.freshness} tone={statusTone(r.freshness)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ----------------------------- impact preview ------------------------------ */

export function ImpactPreviewPanel({ onOpen, spotlight }: { onOpen: () => void; spotlight?: boolean }) {
  return (
    <Panel
      id="panel-impact" title="Persona Impact Preview"
      subtitle={`${impactPreview.persona} evaluating ${impactPreview.change}`} spotlight={spotlight}
      actions={<Button size="sm" className="h-7 text-[11px]" onClick={onOpen}>Open Full Persona Impact Analysis</Button>}
    >
      <p className="text-[11.5px] text-slate-600">{impactPreview.description}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {impactPreview.reactions.map((r) => (
          <div key={r.label} className="flex items-center justify-between rounded-lg border border-slate-200 p-2">
            <span className="text-[11px] text-slate-700">{r.label}</span>
            <Pill label={r.level} tone={r.level === "High" || r.level === "Yes" ? "red" : r.level === "Medium" ? "amber" : "green"} />
          </div>
        ))}
      </div>
      <div className="mt-2 grid gap-2 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-2">
          <h3 className="text-[11px] font-semibold text-slate-800">Recommended reviewers</h3>
          <ul className="mt-1 list-disc pl-4 text-[11px] text-slate-600">{impactPreview.reviewers.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
        <div className="rounded-lg border border-slate-200 p-2">
          <h3 className="text-[11px] font-semibold text-slate-800">Recommended evidence</h3>
          <ul className="mt-1 list-disc pl-4 text-[11px] text-slate-600">{impactPreview.evidence.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------ evidence lineage --------------------------- */

export function EvidencePanel({ onNode, spotlight }: { onNode: (n: typeof evidenceLineage[number]) => void; spotlight?: boolean }) {
  return (
    <Panel id="panel-evidence" title="Persona Evidence & Provenance" subtitle="Source artifact to decision lineage for the Payments Platform service levels" spotlight={spotlight}>
      <ol className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
        {evidenceLineage.map((n, i) => (
          <li key={n.recordId} className="flex flex-1 items-center gap-2">
            <button
              type="button" onClick={() => onNode(n)}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-left hover:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="text-[9.5px] uppercase tracking-wide text-slate-500">{n.stage}</div>
              <div className="text-[11.5px] font-semibold text-slate-900">{n.recordId}</div>
              <div className="text-[10.5px] text-slate-600">{n.title}</div>
              <div className="mt-1 flex flex-wrap gap-1 text-[9.5px] text-slate-500">
                <span>{n.owner}</span><span>{n.authority}</span><span>{n.confidence}%</span>
                <span>{n.freshness}</span><span>{n.version}</span><span>{n.classification}</span>
              </div>
            </button>
            {i < evidenceLineage.length - 1 && <span aria-hidden className="hidden text-slate-400 lg:inline">→</span>}
          </li>
        ))}
      </ol>
    </Panel>
  );
}

/* -------------------------------- attention -------------------------------- */

export function AttentionPanel({ items, activeType, onType, onAction, spotlight }: {
  items: AttentionItem[]; activeType: string | null; onType: (t: string | null) => void;
  onAction: (item: AttentionItem, action: string) => void; spotlight?: boolean;
}) {
  const head = ["Persona", "Issue Type", "Severity", "Affected Section", "Owner", "Age", "Quality Impact", "Downstream Impact", "Recommended Action", "Status", "Actions"];
  const summary = [
    { label: "Evidence Gaps", type: "Evidence Gap" }, { label: "Dependency Conflicts", type: "Dependency Conflict" },
    { label: "Missing Owners", type: "Missing Owner" }, { label: "Stale Personas", type: "Stale Persona" },
    { label: "Decision Rule Conflicts", type: "Decision Rule Conflict" }, { label: "Incomplete Escalation Paths", type: "Incomplete Escalation Path" },
  ];
  return (
    <Panel id="panel-attention" title="Personas Requiring Attention" subtitle={`${items.length} open items`} spotlight={spotlight}>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {summary.map((s) => {
          const count = seedAttention.filter((a) => a.issueType === s.type).length;
          return (
            <button
              key={s.type} type="button" aria-pressed={activeType === s.type}
              onClick={() => onType(activeType === s.type ? null : s.type)}
              className={cn("rounded border px-2 py-1 text-[10.5px]", activeType === s.type ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
            >{s.label} · {count}</button>
          );
        })}
      </div>
      {items.length === 0 ? <EmptyState message="No Personas require attention for the current filters." /> : (
        <div className="overflow-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-[11px]">
            <caption className="sr-only">Personas requiring attention</caption>
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>{head.map((h) => <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <th scope="row" className="whitespace-nowrap px-2 py-1.5 text-left font-medium text-slate-800">{a.persona}</th>
                  <td className="whitespace-nowrap px-2 py-1.5 text-slate-700">{a.issueType}</td>
                  <td className="px-2 py-1.5"><Pill label={a.severity} tone={statusTone(a.severity)} /></td>
                  <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{a.section}</td>
                  <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{a.owner}</td>
                  <td className="px-2 py-1.5 text-slate-600">{a.age}</td>
                  <td className="px-2 py-1.5 text-slate-600">{a.qualityImpact}</td>
                  <td className="px-2 py-1.5 text-slate-600">{a.downstreamImpact}</td>
                  <td className="px-2 py-1.5 text-slate-600">{a.recommendedAction}</td>
                  <td className="px-2 py-1.5"><Pill label={a.status} tone={statusTone(a.status)} /></td>
                  <td className="whitespace-nowrap px-2 py-1.5">
                    <div className="flex gap-1">
                      {["Open Persona", "Open Evidence", "Assign Owner", "Open Conflict", "Refresh Persona", "Request Review"].map((x) => (
                        <Button key={x} size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onAction(a, x)}>{x}</Button>
                      ))}
                    </div>
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

/* -------------------------------- activity --------------------------------- */

export function ActivityPanel({ activity, onOpen, spotlight }: {
  activity: LibraryActivity[]; onOpen: (a: LibraryActivity) => void; spotlight?: boolean;
}) {
  return (
    <Panel id="panel-activity" title="Recent Persona Activity" subtitle="Latest governed changes across the library" spotlight={spotlight}>
      <div className="overflow-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-[11px]">
          <caption className="sr-only">Recent Persona activity</caption>
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>{["Timestamp", "Action", "Persona", "Team", "Section", "Result", "Owner", "Audit ID"].map((h) => (
              <th key={h} scope="col" className="px-2 py-1.5 font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activity.map((a) => (
              <tr key={a.id} className="cursor-pointer hover:bg-slate-50" onClick={() => onOpen(a)}>
                <th scope="row" className="whitespace-nowrap px-2 py-1.5 text-left font-medium text-slate-800">{a.at}</th>
                <td className="px-2 py-1.5 text-slate-700">{a.action}</td>
                <td className="px-2 py-1.5 text-slate-600">{a.persona}</td>
                <td className="px-2 py-1.5 text-slate-600">{a.team}</td>
                <td className="px-2 py-1.5 text-slate-600">{a.section}</td>
                <td className="px-2 py-1.5 text-slate-600">{a.result}</td>
                <td className="px-2 py-1.5 text-slate-600">{a.owner}</td>
                <td className="px-2 py-1.5 text-slate-500">{a.auditId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
