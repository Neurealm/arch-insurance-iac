/**
 * Page 2 · Reliability Command Center (route `/runops/command`)
 *
 * Enterprise view of reliability posture, active operational risk, incidents,
 * runbooks, digital workers, and business impact. All data flows from
 * OperationsProvider + ScenarioStore — no page-local fixtures.
 */

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Activity, AlertOctagon, Bot, CheckCircle2, GitBranch, Sparkles,
  Target, Workflow, ShieldCheck, TrendingUp, ArrowRight, Wrench, Zap,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { useOperations, useRightDrawer } from "@/runops/state/RunOpsProviders";
import { useScenarioStore } from "@/runops/scenario/ScenarioStore";
import { useAskNova } from "@/runops/shell/AskNovaPanel";
import {
  MetricCard, StatusIndicator, EntityQuickView,
  StaleDataState, ConnectorUnavailableState, EmptyState,
} from "@/runops/components";
import { SimulationBadge } from "@/runops/shell/SimulationBadge";
import {
  slos as canonicalSlos,
  connectors as canonicalConnectors,
  executionsList,
  changesList,
  environments, regions, timeRanges,
  type BusinessService, type DigitalWorker,
} from "@/runops/data/scenario";

const HEALTH_ORDER = ["Severely Degraded", "Unavailable", "Degraded", "At Risk", "Recovering", "Healthy"] as const;
const TIERS = ["All", "Tier 1", "Tier 2", "Tier 3"] as const;
const HEALTHS = ["All", "Healthy", "At Risk", "Degraded", "Severely Degraded", "Recovering", "Unavailable"] as const;
const OWNERS = ["All", "Checkout Squad", "Payments Squad", "Identity Squad"] as const;

function healthTone(h: string): "healthy" | "at-risk" | "degraded" | "critical" | "recovering" | "neutral" {
  switch (h) {
    case "Healthy":           return "healthy";
    case "At Risk":           return "at-risk";
    case "Degraded":          return "degraded";
    case "Severely Degraded":
    case "Unavailable":       return "critical";
    case "Recovering":        return "recovering";
    default:                  return "neutral";
  }
}

function ownerForService(id: string): string {
  if (id.includes("order"))    return "Checkout Squad";
  if (id.includes("payment"))  return "Payments Squad";
  if (id.includes("identity")) return "Identity Squad";
  return "Platform Squad";
}

const STALE_THRESHOLD_MS = 5 * 60 * 1000;

