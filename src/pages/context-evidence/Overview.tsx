// Context / Evidence Layer → Overview. The tenant evidence plane control
// surface: filters, KPIs, source inventory, pipeline, storage, entity model,
// quality, policy governance and the service contract footer.

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  SOURCES, INACTIVE_SOURCES, PIPELINE, STORAGE, ENTITIES, EDGES, QUALITY,
  QUALITY_EXCEPTIONS, POLICIES, AUDIT_TRAIL, GUARANTEES, ASSEMBLY_FLOW,
  DOMAINS, TYPES, CLASSIFICATIONS, REGIONS, type SourceRow,
} from "./data";
import {
  Panel, KpiCard, RichTip, InspectDrawer, KV, SubHead, Bullets, StatePill,
  healthTone, ScoreText, Btn, SkeletonPanel, EmptyState, scoreTone,
} from "./parts";
import {
  ArrowRight, ArrowUpDown, RefreshCw, Download, Columns3, Rows3, X, ZoomIn, ZoomOut, Maximize2, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

type DrawerState =
  | { kind: "source"; id: string }
  | { kind: "kpi"; id: string }
  | { kind: "stage"; id: string }
  | { kind: "index"; id: string }
  | { kind: "entity"; id: string }
  | { kind: "edge"; id: string }
  | { kind: "quality"; id: string }
  | { kind: "policy"; id: string }
  | { kind: "exception"; id: string }
  | { kind: "audit"; id: string }
  | null;

const FILTER_KEYS = ["domain", "type", "classification", "health", "freshness", "quality", "region"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

export default function ContextEvidenceOverview() {
  const [params, setParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [dense, setDense] = useState(false);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [hiddenCols, setHiddenCols] = useState<string[]>([]);
  const [showCols, setShowCols] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [sort, setSort] = useState<{ key: keyof SourceRow; dir: 1 | -1 }>({ key: "objects", dir: -1 });

  useEffect(() => { const t = setTimeout(() => setLoading(false), 450); return () => clearTimeout(t); }, []);

  /* ------------------------------ URL state ------------------------------ */
  const filters = useMemo(() => {
    const f: Partial<Record<FilterKey, string>> = {};
    FILTER_KEYS.forEach((k) => { const v = params.get(k); if (v) f[k] = v; });
    return f;
  }, [params]);

  const setFilter = (k: FilterKey, v: string) => {
    const next = new URLSearchParams(params);
    if (!v) next.delete(k); else next.set(k, v);
    setParams(next, { replace: false });
    setPage(1);
  };

  const drawer: DrawerState = useMemo(() => {
    const map: [string, DrawerState["kind" & keyof DrawerState] | any][] = [
      ["drawer", "source"], ["kpi", "kpi"], ["stage", "stage"], ["index", "index"],
      ["entity", "entity"], ["edge", "edge"], ["quality", "quality"], ["policy", "policy"],
      ["exception", "exception"], ["audit", "audit"],
    ];
    for (const [p, kind] of map) { const v = params.get(p); if (v) return { kind, id: v } as DrawerState; }
    return null;
  }, [params]);

  const openDrawer = (param: string, id: string) => {
    const next = new URLSearchParams(params);
    ["drawer", "kpi", "stage", "index", "entity", "edge", "quality", "policy", "exception", "audit"].forEach((k) => next.delete(k));
    next.set(param, id);
    setParams(next);
  };
  const closeDrawer = () => {
    const next = new URLSearchParams(params);
    ["drawer", "kpi", "stage", "index", "entity", "edge", "quality", "policy", "exception", "audit"].forEach((k) => next.delete(k));
    setParams(next);
  };

  /* ------------------------------ Filtering ------------------------------ */
  const filtered = useMemo(() => {
    let rows = SOURCES.filter((s) => {
      if (filters.domain && s.domain !== filters.domain) return false;
      if (filters.type && s.type !== filters.type) return false;
      if (filters.classification && s.classification !== filters.classification) return false;
      if (filters.health && s.status !== filters.health) return false;
      if (filters.region && s.region !== filters.region) return false;
      if (filters.freshness === "below-98" && s.freshness >= 98) return false;
      if (filters.freshness === "at-or-above-98" && s.freshness < 98) return false;
      if (filters.quality === "below-95" && s.quality >= 95) return false;
      if (filters.quality === "at-or-above-95" && s.quality < 95) return false;
      if (q && !`${s.name} ${s.connector} ${s.domain} ${s.type}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    rows = [...rows].sort((a, b) => {
      const av = a[sort.key] as any, bv = b[sort.key] as any;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * sort.dir;
      return String(av).localeCompare(String(bv)) * sort.dir;
    });
    return rows;
  }, [filters, q, sort]);

  const pageSize = dense ? 8 : 6;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  /* -------------------------- Derived aggregates ------------------------- */
  const agg = useMemo(() => {
    const n = filtered.length || 1;
    const objects = filtered.reduce((s, r) => s + r.objects, 0);
    const quality = filtered.reduce((s, r) => s + r.quality, 0) / n;
    const freshness = filtered.reduce((s, r) => s + r.freshness, 0) / n;
    const domains = new Set(filtered.map((r) => r.domain));
    return {
      count: filtered.length,
      objects,
      objectsLabel: objects >= 1e6 ? `${(objects / 1e6).toFixed(1)}M` : `${Math.round(objects / 1e3)}K`,
      quality: Number(quality.toFixed(1)),
      freshness: Number(freshness.toFixed(1)),
      domains,
    };
  }, [filtered]);

  const scaledQuality = useMemo(() => {
    const shift = agg.quality - 94.1;
    return QUALITY.map((d) => ({ ...d, score: Math.max(60, Math.min(100, Math.round(d.score + shift))) }));
  }, [agg.quality]);

  const activeFilterChips = FILTER_KEYS.filter((k) => filters[k]);

  const columns = [
    { key: "name", label: "Source" }, { key: "domain", label: "Domain" }, { key: "type", label: "Type" },
    { key: "connector", label: "Connector" }, { key: "status", label: "Status" }, { key: "lastIngest", label: "Last Ingest" },
    { key: "objects", label: "Objects" }, { key: "freshness", label: "Freshness" }, { key: "quality", label: "Quality" },
    { key: "classification", label: "Classification" }, { key: "actions", label: "Actions" },
  ].filter((c) => !hiddenCols.includes(c.key));

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Panel title="Tenant Evidence Plane Filters" subtitle="Filtering recalculates the source inventory, KPI counts, quality dimensions and entity emphasis."
        actions={<Btn onClick={() => setParams(new URLSearchParams())} disabled={activeFilterChips.length === 0}>Clear Filters</Btn>}>
        <div className="flex flex-wrap items-end gap-2">
          <Sel label="Domain" value={filters.domain ?? ""} options={DOMAINS} onChange={(v) => setFilter("domain", v)} />
          <Sel label="Source Type" value={filters.type ?? ""} options={TYPES} onChange={(v) => setFilter("type", v)} />
          <Sel label="Classification" value={filters.classification ?? ""} options={CLASSIFICATIONS as unknown as string[]} onChange={(v) => setFilter("classification", v)} />
          <Sel label="Health" value={filters.health ?? ""} options={["Healthy", "Degraded", "Inactive", "Error"]} onChange={(v) => setFilter("health", v)} />
          <Sel label="Freshness" value={filters.freshness ?? ""} options={["at-or-above-98", "below-98"]} labels={{ "at-or-above-98": "≥ 98%", "below-98": "< 98%" }} onChange={(v) => setFilter("freshness", v)} />
          <Sel label="Quality" value={filters.quality ?? ""} options={["at-or-above-95", "below-95"]} labels={{ "at-or-above-95": "≥ 95", "below-95": "< 95" }} onChange={(v) => setFilter("quality", v)} />
          <Sel label="Region" value={filters.region ?? ""} options={REGIONS} onChange={(v) => setFilter("region", v)} />
        </div>
        {activeFilterChips.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {activeFilterChips.map((k) => (
              <button key={k} onClick={() => setFilter(k, "")}
                className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] text-blue-800 hover:bg-blue-100">
                {k}: {filters[k]} <X className="h-3 w-3" />
              </button>
            ))}
            <span className="text-[11px] text-slate-500">{agg.count} of {SOURCES.length} sources in scope</span>
          </div>
        )}
      </Panel>

      {/* KPI row */}
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <KpiCard label="Connected Sources" value={`${agg.count} Active`} secondary={`${INACTIVE_SOURCES} Inactive · View all sources`}
          onClick={() => openDrawer("kpi", "sources")}
          tip={{ term: "Connected Sources", definition: "Active sources are polling or streaming on schedule with valid credentials. Inactive sources are registered but suspended and contribute no evidence.",
            rows: [["Polling", "Continuous or scheduled per connector"], ["Connector health", `${filtered.filter((s) => s.status === "Healthy").length} healthy · ${filtered.filter((s) => s.status !== "Healthy").length} attention`], ["Credential health", "1 credential expiring within 2 hours"], ["Last successful sync", "1 min ago (Datadog)"]],
            why: "An inactive or credential-expired source silently degrades every context pack that depends on it." }} />

        <KpiCard label="Indexed Evidence Objects" value={agg.objectsLabel} secondary="1.2 TB total" change="+4.3M this week"
          onClick={() => openDrawer("kpi", "objects")}
          tip={{ term: "Evidence Objects", definition: "Documents, structured records, events, telemetry references, code artifacts, policies and normalized evidence fragments held in the tenant evidence plane.",
            rows: [["In scope", agg.objectsLabel], ["Storage", "1.2 TB"], ["Growth", "+4.3M this week"]],
            why: "Object volume drives index cost, retrieval latency and reindex windows." }} />

        <KpiCard label="Entities in Context Graph" value="6.4M" secondary="24.7M relationships" help="Entity Resolution"
          onClick={() => openDrawer("kpi", "entities")}
          tip={{ term: "Context Graph Entities", definition: "Resolved enterprise entities represented across the tenant context graph.",
            rows: [["Entities", "6.4M"], ["Relationships", "24.7M"], ["Match threshold", "0.91"]],
            why: "Graph structure supplies the relational context that vector similarity alone cannot express." }} />

        <KpiCard label="Average Context Freshness" value={`${agg.freshness}%`} secondary="24-hour target 90%" help="Context Freshness"
          onClick={() => openDrawer("kpi", "freshness")}
          tip={{ term: "Evidence Freshness", definition: "Percentage of evidence objects whose age remains inside the configured source-specific freshness policy.",
            rows: [["Current", `${agg.freshness}% compliant`], ["Target", "90%"], ["Violations", "7 open"]],
            why: "Digital coworkers should not make decisions from stale operational or business state." }} />

        <KpiCard label="Evidence Quality Score" value={`${agg.quality} / 100`} secondary="+2.7 versus previous period" help="Evidence Quality"
          onClick={() => openDrawer("kpi", "quality")}
          tip={{ term: "Evidence Quality Score", definition: "Weighted aggregate of completeness, accuracy, consistency, validity, timeliness, uniqueness, provenance and schema conformity.",
            rows: [["Current", `${agg.quality}`], ["Eligibility floor", "0.82"], ["Open exceptions", "42"]],
            why: "Quality gates which evidence may participate in reasoning and how it is ranked." }} />

        <KpiCard label="Active Policies" value="27" secondary="3 updates pending" help="Context Eligibility"
          onClick={() => openDrawer("kpi", "policies")}
          tip={{ term: "Active Policies", definition: "Policies governing evidence access, classification, retention, masking, usage, freshness, provenance and context eligibility.",
            rows: [["Active", "27"], ["Pending", "3"], ["Families", "8"]],
            why: "Policy defines the boundary of what evidence a digital coworker may ever reason over." }} />
      </div>

      {/* Sources + pipeline */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,58fr)_minmax(0,42fr)]">
        <Panel title="Enterprise Sources Overview" subtitle={`${agg.count} sources in scope · ${agg.objectsLabel} evidence objects`}
          bodyClassName="p-0"
          actions={
            <>
              <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search sources…"
                className="h-7 w-40 rounded border border-slate-200 bg-slate-50 px-2 text-[11.5px] outline-none focus:border-blue-400 focus:bg-white" />
              <Btn onClick={() => setDense((d) => !d)} title="Density"><Rows3 className="h-3.5 w-3.5" />{dense ? "Comfortable" : "Compact"}</Btn>
              <div className="relative">
                <Btn onClick={() => setShowCols((v) => !v)}><Columns3 className="h-3.5 w-3.5" />Columns</Btn>
                {showCols && (
                  <div className="absolute right-0 top-8 z-30 w-52 rounded-md border border-slate-200 bg-white p-2 shadow-lg">
                    {["domain", "type", "connector", "lastIngest", "freshness", "quality", "classification"].map((c) => (
                      <label key={c} className="flex items-center gap-2 px-1 py-1 text-[11.5px] text-slate-700">
                        <input type="checkbox" checked={!hiddenCols.includes(c)}
                          onChange={() => setHiddenCols((h) => h.includes(c) ? h.filter((x) => x !== c) : [...h, c])} />
                        {c}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <Btn onClick={() => toast.success(`Exported ${filtered.length} source rows (CSV).`)}><Download className="h-3.5 w-3.5" />Export</Btn>
              <Btn onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 500); toast.info("Connector inventory refreshed."); }}><RefreshCw className="h-3.5 w-3.5" />Refresh</Btn>
            </>
          }>
          {loading ? <div className="p-4"><SkeletonPanel rows={7} /></div> : filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No sources match the current filters"
                body="The tenant evidence plane has 40 registered sources. Relax a filter to bring sources back into scope, or register a new connector for this domain."
                cta="Clear Filters" onCta={() => setParams(new URLSearchParams())} />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70">
                      <th className="w-8 px-2 py-1.5">
                        <input type="checkbox" aria-label="Select all rows"
                          checked={selected.length === pageRows.length && pageRows.length > 0}
                          onChange={(e) => setSelected(e.target.checked ? pageRows.map((r) => r.id) : [])} />
                      </th>
                      {columns.map((c) => (
                        <th key={c.key} className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          {c.key === "actions" ? c.label : (
                            <button className="inline-flex items-center gap-1 hover:text-slate-800"
                              onClick={() => setSort((s) => ({ key: c.key as keyof SourceRow, dir: s.key === c.key && s.dir === 1 ? -1 : 1 }))}>
                              {c.label}<ArrowUpDown className="h-3 w-3 opacity-50" />
                            </button>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((s) => (
                      <tr key={s.id} onClick={() => openDrawer("drawer", s.id)}
                        className={cn("cursor-pointer border-b border-slate-100 transition-colors hover:bg-blue-50/50", dense ? "text-[11.5px]" : "text-[12px]")}>
                        <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" aria-label={`Select ${s.name}`} checked={selected.includes(s.id)}
                            onChange={() => setSelected((v) => v.includes(s.id) ? v.filter((x) => x !== s.id) : [...v, s.id])} />
                        </td>
                        {columns.map((c) => (
                          <td key={c.key} className={cn("px-2", dense ? "py-1" : "py-2")}>
                            {c.key === "name" && (
                              <RichTip tip={{ term: s.name, definition: s.description, rows: [["Owner", s.owner], ["Domain", s.domain], ["Last sync", s.lastIngest], ["Connector ID", s.id]] }}>
                                <span className="font-medium text-slate-900">{s.name}</span>
                              </RichTip>)}
                            {c.key === "domain" && s.domain}
                            {c.key === "type" && s.type}
                            {c.key === "connector" && s.connector}
                            {c.key === "status" && (
                              <RichTip tip={{ term: `${s.name} · connector health`, definition: s.statusReason ?? "Connector polling normally with valid credentials.",
                                rows: [["API health", s.status === "Healthy" ? "200 OK" : "Degraded"], ["Authentication", s.authState], ["Last successful job", s.lastSuccessfulJob], ["Failure count (24h)", String(s.failures)]] }}>
                                <span><StatePill tone={healthTone(s.status)} label={s.status} /></span>
                              </RichTip>)}
                            {c.key === "lastIngest" && <span className="text-slate-600">{s.lastIngest}</span>}
                            {c.key === "objects" && <span className="tabular-nums">{s.objectsLabel}</span>}
                            {c.key === "freshness" && (
                              <RichTip tip={{ term: "Evidence Freshness", definition: "Whether evidence from this source remains within its configured maximum age.",
                                rows: [["Configured SLA", `${s.freshnessSla}%`], ["Measured", `${s.freshness}%`], ["Violation threshold", `< ${s.freshnessSla}%`]], why: "Stale evidence is excluded from context packs at assembly time." }}>
                                <span><ScoreText value={s.freshness} suffix="%" /></span>
                              </RichTip>)}
                            {c.key === "quality" && (
                              <RichTip tip={{ term: "Evidence Quality", definition: "Weighted score across eight quality dimensions for this source.",
                                rows: Object.entries(s.qualityParts).map(([k, v]) => [k, String(v)]) as [string, string][] }}>
                                <span><ScoreText value={s.quality} /></span>
                              </RichTip>)}
                            {c.key === "classification" && (
                              <RichTip tip={{ term: `Classification: ${s.classification}`, definition: classificationImplication(s.classification),
                                rows: [["PII", s.pii], ["Masking", s.pii === "None" ? "Not required" : "Enabled"], ["Agent direct access", "Disabled"]] }}>
                                <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-700">{s.classification}</span>
                              </RichTip>)}
                            {c.key === "actions" && (
                              <button onClick={(e) => { e.stopPropagation(); openDrawer("drawer", s.id); }}
                                className="text-[11.5px] font-medium text-blue-700 hover:underline">Inspect</button>)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2 text-[11.5px] text-slate-600">
                <span>{selected.length > 0 ? `${selected.length} selected` : `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)} of ${filtered.length}`}</span>
                <div className="flex items-center gap-1.5">
                  <Btn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Btn>
                  <span>Page {page} / {pages}</span>
                  <Btn onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>Next</Btn>
                </div>
              </div>
            </>
          )}
        </Panel>

        <Panel title="Context / Evidence Pipeline" help="Context Assembly"
          subtitle="Every stage is configurable. Select a stage to inspect its services, rules, gates and recent changes.">
          <ol className="space-y-1.5">
            {PIPELINE.map((st, i) => (
              <li key={st.id}>
                <button onClick={() => openDrawer("stage", st.id)}
                  className="group w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                  <div className="flex items-center gap-2">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-slate-300 text-[10px] font-semibold text-slate-600 group-hover:border-blue-400 group-hover:text-blue-700">{i + 1}</span>
                    <span className="text-[12.5px] font-semibold uppercase tracking-wide text-slate-800">{st.name}</span>
                    <span className="ml-auto text-[11px] text-slate-500">{st.metricA}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1 pl-7">
                    <span className="text-[11px] text-slate-500">{st.metricB}</span>
                    <span className="text-slate-300">·</span>
                    {st.components.slice(0, 4).map((c) => (
                      <span key={c} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-px text-[10.5px] text-slate-600">{c}</span>
                    ))}
                    {st.components.length > 4 && <span className="text-[10.5px] text-slate-500">+{st.components.length - 4}</span>}
                  </div>
                </button>
                {i < PIPELINE.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <ArrowRight className="h-3.5 w-3.5 rotate-90 text-slate-300 transition-colors hover:text-blue-500" />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      {/* Storage + entity model */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,34fr)_minmax(0,66fr)]">
        <Panel title="Indexing & Storage Overview" subtitle="1.2 TB across five retrieval structures"
          actions={<Btn onClick={() => openDrawer("kpi", "storage")}>View storage &amp; index configuration</Btn>}>
          <StorageDonut onSelect={(id) => openDrawer("index", id)} />
        </Panel>

        <Panel title="Domain / Entity Model" help="Entity Resolution"
          subtitle="Canonical tenant entities and the derived relationships used for graph retrieval.">
          <EntityModel
            emphasis={filters.domain ? new Set(ENTITIES.filter((e) => emphasisDomains(filters.domain!).includes(e.id)).map((e) => e.id)) : null}
            onEntity={(id) => openDrawer("entity", id)}
            onEdge={(id) => openDrawer("edge", id)}
          />
        </Panel>
      </div>

      {/* Quality + policies */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,55fr)_minmax(0,45fr)]">
        <Panel title="Data Quality & Freshness" help="Evidence Quality" subtitle="Target line 90% · green ≥ 90, amber 80–89, red < 80">
          <div className="space-y-1.5">
            {scaledQuality.map((d) => (
              <RichTip key={d.key} as="div" tip={{
                term: d.key, definition: d.definition,
                rows: [["Calculation", d.calculation], ["Current", String(d.score)], ["Target", String(d.target)], ["Top contributors", d.contributors.join(", ")], ["Violations", String(d.violations)], ["Trend", d.trend]],
              }}>
                <button onClick={() => openDrawer("quality", d.key)} className="w-full rounded px-1 py-1 text-left hover:bg-slate-50">
                  <div className="flex items-center justify-between text-[11.5px]">
                    <span className="text-slate-700">{d.key}</span>
                    <span className="flex items-center gap-1.5">
                      <StatePill tone={scoreTone(d.score)} label={d.score >= 90 ? "Meets target" : d.score >= 80 ? "Below target" : "Critical"} />
                      <ScoreText value={d.score} suffix="%" />
                    </span>
                  </div>
                  <div className="relative mt-1 h-1.5 rounded bg-slate-100">
                    <div className={cn("h-full rounded", d.score >= 90 ? "bg-emerald-500" : d.score >= 80 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${d.score}%` }} />
                    <div className="absolute inset-y-[-2px] w-px bg-slate-500" style={{ left: "90%" }} aria-label="Target 90%" />
                  </div>
                </button>
              </RichTip>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {QUALITY_EXCEPTIONS.map((x, i) => (
              <button key={x.id} onClick={() => openDrawer("exception", x.id)}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-2 text-left transition-colors hover:border-amber-300 hover:bg-amber-50/50">
                <div className="text-[16px] font-semibold tabular-nums text-slate-900">{[42, 7, 12][i]}</div>
                <div className="text-[11px] text-slate-600">{["Open quality exceptions", "Freshness violations", "Schema violations"][i]}</div>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Policy & Governance Summary" help="Context Eligibility" subtitle="8 policy families · 27 active policies · 3 pending updates"
          bodyClassName="p-0">
          <table className="w-full text-left">
            <tbody>
              {POLICIES.map((p) => (
                <RichTip key={p.id} as="tr" tip={{ term: p.name, definition: p.controls, rows: [["Policies", String(p.count)], ["State", p.state]] }}>
                  <>
                    <td className="cursor-pointer border-b border-slate-100 px-4 py-2 text-[12px] text-slate-800 hover:bg-slate-50" onClick={() => openDrawer("policy", p.id)}>{p.name}</td>
                    <td className="border-b border-slate-100 px-2 py-2 text-right text-[12px] tabular-nums text-slate-800">{p.count}</td>
                    <td className="border-b border-slate-100 px-4 py-2 text-right">
                      <StatePill tone={p.tone === "ok" ? "ok" : "warn"} label={p.state} />
                    </td>
                  </>
                </RichTip>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      {/* Architecture principle + audit */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,50fr)_minmax(0,50fr)]">
        <Panel title="Tenant Evidence Plane" subtitle="This administration page governs the tenant evidence plane. It does not directly configure individual digital coworker context requirements.">
          <div className="grid gap-3 sm:grid-cols-2">
            <Bullets items={["What enterprise information exists", "How it is connected", "How it is normalized", "How entities are modeled", "How it is indexed"]} />
            <Bullets items={["How it is governed", "How quality is measured", "How provenance is preserved", "What evidence is eligible for AI consumption"]} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {["Tenant Evidence Plane", "Agent Context Profile", "Runtime Context Assembly", "LLM / Agent Reasoning"].map((s, i) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className={cn("rounded border px-2 py-1 text-[11.5px]", i === 0 ? "border-blue-300 bg-blue-50 font-medium text-blue-800" : "border-slate-200 bg-white text-slate-600")}>{s}</span>
                {i < 3 && <ArrowRight className="h-3.5 w-3.5 text-slate-300" />}
              </span>
            ))}
          </div>
        </Panel>

        <Panel title="Recent Configuration Changes" subtitle="Every configuration change records actor, timestamp, before/after, reason and change reference."
          actions={<Btn onClick={() => openDrawer("audit", "all")}>View Full Audit Trail</Btn>} bodyClassName="p-0">
          <table className="w-full text-left text-[11.5px]">
            <thead><tr className="border-b border-slate-200 bg-slate-50/70 text-[10.5px] uppercase tracking-wide text-slate-500">
              <th className="px-4 py-1.5">When</th><th className="px-2 py-1.5">Actor</th><th className="px-2 py-1.5">Object</th><th className="px-4 py-1.5">Change</th>
            </tr></thead>
            <tbody>
              {AUDIT_TRAIL.slice(0, 5).map((a) => (
                <tr key={a.ticket} className="cursor-pointer border-b border-slate-100 hover:bg-slate-50" onClick={() => openDrawer("audit", a.ticket)}>
                  <td className="px-4 py-1.5 text-slate-600">{a.at}</td>
                  <td className="px-2 py-1.5 text-slate-700">{a.actor}</td>
                  <td className="px-2 py-1.5 text-slate-700">{a.object}</td>
                  <td className="px-4 py-1.5 text-slate-700">{a.oldValue} → <span className="font-medium">{a.newValue}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      {/* Degraded connector notice */}
      {SOURCES.some((s) => s.status === "Degraded") && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <div className="text-[12px] text-amber-900">
            <span className="font-semibold">ServiceNow Connector · Degraded.</span> OAuth token expires in 2 hours. ITSM evidence will fall out of freshness SLA on expiry.
          </div>
          <Btn className="ml-auto" onClick={() => toast.success("Credential rotation requested (CHG-88231).")}>Rotate Credential</Btn>
          <Btn onClick={() => openDrawer("drawer", "SRC-SNOW-004")}>Inspect connector</Btn>
        </div>
      )}

      {/* Service contract footer */}
      <Panel title="What this layer guarantees to neugain.io" subtitle="Technical service contract for every context pack delivered to a digital coworker.">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {GUARANTEES.map((g) => (
            <div key={g.key} className="rounded-md border border-slate-200 bg-slate-50/60 px-2.5 py-2">
              <div className="text-[11px] font-semibold tracking-[0.08em] text-slate-800">{g.key}</div>
              <p className="mt-0.5 text-[11px] leading-snug text-slate-600">{g.q}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Drawers state={drawer} onClose={closeDrawer} agg={agg} quality={scaledQuality} />
    </div>
  );
}

/* ------------------------------- Sub views -------------------------------- */

function Sel({ label, value, options, onChange, labels }: { label: string; value: string; options: string[]; onChange: (v: string) => void; labels?: Record<string, string> }) {
  return (
    <label className="block">
      <span className="block text-[10.5px] font-medium uppercase tracking-wide text-slate-500">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 h-7 rounded border border-slate-200 bg-white px-1.5 text-[11.5px] text-slate-700 outline-none focus:border-blue-400">
        <option value="">All</option>
        {options.map((o) => <option key={o} value={o}>{labels?.[o] ?? o}</option>)}
      </select>
    </label>
  );
}

function classificationImplication(c: string) {
  switch (c) {
    case "Restricted": return "Access limited to named principals with explicit entitlement; masked before entering any context pack.";
    case "Confidential": return "Domain-scoped access; PII attributes masked; never exposed to agents with direct-source access.";
    case "Licensed": return "Third-party licensed data; non-derivative use only, citation mandatory.";
    case "Internal": return "Available to all authenticated tenant principals and eligible context profiles.";
    default: return "Public evidence; no entitlement restriction applied.";
  }
}

function emphasisDomains(domain: string): string[] {
  const map: Record<string, string[]> = {
    Underwriting: ["submission", "policy", "broker", "risk", "claim"],
    Policy: ["policy", "customer", "claim"],
    Insurance: ["policy", "customer", "claim"],
    Risk: ["risk", "location", "asset"],
    Claims: ["claim", "policy"],
  };
  return map[domain] ?? ENTITIES.map((e) => e.id);
}

function StorageDonut({ onSelect }: { onSelect: (id: string) => void }) {
  const [hover, setHover] = useState<string | null>(null);
  let offset = 0;
  const R = 54, C = 2 * Math.PI * R;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 140 140" className="h-[150px] w-[150px] shrink-0" role="img" aria-label="Storage distribution by index type">
        <g transform="rotate(-90 70 70)">
          {STORAGE.map((s) => {
            const len = (s.pct / 100) * C;
            const el = (
              <circle key={s.id} cx="70" cy="70" r={R} fill="none" stroke={s.color}
                strokeWidth={hover === s.id ? 22 : 18} strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset}
                className="cursor-pointer transition-[stroke-width]"
                onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)} onClick={() => onSelect(s.id)} />
            );
            offset += len;
            return el;
          })}
        </g>
        <text x="70" y="66" textAnchor="middle" className="fill-slate-900 text-[15px] font-semibold">1.2 TB</text>
        <text x="70" y="80" textAnchor="middle" className="fill-slate-500 text-[8px]">Total indexed</text>
      </svg>
      <ul className="min-w-0 flex-1 space-y-1">
        {STORAGE.map((s) => (
          <RichTip key={s.id} as="li" tip={{
            term: s.name, definition: `${s.gb} GB (${s.pct}% of tenant evidence storage).`,
            rows: [["Object count", s.objects], ["Query volume", s.queries], ["Average latency", s.latency], ["Replication", s.replication], ["Retention", s.retention], ["Last optimization", s.optimized]],
          }}>
            <button onClick={() => onSelect(s.id)} onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)}
              className={cn("flex w-full items-center gap-2 rounded px-1.5 py-1 text-left transition-colors", hover === s.id ? "bg-slate-100" : "hover:bg-slate-50")}>
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} aria-hidden />
              <span className="flex-1 truncate text-[11.5px] text-slate-700">{s.name}</span>
              <span className="text-[11.5px] tabular-nums text-slate-600">{s.gb} GB</span>
              <span className="w-8 text-right text-[11px] tabular-nums text-slate-500">{s.pct}%</span>
            </button>
          </RichTip>
        ))}
      </ul>
    </div>
  );
}

function EntityModel({ emphasis, onEntity, onEdge }: { emphasis: Set<string> | null; onEntity: (id: string) => void; onEdge: (id: string) => void }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [labels, setLabels] = useState(true);
  const [hoverNode, setHoverNode] = useState<string | null>(null);

  const connected = new Set(EDGES.filter((e) => e.from === hoverNode || e.to === hoverNode).flatMap((e) => [e.from, e.to]));

  return (
    <div className="grid gap-3 lg:grid-cols-[150px_minmax(0,1fr)]">
      <ul className="space-y-1">
        {ENTITIES.map((e) => (
          <button key={e.id} onClick={() => onEntity(e.id)}
            className={cn("flex w-full items-center justify-between rounded border px-2 py-1 text-left text-[11.5px] transition-colors",
              emphasis && !emphasis.has(e.id) ? "border-slate-100 text-slate-400" : "border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/50")}>
            <span>{e.name}</span><span className="tabular-nums text-slate-500">{e.count}</span>
          </button>
        ))}
      </ul>

      <div className="min-w-0">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          <Btn onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}><ZoomIn className="h-3.5 w-3.5" />Zoom in</Btn>
          <Btn onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}><ZoomOut className="h-3.5 w-3.5" />Zoom out</Btn>
          <Btn onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}><Maximize2 className="h-3.5 w-3.5" />Fit graph</Btn>
          <Btn onClick={() => setLabels((v) => !v)}>{labels ? "Hide" : "Show"} relationship labels</Btn>
          <Btn onClick={() => setPan((p) => ({ x: p.x - 40, y: p.y }))}>Pan ←</Btn>
          <Btn onClick={() => setPan((p) => ({ x: p.x + 40, y: p.y }))}>Pan →</Btn>
        </div>
        <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50/50">
          <svg viewBox="0 0 840 260" className="h-[260px] w-full" role="img" aria-label="Enterprise entity relationship graph">
            <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
              {EDGES.map((e) => {
                const a = ENTITIES.find((x) => x.id === e.from)!, b = ENTITIES.find((x) => x.id === e.to)!;
                const dim = (emphasis && (!emphasis.has(a.id) || !emphasis.has(b.id))) || (hoverNode && !(e.from === hoverNode || e.to === hoverNode));
                return (
                  <g key={e.id} className="cursor-pointer" onClick={() => onEdge(e.id)}>
                    <line x1={a.x + 44} y1={a.y + 16} x2={b.x + 44} y2={b.y + 16}
                      stroke={dim ? "#e2e8f0" : "#94a3b8"} strokeWidth={dim ? 1 : 1.6} />
                    {labels && !dim && (
                      <text x={(a.x + b.x) / 2 + 44} y={(a.y + b.y) / 2 + 12} textAnchor="middle"
                        className="fill-slate-500 text-[9px]">{e.label}</text>
                    )}
                  </g>
                );
              })}
              {ENTITIES.map((n) => {
                const dim = emphasis ? !emphasis.has(n.id) : false;
                const hl = hoverNode === n.id || (hoverNode ? connected.has(n.id) : false);
                return (
                  <g key={n.id} className="cursor-pointer"
                    onMouseEnter={() => setHoverNode(n.id)} onMouseLeave={() => setHoverNode(null)}
                    onClick={() => onEntity(n.id)}>
                    <rect x={n.x} y={n.y} width={88} height={32} rx={6}
                      fill={dim ? "#f8fafc" : "#ffffff"} stroke={hl ? "#2563eb" : dim ? "#e2e8f0" : "#cbd5e1"} strokeWidth={hl ? 2 : 1} />
                    <text x={n.x + 44} y={n.y + 14} textAnchor="middle" className={cn("text-[11px] font-medium", dim ? "fill-slate-400" : "fill-slate-800")}>{n.name}</text>
                    <text x={n.x + 44} y={n.y + 25} textAnchor="middle" className="fill-slate-500 text-[9px]">{n.count}</text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Drawers -------------------------------- */

function Drawers({ state, onClose, agg, quality }: { state: DrawerState; onClose: () => void; agg: any; quality: typeof QUALITY }) {
  if (!state) return <InspectDrawer open={false} onClose={onClose} objectType="" name="" tabs={[]} />;

  if (state.kind === "source") {
    const s = SOURCES.find((x) => x.id === state.id);
    if (!s) return null;
    return (
      <InspectDrawer open onClose={onClose} objectType={`Source · ${s.id}`} name={s.name} status={s.status} statusTone={healthTone(s.status) as any}
        tabs={[
          { id: "overview", label: "Overview", content: (
            <div>
              <p className="text-[12px] leading-relaxed text-slate-700">{s.description}</p>
              {s.statusReason && <div className="mt-2 rounded border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11.5px] text-amber-900">
                <div className="font-semibold">Degraded — {s.statusReason}</div>
                <div className="mt-0.5">Impact: ITSM evidence falls out of freshness SLA on expiry. Recommended action: rotate the OAuth credential.</div>
              </div>}
              <SubHead>Overview</SubHead>
              <KV rows={[["Owner", s.owner], ["Business Domain", s.domain], ["Connector Type", s.connector], ["Region", s.region], ["Authentication", s.auth], ["Objects", s.objectsLabel], ["Last Sync", s.lastIngest], ["Freshness", `${s.freshness}%`], ["Quality", String(s.quality)], ["Classification", s.classification]]} />
            </div>) },
          { id: "connection", label: "Connection", content: (
            <div>
              <KV rows={[["Endpoint", `${s.connector.toLowerCase().replace(/\s/g, "")}.dual.internal`], ["Warehouse", "UW_ANALYTICS_WH"], ["Database", "UW_PROD"], ["Schema", "SUBMISSIONS, POLICY_FACT"], ["Role", "NEUGAIN_CONTEXT_READER"], ["Authentication Method", s.auth], ["Credential Rotation", "90 days · vault reference"], ["Network Policy", "Private Link, tenant VPC only"], ["TLS", "TLS 1.3, certificate pinned"], ["Connection Pool", "12 connections, 30s idle"]]} />
              <p className="mt-2 text-[11px] text-slate-500">Secrets are never displayed or stored by the platform; only vault references are persisted.</p>
            </div>) },
          { id: "schemas", label: "Schemas", content: (
            <table className="w-full text-left text-[11.5px]">
              <thead><tr className="border-b border-slate-200 text-[10.5px] uppercase text-slate-500"><th className="py-1">Source field</th><th className="py-1">Canonical field</th><th className="py-1">State</th></tr></thead>
              <tbody>
                {[["POLICY_NBR", "policy.policy_id", "Mapped"], ["INSURED_NM", "customer.legal_name", "Mapped"], ["EFF_DT", "policy.effective_date", "Mapped"], ["PREM_AMT", "policy.premium", "Mapped"], ["ENDORSE_TYP", "policy.endorsement_type", "Unmapped"]].map(([a, b, c]) => (
                  <tr key={a} className="border-b border-slate-100"><td className="py-1 font-mono text-[11px]">{a}</td><td className="py-1 font-mono text-[11px] text-slate-600">{b}</td>
                    <td className="py-1">{c === "Mapped" ? <StatePill tone="ok" label="Mapped" /> : <StatePill tone="warn" label="Unmapped" />}</td></tr>
                ))}
              </tbody>
            </table>) },
          { id: "ingestion", label: "Ingestion", content: (
            <KV rows={[["Mode", "CDC + Incremental"], ["Schedule", "Continuous"], ["Checkpoint", s.lastSuccessfulJob], ["Average Throughput", s.throughput], ["Failed Objects", String(s.failures)], ["Retry Policy", "Exponential"], ["Dead Letter Queue", "Enabled"]]} />) },
          { id: "security", label: "Security", content: (
            <div>
              <KV rows={[["Allowed Domains", `${s.domain}, Risk`], ["PII", s.pii], ["Masking", s.pii === "None" ? "Not required" : "Enabled"], ["Agent Direct Access", "Disabled"], ["Evidence Access", "Context service only"], ["Classification", s.classification]]} />
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{classificationImplication(s.classification)}</p>
            </div>) },
          { id: "usage", label: "Usage", content: (
            <div>
              <KV rows={[["Used by Context Profiles", String(s.contextProfiles)]]} />
              <SubHead>Digital coworkers consuming derived context</SubHead>
              <Bullets items={s.coworkers} />
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">These coworkers do not connect to {s.name} directly. They consume tenant-governed context assembled by the context service.</p>
            </div>) },
          { id: "history", label: "History", content: <AuditTable rows={AUDIT_TRAIL} /> },
        ]} />
    );
  }

  if (state.kind === "stage") {
    const st = PIPELINE.find((x) => x.id === state.id);
    if (!st) return null;
    return (
      <InspectDrawer open onClose={onClose} objectType="Pipeline Stage" name={st.id === "assemble" ? "Context Assembly" : st.name}
        status="Configured" statusTone="ok"
        tabs={[
          { id: "overview", label: "Overview", content: (
            <div>
              <p className="text-[12px] leading-relaxed text-slate-700">{st.purpose}</p>
              <SubHead>Configured services</SubHead><Bullets items={st.components} />
              <SubHead>Owning team</SubHead><p className="text-[11.5px] text-slate-700">{st.owner}</p>
              {st.id === "assemble" && (
                <>
                  <SubHead>Assembly flow</SubHead>
                  <ol className="space-y-1">
                    {ASSEMBLY_FLOW.map((f, i) => (
                      <li key={f} className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50/60 px-2 py-1 text-[11.5px] text-slate-700">
                        <span className="grid h-4 w-4 place-items-center rounded-full bg-slate-200 text-[9px] font-semibold text-slate-700">{i + 1}</span>{f}
                      </li>
                    ))}
                  </ol>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-500">Context is intentionally assembled, not blindly retrieved.</p>
                </>
              )}
            </div>) },
          { id: "config", label: "Configuration", content: <KV rows={st.configuration.map(([k, v]) => [k, v] as [string, any])} /> },
          { id: "rules", label: "Rules", content: <div><SubHead>Processing rules</SubHead><Bullets items={st.rules} /><SubHead>Quality gates</SubHead><Bullets items={st.gates} /></div> },
          { id: "io", label: "Dependencies", content: <div><SubHead>Inputs</SubHead><Bullets items={st.inputs} /><SubHead>Outputs</SubHead><Bullets items={st.outputs} /><SubHead>Downstream</SubHead><Bullets items={st.downstream} /></div> },
          { id: "history", label: "History", content: <Bullets items={st.changes.map((c) => `${c.at} · ${c.actor} — ${c.change}`)} /> },
        ]} />
    );
  }

  if (state.kind === "index") {
    const s = STORAGE.find((x) => x.id === state.id);
    if (!s) return null;
    return <InspectDrawer open onClose={onClose} objectType="Index / Store" name={s.name} status="Healthy" statusTone="ok"
      tabs={[{ id: "o", label: "Overview", content: <KV rows={[["Storage", `${s.gb} GB (${s.pct}%)`], ["Object count", s.objects], ["Query volume", s.queries], ["Average latency", s.latency], ["Replication", s.replication], ["Retention", s.retention], ["Last optimization", s.optimized]]} /> },
        { id: "h", label: "History", content: <AuditTable rows={AUDIT_TRAIL.filter((a) => a.object.toLowerCase().includes("index"))} /> }]} />;
  }

  if (state.kind === "entity") {
    const e = ENTITIES.find((x) => x.id === state.id);
    if (!e) return null;
    return <InspectDrawer open onClose={onClose} objectType="Entity Definition" name={e.name} status={`Quality ${e.quality}`} statusTone={scoreTone(e.quality) as any}
      tabs={[
        { id: "o", label: "Overview", content: (<div><p className="text-[12px] leading-relaxed text-slate-700">{e.description}</p>
          <SubHead>Canonical schema</SubHead><Bullets items={e.schema} />
          <SubHead>Source systems</SubHead><Bullets items={e.sources} />
          <SubHead>Model facts</SubHead><KV rows={[["Resolved entities", e.count], ["Domain", e.domain], ["Quality", String(e.quality)], ["Last schema update", e.schemaUpdated]]} /></div>) },
        { id: "r", label: "Dependencies", content: <Bullets items={EDGES.filter((x) => x.from === e.id || x.to === e.id).map((x) => `${x.from.toUpperCase()} ${x.label} ${x.to.toUpperCase()} (${x.cardinality})`)} /> },
      ]} />;
  }

  if (state.kind === "edge") {
    const e = EDGES.find((x) => x.id === state.id);
    if (!e) return null;
    return <InspectDrawer open onClose={onClose} objectType="Relationship Definition" name={`${e.from.toUpperCase()} ${e.label} ${e.to.toUpperCase()}`} status={`Confidence ${e.confidence}`} statusTone="ok"
      tabs={[{ id: "o", label: "Overview", content: <KV rows={[["Relationship type", e.label], ["Cardinality", e.cardinality], ["Confidence", String(e.confidence)], ["Deriving source", e.source], ["Derivation rule", e.rule]]} /> }]} />;
  }

  if (state.kind === "quality") {
    const d = quality.find((x) => x.key === state.id);
    if (!d) return null;
    return <InspectDrawer open onClose={onClose} objectType="Quality Dimension" name={d.key} status={`${d.score}%`} statusTone={scoreTone(d.score) as any}
      tabs={[{ id: "o", label: "Overview", content: (<div><p className="text-[12px] leading-relaxed text-slate-700">{d.definition}</p>
        <SubHead>Measurement</SubHead><KV rows={[["Calculation", d.calculation], ["Current", `${d.score}%`], ["Target", `${d.target}%`], ["Violations", String(d.violations)], ["Trend", d.trend]]} />
        <SubHead>Top contributing sources</SubHead><Bullets items={d.contributors} /></div>) }]} />;
  }

  if (state.kind === "exception") {
    const x = QUALITY_EXCEPTIONS.find((e) => e.id === state.id) ?? QUALITY_EXCEPTIONS[0];
    return <InspectDrawer open onClose={onClose} objectType={x.type} name={x.id} status="Open" statusTone="warn"
      tabs={[{ id: "o", label: "Overview", content: <KV rows={[["Affected object", x.object], ["Impact", x.impact], ["Recommended action", x.action], ["Assigned queue", "Data steward"]]} /> }]} />;
  }

  if (state.kind === "policy") {
    const p = POLICIES.find((x) => x.id === state.id);
    if (!p) return null;
    return <InspectDrawer open onClose={onClose} objectType="Policy Family" name={p.name} status={p.state} statusTone={p.tone === "ok" ? "ok" : "warn"}
      tabs={[
        { id: "o", label: "Overview", content: (<div><p className="text-[12px] leading-relaxed text-slate-700">{p.controls}</p>
          <SubHead>Policies in family</SubHead>
          {p.items.length === 0
            ? <EmptyState title="No Context Policies Configured" body="Context eligibility policies determine which evidence may participate in agent reasoning." cta="Create Context Policy" />
            : <KV rows={p.items.map((i) => [i.name, `${i.scope} · ${i.status}`] as [string, any])} />}</div>) },
        { id: "h", label: "History", content: <AuditTable rows={AUDIT_TRAIL} /> },
      ]} />;
  }

  if (state.kind === "audit") {
    return <InspectDrawer open onClose={onClose} objectType="Audit" name="Configuration Audit Trail" tabs={[{ id: "o", label: "History", content: <AuditTable rows={AUDIT_TRAIL} full /> }]} />;
  }

  // KPI drawers
  const kpi = state.id;
  const map: Record<string, { name: string; type: string; content: any }> = {
    sources: { name: "Connected Sources", type: "Tenant KPI", content: <KV rows={[["Active", `${agg.count}`], ["Inactive", String(INACTIVE_SOURCES)], ["Registered total", "40"], ["Healthy", String(SOURCES.filter((s) => s.status === "Healthy").length)], ["Attention", String(SOURCES.filter((s) => s.status !== "Healthy").length)], ["Credential expiry within 24h", "1"]]} /> },
    objects: { name: "Index Inventory", type: "Tenant KPI", content: <KV rows={STORAGE.map((s) => [s.name, `${s.gb} GB · ${s.objects}`] as [string, any])} /> },
    entities: { name: "Entity Model", type: "Tenant KPI", content: <KV rows={ENTITIES.map((e) => [e.name, e.count] as [string, any])} /> },
    freshness: { name: "Freshness Policy", type: "Tenant KPI", content: <KV rows={SOURCES.map((s) => [s.name, `${s.freshness}% (SLA ${s.freshnessSla}%)`] as [string, any])} /> },
    quality: { name: "Quality Details", type: "Tenant KPI", content: <KV rows={quality.map((d) => [d.key, `${d.score}%`] as [string, any])} /> },
    policies: { name: "Policy Overview", type: "Tenant KPI", content: <KV rows={POLICIES.map((p) => [p.name, `${p.count} · ${p.state}`] as [string, any])} /> },
    storage: { name: "Storage & Index Configuration", type: "Configuration", content: <KV rows={STORAGE.map((s) => [s.name, `${s.gb} GB · ${s.replication} · ${s.latency}`] as [string, any])} /> },
  };
  const k = map[kpi];
  if (!k) return null;
  return <InspectDrawer open onClose={onClose} objectType={k.type} name={k.name} tabs={[{ id: "o", label: "Overview", content: k.content }, { id: "h", label: "History", content: <AuditTable rows={AUDIT_TRAIL} /> }]} />;
}

function AuditTable({ rows, full }: { rows: typeof AUDIT_TRAIL; full?: boolean }) {
  return (
    <div className="space-y-1.5">
      {rows.map((a) => (
        <div key={a.ticket} className="rounded border border-slate-200 px-2.5 py-2 text-[11.5px]">
          <div className="flex justify-between"><span className="font-medium text-slate-800">{a.action} · {a.object}</span><span className="text-slate-500">{a.at}</span></div>
          <div className="mt-0.5 text-slate-600">{a.actor}</div>
          <div className="mt-0.5 text-slate-700">{a.oldValue} → <span className="font-medium">{a.newValue}</span></div>
          {full && <div className="mt-0.5 text-slate-500">Reason: {a.reason} · {a.ticket}</div>}
          {!full && <div className="mt-0.5 text-slate-500">{a.ticket}</div>}
        </div>
      ))}
    </div>
  );
}
