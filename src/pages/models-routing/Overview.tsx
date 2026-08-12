// The LLM + Model Routing Overview: the tenant model control plane workspace.
// Filters drive every panel; every model, provider, policy, pipeline stage,
// guardrail, chain, metric and evaluation cell opens an inspection drawer.

import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowRight, ChevronDown, ChevronRight, Columns3, Download, RefreshCw, Rows3,
  AlertTriangle, Sparkles, Plus, ShieldCheck, Search as SearchIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  MODELS, PROVIDERS, POLICIES, PIPELINE, GUARDRAILS, CHAINS, ASSURANCE,
  EVALUATIONS, EVAL_COLUMNS, EVAL_DIMENSIONS, EVAL_SOURCES, LATENCY_SUMMARY,
  COST_POLICIES, DECISIONS, EXPLANATION, SPEND_TOTAL, REGISTRY_TOTAL, POLICY_TOTAL,
  CONTROL_PLANE_DEFINES, CONTROL_PLANE_FLOW, SERVICE_CONTRACT, ROLES, FILTER_DEFS,
  type ModelRow, type ProviderRow, type RoutingPolicy, type PipelineStage,
} from "./data";
import {
  Panel, RichTip, KpiCard, InspectDrawer, KV, SubHead, Bullets, StatePill,
  Btn, healthTone, EmptyState, HelpDot, type DrawerTab,
} from "./parts";
import { RoutingPolicyWizard } from "./RoutingPolicyWizard";

/* ------------------------------- utilities -------------------------------- */

const money = (n: number) => `$${n.toFixed(0)}K`;

function Bar({ value, tone = "blue" }: { value: number; tone?: "blue" | "emerald" | "amber" }) {
  return (
    <div className="h-1.5 w-full rounded bg-slate-100" aria-hidden>
      <div className={cn("h-full rounded", tone === "emerald" ? "bg-emerald-500" : tone === "amber" ? "bg-amber-500" : "bg-blue-500")}
        style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
    </div>
  );
}

/* ================================= page =================================== */

