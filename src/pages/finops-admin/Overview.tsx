// Overview workspace for the Agentic AI FinOps & Cost Management administration
// plane: KPI row, optimization opportunity registry, FinOps decision pipeline,
// unit economics, policy governance, cloud account health, savings realization
// chain, execution channels and the architectural service contract.
//
// Selection, filters and the open drawer are held in the URL so browser back
// and deep links behave correctly.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Search, RefreshCw, Download, SlidersHorizontal, Columns3, ArrowUpDown,
  ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Minus, FlaskConical, Command,
} from "lucide-react";
import {
  Panel, RichTip, InspectDrawer, KV, SubHead, Bullets, StatePill, KpiCard, Btn,
  SkeletonPanel, EmptyState, healthTone, riskTone, type DrawerTab,
} from "./parts";
import {
  KPIS, OPPORTUNITIES, PIPELINE, UNIT_ECONOMICS, POLICIES, ACCOUNTS,
  SAVINGS_CHAIN, REALIZATION_METRICS, CHANNELS, RIGHTSIZING_POLICY, CONTRACT,
  type Opportunity,
} from "./data";
import { buildEngineeringDrawer } from "./ExplainDrawers";
import {
  ConflictBanner, RecommendationPanel, AnomalyPanel, GovernancePanels,
  PolicySimulator, GlobalSearch,
} from "./EngineeringPanels";
import { FILTERS, RECOMMENDATIONS, ROLES, can, CAP_REASON, type RoleId } from "./engineering";
import { exportCsv } from "@/lib/operations/exports";


const ALL_COLUMNS = [
  { id: "type", label: "Opportunity Type", locked: true },
  { id: "scope", label: "Scope" },
  { id: "domain", label: "Domain" },
  { id: "recs", label: "Recommendations" },
  { id: "savings", label: "Potential Savings" },
  { id: "confidence", label: "Confidence" },
  { id: "risk", label: "Risk" },
  { id: "status", label: "Status" },
  { id: "owner", label: "Owner" },
  { id: "evaluated", label: "Last Evaluated" },
];

type SortKey = "type" | "recs" | "savings" | "confidence" | "risk" | "status";

