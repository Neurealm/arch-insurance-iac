import { Link } from "react-router-dom";
import { useMemo } from "react";
import {
  RefreshCw, LayoutGrid, ArrowUpRight, ArrowDownRight, ChevronRight, Home,
  AlertTriangle, CheckCircle2, Info, Sparkles, Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardHead, Chip, Donut, LineChart, Sparkline } from "./workflow/wfPrimitives";
import WorkflowStages from "./workflow/WorkflowStages";
import {
  alerts, businessKpis, CUSTOMERS, REGIONS, SKUS, STAGE_LABEL, STAGE_ORDER, systems,
  throughputSeries, type ExceptionCategory, type StageId,
} from "./workflow/wfData";
import { TIME_RANGES, useWorkflowState } from "./workflow/useWorkflowState";
import {
  ArchitectureDrawer, RecommendationsDrawer, ReconciliationDrawer, SystemDrawer, TxnDrawer, remediationLabel,
} from "./workflow/wfDrawers";

const money = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`);

export default function WorkflowOverview() {
  const s = useWorkflowState();

  const kpis = useMemo(() => {
    const c = s.counters;
    return [
      { id: "order" as StageId, label: "Orders", value: c.order.primary, delta: "+18%", sub: "Orders received during selected period", lines: [["Failed", String(c.order.secondary)], ["Avg. intake", c.order.avgTime]], spark: [61, 74, 88, 96, 104, 112, 121, c.order.primary], color: "#2563EB" },
      { id: "entitlement" as StageId, label: "Entitlements Created", value: c.entitlement.primary, delta: "+17%", sub: "Canonical entitlements issued", lines: [["Success rate", `${((c.entitlement.primary / (c.order.primary || 1)) * 100).toFixed(1)}%`], ["Failed", String(c.entitlement.secondary)], ["Avg. create", c.entitlement.avgTime]], spark: [60, 73, 87, 95, 103, 111, 120, c.entitlement.primary], color: "#059669" },
      { id: "lifterSubmit" as StageId, label: "Lifter Submitted", value: c.lifterSubmit.primary, delta: "+15%", sub: "Fulfillment obligations raised", lines: [["Submission rate", `${((c.lifterSubmit.primary / (c.entitlement.primary || 1)) * 100).toFixed(1)}%`], ["Failed", String(c.lifterSubmit.secondary)], ["Retry queue", "2"]], spark: [58, 70, 84, 92, 100, 108, 117, c.lifterSubmit.primary], color: "#7C3AED" },
      { id: "lifterConfirm" as StageId, label: "Lifter Confirmed", value: c.lifterConfirm.primary, delta: "+16%", sub: "Confirmed by Microsoft fulfillment", lines: [["Confirmed", `${((c.lifterConfirm.primary / (c.lifterSubmit.primary || 1)) * 100).toFixed(1)}%`], ["Pending", String(c.lifterConfirm.secondary)], ["Avg. confirm", c.lifterConfirm.avgTime]], spark: [55, 67, 80, 89, 97, 105, 113, c.lifterConfirm.primary], color: "#7C3AED" },
      { id: "provision" as StageId, label: "Provisioned in Azure", value: c.provision.primary, delta: "+14%", sub: "Deployed into customer subscriptions", lines: [["Successful", String(c.provision.primary)], ["Failed", String(c.provision.secondary)], ["Avg. duration", c.provision.avgTime]], spark: [51, 64, 77, 86, 94, 102, 110, c.provision.primary], color: "#0D9488" },
    ];
  }, [s.counters]);

  const filteredCount = s.filtered.length;
  const anyFilter =
    s.filters.customer !== "All" || s.filters.region !== "All" || s.filters.sku !== "All" ||
    s.filters.stage || s.filters.exceptionCategory || s.filters.exceptionStage || s.filters.riskOnly || s.filters.lifecycle;

  const autoRemediable = s.exceptions.filter((t) => !t.exception?.humanApproval).length;
  const topTwoLifter = s.exceptions
    .filter((t) => t.exception?.stage === "lifterSubmit" || t.exception?.stage === "lifterConfirm")
    .sort((a, b) => b.arr - a.arr).slice(0, 2)
    .reduce((a, t) => a + t.arr, 0);

  const healthTone = s.systemHealth === "Healthy" ? "ok" : s.systemHealth === "Attention" ? "warn" : "bad";

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ------------------------------- header ------------------------------- */}
      <header className="sticky top-0 z-30 border-b border-[#E7EBF0] bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-[1680px] px-5 py-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <nav className="flex items-center gap-1 text-[10.5px] text-slate-500">
                <Link to="/app" className="inline-flex items-center gap-1 hover:text-indigo-700"><Home className="h-3 w-3" />NeuGAIN</Link>
                <ChevronRight className="h-3 w-3" />
                <Link to="/direct-commerce" className="hover:text-indigo-700">Direct Commerce Fulfillment</Link>
              </nav>
              <h1 className="mt-0.5 text-[20px] font-semibold leading-tight tracking-tight text-[#1E293B]">
                Operational Workflow Overview
              </h1>
              <p className="mt-0.5 text-[12px] text-slate-500">
                End-to-end operational intelligence across Direct Marketplace → Lifter Fulfillment → Azure Provisioning
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select label="Time range" value={s.range} onChange={(v) => s.setRange(v as never)}
                options={TIME_RANGES.map((t) => ({ value: t.id, label: t.label }))} />
              <Select label="Customer" value={s.filters.customer} onChange={(v) => s.patch("customer", v)}
                options={[{ value: "All", label: "All customers" }, ...CUSTOMERS.map((c) => ({ value: c, label: c }))]} />
              <Select label="Region" value={s.filters.region} onChange={(v) => s.patch("region", v)}
                options={[{ value: "All", label: "All regions" }, ...REGIONS.map((c) => ({ value: c, label: c }))]} />
              <Select label="SKU" value={s.filters.sku} onChange={(v) => s.patch("sku", v)}
                options={[{ value: "All", label: "All products / SKUs" }, ...SKUS.map((c) => ({ value: c, label: c }))]} />

              <button onClick={s.refresh} title="Refresh"
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-[11.5px] font-medium text-slate-700 hover:bg-slate-50">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
              <button onClick={() => s.setAutoRefresh(!s.autoRefresh)} aria-pressed={s.autoRefresh}
                className={cn("inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11.5px] font-medium",
                  s.autoRefresh ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-300 text-slate-600 hover:bg-slate-50")}>
                <span className={cn("h-1.5 w-1.5 rounded-full", s.autoRefresh ? "bg-emerald-500" : "bg-slate-400")} />
                Auto refresh
              </button>
              <button onClick={() => s.setDrawer({ kind: "architecture" })}
                className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-2.5 py-1.5 text-[11.5px] font-medium text-white hover:bg-indigo-700">
                <LayoutGrid className="h-3.5 w-3.5" /> View Architecture
              </button>
            </div>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-[#EEF1F5] pt-2.5">
            <span className="text-[11px] text-slate-500">Overall System Health</span>
            <Chip tone={healthTone}>
              <span className={cn("h-1.5 w-1.5 rounded-full", s.systemHealth === "Healthy" ? "bg-emerald-500" : s.systemHealth === "Attention" ? "bg-amber-500" : "bg-rose-500")} />
              {s.systemHealth}
            </Chip>
            <span className="text-slate-300">|</span>
            <button onClick={() => s.setDrawer({ kind: "reconciliation" })}
              className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] text-slate-600 hover:bg-slate-50">
              <Scale className="h-3.5 w-3.5 text-slate-400" />
              Reconciliation Health <span className="font-semibold text-slate-900">{s.reconciliationHealth.toFixed(1)}%</span>
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-slate-500">Updated {s.lastRefresh.toLocaleTimeString()}</span>
            {anyFilter && (
              <>
                <span className="text-slate-300">|</span>
                <Chip tone="info">{filteredCount} transactions in view</Chip>
                <button onClick={s.resetFilters} className="text-[11px] font-medium text-indigo-600 hover:underline">Clear filters</button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1680px] px-5 py-4">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-4">
            {/* ------------------------- KPI strip ------------------------- */}
            <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {kpis.map((k) => (
                <button key={k.id} onClick={() => s.patch("stage", s.filters.stage === k.id ? null : k.id)}
                  aria-pressed={s.filters.stage === k.id}
                  className={cn("rounded-xl border bg-white p-3 text-left transition-all",
                    s.filters.stage === k.id ? "border-indigo-400 ring-2 ring-indigo-100" : "border-[#E7EBF0] hover:border-indigo-300 hover:shadow-sm")}>
                  <div className="text-[10.5px] font-medium text-slate-500">{k.label}</div>
                  <div className="mt-1 flex items-end justify-between gap-2">
                    <span className="text-[24px] font-semibold leading-none tabular-nums text-[#1E293B]">{k.value}</span>
                    <Sparkline data={k.spark} color={k.color} width={62} height={22} />
                  </div>
                  <div className="mt-1 text-[10px] text-emerald-600">{k.delta} vs prior period</div>
                  <div className="mt-1.5 space-y-0.5 border-t border-slate-100 pt-1.5">
                    {k.lines.map(([l, v]) => (
                      <div key={l} className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">{l}</span>
                        <span className="font-medium text-slate-800">{v}</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
              <button onClick={() => s.patch("lifecycle", s.filters.lifecycle === "healthy" ? null : "healthy")}
                className={cn("rounded-xl border bg-white p-3 text-left transition-all",
                  s.filters.lifecycle === "healthy" ? "border-indigo-400 ring-2 ring-indigo-100" : "border-[#E7EBF0] hover:border-indigo-300 hover:shadow-sm")}>
                <div className="text-[10.5px] font-medium text-slate-500">End-to-End Success Rate</div>
                <div className="mt-1 flex items-end justify-between gap-2">
                  <span className="text-[24px] font-semibold leading-none tabular-nums text-emerald-700">{s.successRate.toFixed(1)}%</span>
                  <Sparkline data={[96.1, 96.8, 97.2, 97.4, 97.9, 98.0, 98.2, s.successRate]} color="#059669" width={62} height={22} />
                </div>
                <div className="mt-1 text-[10px] text-emerald-600">+2.1% vs prior period</div>
                <div className="mt-1.5 space-y-0.5 border-t border-slate-100 pt-1.5 text-[10px]">
                  <div className="flex justify-between"><span className="text-slate-500">Completed</span><span className="font-medium text-slate-800">{s.counters.active.primary}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Eligible</span><span className="font-medium text-slate-800">{s.counters.order.primary}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">In flight</span><span className="font-medium text-slate-800">{Math.max(0, s.counters.order.primary - s.counters.active.primary - s.exceptions.length)}</span></div>
                </div>
              </button>
            </section>

            {/* --------------------- operational intelligence --------------------- */}
            <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50/70 via-white to-violet-50/50">
              <div className="flex flex-wrap items-start gap-3 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-semibold text-indigo-800">Operational Intelligence</div>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-slate-700">
                    {s.exceptions.length} transactions currently require attention. {autoRemediable} can be automatically remediated.
                    Resolving the two highest-value Lifter exceptions could release approximately {money(topTwoLifter)} in blocked ARR.
                  </p>
                </div>
                <button onClick={() => s.setDrawer({ kind: "recommendations" })}
                  className="rounded-md border border-indigo-300 bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-indigo-700 hover:bg-indigo-50">
                  Review Recommendations
                </button>
              </div>
            </Card>

            {/* -------------------------- main workflow -------------------------- */}
            <Card>
              <CardHead
                title="Operational Workflow"
                subtitle="Direct commerce on the front end, Lifter fulfillment behind the scenes, Azure provisioning downstream"
                action={
                  <div className="flex items-center gap-1 rounded-md border border-slate-200 p-0.5">
                    {([["live", "Live Flow"], ["data", "Data Flow"], ["exception", "Exception Flow"]] as const).map(([id, label]) => (
                      <button key={id} onClick={() => s.setFlowMode(id)}
                        className={cn("rounded px-2 py-1 text-[10.5px] font-medium transition-colors",
                          s.flowMode === id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50")}>
                        {label}
                      </button>
                    ))}
                  </div>
                }
              />
              <div className="p-4"><WorkflowStages s={s} /></div>
            </Card>

            {/* --------------------------- exceptions ---------------------------- */}
            <Card>
              <CardHead title="Exceptions / Manual Intervention"
                subtitle="Transactions routed out of the normal workflow into exception management"
                action={<Chip tone="bad">{s.exceptions.length} total exceptions</Chip>} />
              <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-[150px_minmax(0,1fr)_minmax(0,1fr)]">
                <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-3">
                  <div className="text-[30px] font-semibold leading-none tabular-nums text-rose-700">{s.exceptions.length}</div>
                  <div className="mt-1 text-[10.5px] text-slate-600">Total exceptions</div>
                  <div className="mt-2 text-[10.5px] text-rose-700">{money(s.revenueAtRisk)} ARR blocked</div>
                </div>

                <div>
                  <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">By stage</div>
                  <div className="space-y-1">
                    {STAGE_ORDER.filter((st) => (s.exceptionsByStage.get(st) ?? 0) > 0).map((st) => (
                      <FilterRow key={st} label={STAGE_LABEL[st]} count={s.exceptionsByStage.get(st) ?? 0}
                        active={s.filters.exceptionStage === st}
                        onClick={() => s.patch("exceptionStage", s.filters.exceptionStage === st ? null : st)} />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">Top reasons</div>
                  <div className="space-y-1">
                    {[...s.exceptionsByReason.entries()].sort((a, b) => b[1] - a[1]).map(([reason, n]) => (
                      <FilterRow key={reason} label={reason} count={n}
                        active={s.filters.exceptionCategory === reason}
                        onClick={() => s.patch("exceptionCategory", s.filters.exceptionCategory === reason ? null : (reason as ExceptionCategory))} />
                    ))}
                    {s.exceptionsByReason.size === 0 && <p className="text-[11.5px] text-slate-500">No open exception reasons.</p>}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#EEF1F5] px-4 py-3">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">
                  Exception queue {anyFilter ? "(filtered)" : ""}
                </div>
                <div className="space-y-1.5">
                  {s.filteredExceptions.map((t) => (
                    <div key={t.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 hover:border-indigo-300">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-600" />
                      <button onClick={() => s.setDrawer({ kind: "txn", id: t.id })} className="text-[12.5px] font-medium text-slate-900 hover:text-indigo-700">
                        {t.customer}
                      </button>
                      <span className="font-mono text-[10.5px] text-slate-500">{t.id}</span>
                      <Chip tone="bad">{t.exception!.category}</Chip>
                      <Chip tone="neutral">{STAGE_LABEL[t.exception!.stage]}</Chip>
                      <Chip tone="warn">Stalled {t.stalledMinutes}m</Chip>
                      {t.revenueAtRisk > 0 && <Chip tone="bad">{money(t.revenueAtRisk)} at risk</Chip>}
                      <div className="ml-auto flex gap-1.5">
                        <button disabled={s.busy === t.id} onClick={() => s.remediate(t.id, remediationLabel(t.exception!.stage))}
                          className="rounded-md bg-indigo-600 px-2 py-1 text-[10.5px] font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                          {s.busy === t.id ? "Working…" : remediationLabel(t.exception!.stage)}
                        </button>
                        <button onClick={() => s.setDrawer({ kind: "txn", id: t.id })}
                          className="rounded-md border border-slate-300 px-2 py-1 text-[10.5px] font-medium text-slate-700 hover:bg-slate-50">
                          Investigate
                        </button>
                      </div>
                    </div>
                  ))}
                  {s.filteredExceptions.length === 0 && (
                    <p className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2.5 text-[12px] text-emerald-800">
                      No exceptions match the current view. Direct orders are fulfilling through Lifter and provisioning in Azure as expected.
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* ------------------------ connected systems ------------------------ */}
            <Card>
              <CardHead title="Connected Systems" subtitle="Integration chain from direct commerce through fulfillment, provisioning and billing" />
              <div className="flex flex-wrap items-stretch gap-1.5 p-4">
                {systems.map((sys, i) => (
                  <div key={sys.id} className="flex items-stretch gap-1.5">
                    <button onClick={() => s.setDrawer({ kind: "system", id: sys.id })}
                      className="w-[152px] rounded-lg border border-[#E7EBF0] p-2.5 text-left transition-colors hover:border-indigo-300 hover:bg-slate-50">
                      <div className="text-[11.5px] font-semibold leading-tight text-slate-900">{sys.name}</div>
                      <div className="mt-1.5 flex items-center gap-1">
                        <span className={cn("h-1.5 w-1.5 rounded-full", sys.status === "Operational" ? "bg-emerald-500" : sys.status === "Degraded" ? "bg-amber-500" : "bg-rose-500")} />
                        <span className={cn("text-[10.5px] font-medium", sys.status === "Operational" ? "text-emerald-700" : sys.status === "Degraded" ? "text-amber-700" : "text-rose-700")}>{sys.status}</span>
                      </div>
                      <div className="mt-1.5 space-y-0.5 text-[9.5px] text-slate-500">
                        <div className="flex justify-between"><span>Latency</span><span className="font-medium text-slate-700">{sys.latencyMs} ms</span></div>
                        <div className="flex justify-between"><span>Error rate</span><span className="font-medium text-slate-700">{sys.errorRate}</span></div>
                        <div className="flex justify-between"><span>Last txn</span><span className="font-medium text-slate-700">{sys.lastTxn}</span></div>
                      </div>
                    </button>
                    {i < systems.length - 1 && <div className="flex items-center text-slate-300">↔</div>}
                  </div>
                ))}
              </div>
            </Card>

            {/* ----------------------- transaction registry ---------------------- */}
            <Card>
              <CardHead title="Customer Transactions" subtitle="Click any transaction to expose its complete journey"
                action={
                  <button onClick={() => s.patch("riskOnly", !s.filters.riskOnly)}
                    className={cn("rounded-md border px-2 py-1 text-[10.5px] font-medium",
                      s.filters.riskOnly ? "border-rose-300 bg-rose-50 text-rose-700" : "border-slate-300 text-slate-600 hover:bg-slate-50")}>
                    Revenue at risk only
                  </button>
                } />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-[11.5px]">
                  <thead>
                    <tr className="border-b border-[#EEF1F5] text-left text-[10px] uppercase tracking-wide text-slate-500">
                      {["Customer", "Order", "Product / SKU", "Region", "ARR", "Stage", "State", "Reconciliation"].map((h) => (
                        <th key={h} className="whitespace-nowrap px-3 py-2 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {s.filtered.map((t) => (
                      <tr key={t.id} onClick={() => s.setDrawer({ kind: "txn", id: t.id })}
                        className="cursor-pointer hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium text-slate-900">{t.customer}</td>
                        <td className="px-3 py-2 font-mono text-[10.5px] text-slate-600">{t.id}</td>
                        <td className="px-3 py-2 text-slate-700">{t.product}<span className="ml-1 font-mono text-[10px] text-slate-500">{t.sku}</span></td>
                        <td className="px-3 py-2 text-slate-600">{t.region}</td>
                        <td className="px-3 py-2 tabular-nums text-slate-800">${t.arr.toLocaleString()}</td>
                        <td className="px-3 py-2 text-slate-600">{STAGE_LABEL[t.stage]}</td>
                        <td className="px-3 py-2">
                          <Chip tone={t.exception ? "bad" : t.health === "Processing" ? "info" : t.health === "Reconciliation Mismatch" ? "warn" : "ok"}>
                            {t.health}
                          </Chip>
                        </td>
                        <td className="px-3 py-2">
                          <Chip tone={t.reconciliation.verdict === "MATCH" ? "ok" : t.reconciliation.verdict === "CRITICAL MISMATCH" ? "bad" : "warn"}>
                            {t.reconciliation.verdict}
                          </Chip>
                        </td>
                      </tr>
                    ))}
                    {s.filtered.length === 0 && (
                      <tr><td colSpan={8} className="px-3 py-6 text-center text-[12px] text-slate-500">No transactions match the current filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* ------------------------- business KPIs --------------------------- */}
            <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {businessKpis.map((k) => (
                <button key={k.id}
                  onClick={() => k.id === "risk" && s.patch("riskOnly", !s.filters.riskOnly)}
                  className={cn("rounded-xl border bg-white p-3 text-left transition-all",
                    k.id === "risk" && s.filters.riskOnly ? "border-rose-300 ring-2 ring-rose-100" : "border-[#E7EBF0] hover:border-indigo-300 hover:shadow-sm")}>
                  <div className="text-[10.5px] font-medium text-slate-500">{k.label}</div>
                  <div className="mt-1 flex items-end justify-between gap-1">
                    <span className="text-[20px] font-semibold leading-none text-[#1E293B]">
                      {k.id === "risk" ? money(s.revenueAtRisk) : k.value}
                    </span>
                    <Sparkline data={k.spark} color={k.tone === "positive" ? "#059669" : "#E11D48"} width={54} height={20} />
                  </div>
                  <div className={cn("mt-1 inline-flex items-center gap-0.5 text-[10px] font-medium", k.tone === "positive" ? "text-emerald-600" : "text-rose-600")}>
                    {k.dir === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{k.delta}
                  </div>
                  <div className="mt-0.5 text-[9.5px] text-slate-500">{k.compare}</div>
                </button>
              ))}
            </section>
          </div>

          {/* --------------------- right operational column --------------------- */}
          <aside className="space-y-4">
            <Card>
              <CardHead title="Pipeline Efficiency" subtitle={`Conversion across the ${TIME_RANGES.find((t) => t.id === s.range)?.label.toLowerCase()}`} />
              <div className="space-y-1.5 p-4">
                {STAGE_ORDER.filter((st) => st !== "azureAuth" && st !== "active").map((st, i, arr) => {
                  const c = s.counters[st];
                  const base = s.counters.order.primary || 1;
                  const pct = (c.primary / base) * 100;
                  const prev = i === 0 ? c.primary : s.counters[arr[i - 1]].primary;
                  const dropoff = prev - c.primary;
                  return (
                    <button key={st} onClick={() => s.patch("stage", s.filters.stage === st ? null : st)}
                      title={`Volume ${c.primary} · Conversion ${pct.toFixed(0)}% · Drop-off ${dropoff} · Avg dwell ${c.avgTime} · Revenue ~$${(c.primary * 19.3).toFixed(0)}K`}
                      className="group w-full text-left">
                      <div className="flex items-center justify-between text-[10.5px]">
                        <span className="text-slate-600">{STAGE_LABEL[st]}</span>
                        <span className="tabular-nums font-semibold text-slate-900">{c.primary} <span className="font-normal text-slate-500">{pct.toFixed(0)}%</span></span>
                      </div>
                      <div className="mt-1 h-2.5 w-full overflow-hidden rounded bg-slate-100">
                        <div className="h-full rounded transition-all group-hover:opacity-80"
                          style={{ width: `${pct}%`, background: ["#2563EB", "#059669", "#7C3AED", "#D97706", "#0D9488"][i] }} />
                      </div>
                      <div className="mt-0.5 text-[9.5px] text-slate-400">
                        Drop-off {dropoff} · dwell {c.avgTime} · ≈${(c.primary * 19.3).toFixed(0)}K represented
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card>
              <CardHead title="Throughput Over Time" subtitle={TIME_RANGES.find((t) => t.id === s.range)?.label} />
              <div className="p-4"><LineChart labels={throughputSeries.labels} series={throughputSeries.series} /></div>
            </Card>

            <Card>
              <CardHead title="Recent Alerts" action={<Chip tone="neutral">{alerts.length}</Chip>} />
              <div className="divide-y divide-slate-100">
                {alerts.map((a) => (
                  <button key={a.id}
                    onClick={() => a.txnId ? s.setDrawer({ kind: "txn", id: a.txnId }) : a.systemId ? s.setDrawer({ kind: "system", id: a.systemId }) : undefined}
                    className="flex w-full items-start gap-2 px-4 py-2.5 text-left hover:bg-slate-50">
                    {a.severity === "critical" ? <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600" />
                      : a.severity === "warning" ? <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                      : a.severity === "success" ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      : <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />}
                    <div className="min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className={cn("text-[11.5px] font-semibold",
                          a.severity === "critical" ? "text-rose-700" : a.severity === "warning" ? "text-amber-700" : a.severity === "success" ? "text-emerald-700" : "text-blue-700")}>
                          {a.title}
                        </span>
                        <span className="shrink-0 text-[9.5px] text-slate-400">{a.ago}</span>
                      </div>
                      <p className="mt-0.5 text-[10.5px] leading-snug text-slate-600">{a.body}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <CardHead title="Lifecycle Health" subtitle="Click a segment to filter the workflow" />
              <div className="flex items-center gap-4 p-4">
                <Donut
                  segments={[
                    { key: "healthy", value: s.lifecycle.healthy, color: "#059669" },
                    { key: "warning", value: s.lifecycle.warning, color: "#D97706" },
                    { key: "critical", value: s.lifecycle.critical, color: "#E11D48" },
                  ]}
                  centerValue={`${s.lifecycle.healthy}%`} centerLabel="Healthy"
                  onSegmentClick={(k) => s.patch("lifecycle", s.filters.lifecycle === k ? null : (k as never))}
                />
                <div className="space-y-1.5">
                  {([["healthy", "Healthy", s.lifecycle.healthy, "#059669"], ["warning", "Warning", s.lifecycle.warning, "#D97706"], ["critical", "Critical", s.lifecycle.critical, "#E11D48"]] as const).map(([k, label, v, color]) => (
                    <button key={k} onClick={() => s.patch("lifecycle", s.filters.lifecycle === k ? null : (k as never))}
                      className={cn("flex w-full items-center gap-2 rounded px-1.5 py-1 text-[11px] hover:bg-slate-50",
                        s.filters.lifecycle === k && "bg-slate-100")}>
                      <span className="h-2 w-2 rounded-sm" style={{ background: color }} />
                      <span className="text-slate-600">{label}</span>
                      <span className="ml-auto font-semibold tabular-nums text-slate-900">{v}%</span>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>

      {/* -------------------------------- drawers ------------------------------- */}
      {s.drawer?.kind === "txn" && (() => {
        const t = s.txns.find((x) => x.id === (s.drawer as { id: string }).id);
        return t ? <TxnDrawer s={s} txn={t} /> : null;
      })()}
      {s.drawer?.kind === "system" && <SystemDrawer s={s} id={s.drawer.id} />}
      {s.drawer?.kind === "recommendations" && <RecommendationsDrawer s={s} />}
      {s.drawer?.kind === "reconciliation" && <ReconciliationDrawer s={s} />}
      {s.drawer?.kind === "architecture" && <ArchitectureDrawer s={s} />}
    </div>
  );
}

/* ------------------------------- small parts ------------------------------- */

function Select({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="flex items-center gap-1.5">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-[11.5px] text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function FilterRow({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-pressed={active}
      className={cn("flex w-full items-center justify-between rounded-md border px-2.5 py-1.5 text-[11.5px] transition-colors",
        active ? "border-indigo-400 bg-indigo-50 text-indigo-800" : "border-slate-200 text-slate-700 hover:bg-slate-50")}>
      <span>{label}</span>
      <span className="font-semibold tabular-nums">{count}</span>
    </button>
  );
}