export default function Command() {
  const ops = useOperations();
  const scenario = useScenarioStore();
  const { openDrawer } = useRightDrawer();
  const askNova = useAskNova();
  const navigate = useNavigate();

  // Filters (owner + health + tier are page-local; env/region/time flow from OperationsProvider)
  const [tier, setTier]     = useState<(typeof TIERS)[number]>("All");
  const [owner, setOwner]   = useState<(typeof OWNERS)[number]>("All");
  const [health, setHealth] = useState<(typeof HEALTHS)[number]>("All");

  // Acknowledged risks & recent activity (page-local operational log)
  const [ackedRisks, setAckedRisks] = useState<Record<string, boolean>>({});
  const [recentActivity, setRecentActivity] = useState<Array<{ id: string; at: string; text: string }>>([]);
  const logActivity = (text: string) => setRecentActivity((prev) =>
    [{ id: `A-${prev.length + 1}`, at: new Date().toLocaleTimeString(), text }, ...prev].slice(0, 8),
  );

  /* ---------------------- Filtered service portfolio ---------------------- */

  const filteredServices = useMemo<BusinessService[]>(() => {
    return ops.services
      .filter((s) => tier === "All"   || s.tier === tier)
      .filter((s) => health === "All" || s.health === health)
      .filter((s) => owner === "All"  || ownerForService(s.id) === owner)
      .filter((s) => s.environment === ops.environment)
      .filter((s) => s.region === ops.region)
      .sort((a, b) => {
        const t = (a.tier).localeCompare(b.tier);
        if (t !== 0) return t;
        return HEALTH_ORDER.indexOf(a.health as never) - HEALTH_ORDER.indexOf(b.health as never);
      });
  }, [ops.services, ops.environment, ops.region, tier, health, owner]);

  /* --------------------------- Top metrics -------------------------------- */

  const metrics = useMemo(() => {
    const services = ops.services;
    const healthy = services.filter((s) => s.health === "Healthy").length;
    const degraded = services.filter((s) => s.health === "Degraded" || s.health === "Severely Degraded" || s.health === "At Risk").length;
    const slosAtRisk = canonicalSlos.filter((s) => s.current < s.target).length;
    const errorBudgetAvg = Math.round(services.reduce((a, s) => a + s.errorBudgetRemaining, 0) / services.length);
    const activeIncidents = ops.incident.state !== "Resolved" ? 1 : 0;
    const runbooksExecuting = ops.execution.state === "Running" ? 1 : 0;
    const pendingApprovals = ops.approval.state === "Pending" ? 1 : 0;
    // Deterministic business impact estimate derived from stage + incident state.
    const impactUsd = ops.incident.state === "Resolved" ? 0 : Math.round((scenario.stageIndex + 1) * 12_500);
    return { healthy, degraded, slosAtRisk, errorBudgetAvg, activeIncidents, runbooksExecuting, pendingApprovals, impactUsd };
  }, [ops.services, ops.incident.state, ops.execution.state, ops.approval.state, scenario.stageIndex]);

  const stale = useMemo(() => {
    const ageMs = Date.now() - new Date(ops.dataFreshnessAt).getTime();
    return Number.isFinite(ageMs) && ageMs > STALE_THRESHOLD_MS;
  }, [ops.dataFreshnessAt]);

  const backendUnavailable = ops.mode === "connected";
  const partialConnectorFailure = canonicalConnectors.some((c) => c.status !== "Healthy");

  /* -------------------------- Chart datasets ------------------------------ */

  const budgetChart = canonicalSlos.map((s) => ({
    name: s.name.replace(/ availability| latency.*/i, ""),
    remaining: s.errorBudgetRemaining,
    at: s.current < s.target ? "risk" : "ok",
  }));

  const burnSeries = useMemo(() => {
    // Deterministic burn curve keyed to stageIndex (higher = worse burn)
    const base = scenario.stageIndex;
    return Array.from({ length: 12 }, (_, i) => ({
      t: `${i * 5}m`,
      burn: Math.max(0.2, 0.4 + (base * 0.15) - Math.max(0, i - base) * 0.05),
    }));
  }, [scenario.stageIndex]);

  /* ------------------------ Reliability risks --------------------------- */

  const risks = useMemo(() => [
    { id: "R-1", title: "Checkout p95 latency exceeds SLO",           service: "svc-global-order-processing", severity: "critical" as const, route: "/runops/reliability/slos" },
    { id: "R-2", title: "SQL primary pool at 98% saturation",         service: "svc-global-order-processing", severity: "critical" as const, route: "/runops/services/svc-global-order-processing/observability" },
    { id: "R-3", title: "Identity availability burn accelerated",     service: "svc-identity",                severity: "warning"  as const, route: "/runops/reliability/slos" },
    { id: "R-4", title: "Azure DevOps connector degraded",            service: "platform",                    severity: "warning"  as const, route: "/runops/integrations" },
  ], []);

  const toilItems = useMemo(() => [
    { id: "T-1", title: "Weekly SQL failover rehearsal",  frequency: "Weekly", hoursPerMonth: 6,  automation: "Runbook RB-0039" },
    { id: "T-2", title: "Ad-hoc pod recycling on alarm",  frequency: "Daily",  hoursPerMonth: 12, automation: "Candidate AUT-118" },
    { id: "T-3", title: "3DS provider fallback drill",    frequency: "Monthly", hoursPerMonth: 3,  automation: "Runbook RB-0051" },
  ], []);

  const businessTx = useMemo(() => [
    { id: "TX-Checkout",     name: "Checkout",      volumePerMin: 2400, successPct: 91.4, target: 99.5 },
    { id: "TX-Auth",         name: "Authentication", volumePerMin: 3100, successPct: 99.7, target: 99.9 },
    { id: "TX-Payment",      name: "Payment Capture", volumePerMin: 2100, successPct: 99.6, target: 99.9 },
    { id: "TX-Fulfillment",  name: "Fulfillment",    volumePerMin: 890,  successPct: 99.9, target: 99.5 },
  ], []);

  /* -------------------------- Drawers ----------------------------------- */

  const openServiceDrawer = (s: BusinessService) => {
    logActivity(`Opened service ${s.name}`);
    openDrawer({
      title: s.name, subtitle: `${s.tier} · ${s.region}`,
      body: <EntityQuickView
        eyebrow="Service" title={s.name} subtitle={s.id}
        status={{ tone: healthTone(s.health), label: s.health }}
        fields={[
          { label: "Tier",         value: s.tier },
          { label: "Environment",  value: s.environment },
          { label: "SLO",          value: `${s.sloAvailability}%` },
          { label: "Budget left",  value: `${s.errorBudgetRemaining}%` },
          { label: "Owner",        value: ownerForService(s.id) },
        ]}
        footer={<Link to={`/runops/services/${s.id}`} className="text-sky-700 underline">Open service detail</Link>}
      />,
    });
  };

  const openWorkerDrawer = (w: DigitalWorker) => {
    logActivity(`Opened worker ${w.id}`);
    openDrawer({
      title: w.name, subtitle: w.role,
      body: <EntityQuickView
        eyebrow="Digital Worker" title={w.name} subtitle={w.role}
        status={{ tone: w.status === "Idle" ? "neutral" : "connected", label: w.status }}
        fields={[
          { label: "Autonomy", value: w.autonomy },
          { label: "Status",   value: w.status },
        ]}
        footer={<Link to={`/runops/workers/${w.id}/studio`} className="text-sky-700 underline">Open worker studio</Link>}
      />,
    });
  };

  const acknowledgeRisk = (id: string, title: string) => {
    setAckedRisks((prev) => ({ ...prev, [id]: true }));
    ops.pushNotification({
      kind: "info", title: `Risk acknowledged: ${title}`,
      detail: "Operations task created for follow-up.", entityRef: id,
    });
    logActivity(`Acknowledged risk ${id}`);
  };

  const openRisk = (r: typeof risks[number]) => {
    logActivity(`Reviewed risk ${r.id}`);
    navigate(r.route);
  };

  const requestDailyBriefing = () => {
    askNova.setOpen(true);
    askNova.ask("Give me the daily reliability briefing for the active tenant.");
  };

  /* ---------------------------- Render --------------------------------- */

  return (
    <div className="mx-auto max-w-[1600px] p-5">
      {/* Header + filters */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-slate-500">
            <span>Command Center</span>
            <span className="text-slate-300">·</span>
            <span>{ops.tenant.name}</span>
            <SimulationBadge />
          </div>
          <h1 className="mt-0.5 text-[22px] font-semibold text-slate-900">Reliability Command Center</h1>
          <p className="mt-1 max-w-3xl text-[12.5px] text-slate-600">
            The primary enterprise surface for reliability, operational risk, incidents, runbooks, digital workers, and
            business impact. Selecting any card opens the shared context drawer or the relevant workspace.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect label="Tenant" value={ops.tenant.id} onChange={ops.setTenant} options={ops.tenants.map((t) => ({ value: t.id, label: t.name }))} />
          <FilterSelect label="Tier"   value={tier}          onChange={(v) => setTier(v as typeof tier)}     options={TIERS.map((t) => ({ value: t, label: t }))} />
          <FilterSelect label="Env"    value={ops.environment} onChange={(v) => ops.setEnvironment(v as typeof ops.environment)} options={environments.map((e) => ({ value: e, label: e }))} />
          <FilterSelect label="Region" value={ops.region}      onChange={(v) => ops.setRegion(v as typeof ops.region)}           options={regions.map((r) => ({ value: r, label: r }))} />
          <FilterSelect label="Time"   value={ops.timeRange}   onChange={(v) => ops.setTimeRange(v as typeof ops.timeRange)}     options={timeRanges.map((t) => ({ value: t, label: t }))} />
          <FilterSelect label="Owner"  value={owner}          onChange={(v) => setOwner(v as typeof owner)}   options={OWNERS.map((o) => ({ value: o, label: o }))} />
          <FilterSelect label="Health" value={health}         onChange={(v) => setHealth(v as typeof health)} options={HEALTHS.map((h) => ({ value: h, label: h }))} />
          <Button size="sm" className="h-8 bg-slate-900 text-[12px] hover:bg-slate-800" onClick={requestDailyBriefing}>
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Daily Briefing
          </Button>
        </div>
      </div>

      {/* Global banners */}
      {stale && (
        <div className="mb-3"><StaleDataState title="Telemetry may be stale" description="Refresh to pull the latest snapshot." /></div>
      )}
      {backendUnavailable && (
        <div className="mb-3"><ConnectorUnavailableState title="Connected Mode backend unavailable" description="Switch to Demo Mode to explore the scenario." /></div>
      )}
      {!backendUnavailable && partialConnectorFailure && (
        <div className="mb-3 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-[12px] text-amber-900">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
          Partial connector failure: {canonicalConnectors.filter((c) => c.status !== "Healthy").map((c) => c.name).join(", ")}.
          <Link to="/runops/integrations" className="ml-auto underline">Open integrations</Link>
        </div>
      )}

      {/* Metric row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <MetricCard label="Services healthy"     value={String(metrics.healthy)}    tone={metrics.healthy ? "healthy" : "neutral"} />
        <MetricCard label="Services degraded"    value={String(metrics.degraded)}   tone={metrics.degraded ? "critical" : "healthy"} />
        <MetricCard label="SLOs at risk"         value={String(metrics.slosAtRisk)} tone={metrics.slosAtRisk ? "warning" : "healthy"} />
        <MetricCard label="Error budget avg"     value={`${metrics.errorBudgetAvg}%`} tone={metrics.errorBudgetAvg > 50 ? "healthy" : metrics.errorBudgetAvg > 20 ? "warning" : "critical"} />
        <MetricCard label="Active incidents"     value={String(metrics.activeIncidents)}  tone={metrics.activeIncidents ? "critical" : "healthy"} />
        <MetricCard label="Runbooks executing"   value={String(metrics.runbooksExecuting)} tone={metrics.runbooksExecuting ? "connected" : "neutral"} />
        <MetricCard label="Pending approvals"    value={String(metrics.pendingApprovals)}  tone={metrics.pendingApprovals ? "warning" : "neutral"} />
        <MetricCard label="Est. business impact" value={metrics.impactUsd ? `$${(metrics.impactUsd/1000).toFixed(0)}k` : "—"} tone={metrics.impactUsd > 100_000 ? "critical" : metrics.impactUsd ? "warning" : "healthy"} />
      </div>

      {/* Main grid */}
      <div className="mt-4 grid grid-cols-12 gap-4">
        {/* Service Health Portfolio */}
        <Card className="col-span-12 border-slate-200 xl:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[14px]">Service Health Portfolio</CardTitle>
            <span className="text-[11px] text-slate-500">{filteredServices.length} of {ops.services.length} shown</span>
          </CardHeader>
          <CardContent>
            {filteredServices.length === 0 ? (
              <EmptyState title="No services match" description="Adjust filters to see services." />
            ) : (
              <table className="w-full text-[12.5px]">
                <thead className="text-[10.5px] uppercase tracking-wider text-slate-500">
                  <tr><th className="py-1 text-left">Service</th><th className="text-left">Tier</th><th className="text-left">Owner</th><th className="text-left">Health</th><th className="text-right">SLO</th><th className="text-right">Budget</th><th></th></tr>
                </thead>
                <tbody>
                  {filteredServices.map((s) => (
                    <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="py-1.5">
                        <button onClick={() => openServiceDrawer(s)} className="text-left font-medium text-slate-900 hover:underline">
                          {s.name}
                        </button>
                      </td>
                      <td>{s.tier}</td>
                      <td className="text-slate-600">{ownerForService(s.id)}</td>
                      <td><StatusIndicator tone={healthTone(s.health)} label={s.health} /></td>
                      <td className="text-right tabular-nums">{s.sloAvailability}%</td>
                      <td className="text-right tabular-nums">{s.errorBudgetRemaining}%</td>
                      <td className="text-right">
                        <Button asChild variant="ghost" size="sm" className="h-6 text-[11px]">
                          <Link to={`/runops/services/${s.id}`}>Open <ArrowRight className="ml-1 h-3 w-3" /></Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Active Incident */}
        <Card className="col-span-12 border-slate-200 xl:col-span-4">
          <CardHeader className="pb-2"><CardTitle className="text-[14px]">Active Incident Command</CardTitle></CardHeader>
          <CardContent>
            {ops.incident.state === "Resolved" ? (
              <EmptyState title="No active incident" description="Operations queue is clear." />
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="h-4 w-4 text-red-600" />
                    <Link to={`/runops/incidents/${ops.incident.id}`} className="text-[13px] font-semibold text-slate-900 hover:underline">
                      {ops.incident.id}
                    </Link>
                  </div>
                  <Badge variant="outline" className="border-red-300 bg-red-50 text-[10px] uppercase text-red-700">{ops.incident.severity}</Badge>
                </div>
                <div className="text-[12.5px] text-slate-700">{ops.incident.title}</div>
                <div className="text-[11.5px] text-slate-600">Commander {ops.incident.commander} · opened {ops.incident.openedAt}</div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[11.5px] text-slate-700">
                  {ops.incident.summary}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" className="h-7 bg-slate-900 text-[11.5px] hover:bg-slate-800">
                    <Link to={`/runops/incidents/${ops.incident.id}`}>Open incident</Link>
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[11.5px]"
                    onClick={() => { ops.resolveIncident(); logActivity(`Resolved ${ops.incident.id}`); }}>
                    Mark resolved
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SLO & Error Budget Exposure */}
        <Card className="col-span-12 border-slate-200 xl:col-span-6">
          <CardHeader className="pb-2"><CardTitle className="text-[14px]">SLO & Error Budget Exposure</CardTitle></CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetChart} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis tick={{ fontSize: 10 }} unit="%" />
                  <RTooltip cursor={{ fill: "#f1f5f9" }} contentStyle={{ fontSize: 11 }} />
                  <Bar dataKey="remaining" radius={[3,3,0,0]}>
                    {budgetChart.map((d, i) => (
                      <cell key={i} fill={d.at === "risk" ? "#f59e0b" : "#10b981"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 space-y-1 text-[12px]">
              {canonicalSlos.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => navigate(`/runops/reliability/slos?service=${s.serviceId}`)}
                    className="flex w-full items-center justify-between rounded-md border border-slate-200 p-1.5 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Target className="h-3.5 w-3.5 text-slate-500" />
                      <span className="truncate">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-2 tabular-nums">
                      <span className={cn("text-[11px]", s.current < s.target ? "text-red-700" : "text-emerald-700")}>{s.current}%/{s.target}%</span>
                      <Progress value={s.errorBudgetRemaining} className="h-1.5 w-16" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Live Runbook Executions */}
        <Card className="col-span-12 border-slate-200 xl:col-span-6">
          <CardHeader className="pb-2"><CardTitle className="text-[14px]">Live Runbook Executions</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-[12.5px]">
              <li>
                <Link to={`/runops/executions/${ops.execution.id}`} className="flex items-center justify-between rounded-md border border-slate-200 p-2 hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Workflow className="h-3.5 w-3.5 text-sky-700" />
                    <span className="font-medium">{ops.execution.id}</span>
                    <span className="text-slate-500">· {ops.execution.runbookId}</span>
                  </div>
                  <StatusIndicator tone={ops.execution.state === "Running" ? "connected" : ops.execution.state === "Completed" ? "healthy" : "warning"} label={ops.execution.state} />
                </Link>
              </li>
              {executionsList.slice(1).map((e) => (
                <li key={e.id}>
                  <Link to={`/runops/executions/${e.id}`} className="flex items-center justify-between rounded-md border border-slate-200 p-2 hover:bg-slate-50">
                    <div className="flex items-center gap-2 truncate">
                      <GitBranch className="h-3.5 w-3.5 text-slate-500" />
                      <span className="truncate"><span className="font-medium">{e.id}</span> · {e.title}</span>
                    </div>
                    <StatusIndicator tone="healthy" label={e.state} />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recent Change Risk */}
        <Card className="col-span-12 border-slate-200 xl:col-span-4">
          <CardHeader className="pb-2"><CardTitle className="text-[14px]">Recent Change Risk</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-[12px]">
              {[ops.change, ...changesList.filter((c) => c.id !== ops.change.id)].slice(0, 4).map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-md border border-slate-200 p-2">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-slate-900">{c.id}</div>
                    <div className="truncate text-[11.5px] text-slate-600">{c.title}</div>
                  </div>
                  <Badge variant="outline" className={cn("text-[10px] uppercase",
                    c.risk === "High"   ? "border-red-300 bg-red-50 text-red-700" :
                    c.risk === "Medium" ? "border-amber-300 bg-amber-50 text-amber-800" :
                                          "border-emerald-300 bg-emerald-50 text-emerald-700")}>
                    {c.risk}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Digital Worker Activity */}
        <Card className="col-span-12 border-slate-200 xl:col-span-4">
          <CardHeader className="pb-2"><CardTitle className="text-[14px]">Digital Worker Activity</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1 text-[12px]">
              {ops.digitalWorkers.slice(0, 6).map((w) => (
                <li key={w.id}>
                  <button onClick={() => openWorkerDrawer(w)} className="flex w-full items-center justify-between rounded-md border border-slate-200 p-1.5 text-left hover:bg-slate-50">
                    <div className="flex items-center gap-2 truncate">
                      <Bot className="h-3.5 w-3.5 text-slate-500" />
                      <div className="min-w-0">
                        <div className="truncate font-medium text-slate-900">{w.id}</div>
                        <div className="truncate text-[11px] text-slate-600">{w.role}</div>
                      </div>
                    </div>
                    <StatusIndicator tone={w.status === "Idle" ? "neutral" : "connected"} label={w.status} />
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Operations Queue */}
        <Card className="col-span-12 border-slate-200 xl:col-span-4">
          <CardHeader className="pb-2"><CardTitle className="text-[14px]">Operations Queue</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-[12.5px]">
            <QueueRow label="Active incidents"   value={metrics.activeIncidents}  to="/runops/incidents" />
            <QueueRow label="Pending approvals"  value={metrics.pendingApprovals} to="/runops/approvals" />
            <QueueRow label="Running executions" value={metrics.runbooksExecuting} to="/runops/operations" />
            <QueueRow label="Open alerts"        value={metrics.degraded * 2}      to="/runops/operations/alerts" />
            <QueueRow label="Corrective actions" value={2}                          to="/runops/problems/actions" />
            {recentActivity.length > 0 && (
              <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2">
                <div className="text-[10.5px] uppercase tracking-wider text-slate-500">Recent activity</div>
                <ul className="mt-1 space-y-0.5 text-[11.5px] text-slate-700">
                  {recentActivity.map((a) => <li key={a.id}>{a.at} · {a.text}</li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Reliability Risks */}
        <Card className="col-span-12 border-slate-200 xl:col-span-6">
          <CardHeader className="pb-2"><CardTitle className="text-[14px]">Top Reliability Risks</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-[12.5px]">
              {risks.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 rounded-md border border-slate-200 p-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <TrendingUp className={cn("h-3.5 w-3.5", r.severity === "critical" ? "text-red-600" : "text-amber-600")} />
                      <button onClick={() => openRisk(r)} className="font-medium text-slate-900 hover:underline">{r.title}</button>
                      {ackedRisks[r.id] && <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-[10px] text-emerald-700">Acknowledged</Badge>}
                    </div>
                    <div className="truncate text-[11.5px] text-slate-600">{r.service}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-6 text-[11px]" onClick={() => acknowledgeRisk(r.id, r.title)} disabled={ackedRisks[r.id]}>
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Ack
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Toil & Automation Opportunities */}
        <Card className="col-span-12 border-slate-200 xl:col-span-6">
          <CardHeader className="pb-2"><CardTitle className="text-[14px]">Toil & Automation Opportunities</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-[12.5px]">
              {toilItems.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2 rounded-md border border-slate-200 p-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-3.5 w-3.5 text-slate-500" />
                    <div>
                      <div className="font-medium text-slate-900">{t.title}</div>
                      <div className="text-[11.5px] text-slate-600">{t.frequency} · {t.hoursPerMonth}h/mo · {t.automation}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 text-[11px]" onClick={() => navigate("/runops/automation")}>
                    <Zap className="mr-1 h-3 w-3" /> Promote
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Business Transaction Health */}
        <Card className="col-span-12 border-slate-200 xl:col-span-8">
          <CardHeader className="pb-2"><CardTitle className="text-[14px]">Business Transaction Health</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-[12.5px]">
              <thead className="text-[10.5px] uppercase tracking-wider text-slate-500">
                <tr><th className="py-1 text-left">Transaction</th><th className="text-right">Volume/min</th><th className="text-right">Success</th><th className="text-right">Target</th><th></th></tr>
              </thead>
              <tbody>
                {businessTx.map((tx) => {
                  const bad = tx.successPct < tx.target;
                  return (
                    <tr key={tx.id} className="border-t border-slate-100">
                      <td className="py-1.5 font-medium text-slate-900">{tx.name}</td>
                      <td className="text-right tabular-nums">{tx.volumePerMin.toLocaleString()}</td>
                      <td className={cn("text-right tabular-nums", bad ? "text-red-700 font-semibold" : "text-emerald-700")}>{tx.successPct}%</td>
                      <td className="text-right tabular-nums text-slate-600">{tx.target}%</td>
                      <td className="text-right">
                        <StatusIndicator tone={bad ? "critical" : "healthy"} label={bad ? "Breach" : "Meeting"} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* SLO burn line */}
        <Card className="col-span-12 border-slate-200 xl:col-span-4">
          <CardHeader className="pb-2"><CardTitle className="text-[14px]">Error Budget Burn</CardTitle></CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={burnSeries} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} unit="x" />
                  <RTooltip contentStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="burn" stroke="#dc2626" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">Deterministic burn curve derived from scenario stage.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------- Local subcomponents ---------------------------- */

function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center gap-1">
      <label className="text-[10.5px] uppercase tracking-wider text-slate-500">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-7 min-w-[110px] text-[11.5px]" aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o.value} value={o.value} className="text-[11.5px]">{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function QueueRow({ label, value, to }: { label: string; value: number; to: string }) {
  return (
    <Link to={to} className="flex items-center justify-between rounded-md border border-slate-200 p-2 hover:bg-slate-50">
      <div className="flex items-center gap-2">
        <Activity className="h-3.5 w-3.5 text-slate-500" />
        <span>{label}</span>
      </div>
      <span className="tabular-nums font-semibold">{value}</span>
    </Link>
  );
}