export default function FinOpsAdminOverview() {
  const [params, setParams] = useSearchParams();

  /* ------------------------------ URL state ------------------------------ */
  const drawer = params.get("drawer") ?? "policy:rightsizing"; // rightsizing policy opens by default
  const q = params.get("q") ?? "";
  const statusFilter = params.get("status") ?? "All";
  const riskFilter = params.get("risk") ?? "All";
  const providerFilter = params.get("provider") ?? "All";
  const envFilter = params.get("environment") ?? "All";
  const buFilter = params.get("bu") ?? "All";
  const categoryFilter = params.get("category") ?? "All";
  const confidenceFilter = params.get("confidence") ?? "All";
  const approvalFilter = params.get("approval") ?? "All";
  const executionFilter = params.get("execution") ?? "All";
  const validationFilter = params.get("validation") ?? "All";
  const role = (params.get("role") ?? "finops_admin") as RoleId;
  const sort = (params.get("sort") ?? "savings") as SortKey;
  const dir = params.get("dir") === "asc" ? "asc" : "desc";
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const dense = params.get("density") !== "comfortable";


  const setParam = useCallback((patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v === null ? next.delete(k) : next.set(k, v)));
    setParams(next, { replace: false });
  }, [params, setParams]);

  const openDrawer = (id: string) => setParam({ drawer: id });
  const closeDrawer = () => setParam({ drawer: "none" });

  /* ------------------------------ refresh -------------------------------- */
  const [loading, setLoading] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState("18 min ago");
  const refresh = () => {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setRefreshedAt("just now");
      toast.success("Registry re-scored", { description: "1,491 opportunities re-evaluated against current utilization telemetry and effective rates." });
    }, 700);
  };

  /* ---------------------------- column chooser --------------------------- */
  const [cols, setCols] = useState<string[]>(ALL_COLUMNS.map((c) => c.id));
  const [colMenu, setColMenu] = useState(false);
  const [filterMenu, setFilterMenu] = useState(false);
  useEffect(() => {
    if (!colMenu && !filterMenu) return;
    const h = () => { setColMenu(false); setFilterMenu(false); };
    window.addEventListener("click", h);
    return () => window.removeEventListener("click", h);
  }, [colMenu, filterMenu]);
  const show = (id: string) => cols.includes(id);

  /* --------------------- simulation + global search ---------------------- */
  const [simOpen, setSimOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  /* ------------------------------- table --------------------------------- */
  const riskOrder = ["Very Low", "Low", "Medium", "High"];
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const text = (o: Opportunity) => [o.id, o.type, o.scope, o.domain, o.owner, o.approval, o.execution].join(" ").toLowerCase();
    return OPPORTUNITIES.filter((o) => {
      if (statusFilter !== "All" && o.status !== statusFilter) return false;
      if (riskFilter !== "All" && o.risk !== riskFilter) return false;
      if (categoryFilter !== "All" && o.type !== categoryFilter) return false;
      if (providerFilter !== "All" && !text(o).includes(providerFilter.toLowerCase())) return false;
      if (buFilter !== "All" && !text(o).includes(buFilter.toLowerCase())) return false;
      if (envFilter !== "All") {
        const prod = /prod|underwriting|claims api|tenant-wide/i.test(o.scope);
        if (envFilter === "Production" && !prod) return false;
        if (envFilter !== "Production" && prod) return false;
      }
      if (confidenceFilter !== "All") {
        if (confidenceFilter === "≥ 90%" && o.confidence < 90) return false;
        if (confidenceFilter === "80–89%" && (o.confidence < 80 || o.confidence >= 90)) return false;
        if (confidenceFilter === "< 80%" && o.confidence >= 80) return false;
      }
      if (approvalFilter !== "All") {
        const required = !/no approval/i.test(o.approval);
        if (approvalFilter === "Not required" && required) return false;
        if (approvalFilter === "Pending" && !required) return false;
        if (approvalFilter === "Blocked" && o.status !== "Attention") return false;
        if (approvalFilter === "Approved" && o.status !== "Healthy") return false;
      }
      if (executionFilter !== "All") {
        if (executionFilter === "Scheduled" && !/schedul|window/i.test(o.execution)) return false;
        if (executionFilter === "Executed" && o.status !== "Healthy") return false;
        if (executionFilter === "Rolled Back" && !/rollback/i.test(o.rollback)) return false;
        if (executionFilter === "Not started" && o.status !== "Attention") return false;
      }
      if (validationFilter !== "All") {
        if (validationFilter === "Realized" && o.status !== "Healthy") return false;
        if (validationFilter === "Disputed" && o.type !== "Governance & Realization") return false;
      }
      if (!needle) return true;
      return text(o).includes(needle);
    });
  }, [q, statusFilter, riskFilter, categoryFilter, providerFilter, buFilter, envFilter,
    confidenceFilter, approvalFilter, executionFilter, validationFilter]);

  const activeFilters = [statusFilter, riskFilter, providerFilter, envFilter, buFilter, categoryFilter,
    confidenceFilter, approvalFilter, executionFilter, validationFilter].filter((v) => v !== "All").length;

  const clearFilters = () => setParam({
    q: null, status: null, risk: null, provider: null, environment: null, bu: null, category: null,
    confidence: null, approval: null, execution: null, validation: null, page: "1",
  });

  const sorted = useMemo(() => {
    const s = [...filtered].sort((a, b) => {
      let r = 0;
      if (sort === "savings") r = a.savings - b.savings;
      else if (sort === "recs") r = a.recs - b.recs;
      else if (sort === "confidence") r = a.confidence - b.confidence;
      else if (sort === "risk") r = riskOrder.indexOf(a.risk) - riskOrder.indexOf(b.risk);
      else r = String(a[sort]).localeCompare(String(b[sort]));
      return dir === "asc" ? r : -r;
    });
    return s;
  }, [filtered, sort, dir]);

  const perPage = 6;
  const pages = Math.max(1, Math.ceil(sorted.length / perPage));
  const clampedPage = Math.min(page, pages);
  const rows = sorted.slice((clampedPage - 1) * perPage, clampedPage * perPage);

  const toggleSort = (k: SortKey) =>
    setParam({ sort: k, dir: sort === k && dir === "desc" ? "asc" : "desc", page: "1" });

  const canExport = can(role, "export");
  const exportRegistry = () => {
    if (!canExport) return;
    exportCsv("finops-optimization-registry.csv", [
      ["ID", "Opportunity Type", "Scope", "Domain", "Recommendations", "Potential Monthly Savings", "Confidence", "Risk", "Status", "Owner", "Last Evaluated"],
      ...sorted.map((o) => [o.id, o.type, o.scope, o.domain, o.recs, o.savings, `${o.confidence}%`, o.risk, o.status, o.owner, o.evaluated]),
    ]);
    toast.success("Registry exported", { description: `${sorted.length} opportunity groups written to CSV.` });
  };

  /* ------------------------------- drawer -------------------------------- */
  const drawerNode = useMemo(() => buildEngineeringDrawer(drawer) ?? buildDrawer(drawer), [drawer]);


  const totalPotential = sorted.reduce((s, o) => s + o.savings, 0);

  return (
    <div className="space-y-4">
      {/* ------------------- operator context + global search ------------- */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
        <button onClick={() => setSearchOpen(true)}
          className="inline-flex h-7 min-w-[280px] flex-1 items-center gap-2 rounded-md border border-slate-200 px-2 text-left text-[12px] text-slate-500 hover:border-slate-300 hover:bg-slate-50">
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 truncate">Search opportunities, policies, cloud accounts, applications, resources, savings records…</span>
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1 text-[10px] text-slate-500">/</kbd>
        </button>
        <label className="flex items-center gap-1.5 text-[11.5px] text-slate-600">
          Acting role
          <select value={role} onChange={(e) => setParam({ role: e.target.value })}
            className="h-7 rounded border border-slate-200 px-1.5 text-[12px]" aria-label="Acting role">
            {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </label>
        <Btn onClick={() => openDrawer("roles:all")}>Permissions</Btn>
        <Btn onClick={() => setSimOpen(true)} disabled={!can(role, "simulate")} title={can(role, "simulate") ? undefined : CAP_REASON.simulate}>
          <FlaskConical className="h-3.5 w-3.5" /> Test Policy
        </Btn>
        <Btn onClick={() => openDrawer("audit:all")}><Command className="h-3.5 w-3.5" /> Audit trail</Btn>
      </div>

      {/* --------------------- conflicts and degradations ----------------- */}
      <ConflictBanner openDrawer={openDrawer} />

      {/* --------------------------- KPI row ------------------------------ */}
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {KPIS.map((k) => (
          <KpiCard key={k.id} label={k.label} value={k.value} secondary={k.secondary}
            selected={drawer === `kpi:${k.id}`}
            tip={{ term: k.label, definition: k.definition, rows: k.rows as [string, string][], why: k.why }}
            onClick={() => openDrawer(`kpi:${k.id}`)} />
        ))}
      </div>

      {/* ------------------- optimization opportunity registry ------------ */}
      <Panel
        title="Optimization Opportunity Registry"
        help="registry"
        subtitle={`${sorted.length} opportunity groups · ${totalPotential.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 })} risk-adjusted monthly savings · last evaluated ${refreshedAt}`}
        actions={
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setParam({ q: e.target.value || null, page: "1" })}
                placeholder="Search opportunities…" aria-label="Search opportunities"
                className="h-7 w-[200px] rounded-md border border-slate-200 pl-7 pr-2 text-[12px]" />
            </div>
            <div className="relative">
              <Btn onClick={() => { setFilterMenu((v) => !v); setColMenu(false); }} title="Filter">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
                {activeFilters > 0 && <span className="ml-1 rounded bg-blue-100 px-1 text-[10px] text-blue-700">{activeFilters}</span>}
              </Btn>
              {filterMenu && (
                <div className="absolute right-0 top-8 z-40 max-h-[420px] w-[260px] overflow-y-auto rounded-md border border-slate-200 bg-white p-3 shadow-xl" onClick={(e) => e.stopPropagation()}>
                  <FilterSelect label="Provider" value={providerFilter} options={FILTERS.provider} onChange={(v) => setParam({ provider: v, page: "1" })} />
                  <FilterSelect label="Business unit" value={buFilter} options={FILTERS.businessUnit} onChange={(v) => setParam({ bu: v, page: "1" })} />
                  <FilterSelect label="Environment" value={envFilter} options={FILTERS.environment} onChange={(v) => setParam({ environment: v, page: "1" })} />
                  <FilterSelect label="Category" value={categoryFilter} options={FILTERS.category} onChange={(v) => setParam({ category: v, page: "1" })} />
                  <FilterSelect label="Confidence" value={confidenceFilter} options={FILTERS.confidence} onChange={(v) => setParam({ confidence: v, page: "1" })} />
                  <FilterSelect label="Risk" value={riskFilter} options={FILTERS.risk} onChange={(v) => setParam({ risk: v, page: "1" })} />
                  <FilterSelect label="Approval state" value={approvalFilter} options={FILTERS.approvalState} onChange={(v) => setParam({ approval: v, page: "1" })} />
                  <FilterSelect label="Execution state" value={executionFilter} options={FILTERS.executionState} onChange={(v) => setParam({ execution: v, page: "1" })} />
                  <FilterSelect label="Validation state" value={validationFilter} options={FILTERS.validationState} onChange={(v) => setParam({ validation: v, page: "1" })} />
                  <FilterSelect label="Status" value={statusFilter} options={["All", "Healthy", "Attention"]} onChange={(v) => setParam({ status: v, page: "1" })} />
                  <button className="mt-2 text-[11.5px] text-blue-700 hover:underline" onClick={clearFilters}>Clear all filters</button>
                </div>
              )}
            </div>

            <div className="relative">
              <Btn onClick={() => { setColMenu((v) => !v); setFilterMenu(false); }} title="Choose columns"><Columns3 className="h-3.5 w-3.5" /> Columns</Btn>
              {colMenu && (
                <div className="absolute right-0 top-8 z-40 w-[220px] rounded-md border border-slate-200 bg-white p-2 shadow-xl" onClick={(e) => e.stopPropagation()}>
                  {ALL_COLUMNS.map((c) => (
                    <label key={c.id} className={cn("flex items-center gap-2 rounded px-1.5 py-1 text-[12px]", c.locked ? "text-slate-400" : "text-slate-700 hover:bg-slate-50")}>
                      <input type="checkbox" disabled={c.locked} checked={show(c.id)}
                        onChange={() => setCols((v) => (v.includes(c.id) ? v.filter((x) => x !== c.id) : [...v, c.id]))} />
                      {c.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <Btn onClick={() => setParam({ density: dense ? "comfortable" : "dense" })} title="Toggle row density">{dense ? "Comfortable" : "Dense"}</Btn>
            <Btn onClick={refresh} title="Re-score registry"><RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} /> Refresh</Btn>
            <Btn onClick={exportRegistry} disabled={!canExport} title={canExport ? "Export current view" : CAP_REASON.export}><Download className="h-3.5 w-3.5" /> Export</Btn>
          </>
        }
        bodyClassName="p-0"
      >
        {loading ? (
          <div className="p-4"><SkeletonPanel rows={6} /></div>
        ) : rows.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No opportunities match this view"
              body="No opportunity group satisfies the current search and filter combination. Clear the filters to return to the full registry."
              cta="Clear filters" onCta={clearFilters} />
          </div>

        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
                  <SortTh label="Opportunity Type" k="type" sort={sort} dir={dir} onSort={toggleSort} />
                  {show("scope") && <th className="px-3 py-2 font-medium">Scope</th>}
                  {show("domain") && <th className="px-3 py-2 font-medium">Domain</th>}
                  {show("recs") && <SortTh label="Recommendations" k="recs" right sort={sort} dir={dir} onSort={toggleSort} />}
                  {show("savings") && <SortTh label="Potential Savings" k="savings" right sort={sort} dir={dir} onSort={toggleSort} />}
                  {show("confidence") && <SortTh label="Confidence" k="confidence" right sort={sort} dir={dir} onSort={toggleSort} />}
                  {show("risk") && <SortTh label="Risk" k="risk" sort={sort} dir={dir} onSort={toggleSort} />}
                  {show("status") && <SortTh label="Status" k="status" sort={sort} dir={dir} onSort={toggleSort} />}
                  {show("owner") && <th className="px-3 py-2 font-medium">Owner</th>}
                  {show("evaluated") && <th className="px-3 py-2 font-medium">Last Evaluated</th>}
                  <th className="px-3 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.id} onClick={() => openDrawer(`opp:${o.id}`)}
                    className={cn("cursor-pointer border-b border-slate-100 transition-colors hover:bg-blue-50/40",
                      dense ? "h-9" : "h-12", drawer === `opp:${o.id}` && "bg-blue-50/60")}>
                    <td className="px-3">
                      <div className="font-medium text-slate-900">{o.type}</div>
                      <div className="font-mono text-[10.5px] text-slate-400">{o.id}</div>
                    </td>
                    {show("scope") && <td className="px-3 text-slate-700">{o.scope}</td>}
                    {show("domain") && <td className="px-3 text-slate-600">{o.domain}</td>}
                    {show("recs") && <td className="px-3 text-right tabular-nums text-slate-700">{o.recs.toLocaleString()}</td>}
                    {show("savings") && (
                      <td className="px-3 text-right">
                        <RichTip tip={{
                          term: "Potential Savings", definition: "Risk-adjusted, policy-eligible monthly savings for this opportunity group.",
                          rows: [["Gross detected", `$${Math.round(o.savings * 1.39).toLocaleString()}`], ["Policy eligible", `$${Math.round(o.savings * 1.11).toLocaleString()}`], ["Risk adjusted", `$${o.savings.toLocaleString()}`]],
                          why: "Gross detection overstates value; only risk-adjusted savings should enter a financial plan.",
                        }}>
                          <span className="font-semibold tabular-nums text-slate-900">${o.savings.toLocaleString()}/mo</span>
                        </RichTip>
                      </td>
                    )}
                    {show("confidence") && (
                      <td className="px-3 text-right">
                        <RichTip tip={{
                          term: "Confidence", definition: `Composite evidence score for ${o.type.toLowerCase()} in ${o.scope}.`,
                          rows: [["Telemetry completeness", `${Math.min(99, o.confidence + 5)}%`], ["Observation window", "28 days"], ["Method agreement", o.confidence >= 88 ? "High" : "Partial"], ["Historical accuracy", `${o.confidence - 3}%`]],
                          why: "Confidence below the tenant threshold routes to investigation rather than action.",
                        }}>
                          <span className={cn("font-medium tabular-nums", o.confidence >= 88 ? "text-emerald-700" : o.confidence >= 75 ? "text-amber-700" : "text-rose-700")}>{o.confidence}%</span>
                        </RichTip>
                      </td>
                    )}
                    {show("risk") && (
                      <td className="px-3">
                        <RichTip tip={{
                          term: "Risk", definition: "Composite of performance, availability, change, security and business risk for this change class.",
                          rows: [["Performance", o.risk === "High" ? "Elevated" : "Bounded"], ["Availability", o.rollback.includes("Not") ? "No rollback" : "Rollback available"], ["Change", o.execution], ["Business criticality", o.scope.includes("Prod") || o.scope.includes("Underwriting") ? "Tier 1" : "Tier 2"]],
                          why: "Risk class determines approval routing and whether autonomous execution is permitted.",
                        }}>
                          <StatePill tone={riskTone(o.risk)} label={`${o.risk} risk`} />
                        </RichTip>
                      </td>
                    )}
                    {show("status") && <td className="px-3"><StatePill tone={healthTone(o.status)} label={o.status} /></td>}
                    {show("owner") && <td className="px-3 text-slate-700">{o.owner}</td>}
                    {show("evaluated") && <td className="px-3 text-slate-500">{o.evaluated}</td>}
                    <td className="px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <button onClick={() => openDrawer(`opp:${o.id}`)}
                          className="text-[11.5px] font-medium text-blue-700 hover:underline">Inspect</button>
                        {RECOMMENDATIONS.filter((r) => r.opportunityId === o.id).map((r) => (
                          <button key={r.id} onClick={() => openDrawer(`rec:${r.id}`)}
                            className="text-[11.5px] font-medium text-blue-700 hover:underline">
                            {r.state === "Rejected" ? "Explain Rejection" : "Explain Recommendation"}
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

        <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 px-3 py-2 text-[11.5px] text-slate-600">
          <span>Showing {rows.length ? (clampedPage - 1) * perPage + 1 : 0}–{(clampedPage - 1) * perPage + rows.length} of {sorted.length}</span>
          <div className="flex-1" />
          <Btn onClick={() => setParam({ page: String(Math.max(1, clampedPage - 1)) })} disabled={clampedPage === 1}><ChevronLeft className="h-3.5 w-3.5" /> Previous</Btn>
          <span className="tabular-nums">Page {clampedPage} of {pages}</span>
          <Btn onClick={() => setParam({ page: String(Math.min(pages, clampedPage + 1)) })} disabled={clampedPage === pages}>Next <ChevronRight className="h-3.5 w-3.5" /></Btn>
        </div>
      </Panel>

      {/* ------------------------ decision pipeline ----------------------- */}
      <Panel title="FinOps Decision Pipeline" help="pipeline"
        subtitle="A detected opportunity is not realized savings. Each stage has its own evidence requirements, controls and exit criteria."
        bodyClassName="p-3">
        <div className="overflow-x-auto pb-1">
          <ol className="flex min-w-[1180px] items-stretch gap-1.5">
            {PIPELINE.map((s, i) => (
              <li key={s.id} className="flex min-w-0 flex-1 items-stretch gap-1.5">
                <RichTip as="div" className="min-w-0 flex-1" tip={{
                  term: s.label, definition: s.summary,
                  rows: [[s.listTitle, s.items.slice(0, 3).join(", ")], ["Current", `${s.metric} ${s.metricLabel}`], ["State", s.health]],
                  why: "Opportunities cannot skip a stage; each exit criterion is tenant policy.",
                }}>
                  <button onClick={() => openDrawer(`stage:${s.id}`)}
                    className={cn("h-full w-full rounded-md border p-2.5 text-left transition-all hover:-translate-y-px hover:shadow-sm",
                      drawer === `stage:${s.id}` ? "border-blue-400 bg-blue-50/60" : s.health === "Attention" ? "border-amber-300 bg-amber-50/50" : "border-slate-200 bg-white")}>
                    <div className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">Stage {i + 1}</div>
                    <div className="mt-0.5 text-[12px] font-semibold leading-tight text-slate-900">{s.label}</div>
                    <div className="mt-1.5 text-[17px] font-semibold leading-none tabular-nums text-slate-900">{s.metric}</div>
                    <div className="text-[10.5px] text-slate-500">{s.metricLabel}</div>
                    <ul className="mt-1.5 space-y-0.5 border-t border-slate-100 pt-1.5">
                      {s.items.slice(0, 4).map((it) => (
                        <li key={it} className="truncate text-[10.5px] text-slate-600">{it}</li>
                      ))}
                      {s.items.length > 4 && <li className="text-[10.5px] font-medium text-blue-700">+{s.items.length - 4} more</li>}
                    </ul>
                  </button>
                </RichTip>
                {i < PIPELINE.length - 1 && <div className="flex items-center text-slate-300">→</div>}
              </li>
            ))}
          </ol>
        </div>
      </Panel>

      {/* ------------------ recommendation engineering registry ----------- */}
      <RecommendationPanel role={role} drawer={drawer} openDrawer={openDrawer} loading={loading} />

      {/* ---------------------------- anomalies --------------------------- */}
      <AnomalyPanel drawer={drawer} openDrawer={openDrawer} />



      {/* ------------------ unit economics + policy governance ------------ */}
      <div className="grid gap-4 2xl:grid-cols-[1.35fr_1fr]">
        <Panel title="Unit Economics & Spend Allocation" help="unitecon"
          subtitle="Allocated spend expressed against a governed business demand driver." bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2 font-medium">Service / Application</th>
                  <th className="px-3 py-2 text-right font-medium">Monthly Spend</th>
                  <th className="px-3 py-2 text-right font-medium">Allocation Coverage</th>
                  <th className="px-3 py-2 font-medium">Business Unit</th>
                  <th className="px-3 py-2 font-medium">Unit</th>
                  <th className="px-3 py-2 text-right font-medium">Cost / Unit</th>
                  <th className="px-3 py-2 text-right font-medium">Trend</th>
                  <th className="px-3 py-2 font-medium">Owner</th>
                </tr>
              </thead>
              <tbody>
                {UNIT_ECONOMICS.map((u) => (
                  <RichTip key={u.id} as="tr" className={cn("cursor-pointer border-b border-slate-100 transition-colors hover:bg-blue-50/40", drawer === `unit:${u.id}` && "bg-blue-50/60")}
                    tip={{
                      term: `${u.service} — cost composition`, definition: `Demand driver: ${u.driver}`,
                      rows: u.composition, why: "Unit cost reveals efficiency independent of growth; absolute spend alone does not.",
                    }}>
                    <td className="px-3 py-1.5 font-medium text-slate-900" onClick={() => openDrawer(`unit:${u.id}`)}>{u.service}</td>
                    <td className="px-3 text-right tabular-nums text-slate-800" onClick={() => openDrawer(`unit:${u.id}`)}>{u.spend}</td>
                    <td className="px-3 text-right" onClick={() => openDrawer(`unit:${u.id}`)}>
                      <span className={cn("tabular-nums font-medium", u.coverage >= 95 ? "text-emerald-700" : "text-amber-700")}>{u.coverage}%</span>
                    </td>
                    <td className="px-3 text-slate-600" onClick={() => openDrawer(`unit:${u.id}`)}>{u.bu}</td>
                    <td className="px-3 text-slate-600" onClick={() => openDrawer(`unit:${u.id}`)}>{u.unit}</td>
                    <td className="px-3 text-right font-semibold tabular-nums text-slate-900" onClick={() => openDrawer(`unit:${u.id}`)}>{u.costPerUnit}</td>
                    <td className="px-3 text-right" onClick={() => openDrawer(`unit:${u.id}`)}>
                      <span className={cn("inline-flex items-center gap-1 tabular-nums",
                        u.trendDir === "down" ? "text-emerald-700" : u.trendDir === "up" ? "text-rose-700" : "text-slate-500")}>
                        {u.trendDir === "down" ? <TrendingDown className="h-3 w-3" /> : u.trendDir === "up" ? <TrendingUp className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                        {u.trend}
                      </span>
                    </td>
                    <td className="px-3 text-slate-600" onClick={() => openDrawer(`unit:${u.id}`)}>{u.owner}</td>
                  </RichTip>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Policy & Governance Summary" help="policies"
          subtitle="Tenant policy families bounding detection, routing, approval, execution and financial recognition." bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2 font-medium">Policy Family</th>
                  <th className="px-3 py-2 text-right font-medium">Active</th>
                  <th className="px-3 py-2 text-right font-medium">Pending</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {POLICIES.map((p) => (
                  <RichTip key={p.id} as="tr" className={cn("cursor-pointer border-b border-slate-100 transition-colors hover:bg-blue-50/40", drawer === `pol:${p.id}` && "bg-blue-50/60")}
                    tip={{ term: p.family, definition: p.purpose, rows: [["Enforcement", p.enforcement], ["Owner", p.owner], ["Active", String(p.active)], ["Pending change", String(p.pending)]], why: "Policy is the boundary between governed autonomy and unsupervised change." }}>
                    <td className="px-3 py-1.5 font-medium text-slate-900" onClick={() => openDrawer(`pol:${p.id}`)}>{p.family}</td>
                    <td className="px-3 text-right tabular-nums text-slate-800" onClick={() => openDrawer(`pol:${p.id}`)}>{p.active}</td>
                    <td className="px-3 text-right tabular-nums text-slate-600" onClick={() => openDrawer(`pol:${p.id}`)}>{p.pending || "—"}</td>
                    <td className="px-3" onClick={() => openDrawer(`pol:${p.id}`)}><StatePill tone={healthTone(p.status)} label={p.status} /></td>
                  </RichTip>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {/* ------------------ cloud accounts + savings realization ---------- */}
      <div className="grid gap-4 2xl:grid-cols-[1fr_1fr]">
        <Panel title="Cloud Accounts & Provider Health" help="accounts"
          subtitle="Billing and telemetry connectivity across the governed estate." bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2 font-medium">Provider</th>
                  <th className="px-3 py-2 font-medium">Accounts</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Last Sync</th>
                  <th className="px-3 py-2 text-right font-medium">Spend Coverage</th>
                  <th className="px-3 py-2 text-right font-medium">Allocation</th>
                  <th className="px-3 py-2 font-medium">Telemetry</th>
                </tr>
              </thead>
              <tbody>
                {ACCOUNTS.map((a) => (
                  <RichTip key={a.id} as="tr" className={cn("cursor-pointer border-b border-slate-100 transition-colors hover:bg-blue-50/40", drawer === `acc:${a.id}` && "bg-blue-50/60")}
                    tip={{ term: a.provider, definition: a.note, rows: [["Monthly spend", a.spend], ["Connector", a.connector], ["Spend coverage", `${a.spendCoverage}%`], ["Allocation coverage", `${a.allocationCoverage}%`]], why: "Coverage gaps become blind spots that produce both missed savings and unsafe recommendations." }}>
                    <td className="px-3 py-1.5 font-medium text-slate-900" onClick={() => openDrawer(`acc:${a.id}`)}>{a.provider}</td>
                    <td className="px-3 text-slate-700" onClick={() => openDrawer(`acc:${a.id}`)}>{a.accounts}</td>
                    <td className="px-3" onClick={() => openDrawer(`acc:${a.id}`)}><StatePill tone={healthTone(a.status)} label={a.status} /></td>
                    <td className="px-3 text-slate-500" onClick={() => openDrawer(`acc:${a.id}`)}>{a.lastSync}</td>
                    <td className="px-3 text-right tabular-nums text-slate-800" onClick={() => openDrawer(`acc:${a.id}`)}>{a.spendCoverage}%</td>
                    <td className="px-3 text-right" onClick={() => openDrawer(`acc:${a.id}`)}>
                      <span className={cn("tabular-nums font-medium", a.allocationCoverage >= 90 ? "text-emerald-700" : "text-amber-700")}>{a.allocationCoverage}%</span>
                    </td>
                    <td className="px-3" onClick={() => openDrawer(`acc:${a.id}`)}><StatePill tone={healthTone(a.telemetry)} label={a.telemetry} /></td>
                  </RichTip>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Savings Validation & Realization" help="savings"
          actions={
            <>
              <Btn onClick={() => openDrawer("svg:SVG-2026-04122")}>Explain Savings</Btn>
              <Btn onClick={() => openDrawer("svg:SVG-2026-04150")} title="Validation exception after demand normalization">Exception case</Btn>
              <Btn onClick={() => openDrawer("baseline:v6")}>Baseline</Btn>
            </>
          }
          subtitle="Annualized savings state chain. Only realized savings are reported to Finance." bodyClassName="p-3">
          <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-1.5">
              {SAVINGS_CHAIN.map((s) => {
                const width = Math.max(6, Math.round((s.amount / SAVINGS_CHAIN[0].amount) * 100));
                return (
                  <RichTip key={s.id} as="div" tip={{ term: s.label, definition: s.definition, rows: [["Amount", s.value], ["Records", s.records], ["Gate", s.gate]], why: "Reporting projected savings as realized destroys programme credibility with Finance." }}>
                    <button onClick={() => openDrawer(`sav:${s.id}`)}
                      className={cn("w-full rounded-md border px-2.5 py-1.5 text-left transition-colors",
                        drawer === `sav:${s.id}` ? "border-blue-400 bg-blue-50/60" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50")}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[12px] font-medium text-slate-800">{s.label}</span>
                        <span className={cn("text-[13px] font-semibold tabular-nums",
                          s.tone === "green" ? "text-emerald-700" : s.tone === "amber" ? "text-amber-700" : s.tone === "blue" ? "text-blue-700" : "text-slate-800")}>{s.value}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className={cn("h-full rounded-full",
                          s.tone === "green" ? "bg-emerald-500" : s.tone === "amber" ? "bg-amber-500" : s.tone === "blue" ? "bg-blue-500" : "bg-slate-400")}
                          style={{ width: `${width}%` }} />
                      </div>
                      <div className="mt-0.5 text-[10.5px] text-slate-500">{s.records} · {s.gate}</div>
                    </button>
                  </RichTip>
                );
              })}
            </div>
            <div className="space-y-1.5">
              {REALIZATION_METRICS.map((m) => (
                <RichTip key={m.id} as="div" tip={{ term: m.label, definition: m.definition, why: m.detail }}>
                  <button onClick={() => openDrawer(`real:${m.id}`)}
                    className={cn("w-full rounded-md border px-2.5 py-2 text-left transition-colors",
                      drawer === `real:${m.id}` ? "border-blue-400 bg-blue-50/60" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50")}>
                    <div className="text-[11px] text-slate-500">{m.label}</div>
                    <div className={cn("mt-0.5 text-[18px] font-semibold leading-none tabular-nums", m.tone === "ok" ? "text-emerald-700" : "text-amber-700")}>{m.value}</div>
                  </button>
                </RichTip>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      {/* --------------------- execution channels ------------------------- */}
      <Panel title="Execution Channels & Tool Bindings" help="channels"
        subtitle="Optimization change may execute only through a registered channel with declared operations and approval requirements." bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2 font-medium">System / Channel</th>
                <th className="px-3 py-2 font-medium">Invocation Mode</th>
                <th className="px-3 py-2 font-medium">Approval Required</th>
                <th className="px-3 py-2 font-medium">Health</th>
                <th className="px-3 py-2 font-medium">Last Policy Sync</th>
                <th className="px-3 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {CHANNELS.map((c) => (
                <RichTip key={c.id} as="tr" className={cn("cursor-pointer border-b border-slate-100 transition-colors hover:bg-blue-50/40", drawer === `ch:${c.id}` && "bg-blue-50/60")}
                  tip={{ term: c.system, definition: c.note, rows: [["Mode", c.mode], ["Approval", c.approval], ["Allowed operations", c.operations.join(", ")], ["Credential", c.credential]], why: "Unregistered execution paths cannot be governed, approved, audited or rolled back." }}>
                  <td className="px-3 py-1.5 font-medium text-slate-900" onClick={() => openDrawer(`ch:${c.id}`)}>{c.system}</td>
                  <td className="px-3 text-slate-700" onClick={() => openDrawer(`ch:${c.id}`)}>{c.mode}</td>
                  <td className="px-3" onClick={() => openDrawer(`ch:${c.id}`)}>
                    <StatePill tone={c.approval === "No approval" ? "muted" : "warn"} label={c.approval} />
                  </td>
                  <td className="px-3" onClick={() => openDrawer(`ch:${c.id}`)}><StatePill tone={healthTone(c.health)} label={c.health} /></td>
                  <td className="px-3 text-slate-500" onClick={() => openDrawer(`ch:${c.id}`)}>{c.lastSync}</td>
                  <td className="px-3 text-right">
                    <button onClick={(e) => { e.stopPropagation(); openDrawer(`ch:${c.id}`); }} className="text-[11.5px] font-medium text-blue-700 hover:underline">Binding detail</button>
                  </td>
                </RichTip>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* ------------- attribution, baselines and governance --------------- */}
      <GovernancePanels role={role} openDrawer={openDrawer} />

      {/* ------------------------ service contract ------------------------ */}
      <Panel title="What this layer guarantees to neugain.io"
        subtitle="Technical service contract for the FinOps and cost management plane." bodyClassName="p-3">
        <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-5">
          {CONTRACT.map((c) => (
            <div key={c.term} className="rounded-md border border-slate-200 bg-slate-50/70 px-2.5 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{c.term}</div>
              <div className="mt-0.5 text-[11.5px] leading-snug text-slate-700">{c.body}</div>
            </div>
          ))}
        </div>
      </Panel>

      {drawerNode && (
        <InspectDrawer open onClose={closeDrawer} objectType={drawerNode.objectType} name={drawerNode.name}
          status={drawerNode.status} statusTone={drawerNode.statusTone} tabs={drawerNode.tabs}
          canEdit={can(role, "edit_policy")} />
      )}

      <PolicySimulator role={role} open={simOpen} onClose={() => setSimOpen(false)} />
      <GlobalSearch open={searchOpen} onOpen={() => setSearchOpen(true)} onClose={() => setSearchOpen(false)} openDrawer={openDrawer} />
    </div>

  );
}

/* ------------------------------- helpers --------------------------------- */

function SortTh({ label, k, right, sort, dir, onSort }: {
  label: string; k: SortKey; right?: boolean; sort: SortKey; dir: string; onSort: (k: SortKey) => void;
}) {
  return (
    <th className={cn("px-3 py-2 font-medium", right && "text-right")}>
      <button onClick={() => onSort(k)} className={cn("inline-flex items-center gap-1 hover:text-slate-900", sort === k && "text-slate-900")}>
        {label}<ArrowUpDown className="h-3 w-3" />{sort === k && <span className="text-[9px]">{dir === "asc" ? "▲" : "▼"}</span>}
      </button>
    </th>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="mb-2 block">
      <span className="mb-1 block text-[11px] font-medium text-slate-600">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-7 w-full rounded border border-slate-200 px-1.5 text-[12px]">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}

interface DrawerSpec { objectType: string; name: string; status?: string; statusTone?: "ok" | "warn" | "bad"; tabs: DrawerTab[] }

function buildDrawer(key: string): DrawerSpec | null {
  if (!key || key === "none") return null;
  const [kind, id] = key.split(":");

  if (kind === "policy" && id === "rightsizing") {
    const p = RIGHTSIZING_POLICY;
    return {
      objectType: "Optimization Policy", name: p.name, status: p.status, statusTone: "ok",
      tabs: [
        { id: "overview", label: "Overview", content: (
          <div>
            <p className="text-[12px] leading-relaxed text-slate-700">
              Governs how sustained compute overprovisioning is detected, engineered into a target configuration, approved, executed and financially validated.
            </p>
            <SubHead>Policy configuration</SubHead>
            <KV rows={[["Primary focus", p.focus], ["Scope", p.scope], ["Minimum savings", p.minSavings], ["Confidence threshold", p.confidenceThreshold], ["Approval", p.approval], ["Execution", p.execution], ["Rollback", p.rollback]]} />
          </div>) },
        { id: "config", label: "Configuration", content: (
          <div>
            <SubHead>Configuration summary</SubHead>
            <ol className="mt-1 space-y-1">
              {p.steps.map((s) => <PolicyStep key={s.id} index={s.id} label={s.label} detail={s.detail} />)}
            </ol>
          </div>) },
        { id: "risk", label: "Risk", content: (
          <div>
            <p className="text-[12px] leading-relaxed text-slate-700">Risk is scored per candidate and determines approval routing and autonomy eligibility.</p>
            <SubHead>Risk dimensions</SubHead>
            <Bullets items={[
              "Performance: target configuration must retain 40% headroom above observed peak.",
              "Availability: rollback definition captured and verified before apply.",
              "Change: blast-radius ceiling of 5% concurrent capacity per service.",
              "Security: no change to network exposure, IAM or encryption posture.",
              "Business: Tier-1 services require two-person approval and a change record.",
            ]} />
          </div>) },
        { id: "approval", label: "Approval", content: (
          <div><KV rows={[["Required approvers", p.approval], ["Approval expiry", "14 days"], ["Escalation", "FinOps Director after 5 business days"], ["Freeze windows", "Retail peak, quarter-end close"], ["Autonomy", "Not eligible for autonomous execution"]]} /></div>) },
        { id: "validation", label: "Validation", content: (
          <div><KV rows={[["Technical validation", "Configuration confirmed + 72h SLO observation"], ["Financial validation", "Two billing cycles, demand normalized"], ["Variance tolerance", "10%"], ["Dispute routing", "Cloud Finance reconciliation queue"]]} /></div>) },
      ],
    };
  }

  if (kind === "kpi") {
    const k = KPIS.find((x) => x.id === id);
    if (!k) return null;
    return {
      objectType: "Tenant Metric", name: k.label, status: k.value, statusTone: "ok",
      tabs: [{ id: "m", label: "Measurement", content: (
        <div>
          <p className="text-[12px] leading-relaxed text-slate-700">{k.definition}</p>
          <SubHead>Breakdown</SubHead>
          <KV rows={k.rows as [string, string][]} />
          <SubHead>Why it matters</SubHead>
          <p className="text-[11.5px] leading-relaxed text-slate-700">{k.why}</p>
        </div>) }],
    };
  }

  if (kind === "opp") {
    const o = OPPORTUNITIES.find((x) => x.id === id);
    if (!o) return null;
    return {
      objectType: `Optimization Opportunity · ${o.id}`, name: `${o.type} — ${o.scope}`,
      status: o.status, statusTone: o.status === "Healthy" ? "ok" : "warn",
      tabs: [
        { id: "overview", label: "Overview", content: (
          <div>
            <p className="text-[12px] leading-relaxed text-slate-700">{o.method}</p>
            <SubHead>Summary</SubHead>
            <KV rows={[["Domain", o.domain], ["Recommendations", o.recs.toLocaleString()], ["Risk-adjusted savings", `$${o.savings.toLocaleString()} / month`], ["Confidence", `${o.confidence}%`], ["Risk", o.risk], ["Owner", o.owner], ["Last evaluated", o.evaluated]]} />
          </div>) },
        { id: "evidence", label: "Evidence", content: (
          <div>
            <p className="text-[12px] leading-relaxed text-slate-700">Evidence set assembled by the detection and impact analysis stages. Incomplete evidence blocks routing for approval.</p>
            <SubHead>Evidence used</SubHead>
            <Bullets items={o.evidence} />
          </div>) },
        { id: "savings", label: "Savings", content: (
          <div>
            <KV rows={[["Gross detected", `$${Math.round(o.savings * 1.39).toLocaleString()} / mo`], ["Policy eligible", `$${Math.round(o.savings * 1.11).toLocaleString()} / mo`], ["Risk adjusted", `$${o.savings.toLocaleString()} / mo`], ["Annualized (risk adjusted)", `$${(o.savings * 12).toLocaleString()}`]]} />
            <p className="mt-2 text-[11.5px] leading-relaxed text-slate-600">
              None of these figures are realized savings. Realization requires execution, technical validation and two billing cycles of invoice confirmation.
            </p>
          </div>) },
        { id: "risk", label: "Risk", content: (
          <div><KV rows={[["Risk class", o.risk], ["Execution", o.execution], ["Rollback", o.rollback], ["Blast radius", "≤ 5% concurrent capacity per service"], ["Freeze windows", "Honoured"]]} /></div>) },
        { id: "approval", label: "Approval", content: (
          <div><KV rows={[["Required approval", o.approval], ["Confidence threshold", "0.88"], ["Minimum savings", "$250 / month"], ["Approval expiry", "14 days"]]} /></div>) },
        { id: "validation", label: "Validation", content: (
          <div><KV rows={[["Technical validation", "Configuration + 72h SLO observation"], ["Financial validation", "Two billing cycles, demand normalized"], ["Variance tolerance", "10%"], ["Current state", o.status === "Healthy" ? "On track" : "Held — telemetry or evidence gap"]]} /></div>) },
      ],
    };
  }

  if (kind === "stage") {
    const s = PIPELINE.find((x) => x.id === id);
    if (!s) return null;
    return {
      objectType: "Pipeline Stage", name: s.label, status: `${s.metric} ${s.metricLabel}`, statusTone: s.health === "Attention" ? "warn" : "ok",
      tabs: [
        { id: "o", label: "Overview", content: (
          <div>
            <p className="text-[12px] leading-relaxed text-slate-700">{s.summary}</p>
            <SubHead>{s.listTitle}</SubHead>
            <Bullets items={s.items} />
          </div>) },
        { id: "c", label: "Controls", content: <div><SubHead>Stage controls</SubHead><Bullets items={s.controls} /></div> },
      ],
    };
  }

  if (kind === "unit") {
    const u = UNIT_ECONOMICS.find((x) => x.id === id);
    if (!u) return null;
    return {
      objectType: "Unit Economics Model", name: u.service, status: `${u.costPerUnit} per ${u.unit}`, statusTone: "ok",
      tabs: [
        { id: "o", label: "Overview", content: (
          <div>
            <p className="text-[12px] leading-relaxed text-slate-700">Demand driver: {u.driver}</p>
            <SubHead>Model</SubHead>
            <KV rows={[["Monthly spend", u.spend], ["Allocation coverage", `${u.coverage}%`], ["Business unit", u.bu], ["Unit", u.unit], ["Cost per unit", u.costPerUnit], ["Trend", u.trend], ["Owner", u.owner]]} />
          </div>) },
        { id: "c", label: "Composition", content: <div><SubHead>Cost composition</SubHead><KV rows={u.composition} /></div> },
      ],
    };
  }

  if (kind === "pol") {
    const p = POLICIES.find((x) => x.id === id);
    if (!p) return null;
    return {
      objectType: "Policy Family", name: p.family, status: p.status, statusTone: p.status === "Healthy" ? "ok" : "warn",
      tabs: [
        { id: "o", label: "Overview", content: (
          <div>
            <p className="text-[12px] leading-relaxed text-slate-700">{p.purpose}</p>
            <SubHead>Family state</SubHead>
            <KV rows={[["Active policies", String(p.active)], ["Pending change", String(p.pending)], ["Enforcement", p.enforcement], ["Owner", p.owner]]} />
          </div>) },
        { id: "e", label: "Configuration", content: <div><SubHead>Representative policies</SubHead><Bullets items={p.examples} /></div> },
      ],
    };
  }

  if (kind === "acc") {
    const a = ACCOUNTS.find((x) => x.id === id);
    if (!a) return null;
    return {
      objectType: "Cloud Account Group", name: a.provider, status: a.status, statusTone: a.status === "Healthy" ? "ok" : "warn",
      tabs: [
        { id: "o", label: "Overview", content: (
          <div>
            <p className="text-[12px] leading-relaxed text-slate-700">{a.note}</p>
            <SubHead>Connection</SubHead>
            <KV rows={[["Accounts", a.accounts], ["Monthly spend", a.spend], ["Connector", a.connector], ["Last sync", a.lastSync]]} />
          </div>) },
        { id: "c", label: "Coverage", content: (
          <div><KV rows={[["Spend coverage", `${a.spendCoverage}%`], ["Allocation coverage", `${a.allocationCoverage}%`], ["Telemetry health", a.telemetry], ["Impact", a.status === "Degraded" ? "Opportunities in this scope are held in Attention until telemetry recovers." : "No restrictions in force."]]} /></div>) },
      ],
    };
  }

  if (kind === "sav") {
    const s = SAVINGS_CHAIN.find((x) => x.id === id);
    if (!s) return null;
    return {
      objectType: "Savings State", name: s.label, status: s.value, statusTone: s.tone === "amber" ? "warn" : "ok",
      tabs: [{ id: "o", label: "Overview", content: (
        <div>
          <p className="text-[12px] leading-relaxed text-slate-700">{s.definition}</p>
          <SubHead>State</SubHead>
          <KV rows={[["Amount", s.value], ["Records", s.records], ["Gate to reach this state", s.gate]]} />
          <SubHead>Why this distinction exists</SubHead>
          <p className="text-[11.5px] leading-relaxed text-slate-700">
            A detected opportunity is not realized savings. Each state has its own evidence gate, and only the realized state is reported to Finance.
          </p>
        </div>) }],
    };
  }

  if (kind === "real") {
    const m = REALIZATION_METRICS.find((x) => x.id === id);
    if (!m) return null;
    return {
      objectType: "Realization Metric", name: m.label, status: m.value, statusTone: m.tone,
      tabs: [{ id: "o", label: "Overview", content: (
        <div>
          <p className="text-[12px] leading-relaxed text-slate-700">{m.definition}</p>
          <SubHead>Current detail</SubHead>
          <p className="text-[11.5px] leading-relaxed text-slate-700">{m.detail}</p>
        </div>) }],
    };
  }

  if (kind === "ch") {
    const c = CHANNELS.find((x) => x.id === id);
    if (!c) return null;
    return {
      objectType: "Execution Channel", name: c.system, status: c.health, statusTone: c.health === "Healthy" ? "ok" : "warn",
      tabs: [
        { id: "o", label: "Overview", content: (
          <div>
            <p className="text-[12px] leading-relaxed text-slate-700">{c.note}</p>
            <SubHead>Binding</SubHead>
            <KV rows={[["Invocation mode", c.mode], ["Approval requirement", c.approval], ["Credential reference", c.credential], ["Last policy sync", c.lastSync]]} />
          </div>) },
        { id: "ops", label: "Configuration", content: <div><SubHead>Allowed operations</SubHead><Bullets items={c.operations} /></div> },
      ],
    };
  }

  return null;
}

function PolicyStep({ index, label, detail }: { index: number; label: string; detail: string }) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button onClick={() => setOpen((v) => !v)}
        className={cn("flex w-full items-start gap-2 rounded-md border px-2.5 py-1.5 text-left transition-colors",
          open ? "border-blue-300 bg-blue-50/50" : "border-slate-200 bg-white hover:bg-slate-50")}>
        <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-slate-800 text-[9.5px] font-semibold text-white">{index}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] font-medium text-slate-800">{label}</span>
          {open && <span className="mt-1 block text-[11.5px] leading-relaxed text-slate-600">{detail}</span>}
        </span>
      </button>
    </li>
  );
}