export default function ModelsRoutingOverview() {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [dense, setDense] = useState(false);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<{ k: keyof ModelRow; dir: 1 | -1 }>({ k: "usage", dir: -1 });
  const [policyWizard, setPolicyWizard] = useState(false);
  const [decisionsOpen, setDecisionsOpen] = useState(true);
  const [hoverChain, setHoverChain] = useState<string | null>(null);
  const [evalCell, setEvalCell] = useState<{ r: number; c: number } | null>(null);

  const drawer = params.get("drawer");
  const openDrawer = (d: string) => { const p = new URLSearchParams(params); p.set("drawer", d); setParams(p); };
  const closeDrawer = () => { const p = new URLSearchParams(params); p.delete("drawer"); setParams(p); };

  const setFilter = (k: string, v: string) => { setPage(0); setFilters((f) => ({ ...f, [k]: v })); };
  const activeFilters = Object.entries(filters).filter(([, v]) => v && v !== "All");
  const clearFilters = () => { setFilters({}); setPage(0); };

  /* ------------------------------- filtering ------------------------------ */

  const models = useMemo(() => {
    let out = MODELS.filter((m) => {
      if (filters.provider && filters.provider !== "All" && m.provider !== filters.provider) return false;
      if (filters.type && filters.type !== "All" && m.type !== filters.type) return false;
      if (filters.status && filters.status !== "All" && m.status !== filters.status) return false;
      if (filters.safety && filters.safety !== "All" && m.safety !== filters.safety) return false;
      if (filters.reasoning && filters.reasoning !== "All" && m.reasoning !== filters.reasoning) return false;
      if (filters.region && filters.region !== "All") {
        const r = filters.region;
        if (r === "Global" ? m.regions !== "Global" : !m.regions.includes(r) && m.regions !== "Global") return false;
      }
      if (filters.policy && filters.policy !== "All") {
        const pol = POLICIES.find((p) => p.name === filters.policy);
        if (pol && ![pol.primary, pol.fallback].some((n) => n.startsWith(m.name))) return false;
      }
      if (query && !(`${m.name} ${m.provider} ${m.family}`.toLowerCase().includes(query.toLowerCase()))) return false;
      return true;
    });
    out = [...out].sort((a, b) => {
      const av = a[sort.k] as any, bv = b[sort.k] as any;
      return (typeof av === "number" ? av - bv : String(av).localeCompare(String(bv))) * sort.dir;
    });
    return out;
  }, [filters, query, sort]);

  const providers = useMemo(() => PROVIDERS.filter((p) =>
    (!filters.provider || filters.provider === "All" || p.name === filters.provider) &&
    (!filters.status || filters.status === "All" || p.status === filters.status) &&
    (!filters.region || filters.region === "All" || filters.region === "Global" || p.regions.includes(filters.region))
  ), [filters]);

  const policies = useMemo(() => POLICIES.filter((p) =>
    (!filters.policy || filters.policy === "All" || p.name === filters.policy) &&
    (!filters.provider || filters.provider === "All" || MODELS.some((m) => m.provider === filters.provider && [p.primary, p.fallback].some((n) => n.startsWith(m.name))))
  ), [filters]);

  const evals = useMemo(() => EVALUATIONS.filter((e) =>
    models.some((m) => m.name === e.model) || models.length === MODELS.length), [models]);

  const unfiltered = activeFilters.length === 0 && !query;
  const degradedProviders = providers.filter((p) => p.status === "Degraded");
  const conflictPolicy = POLICIES.find((p) => p.status === "Conflict");
  const pageSize = dense ? 7 : 6;
  const paged = models.slice(page * pageSize, page * pageSize + pageSize);

  /* --------------------------------- KPIs --------------------------------- */

  const kpis = [
    {
      id: "kpi-providers", label: "Active Providers", value: `${providers.filter((p) => p.status !== "Inactive").length} Active`,
      secondary: `${providers.filter((p) => p.status === "Degraded").length} Degraded · View provider health`, help: "Provider Health",
      tip: { term: "Active Providers", definition: "Inference platforms registered in the tenant control plane with a validated connection.",
        rows: [["Registered", `${PROVIDERS.length}`], ["Degraded", "1 (AWS Bedrock, US-East latency)"], ["Authentication", "All healthy, no static secrets"], ["Quota headroom", "Lowest 26% (AWS Bedrock)"]],
        why: "Provider registration state, authentication, regional availability and quota all determine whether a model is a legitimate routing candidate." },
      drawer: "kpi:providers",
    },
    {
      id: "kpi-models", label: "Registered Models", value: unfiltered ? `${REGISTRY_TOTAL}` : `${models.length}`,
      secondary: "View model registry", change: "+5 this month", help: "Model Registry",
      tip: { term: "Registered Models", definition: "Registered models represent tenant-approved model endpoints and deployments, not all models publicly available from providers.",
        rows: [["Registered deployments", `${REGISTRY_TOTAL}`], ["Shown in catalog", `${MODELS.length} primary`], ["Added this month", "5"], ["Pending evaluation", "2"]],
        why: "The registry is the boundary between what a provider offers and what this tenant permits." },
      drawer: "kpi:models",
    },
    {
      id: "kpi-policies", label: "Active Routing Policies", value: unfiltered ? `${POLICY_TOTAL}` : `${policies.length}`,
      secondary: "2 pending updates · View policies", help: "Routing Policy",
      tip: { term: "Active Routing Policies", definition: "Routing policies determine model eligibility and selection based on task class, capability, policy, region, cost, latency, and fallback.",
        rows: [["Active", `${POLICY_TOTAL}`], ["Pending updates", "2"], ["In conflict", "1 (Regulated EU Data)"], ["Owner teams", "AI Platform, Security, FinOps"]],
        why: "Without explicit policies, model choice becomes an implementation detail of whichever agent was written last." },
      drawer: "kpi:policies",
    },
    {
      id: "kpi-compliance", label: "Policy-Compliant Routes", value: "99.3%", secondary: "Target 99% · View compliance",
      tip: { term: "Policy-Compliant Routes", definition: "Percentage of executed routes that satisfied provider, model, region, classification, cost, and security constraints.",
        rows: [["Current", "99.3%"], ["Target", "99%"], ["Top exception", "Regional fallback mismatch"], ["Blocked candidates today", "1,478"]],
        why: "Digital coworkers must not invoke technically available models that violate data, security, cost, residency, or governance requirements." },
      drawer: "kpi:compliance",
    },
    {
      id: "kpi-latency", label: "Average Inference Latency", value: "1.42 sec", secondary: "p95: 3.1 sec · View latency",
      tip: { term: "Average Inference Latency", definition: "Mean end-to-end provider inference time across routed requests, excluding the 41 ms route decision.",
        rows: [["OpenAI", "1.51s"], ["Anthropic", "1.32s"], ["Google", "1.60s"], ["Azure OpenAI", "1.44s"], ["AWS Bedrock", "3.80s (degraded)"]],
        why: "Latency is a routing input, not just an observation: policies with latency ceilings exclude deployments that breach them." },
      drawer: "kpi:latency",
    },
    {
      id: "kpi-spend", label: "Monthly Token Spend", value: SPEND_TOTAL, secondary: "8% below configured budget · View cost profile", help: "Cost Ceiling",
      tip: { term: "Monthly Token Spend", definition: "Input token cost, output token cost, cached context, embedding cost, and model inference charges for the current period.",
        rows: [["Input tokens", "$96.4K"], ["Output tokens", "$74.1K"], ["Embeddings", "$8.9K"], ["Cached context credit", "-$12.3K"], ["Budget", "$200K"]],
        why: "Agentic workloads multiply request volume; per-request economics determine whether a workflow is viable at scale." },
      drawer: "kpi:spend",
    },
  ];

  /* ------------------------------- drawers -------------------------------- */

  const model = drawer?.startsWith("model:") ? MODELS.find((m) => m.id === drawer.slice(6)) : undefined;
  const provider = drawer?.startsWith("provider:") ? PROVIDERS.find((p) => p.id === drawer.slice(9)) : undefined;
  const policy = drawer?.startsWith("policy:") ? POLICIES.find((p) => p.id === drawer.slice(7)) : undefined;
  const stage = drawer?.startsWith("stage:") ? PIPELINE.find((s) => s.id === drawer.slice(6)) : undefined;
  const guardrail = drawer?.startsWith("guardrail:") ? GUARDRAILS.find((g) => g.id === drawer.slice(10)) : undefined;
  const chain = drawer?.startsWith("chain:") ? CHAINS.find((c) => c.id === drawer.slice(6)) : undefined;
  const assurance = drawer?.startsWith("assurance:") ? ASSURANCE.find((a) => a.id === drawer.slice(10)) : undefined;
  const latency = drawer?.startsWith("latency:") ? LATENCY_SUMMARY.find((l) => l.id === drawer.slice(8)) : undefined;
  const costPolicy = drawer?.startsWith("cost:") ? COST_POLICIES.find((c) => c.id === drawer.slice(5)) : undefined;
  const evalRow = drawer?.startsWith("eval:") ? EVALUATIONS.find((e) => e.model === drawer.slice(5)) : undefined;
  const kpi = drawer?.startsWith("kpi:") ? kpis.find((k) => k.drawer === drawer) : undefined;
  const explain = drawer === "explain";
  const spendProvider = drawer?.startsWith("spend:") ? PROVIDERS.find((p) => p.id === drawer.slice(6)) : undefined;
  const decision = drawer?.startsWith("decision:") ? DECISIONS.find((d) => d.id === drawer.slice(9)) : undefined;

  return (
    <div className="space-y-4">
      {/* Degradation + conflict banners */}
      {(degradedProviders.length > 0 || conflictPolicy) && (
        <div className="grid gap-3 lg:grid-cols-2">
          {degradedProviders.map((p) => (
            <div key={p.id} className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-amber-900">{p.name} — Degraded</div>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-amber-900/90">{p.incidentDetail}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Btn onClick={() => openDrawer(`provider:${p.id}`)}>View Incident</Btn>
                    <Btn onClick={() => setFilter("provider", p.name)}>Review Routes</Btn>
                    <Btn disabled>Suspend Provider</Btn>
                    <Btn onClick={() => toast.success("Endpoint test queued", { description: `${p.name} · ${p.regionList.join(", ")}` })}>Test Endpoint</Btn>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {conflictPolicy && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-red-900">{conflictPolicy.conflict?.title} — {conflictPolicy.name}</div>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-red-900/90">
                    {conflictPolicy.conflict?.detail} {conflictPolicy.conflict?.impact}
                  </p>
                  <p className="mt-1 text-[11.5px] font-medium text-red-900">Recommended: {conflictPolicy.conflict?.recommended}</p>
                  <div className="mt-2 flex gap-1.5">
                    <Btn variant="primary" onClick={() => openDrawer(`policy:${conflictPolicy.id}`)}>Resolve Policy</Btn>
                    <Btn onClick={() => openDrawer("chain:chain-4")}>Inspect Fallback Chain</Btn>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <Panel title="Tenant Model Plane Filters" subtitle="Filtering recalculates the model catalog, provider health, routing policies, spend analytics, evaluation comparison and KPI counts."
        actions={<Btn onClick={clearFilters} disabled={activeFilters.length === 0}>Clear All</Btn>}>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
          {FILTER_DEFS.map((f) => (
            <label key={f.id} className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">{f.label}</span>
              <select value={filters[f.id] ?? "All"} onChange={(e) => setFilter(f.id, e.target.value)}
                className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-[12px] text-slate-800 outline-none focus:border-blue-400">
                <option>All</option>
                {f.options.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
          ))}
        </div>
        {activeFilters.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {activeFilters.map(([k, v]) => (
              <button key={k} onClick={() => setFilter(k, "All")}
                className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-800 hover:bg-blue-100">
                {FILTER_DEFS.find((f) => f.id === k)?.label}: {v} ×
              </button>
            ))}
          </div>
        )}
      </Panel>

      {/* KPI row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <KpiCard key={k.id} label={k.label} value={k.value} secondary={k.secondary} change={k.change}
            help={k.help} tip={{ ...k.tip, rows: k.tip.rows as [string, string][] }} onClick={() => openDrawer(k.drawer)} selected={drawer === k.drawer} />
        ))}
      </div>

      {/* Catalog + pipeline */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Panel title="Model Catalog Overview" help="Model Registry"
          subtitle={`${models.length} of ${MODELS.length} deployments in scope · ${REGISTRY_TOTAL} registered tenant-wide`}
          actions={
            <>
              <Btn onClick={() => setDense((d) => !d)}>{dense ? <Rows3 className="h-3.5 w-3.5" /> : <Columns3 className="h-3.5 w-3.5" />}{dense ? "Comfortable" : "Compact"}</Btn>
              <Btn onClick={() => toast.info("Column selector", { description: "12 columns available; 11 currently visible." })}><Columns3 className="h-3.5 w-3.5" />Columns</Btn>
              <Btn onClick={() => toast.success("Model catalog exported", { description: `${models.length} rows · CSV` })}><Download className="h-3.5 w-3.5" />Export</Btn>
              <Btn onClick={() => toast.success("Catalog refreshed from provider registries")}><RefreshCw className="h-3.5 w-3.5" />Refresh</Btn>
            </>
          }
          bodyClassName="p-0">
          <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2">
            <label className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} placeholder="Search models…"
                className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 pl-8 pr-2 text-[12px] outline-none focus:border-blue-400 focus:bg-white" />
            </label>
          </div>

          {models.length === 0 ? (
            <div className="p-4"><EmptyState title="No models match the current filters" body="Relax the provider, region, reasoning tier or safety filter to restore the catalog." cta="Clear all filters" onCta={clearFilters} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1020px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-[10.5px] uppercase tracking-[0.06em] text-slate-500">
                    {([["name", "Model"], ["provider", "Provider"], ["type", "Type"], ["contextTokens", "Context"], ["reasoning", "Reasoning"], ["latency", "Latency"], ["cost", "Cost"], ["safety", "Safety"], ["regions", "Regions"], ["status", "Status"], ["usage", "Usage"]] as [keyof ModelRow, string][]).map(([k, label]) => (
                      <th key={k} className="px-3 py-2 font-semibold">
                        <button onClick={() => setSort((s) => ({ k, dir: s.k === k && s.dir === -1 ? 1 : -1 }))} className="inline-flex items-center gap-1 hover:text-slate-800">
                          {label}<ChevronDown className={cn("h-3 w-3 transition-transform", sort.k === k && sort.dir === 1 && "rotate-180", sort.k !== k && "opacity-30")} />
                        </button>
                      </th>
                    ))}
                    <th className="px-3 py-2 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((m) => (
                    <tr key={m.id} onClick={() => openDrawer(`model:${m.id}`)}
                      className={cn("cursor-pointer border-b border-slate-100 text-[12px] transition-colors hover:bg-blue-50/40", dense ? "[&>td]:py-1" : "[&>td]:py-2")}>
                      <td className="px-3">
                        <RichTip as="div" tip={{
                          term: m.name,
                          definition: `${m.family} family, exposed through ${m.provider}.`,
                          rows: [["Deployment", m.deployment], ["Reasoning tier", m.reasoning], ["Context", `${m.contextWindow} provider · ${m.allowedContext} tenant`],
                            ["Modalities", m.modalities.join(", ")], ["Tool support", m.tools ? "Supported" : "Not supported"],
                            ["Structured output", m.structured ? "Supported" : "Not supported"],
                            ["Routing eligibility", `${m.eligiblePolicies} policies · ${m.primaryRoutes} primary`], ["Status", m.status]],
                        }}>
                          <span className="font-medium text-slate-800">{m.name}</span>
                        </RichTip>
                      </td>
                      <td className="px-3 text-slate-600">{m.provider}</td>
                      <td className="px-3 text-slate-600">{m.type}</td>
                      <td className="px-3">
                        <RichTip as="div" tip={{ term: "Context Window", definition: `${m.name} supports up to ${m.contextWindow} provider-side.`,
                          rows: [["Provider maximum", m.contextWindow], ["Tenant allowed", m.allowedContext], ["Overflow behaviour", "Evidence re-ranking, never silent truncation"]],
                          why: "Provider maximum context is a capability, not a budget." }}>
                          <span className="text-slate-600">{m.contextWindow}</span>
                        </RichTip>
                      </td>
                      <td className="px-3">
                        <RichTip as="div" tip={{ term: "Reasoning Tier", definition: "Tenant taxonomy: Fast for deterministic utility work, Balanced for standard analysis, Advanced for multi-step reasoning.",
                          rows: [["This deployment", m.reasoning], ["Assigned from", "Tenant evaluation, not vendor claim"], ["Composite score", `${m.composite}`]] }}>
                          <span className="text-slate-600">{m.reasoning}</span>
                        </RichTip>
                      </td>
                      <td className="px-3 tabular-nums text-slate-600">{m.latency.toFixed(1)}s</td>
                      <td className="px-3">
                        <RichTip as="div" tip={{ term: "Relative Cost", definition: `Tenant cost classification for ${m.name}.`,
                          rows: [["Classification", m.cost], ["Recent average / request", m.costPerRequest], ["Input rate", m.inputRate], ["Output rate", m.outputRate]] }}>
                          <span className="font-medium text-slate-700">{m.cost}</span>
                        </RichTip>
                      </td>
                      <td className="px-3 text-slate-600">{m.safety}</td>
                      <td className="px-3 text-slate-600">{m.regions}</td>
                      <td className="px-3">
                        <RichTip as="div" tip={{ term: `${m.name} status`, definition: m.statusReason ?? "Deployment operating within tenant thresholds.",
                          rows: [["Provider health", PROVIDERS.find((p) => p.name === m.provider)?.status ?? "Healthy"], ["Deployment health", m.status],
                            ["Quota", `${m.quota}% used`], ["Recent errors", m.recentErrors], ["Last successful invocation", m.lastInvocation]] }}>
                          <span><StatePill tone={healthTone(m.status)} label={m.status} /></span>
                        </RichTip>
                      </td>
                      <td className="px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-7 tabular-nums text-slate-600">{m.usage}%</span>
                          <div className="w-10"><Bar value={m.usage * 3} /></div>
                        </div>
                      </td>
                      <td className="px-3">
                        <button onClick={(e) => { e.stopPropagation(); openDrawer("explain"); }}
                          className="rounded border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-600 hover:border-blue-300 hover:text-blue-700">
                          Explain Route
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {models.length > 0 && (
            <div className="flex items-center gap-2 border-t border-slate-200 px-4 py-2 text-[11.5px] text-slate-500">
              <span className="flex-1">Showing {page * pageSize + 1}–{Math.min(models.length, (page + 1) * pageSize)} of {models.length}</span>
              <Btn onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>Previous</Btn>
              <span>Page {page + 1} / {Math.max(1, Math.ceil(models.length / pageSize))}</span>
              <Btn onClick={() => setPage((p) => (p + 1) * pageSize < models.length ? p + 1 : p)} disabled={(page + 1) * pageSize >= models.length}>Next</Btn>
            </div>
          )}
        </Panel>

        {/* Routing decision pipeline */}
        <Panel title="Routing Decision Pipeline" help="Composite Route Score"
          subtitle="Task intent → capability requirement → policy eligibility → safety eligibility → cost / latency optimization → model selection → fallback assurance."
          actions={<Btn onClick={() => openDrawer("explain")}><Sparkles className="h-3.5 w-3.5" />Explain Route</Btn>}>
          <ol className="space-y-1.5">
            {PIPELINE.map((s, i) => (
              <li key={s.id}>
                <RichTip as="div" tip={{ term: s.name, definition: s.purpose, rows: [["Volume", s.volume], ["Pass-through", s.pass], ["Health", s.health]] }}>
                  <button onClick={() => openDrawer(`stage:${s.id}`)}
                    className={cn("w-full rounded-md border px-3 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                      drawer === `stage:${s.id}` ? "border-blue-400 bg-blue-50/50" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50")}>
                    <div className="flex items-center gap-2">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">{s.index}</span>
                      <span className="flex-1 text-[12.5px] font-semibold uppercase tracking-[0.04em] text-slate-800">{s.name}</span>
                      <span className="tabular-nums text-[11.5px] text-slate-600">{s.volume}</span>
                      {s.pass !== "—" && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10.5px] font-medium text-slate-700">{s.pass}</span>}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1 pl-7">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">{s.signalsLabel}</span>
                      {s.signals.map((sig) => (
                        <span key={sig} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10.5px] text-slate-600">{sig}</span>
                      ))}
                    </div>
                  </button>
                </RichTip>
                {i < PIPELINE.length - 1 && <div className="py-0.5 pl-[18px] text-slate-300" aria-hidden>↓</div>}
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      {/* Provider health + routing policies */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Provider &amp; Region Health" help="Provider Health"
          subtitle="Synthetic probes plus real invocation telemetry, evaluated against tenant SLA thresholds."
          bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[10.5px] uppercase tracking-[0.06em] text-slate-500">
                  {["Provider", "Regions Monitored", "Status", "Failover Readiness", "Authentication", "Quota Usage", "Recent Incidents"].map((h) => (
                    <th key={h} className="px-3 py-2 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {providers.map((p) => (
                  <tr key={p.id} onClick={() => openDrawer(`provider:${p.id}`)}
                    className="cursor-pointer border-b border-slate-100 text-[12px] transition-colors hover:bg-blue-50/40 [&>td]:py-2">
                    <td className="px-3 font-medium text-slate-800">{p.name}</td>
                    <td className="px-3">
                      <RichTip as="div" tip={{ term: `${p.name} deployments`, definition: "Endpoint health per monitored region.",
                        rows: p.regionList.map((r) => [r, p.status === "Degraded" && r === "US-East" ? "Degraded · 3.8s p95" : "Healthy"] as [string, string]) }}>
                        <span className="text-slate-600">{p.regions}</span>
                      </RichTip>
                    </td>
                    <td className="px-3"><StatePill tone={healthTone(p.status)} label={p.status} /></td>
                    <td className="px-3 text-slate-600">{p.failover}</td>
                    <td className="px-3">
                      <RichTip as="div" tip={{ term: "Authentication", definition: p.authDetail, rows: [["State", p.auth], ["Secrets in console", "Never displayed"]] }}>
                        <span className="text-emerald-700">{p.auth}</span>
                      </RichTip>
                    </td>
                    <td className="px-3">
                      <RichTip as="div" tip={{ term: `${p.name} quota`, definition: "Token throughput allocation and consumption.",
                        rows: [["Hard limit", p.quotaHard], ["Soft threshold", p.quotaSoft], ["Recent peak", p.quotaPeak], ["Projection", p.projected]] }}>
                        <span className="flex items-center gap-1.5">
                          <span className="w-8 tabular-nums text-slate-600">{p.quota}%</span>
                          <span className="inline-block w-12"><Bar value={p.quota} tone={p.quota > 70 ? "amber" : "blue"} /></span>
                        </span>
                      </RichTip>
                    </td>
                    <td className="px-3">
                      {p.incident === "None" ? <span className="text-slate-400">None</span> : (
                        <RichTip as="div" tip={{ term: "Provider incident", definition: p.incidentDetail ?? "", rows: [["Observed", "3.8 sec"], ["Threshold", "2.5 sec"], ["Since", "04:10 UTC"]] }}>
                          <span className="text-amber-700">{p.incident}</span>
                        </RichTip>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Routing Policies" help="Routing Policy"
          subtitle="Rules controlling model selection for a defined task or workload class."
          actions={<Btn variant="primary" onClick={() => setPolicyWizard(true)}><Plus className="h-3.5 w-3.5" />Create Routing Policy</Btn>}
          bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[10.5px] uppercase tracking-[0.06em] text-slate-500">
                  {["Policy Name", "Intent Class", "Primary Model", "Fallback", "Constraints", "Last Updated", "Status"].map((h) => (
                    <th key={h} className="px-3 py-2 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {policies.map((p) => (
                  <tr key={p.id} onClick={() => openDrawer(`policy:${p.id}`)}
                    className="cursor-pointer border-b border-slate-100 align-top text-[12px] transition-colors hover:bg-blue-50/40 [&>td]:py-2">
                    <td className="px-3 font-medium text-slate-800">{p.name}</td>
                    <td className="px-3 text-slate-600">{p.intent}</td>
                    <td className="px-3 text-slate-700">{p.primary}</td>
                    <td className="px-3 text-slate-600">{p.fallback}</td>
                    <td className="px-3">
                      <div className="flex flex-wrap gap-1">
                        {p.constraints.map((c) => <span key={c} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10.5px] text-slate-600">{c}</span>)}
                      </div>
                    </td>
                    <td className="px-3 text-slate-500">{p.updated}</td>
                    <td className="px-3"><StatePill tone={p.status === "Active" ? "ok" : p.status === "Conflict" ? "bad" : "muted"} label={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {/* Cost & performance + evaluation */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="Cost &amp; Performance Overview" help="Cost Ceiling"
          subtitle="Spend by provider, latency distribution, and the cost control policies that bound every route.">
          <div className="flex flex-wrap gap-5">
            <div className="flex items-center gap-4">
              <Donut providers={PROVIDERS} onSelect={(id) => openDrawer(`spend:${id}`)} />
              <ul className="space-y-1">
                {PROVIDERS.map((p) => (
                  <li key={p.id}>
                    <RichTip as="div" tip={{ term: `${p.name} spend`, definition: "Provider contribution to monthly inference spend.",
                      rows: [["Spend", p.spend], ["Requests", p.requests], ["Input tokens", p.inputTokens], ["Output tokens", p.outputTokens], ["Average request cost", p.avgCost], ["Trend", p.trend]] }}>
                      <button onClick={() => openDrawer(`spend:${p.id}`)} className="flex w-full items-center gap-2 rounded px-1 py-0.5 text-[11.5px] hover:bg-slate-50">
                        <span className="h-2 w-2 rounded-full" style={{ background: SEGMENT_COLORS[PROVIDERS.indexOf(p) % SEGMENT_COLORS.length] }} />
                        <span className="flex-1 text-slate-700">{p.name}</span>
                        <span className="tabular-nums text-slate-500">{p.spendShare}%</span>
                        <span className="w-14 text-right tabular-nums text-slate-700">{p.spend}</span>
                      </button>
                    </RichTip>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-[220px] flex-1">
              <SubHead>Latency &amp; throughput summary</SubHead>
              <div className="grid grid-cols-2 gap-1.5">
                {LATENCY_SUMMARY.map((l) => (
                  <button key={l.id} onClick={() => openDrawer(`latency:${l.id}`)}
                    className="rounded-md border border-slate-200 px-2.5 py-1.5 text-left transition-colors hover:border-blue-300 hover:bg-slate-50">
                    <div className="text-[15px] font-semibold tabular-nums text-slate-900">{l.value}</div>
                    <div className="text-[10.5px] text-slate-500">{l.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <SubHead>Cost control policies</SubHead>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {COST_POLICIES.map((c) => (
              <RichTip key={c.id} as="div" tip={{ term: c.name, definition: c.detail, rows: [["Limit", c.limit], ["Enforcement", c.kind]],
                why: c.kind === "Hard block" ? "Hard-blocking policies reject the request rather than exceeding the ceiling." : "Guidance policies bias scoring without blocking an eligible route." }}>
                <button onClick={() => openDrawer(`cost:${c.id}`)} className="flex w-full items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 text-left text-[11.5px] hover:border-blue-300 hover:bg-slate-50">
                  <span className="flex-1 text-slate-700">{c.name}</span>
                  <span className="tabular-nums font-medium text-slate-800">{c.limit}</span>
                  <StatePill tone={c.kind === "Hard block" ? "bad" : "muted"} label={c.kind === "Hard block" ? "Hard" : "Guidance"} />
                </button>
              </RichTip>
            ))}
          </div>
        </Panel>

        <Panel title="Model Capability &amp; Evaluation Summary" help="Evaluation Score"
          subtitle="Normalized tenant evaluation results across task dimensions."
          actions={<Btn onClick={() => toast.info("Evaluation benchmark", { description: "Tenant golden sets, synthetic tests, human review and production outcomes." })}>View evaluation benchmark</Btn>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[10.5px] uppercase tracking-[0.06em] text-slate-500">
                  <th className="px-2 py-2 font-semibold">Model</th>
                  {EVAL_COLUMNS.map((c) => <th key={c} className="px-2 py-2 font-semibold">{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {evals.map((e, ri) => (
                  <tr key={e.model} className={cn("border-b border-slate-100 text-[12px]", evalCell?.r === ri && "bg-blue-50/40")}>
                    <td className="px-2 py-2 font-medium text-slate-800">{e.model}</td>
                    {e.scores.map((s, ci) => (
                      <td key={ci} className={cn("px-2 py-2", evalCell?.c === ci && "bg-blue-50/40")}
                        onMouseEnter={() => setEvalCell({ r: ri, c: ci })} onMouseLeave={() => setEvalCell(null)}>
                        <RichTip as="div" tip={{ term: `${e.model} · ${EVAL_COLUMNS[ci]}`, definition: "Normalized tenant evaluation result — not a public benchmark claim.",
                          rows: [["Score", `${s}`], ["Benchmark", e.suite], ["Sample size", `${e.sample.toLocaleString()} cases`], ["Evaluation date", e.date],
                            ["Confidence interval", e.ci], ["Change from previous", `${e.delta[ci] >= 0 ? "+" : ""}${e.delta[ci]}`]] }}>
                          <button onClick={() => openDrawer(`eval:${e.model}`)} className="w-full text-left">
                            <div className="tabular-nums text-slate-700">{s}</div>
                            <Bar value={s} tone={s >= 90 ? "emerald" : s >= 82 ? "blue" : "amber"} />
                          </button>
                        </RichTip>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            Scores are normalized tenant evaluation results. Benchmark date: May 15, 2026. These are mock tenant measurements and do not represent public benchmark claims.
          </p>
        </Panel>
      </div>

      {/* Guardrails + fallback */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Panel title="Safety &amp; Guardrail Summary" help="Guardrail"
          subtitle="Controls evaluated before and after inference." bodyClassName="p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[10.5px] uppercase tracking-[0.06em] text-slate-500">
                {["Guardrail", "Active Policies", "Status", "Enforced"].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {GUARDRAILS.map((g) => (
                <tr key={g.id} onClick={() => openDrawer(`guardrail:${g.id}`)}
                  className="cursor-pointer border-b border-slate-100 text-[12px] transition-colors hover:bg-blue-50/40 [&>td]:py-1.5">
                  <td className="px-3">
                    <RichTip as="div" tip={{ term: g.name, definition: g.definition,
                      rows: [["Current configuration", g.configuration[0]], ["Enforced", g.enforced], ["Recent interventions", g.interventions]], why: g.why }}>
                      <span className="text-slate-800">{g.name}</span>
                    </RichTip>
                  </td>
                  <td className="px-3 tabular-nums text-slate-600">{g.policies}</td>
                  <td className="px-3"><StatePill tone="ok" label={g.status} /></td>
                  <td className="px-3 text-slate-600">{g.enforced}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-3 py-2 text-[11px] text-slate-500">Guardrails are enforced before and after model invocation.</p>
        </Panel>

        <Panel title="Fallback Chains &amp; Routing Assurance" help="Fallback Chain"
          subtitle="Ordered alternate routes invoked when the preferred route cannot execute successfully.">
          <div className="flex flex-wrap gap-4">
            <div className="min-w-[320px] flex-1 space-y-1.5">
              {CHAINS.map((c, i) => (
                <button key={c.id} onClick={() => openDrawer(`chain:${c.id}`)}
                  onMouseEnter={() => setHoverChain(c.id)} onMouseLeave={() => setHoverChain(null)}
                  className={cn("w-full rounded-md border px-3 py-2 text-left transition-colors",
                    hoverChain === c.id ? "border-blue-300 bg-blue-50/40" : "border-slate-200 hover:bg-slate-50")}>
                  <div className="flex items-center gap-2">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-slate-100 text-[10px] font-semibold text-slate-600">{i + 1}</span>
                    <div className="flex flex-1 flex-wrap items-center gap-1">
                      {c.nodes.map((n, ni) => (
                        <span key={n} className="flex items-center gap-1">
                          <RichTip as="span" tip={{ term: n, definition: "Chain hop health and recent latency.",
                            rows: [["Health", MODELS.find((m) => n.startsWith(m.name))?.status ?? "Healthy"],
                              ["Recent latency", `${MODELS.find((m) => n.startsWith(m.name))?.latency ?? 1.5}s`]] }}>
                            <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] text-slate-700">{n}</span>
                          </RichTip>
                          {ni < c.nodes.length - 1 && (
                            <RichTip as="span" tip={{ term: "Failover rule", definition: c.arrowRules[Math.min(ni, c.arrowRules.length - 1)],
                              rows: [["Timeout", c.timeout], ["Retries", c.retries], ["Trigger", c.trigger]] }}>
                              <ArrowRight className={cn("h-3 w-3", hoverChain === c.id ? "text-blue-600" : "text-slate-400")} />
                            </RichTip>
                          )}
                        </span>
                      ))}
                    </div>
                    <StatePill tone={c.status === "Validated" ? "ok" : "bad"} label={c.status} />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 pl-7 text-[10.5px] text-slate-500">
                    <span>Timeout {c.timeout}</span><span>·</span><span>Retries {c.retries}</span><span>·</span><span>{c.regional}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="w-[200px] shrink-0 space-y-1.5">
              {ASSURANCE.map((a) => (
                <RichTip key={a.id} as="div" tip={{ term: a.label, definition: a.definition }}>
                  <button onClick={() => openDrawer(`assurance:${a.id}`)}
                    className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-left transition-colors hover:border-blue-300 hover:bg-slate-50">
                    <div className="text-[15px] font-semibold tabular-nums text-slate-900">{a.value}</div>
                    <div className="text-[10.5px] leading-snug text-slate-500">{a.label}</div>
                  </button>
                </RichTip>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      {/* Recent routing decisions */}
      <Panel title="Recent Routing Decisions"
        subtitle="Configuration verification and administrative traceability — not operational monitoring."
        actions={<Btn onClick={() => setDecisionsOpen((v) => !v)}>{decisionsOpen ? "Collapse" : "Expand"}<ChevronRight className={cn("h-3.5 w-3.5 transition-transform", decisionsOpen && "rotate-90")} /></Btn>}
        bodyClassName={decisionsOpen ? "p-0" : "hidden"}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[10.5px] uppercase tracking-[0.06em] text-slate-500">
                {["Timestamp", "Request ID", "Task Class", "Selected Model", "Fallback", "Policy", "Latency", "Cost", "Status", "Reason"].map((h) => (
                  <th key={h} className="px-3 py-2 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DECISIONS.map((d) => (
                <tr key={d.id} onClick={() => openDrawer("explain")}
                  className="cursor-pointer border-b border-slate-100 text-[12px] transition-colors hover:bg-blue-50/40 [&>td]:py-1.5">
                  <td className="px-3 tabular-nums text-slate-500">{d.time}</td>
                  <td className="px-3 font-mono text-[11px] text-slate-700">{d.id}</td>
                  <td className="px-3 text-slate-600">{d.taskClass}</td>
                  <td className="px-3 font-medium text-slate-800">{d.model}</td>
                  <td className="px-3 text-slate-600">{d.fallback}</td>
                  <td className="px-3 text-slate-600">{d.policy}</td>
                  <td className="px-3 tabular-nums text-slate-600">{d.latency}</td>
                  <td className="px-3 tabular-nums text-slate-600">{d.cost}</td>
                  <td className="px-3"><StatePill tone={d.status === "Completed" ? "ok" : d.status === "Fallback" ? "warn" : "bad"} label={d.status} /></td>
                  <td className="px-3">
                    <RichTip as="div" tip={{ term: `${d.id} route explanation`, definition: d.reasonLong, rows: [["Policy", d.policy], ["Selected", d.model], ["Fallback", d.fallback]] }}>
                      <span className="text-slate-600">{d.reason}</span>
                    </RichTip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Control plane + service contract */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="Tenant Model Control Plane" subtitle="This page governs the tenant model control plane. Individual digital coworkers consume approved routing policies but are configured separately.">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <SubHead>Defines</SubHead>
              <Bullets items={CONTROL_PLANE_DEFINES} />
            </div>
            <div>
              <SubHead>Runtime relationship</SubHead>
              <ol className="space-y-1">
                {CONTROL_PLANE_FLOW.map((f, i) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">{i + 1}</span>
                    <span className={cn("flex-1 rounded border px-2 py-1 text-[11.5px]",
                      i === 0 ? "border-blue-200 bg-blue-50 font-medium text-blue-800" : "border-slate-200 bg-white text-slate-700")}>{f}</span>
                  </li>
                ))}
              </ol>
              <SubHead>Administrative roles</SubHead>
              <div className="space-y-1">
                {ROLES.map(([r, d]) => (
                  <RichTip key={r} as="div" tip={{ term: r, definition: d }}>
                    <div className="rounded border border-slate-200 px-2 py-1 text-[11px] text-slate-700">{r}</div>
                  </RichTip>
                ))}
              </div>
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Model Evaluation Framework" help="Evaluation Score"
            subtitle="Models are not selected from vendor specifications; they are selected from tenant measurement.">
            <SubHead>Evaluation dimensions</SubHead>
            <div className="flex flex-wrap gap-1">
              {EVAL_DIMENSIONS.map((d) => <span key={d} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10.5px] text-slate-600">{d}</span>)}
            </div>
            <SubHead>Evaluation sources</SubHead>
            <div className="flex flex-wrap gap-1">
              {EVAL_SOURCES.map((d) => <span key={d} className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10.5px] text-slate-600">{d}</span>)}
            </div>
            <div className="mt-3">
              <KV rows={[["Last evaluated", "May 15, 2026"], ["Evaluation owner", "AI Platform Team"], ["Suite version", "Golden set v6 · Utility v9"], ["Sample size", "22,400 cases"], ["Confidence", "±1.5 at 95%"], ["Regression result", "Pass — 1 latency regression on AWS Bedrock"]]} />
            </div>
          </Panel>

          <Panel title="What this layer guarantees to neugain.io" subtitle="Engineering service contract for the LLM + Model Routing plane.">
            <div className="grid gap-1.5 sm:grid-cols-2">
              {SERVICE_CONTRACT.map(([k, v]) => (
                <div key={k} className="flex items-start gap-2 rounded-md border border-slate-200 px-2.5 py-1.5">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-800">{k}</div>
                    <p className="text-[11px] leading-snug text-slate-600">{v}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <RoutingPolicyWizard open={policyWizard} onClose={() => setPolicyWizard(false)}
        onPublished={(n) => { setPolicyWizard(false); toast.success("Routing policy published", { description: n }); }} />

      {/* ------------------------------ drawers ------------------------------ */}

      <InspectDrawer open={!!model} onClose={closeDrawer} objectType="Model Deployment" name={model?.name ?? ""}
        status={model?.status} statusTone={model ? (healthTone(model.status) as any) : "ok"} tabs={model ? modelTabs(model) : []} />

      <InspectDrawer open={!!provider} onClose={closeDrawer} objectType="Provider" name={provider?.name ?? ""}
        status={provider?.status} statusTone={provider ? (healthTone(provider.status) as any) : "ok"} tabs={provider ? providerTabs(provider) : []} />

      <InspectDrawer open={!!policy} onClose={closeDrawer} objectType="Routing Policy" name={policy?.name ?? ""}
        status={policy?.status} statusTone={policy?.status === "Active" ? "ok" : "bad"} tabs={policy ? policyTabs(policy, () => openDrawer("explain")) : []} />

      <InspectDrawer open={!!stage} onClose={closeDrawer} objectType="Routing Pipeline Stage" name={stage?.name ?? ""}
        status={stage?.pass !== "—" ? `${stage?.pass} pass-through` : stage?.volume} statusTone="ok" tabs={stage ? stageTabs(stage) : []} />

      <InspectDrawer open={!!guardrail} onClose={closeDrawer} objectType="Guardrail" name={guardrail?.name ?? ""}
        status={guardrail?.status} statusTone="ok" tabs={guardrail ? [
          { id: "o", label: "Overview", content: (<div>
            <p className="text-[12px] leading-relaxed text-slate-700">{guardrail.definition}</p>
            <SubHead>Current configuration</SubHead><Bullets items={guardrail.configuration} />
            <SubHead>Enforcement</SubHead><KV rows={[["Enforced", guardrail.enforced], ["Active policies", `${guardrail.policies}`], ["Recent interventions", guardrail.interventions]]} />
            <SubHead>Why it matters</SubHead><p className="text-[11.5px] leading-relaxed text-slate-700">{guardrail.why}</p>
          </div>) },
          { id: "h", label: "History", content: <KV rows={[["May 11, 2026 · S. Devi", "Threshold updated"], ["Apr 26, 2026 · R. Nair", "Applied to 2 additional policies"]]} /> },
        ] : []} />

      <InspectDrawer open={!!chain} onClose={closeDrawer} objectType="Fallback Chain" name={chain?.nodes.join(" → ") ?? ""}
        status={chain?.status} statusTone={chain?.status === "Validated" ? "ok" : "bad"} tabs={chain ? [
          { id: "o", label: "Overview", content: (<div>
            <p className="text-[12px] leading-relaxed text-slate-700">{chain.note}</p>
            <SubHead>Execution contract</SubHead>
            <KV rows={[["Timeout", chain.timeout], ["Retries", chain.retries], ["Failover trigger", chain.trigger], ["Regional constraints", chain.regional], ["Status", chain.status]]} />
            <SubHead>Hop rules</SubHead><Bullets items={chain.arrowRules} />
          </div>) },
          { id: "c", label: "Constraints", content: <Bullets items={[`Every hop must independently satisfy the policy evaluation.`, chain.regional, `Failover trigger: ${chain.trigger}`]} /> },
        ] : []} />

      <InspectDrawer open={!!assurance} onClose={closeDrawer} objectType="Routing Assurance Metric" name={assurance?.label ?? ""}
        status={assurance?.value} statusTone="ok" tabs={assurance ? [{ id: "m", label: "Measurement", content: (<div>
          <p className="text-[12px] leading-relaxed text-slate-700">{assurance.definition}</p>
          <SubHead>Detail</SubHead><p className="text-[11.5px] leading-relaxed text-slate-700">{assurance.detail}</p>
        </div>) }] : []} />

      <InspectDrawer open={!!latency} onClose={closeDrawer} objectType="Performance Metric" name={latency?.label ?? ""}
        status={latency?.value} statusTone="ok" tabs={latency ? [{ id: "m", label: "Measurement", content: <p className="text-[12px] leading-relaxed text-slate-700">{latency.detail}</p> }] : []} />

      <InspectDrawer open={!!costPolicy} onClose={closeDrawer} objectType="Cost Control Policy" name={costPolicy?.name ?? ""}
        status={costPolicy?.kind} statusTone={costPolicy?.kind === "Hard block" ? "bad" : "warn"} tabs={costPolicy ? [{ id: "o", label: "Overview", content: (<div>
          <KV rows={[["Limit", costPolicy.limit], ["Enforcement", costPolicy.kind]]} />
          <SubHead>Behaviour</SubHead><p className="text-[11.5px] leading-relaxed text-slate-700">{costPolicy.detail}</p>
        </div>) }] : []} />

      <InspectDrawer open={!!evalRow} onClose={closeDrawer} objectType="Evaluation" name={evalRow ? `${evalRow.model} evaluation` : ""}
        status={evalRow?.date} statusTone="ok" tabs={evalRow ? [
          { id: "s", label: "Scores", content: (<div>
            <KV rows={EVAL_COLUMNS.map((c, i) => [c, `${evalRow.scores[i]} (${evalRow.delta[i] >= 0 ? "+" : ""}${evalRow.delta[i]})`] as [string, string])} />
            <SubHead>Method</SubHead>
            <KV rows={[["Test suite", evalRow.suite], ["Sample size", `${evalRow.sample.toLocaleString()} cases`], ["Evaluation date", evalRow.date], ["Confidence interval", evalRow.ci]]} />
            <p className="mt-2 text-[11px] text-slate-500">Mock tenant evaluation results. These are not public benchmark claims.</p>
          </div>) },
          { id: "d", label: "Dimensions", content: <Bullets items={EVAL_DIMENSIONS} /> },
        ] : []} />

      <InspectDrawer open={!!spendProvider} onClose={closeDrawer} objectType="Provider Spend" name={spendProvider?.name ?? ""}
        status={spendProvider?.spend} statusTone="ok" tabs={spendProvider ? [{ id: "c", label: "Cost", content: (
          <KV rows={[["Spend this month", spendProvider.spend], ["Share of total", `${spendProvider.spendShare}%`], ["Requests", spendProvider.requests],
            ["Input tokens", spendProvider.inputTokens], ["Output tokens", spendProvider.outputTokens],
            ["Average request cost", spendProvider.avgCost], ["Trend", spendProvider.trend]]} />) }] : []} />

      <InspectDrawer open={!!kpi} onClose={closeDrawer} objectType="Tenant Indicator" name={kpi?.label ?? ""}
        status={kpi?.value} statusTone="ok" tabs={kpi ? [{ id: "m", label: "Measurement", content: (<div>
          <p className="text-[12px] leading-relaxed text-slate-700">{kpi.tip.definition}</p>
          <SubHead>Breakdown</SubHead><KV rows={kpi.tip.rows as [string, string][]} />
          {kpi.tip.why && (<><SubHead>Why it matters</SubHead><p className="text-[11.5px] leading-relaxed text-slate-700">{kpi.tip.why}</p></>)}
        </div>) }] : []} />

      <InspectDrawer open={explain} onClose={closeDrawer} objectType="Route Explanation" name={EXPLANATION.requestId}
        status="Selected: GPT-5 Enterprise" statusTone="ok" tabs={explanationTabs()} />

      <InspectDrawer open={!!decision} onClose={closeDrawer} objectType="Route Decision" name={decision?.id ?? ""}
        status={decision?.status} statusTone="ok" tabs={decision ? [{ id: "o", label: "Overview", content: <p className="text-[12px] text-slate-700">{decision.reasonLong}</p> }] : []} />
    </div>
  );
}

/* ------------------------------- donut chart ------------------------------ */

const SEGMENT_COLORS = ["#2563eb", "#0ea5e9", "#14b8a6", "#8b5cf6", "#f59e0b", "#94a3b8"];

function Donut({ providers, onSelect }: { providers: ProviderRow[]; onSelect: (id: string) => void }) {
  const r = 52, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative h-[150px] w-[150px] shrink-0">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        {providers.map((p, i) => {
          const len = (p.spendShare / 100) * c;
          const el = (
            <circle key={p.id} cx="70" cy="70" r={r} fill="none" strokeWidth="16"
              stroke={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset}
              className="cursor-pointer transition-opacity hover:opacity-80"
              onClick={() => onSelect(p.id)}>
              <title>{`${p.name} · ${p.spendShare}% · ${p.spend}`}</title>
            </circle>
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-[18px] font-semibold text-slate-900">{SPEND_TOTAL}</div>
          <div className="text-[10.5px] text-slate-500">Month</div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- drawer tabs ------------------------------ */

function modelTabs(m: ModelRow): DrawerTab[] {
  return [
    { id: "o", label: "Overview", content: (<div>
      <KV rows={[["Model family", m.family], ["Provider", m.provider], ["Deployment", m.deployment],
        ["Context window", m.contextWindow], ["Tenant allowed context", m.allowedContext], ["Reasoning tier", m.reasoning],
        ["Modalities", m.modalities.join(", ")], ["Streaming", m.streaming ? "Supported" : "Not supported"],
        ["Structured output", m.structured ? "Supported" : "Not supported"], ["Tool calling", m.tools ? "Supported" : "Not supported"],
        ["Region availability", m.regionList.join(", ")], ["Current status", m.status]]} />
      {m.statusReason && (<><SubHead>Status detail</SubHead><p className="text-[11.5px] leading-relaxed text-amber-800">{m.statusReason}</p></>)}
    </div>) },
    { id: "c", label: "Capabilities", content: <KV rows={[["Reasoning", m.reasoning], ["Code", "Supported"], ["Vision", m.modalities.includes("Vision") ? "Supported" : "Not supported"],
      ["Long context", m.contextTokens >= 128000 ? "Supported" : "Limited"], ["Tool use", m.tools ? "Supported" : "Not supported"],
      ["Structured output", m.structured ? "Supported" : "Not supported"], ["Function calling", m.tools ? "Supported" : "Not supported"], ["Grounded retrieval", "Supported"]]} /> },
    { id: "d", label: "Deployment", content: (<div>
      <KV rows={[["Endpoint reference", m.deployment], ["Gateway", "gateway.neugain.io/inference"], ["Region", m.regionList.join(", ")],
        ["Timeout", "18s"], ["Retry", "1 per hop"], ["Concurrency", "64 in-flight"], ["Quota", `${m.quota}% consumed`],
        ["Authentication", "Vault credential reference"], ["Connection policy", "Private endpoint · TLS 1.3"]]} />
      <p className="mt-2 text-[11px] text-slate-500">API secrets are never displayed in this console.</p>
    </div>) },
    { id: "r", label: "Routing", content: <KV rows={[["Eligible policies", `${m.eligiblePolicies}`], ["Primary route", `${m.primaryRoutes}`], ["Fallback route", `${m.fallbackRoutes}`], ["Usage share", `${m.usage}%`]]} /> },
    { id: "co", label: "Cost", content: <KV rows={[["Current month", m.monthCost], ["Cost / request", m.costPerRequest], ["Input token rate", m.inputRate],
      ["Output token rate", m.outputRate], ["Average input tokens", m.avgInputTokens.toLocaleString()], ["Average output tokens", m.avgOutputTokens.toLocaleString()],
      ["Budget exposure", `${m.usage}% of tenant spend`]]} /> },
    { id: "s", label: "Safety", content: (<div>
      <KV rows={[["Safety profile", m.safety], ["Allowed data classes", m.allowedClasses.join(", ")], ["Blocked data classes", m.blockedClasses.join(", ")], ["Allowed regions", m.regionList.join(", ")]]} />
      <SubHead>Guardrails applied</SubHead><Bullets items={GUARDRAILS.slice(0, 5).map((g) => g.name)} />
    </div>) },
    { id: "e", label: "Evaluation", content: <KV rows={[["Composite score", `${m.composite}`], ["Last evaluation", m.lastEvaluated], ["Regression status", m.regression], ["Evaluation suites", "Golden set v6, Utility v9, Long-context v3"]]} /> },
    { id: "u", label: "Usage", content: (<div>
      <KV rows={[["Requests (30d)", m.requests], ["Tokens (30d)", m.tokens], ["Success rate", m.successRate], ["Median latency", `${m.latency}s`]]} />
      <SubHead>Digital coworkers using policies that reference this model</SubHead><Bullets items={m.coworkers} />
    </div>) },
    { id: "h", label: "History", content: <KV rows={m.history} /> },
  ];
}

function providerTabs(p: ProviderRow): DrawerTab[] {
  return [
    { id: "o", label: "Overview", content: (<div>
      <KV rows={[["Status", p.status], ["Regions monitored", p.regionList.join(", ")], ["Failover readiness", p.failover],
        ["Registered deployments", `${p.models}`], ["Endpoint", p.endpoint], ["Connection", p.connection]]} />
      {p.incidentDetail && (<><SubHead>Active incident</SubHead>
        <p className="text-[11.5px] leading-relaxed text-amber-800">{p.incidentDetail}</p>
        <SubHead>Routing impact</SubHead>
        <p className="text-[11.5px] leading-relaxed text-slate-700">New eligible requests have been shifted to alternate providers for policies allowing cross-provider fallback. Policies that block cross-provider failover continue to route here and are being monitored.</p></>)}
    </div>) },
    { id: "s", label: "Security", content: <KV rows={[["Authentication", p.auth], ["Method", p.authDetail], ["Network route", p.connection], ["Secrets", "Vault reference only — never displayed"]]} /> },
    { id: "q", label: "Health", content: <KV rows={[["Quota consumed", `${p.quota}%`], ["Hard limit", p.quotaHard], ["Soft threshold", p.quotaSoft], ["Recent peak", p.quotaPeak], ["Projection", p.projected], ["Recent incidents", p.incident]]} /> },
    { id: "c", label: "Usage", content: <KV rows={[["Spend this month", p.spend], ["Share of spend", `${p.spendShare}%`], ["Requests", p.requests], ["Input tokens", p.inputTokens], ["Output tokens", p.outputTokens], ["Average request cost", p.avgCost], ["Trend", p.trend]]} /> },
    { id: "h", label: "History", content: <KV rows={[["May 16, 2026 · System", `Status changed to ${p.status}`], ["May 02, 2026 · R. Nair", "Credential rotated"], ["Apr 19, 2026 · A. Ito", "Region added to monitoring"]]} /> },
  ];
}

function policyTabs(p: RoutingPolicy, explain: () => void): DrawerTab[] {
  return [
    { id: "o", label: "Overview", content: (<div>
      <KV rows={[["Primary model", p.primary], ["Fallback", p.fallback], ["Max context", p.maxContext], ["Max cost per request", p.maxCost],
        ["Allowed regions", p.regions.join(", ")], ["Policy owner", p.owner], ["Status", p.status], ["Last updated", p.updated]]} />
      <SubHead>About this policy</SubHead>
      <p className="text-[11.5px] leading-relaxed text-slate-700">{p.about}</p>
      {p.conflict && (<><SubHead>Conflict</SubHead>
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
          <div className="text-[11.5px] font-semibold text-red-900">{p.conflict.detail}</div>
          <p className="mt-1 text-[11px] leading-relaxed text-red-900/90">{p.conflict.impact}</p>
          <p className="mt-1 text-[11px] font-medium text-red-900">Recommended: {p.conflict.recommended}</p>
        </div></>)}
      <div className="mt-3"><Btn variant="primary" onClick={explain}><Sparkles className="h-3.5 w-3.5" />Explain Route</Btn></div>
    </div>) },
    { id: "c", label: "Configuration", content: (<ol className="space-y-1.5">
      {p.steps.map((s, i) => (
        <li key={s.title} className="rounded-md border border-slate-200 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">{i + 1}</span>
            <span className="flex-1 text-[12px] font-medium text-slate-800">{s.title}</span>
            <StatePill tone={s.status === "Active" ? "ok" : "bad"} label={s.status} />
          </div>
          <dl className="mt-1 space-y-0.5 pl-7 text-[11px]">
            <div className="flex gap-2"><dt className="w-16 text-slate-500">Rule</dt><dd className="flex-1 font-mono text-[10.5px] text-slate-700">{s.rule}</dd></div>
            <div className="flex gap-2"><dt className="w-16 text-slate-500">Condition</dt><dd className="flex-1 text-slate-700">{s.condition}</dd></div>
            <div className="flex gap-2"><dt className="w-16 text-slate-500">Action</dt><dd className="flex-1 text-slate-700">{s.action}</dd></div>
          </dl>
        </li>
      ))}
    </ol>) },
    { id: "k", label: "Constraints", content: <Bullets items={[...p.constraints, `Maximum context ${p.maxContext}`, `Maximum cost ${p.maxCost} per request`, `Allowed regions: ${p.regions.join(", ")}`]} /> },
    { id: "u", label: "Usage", content: <KV rows={p.usage} /> },
    { id: "h", label: "History", content: <KV rows={p.history} /> },
  ];
}

function stageTabs(s: PipelineStage): DrawerTab[] {
  return [
    { id: "o", label: "Overview", content: (<div>
      <SubHead>Purpose</SubHead><p className="text-[12px] leading-relaxed text-slate-700">{s.purpose}</p>
      <SubHead>Inputs</SubHead><Bullets items={s.inputs} />
      <SubHead>Decision logic</SubHead>
      <ul className="space-y-1">
        {s.logic.map((l) => <li key={l} className="rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[10.5px] leading-relaxed text-slate-700">{l}</li>)}
      </ul>
      <SubHead>Configuration rules</SubHead><Bullets items={s.rules} />
    </div>) },
    { id: "c", label: "Configuration", content: (<div>
      <SubHead>Thresholds</SubHead><KV rows={s.thresholds} />
      <SubHead>Dependencies</SubHead><Bullets items={s.dependencies} />
      <div className="mt-3 flex gap-1.5">
        <Btn>View as JSON</Btn><Btn>Edit</Btn><Btn>Audit History</Btn>
      </div>
    </div>) },
    { id: "h", label: "Health", content: (<div>
      <p className="text-[12px] text-slate-700">{s.health}</p>
      <SubHead>Throughput</SubHead><KV rows={[["Volume", s.volume], ["Pass-through", s.pass]]} />
    </div>) },
    { id: "r", label: "Recent decisions", content: <KV rows={s.recent} /> },
    { id: "ch", label: "History", content: <KV rows={s.changes} /> },
  ];
}

function explanationTabs(): DrawerTab[] {
  const e = EXPLANATION;
  return [
    { id: "r", label: "Request", content: (<div>
      <KV rows={[["Request ID", e.requestId], ["Task", e.task], ["Classification", e.classification],
        ["Required context", e.context], ["Data classification", e.dataClass], ["Region", e.region], ["Policy applied", e.policy]]} />
      <SubHead>Selected route</SubHead>
      <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
        <div className="text-[12.5px] font-semibold text-emerald-900">{e.selected}</div>
        <p className="mt-0.5 text-[11.5px] leading-relaxed text-emerald-900/90">{e.reason}</p>
        <p className="mt-1 text-[11.5px] text-emerald-900/80">Fallback: {e.fallback}</p>
      </div>
    </div>) },
    { id: "c", label: "Candidates", content: (<div className="space-y-1.5">
      {e.candidates.map((c) => (
        <div key={c.model} className={cn("rounded-md border px-3 py-2", c.eligible ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-slate-50")}>
          <div className="flex items-center gap-2">
            <span className="flex-1 text-[12px] font-medium text-slate-800">{c.model}</span>
            <StatePill tone={c.eligible ? "ok" : "bad"} label={c.eligible ? "Eligible" : "Rejected"} />
          </div>
          {c.rejection && <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{c.rejection}</p>}
          {c.scores && (
            <div className="mt-1.5 grid grid-cols-5 gap-1">
              {Object.entries(c.scores).map(([k, v]) => (
                <div key={k} className="rounded border border-slate-200 bg-white px-1 py-0.5 text-center">
                  <div className="text-[11px] font-semibold tabular-nums text-slate-800">{v}</div>
                  <div className="text-[9px] text-slate-500">{k}</div>
                </div>
              ))}
            </div>
          )}
          {c.composite !== undefined && <div className="mt-1 text-[11px] font-medium text-slate-700">Composite: {c.composite}</div>}
        </div>
      ))}
    </div>) },
    { id: "s", label: "Scoring", content: (<div>
      <SubHead>Composite weights</SubHead><KV rows={e.weights} />
      <SubHead>Result</SubHead>
      <KV rows={[["GPT-5 Enterprise", "92.4"], ["Claude Sonnet", "91.8"], ["Margin", "0.6"], ["Decision", "GPT-5 Enterprise selected, Claude Sonnet attached as fallback"]]} />
      <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
        Scoring is applied only to candidates that passed capability and policy eligibility. Rejected candidates are never scored.
      </p>
    </div>) },
  ];
}
