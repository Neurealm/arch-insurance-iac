/**
 * Page 1 · Experience Entry (route `/runops`)
 *
 * Introduces NOVA RunOps and routes each persona into the most relevant
 * experience. All data is sourced from `useOperations()` (OperationsProvider)
 * and the ScenarioStore — no hardcoded page data. Cards navigate through
 * react-router and role selection updates the shared demo role.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Activity, AlertOctagon, BookOpen, Bot, CheckCircle2, ClipboardCheck,
  Compass, GitBranch, LayoutGrid, PlayCircle, ShieldCheck, Sparkles, Target,
  Workflow, Wrench,
} from "lucide-react";
import { useOperations, useRightDrawer } from "@/runops/state/RunOpsProviders";
import { useScenarioStore } from "@/runops/scenario/ScenarioStore";
import {
  MetricCard, StatusIndicator, FreshnessIndicator, EmptyState,
  StaleDataState, ConnectorUnavailableState, PermissionDeniedState,
  EntityQuickView,
} from "@/runops/components";
import { SimulationBadge } from "@/runops/shell/SimulationBadge";
import {
  demoRoles, connectors as canonicalConnectors, runbooksList,
  executionsList, type DemoRole,
} from "@/runops/data/scenario";

/* ---------------------------------------------------------------- Roles */

interface JourneyCard {
  key: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  cta: string;
  /** Roles for whom this journey is a primary recommendation. */
  recommendedFor: DemoRole[];
  /** Roles that may not access this journey at all. */
  restrictedFrom?: DemoRole[];
}

const JOURNEYS: JourneyCard[] = [
  {
    key: "operate",
    title: "Operate Services",
    description: "Live command surface for service health, alerts, and hand-offs.",
    icon: LayoutGrid,
    route: "/runops/command",
    cta: "Open Command Center",
    recommendedFor: ["SRE Engineer", "Service Owner", "Incident Commander"],
  },
  {
    key: "incident",
    title: "Manage an Incident",
    description: "Investigate the active SEV 1, evaluate remediations, and coordinate response.",
    icon: AlertOctagon,
    route: "/runops/incidents",
    cta: "Go to Incidents",
    recommendedFor: ["Incident Commander", "SRE Engineer"],
  },
  {
    key: "runbooks",
    title: "Build Runbooks",
    description: "Author, review, and certify automation-ready runbooks with fitness scoring.",
    icon: BookOpen,
    route: "/runops/runbooks",
    cta: "Open Runbook Library",
    recommendedFor: ["Runbook Author", "Platform Engineer"],
  },
  {
    key: "reliability",
    title: "Review Reliability",
    description: "SLOs, error budgets, and burn-rate risk across the tenant portfolio.",
    icon: Target,
    route: "/runops/reliability/slos",
    cta: "View SLOs",
    recommendedFor: ["Service Owner", "Executive"],
  },
  {
    key: "governance",
    title: "Govern Automation",
    description: "Autonomy policies, approvals, and AI recommendation guardrails.",
    icon: ShieldCheck,
    route: "/runops/ai-governance",
    cta: "Open AI Governance",
    recommendedFor: ["Platform Engineer", "Auditor", "Demo Controller"],
    restrictedFrom: ["Executive"],
  },
  {
    key: "evidence",
    title: "Review Evidence",
    description: "Immutable audit trail, execution provenance, and compliance packets.",
    icon: ClipboardCheck,
    route: "/runops/governance",
    cta: "Open Evidence Vault",
    recommendedFor: ["Auditor", "Auditor"],
  },
];

/* -------------------------------------------------------- Guided tour */

interface TourStep {
  title: string;
  body: string;
  route?: string;
}

const TOUR_STEPS: TourStep[] = [
  { title: "Welcome to NOVA RunOps",
    body: "An AI-native reliability operations digital twin. Every action is scenario-driven and reversible." },
  { title: "The AppShell",
    body: "Left sidebar is your primary navigation. The top bar carries global search (⌘K), Ask NOVA, notifications, and Create." },
  { title: "Command Center",
    body: "Your live command surface for the currently selected service and environment.", route: "/runops/command" },
  { title: "Incident Response",
    body: "Investigate the active SEV 1, weigh remediations, and coordinate through a single spine.", route: "/runops/incidents" },
  { title: "Runbooks",
    body: "Author, certify, and score runbooks. Fitness gates autonomy.", route: "/runops/runbooks" },
  { title: "SLOs & Governance",
    body: "Review reliability posture and governance policies from the same shared context.", route: "/runops/reliability/slos" },
];

/* -------------------------------------------------------- Helpers */

const FIRST_USE_KEY = "runops.entry.firstUse.v1";
const STALE_THRESHOLD_MS = 5 * 60 * 1000;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return iso;
  const s = Math.max(0, Math.floor(diff / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

/* -------------------------------------------------------- Page */

export default function ExperienceEntry() {
  const ops = useOperations();
  const scenario = useScenarioStore();
  const { openDrawer } = useRightDrawer();
  const navigate = useNavigate();

  const [firstUse, setFirstUse] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourIdx, setTourIdx] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem(FIRST_USE_KEY);
    if (!seen) setFirstUse(true);
  }, []);

  const markVisited = () => {
    if (typeof window !== "undefined") window.localStorage.setItem(FIRST_USE_KEY, "1");
    setFirstUse(false);
  };

  const startTour = () => { setTourIdx(0); setTourOpen(true); markVisited(); };
  const tourStep = TOUR_STEPS[tourIdx];
  const tourNext = () => {
    if (tourStep.route) navigate(tourStep.route);
    if (tourIdx >= TOUR_STEPS.length - 1) { setTourOpen(false); return; }
    setTourIdx((i) => i + 1);
  };

  /* -------- Derived reliability summary from OperationsProvider -------- */

  const summary = useMemo(() => {
    const servicesMonitored = ops.services.length;
    const degraded = ops.services.filter((s) =>
      s.health === "Degraded" || s.health === "Severely Degraded" || s.health === "At Risk",
    ).length;
    const activeIncidents = ops.incident.state !== "Resolved" ? 1 : 0;
    const pendingApprovals = ops.approval.state === "Pending" ? 1 : 0;
    const activeExecutions = ops.execution.state === "Running" || ops.execution.state === "Queued" ? 1 : 0;
    const errorBudgetsAtRisk = degraded; // one budget per degraded service in the canonical scenario
    return { servicesMonitored, degraded, activeIncidents, pendingApprovals, activeExecutions, errorBudgetsAtRisk };
  }, [ops.services, ops.incident.state, ops.approval.state, ops.execution.state]);

  /* -------- Freshness / staleness --------------------------------- */

  const stale = useMemo(() => {
    const ageMs = Date.now() - new Date(ops.dataFreshnessAt).getTime();
    return Number.isFinite(ageMs) && ageMs > STALE_THRESHOLD_MS;
  }, [ops.dataFreshnessAt]);

  /* -------- Activity feeds from OperationsProvider ---------------- */

  const autonomousActions = useMemo(
    () => ops.auditLog.filter((a) => a.actor.startsWith("DW-")).slice(-5).reverse(),
    [ops.auditLog],
  );
  const recentIncidents = useMemo(() => {
    // Canonical scenario has one live incident + prior execution incident refs.
    const base = [{
      id: ops.incident.id, title: ops.incident.title, state: ops.incident.state,
      severity: ops.incident.severity, service: ops.incident.serviceId,
      route: `/runops/incidents/${ops.incident.id}`,
    }];
    for (const e of executionsList) {
      if (e.incidentId !== ops.incident.id && base.length < 4) {
        base.push({
          id: e.incidentId, title: e.title, state: "Resolved", severity: "SEV 2",
          service: ops.incident.serviceId, route: `/runops/incidents/${e.incidentId}`,
        });
      }
    }
    return base;
  }, [ops.incident]);

  const pendingApprovals = ops.approval.state === "Pending" ? [ops.approval] : [];
  const recentRunbooks = useMemo(() => runbooksList.slice(0, 4), []);
  const connectorHealth = useMemo(() => canonicalConnectors.slice(0, 5), []);

  /* -------- Role-based journey recommendations ------------------- */

  const journeys = useMemo(() => {
    const allowed = JOURNEYS.filter((j) => !j.restrictedFrom?.includes(ops.role));
    const recommended = allowed.filter((j) => j.recommendedFor.includes(ops.role));
    const others = allowed.filter((j) => !j.recommendedFor.includes(ops.role));
    return [...recommended, ...others];
  }, [ops.role]);

  const restrictedJourneys = JOURNEYS.filter((j) => j.restrictedFrom?.includes(ops.role));

  const noActiveWork =
    ops.incident.state === "Resolved" &&
    ops.approval.state !== "Pending" &&
    ops.execution.state !== "Running" &&
    ops.execution.state !== "Queued";

  /* -------- Drawer openers (shared context drawer) --------------- */

  const openIncidentDrawer = (inc: typeof recentIncidents[number]) => openDrawer({
    title: inc.title, subtitle: `${inc.id} · ${inc.severity}`,
    body: <EntityQuickView
      eyebrow="Incident" title={inc.title} subtitle={inc.id}
      status={{ tone: inc.state === "Resolved" ? "healthy" : "critical", label: inc.state }}
      fields={[
        { label: "Severity", value: inc.severity },
        { label: "Service", value: inc.service },
      ]}
      footer={<Link to={inc.route} className="text-sky-700 underline">Open incident</Link>}
    />,
  });

  const openAuditDrawer = (a: typeof autonomousActions[number]) => openDrawer({
    title: a.action, subtitle: `${a.actor} · ${a.at}`,
    body: <EntityQuickView
      eyebrow="Autonomous action" title={a.action} subtitle={a.target}
      status={{ tone: "connected", label: "Recorded" }}
      fields={[
        { label: "Actor", value: a.actor },
        { label: "At",    value: a.at },
        { label: "Target", value: a.target },
        { label: "Detail", value: a.detail ?? "—" },
      ]}
    />,
  });

  const openApprovalDrawer = () => openDrawer({
    title: `Approval ${ops.approval.id}`, subtitle: ops.approval.reason,
    body: <EntityQuickView
      eyebrow="Approval" title={ops.approval.id} subtitle={ops.approval.reason}
      status={{ tone: "warning", label: ops.approval.state }}
      fields={[
        { label: "Runbook", value: ops.approval.runbookId },
        { label: "Requested by", value: ops.approval.requestedBy },
      ]}
      footer={<Link to="/runops/approvals" className="text-sky-700 underline">Open approvals</Link>}
    />,
  });

  const openRunbookDrawer = (rb: typeof recentRunbooks[number]) => openDrawer({
    title: rb.name, subtitle: rb.id,
    body: <EntityQuickView
      eyebrow="Runbook" title={rb.name} subtitle={rb.id}
      status={{ tone: rb.state === "Certified" ? "ok" : "info", label: rb.state }}
      fields={[
        { label: "Autonomy", value: rb.autonomy },
        { label: "Steps",    value: String(rb.steps.length) },
      ]}
      footer={<Link to={`/runops/runbooks/${rb.id}`} className="text-sky-700 underline">Open runbook</Link>}
    />,
  });

  const openConnectorDrawer = (c: typeof connectorHealth[number]) => openDrawer({
    title: c.name, subtitle: c.id,
    body: <EntityQuickView
      eyebrow="Connector" title={c.name} subtitle={c.type}
      status={{ tone: c.status === "Healthy" ? "ok" : c.status === "Degraded" ? "warning" : "critical", label: c.status }}
      fields={[
        { label: "Type",   value: c.type },
        { label: "Status", value: c.status },
      ]}
      footer={<Link to="/runops/integrations" className="text-sky-700 underline">Open integrations</Link>}
    />,
  });

  /* -------- Render ---------------------------------------------- */

  const backendUnavailable = ops.mode === "connected";

  return (
    <div className="mx-auto max-w-[1280px] p-5">
      {/* Executive hero */}
      <section className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-slate-500">
              <span>NOVA RunOps</span>
              <span className="text-slate-300">·</span>
              <span>{ops.tenant.name}</span>
              <SimulationBadge />
              <Badge variant="outline" className="border-slate-300 text-[10px] uppercase">
                {ops.mode === "demo" ? "Demo Mode" : "Connected Mode"}
              </Badge>
            </div>
            <h1 className="mt-1 text-[26px] font-semibold leading-tight text-slate-900">
              An AI-native reliability operations digital twin
            </h1>
            <p className="mt-2 max-w-3xl text-[13px] text-slate-600">
              Observe every service, coordinate every incident, and govern every autonomous action from a single
              shared spine. NOVA turns operational chaos into a deterministic, auditable digital twin.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <FreshnessIndicator freshness="Fresh" asOf={new Date(ops.dataFreshnessAt).toLocaleTimeString()} />
              <span className="text-[11px] text-slate-500">
                Scenario stage <span className="font-medium text-slate-700">{scenario.currentStage.index + 1}/{scenario.stages.length}</span> · {scenario.currentStage.title}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button size="sm" className="h-8 bg-slate-900 text-[12px] hover:bg-slate-800" onClick={startTour}>
              <Compass className="mr-1.5 h-3.5 w-3.5" /> Start Guided Tour
            </Button>
            {ops.incident.state !== "Resolved" && (
              <Button size="sm" variant="outline" className="h-8 text-[12px]" asChild>
                <Link to={`/runops/incidents/${ops.incident.id}`}>
                  <AlertOctagon className="mr-1.5 h-3.5 w-3.5 text-red-600" /> Resume {ops.incident.id}
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* First-use banner */}
        {firstUse && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-sky-200 bg-sky-50/70 p-3 text-[12px] text-sky-900">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-700" />
              <span><strong>First visit.</strong> Take a two-minute tour to orient yourself in the shell.</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="h-7 text-[11.5px]" onClick={markVisited}>Skip</Button>
              <Button size="sm" className="h-7 bg-sky-700 text-[11.5px] hover:bg-sky-800" onClick={startTour}>Start tour</Button>
            </div>
          </div>
        )}

        {stale && (
          <div className="mt-4">
            <StaleDataState
              title="Telemetry may be stale"
              description={`Last refreshed ${timeAgo(ops.dataFreshnessAt)}. Refresh to pull the latest snapshot.`}
            />
          </div>
        )}
      </section>

      {/* Reliability summary */}
      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-slate-600">Live Reliability Summary</h2>
          <Button variant="ghost" size="sm" className="h-7 text-[11.5px]" onClick={ops.refreshData}>
            <Activity className="mr-1 h-3 w-3" /> Refresh
          </Button>
        </div>
        {backendUnavailable ? (
          <ConnectorUnavailableState
            title="Connected Mode backend unavailable"
            description="Live telemetry providers are not configured for this deployment. Switch to Demo Mode to explore the scenario."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <MetricCard label="Services monitored"  value={String(summary.servicesMonitored)} tone="neutral" />
            <MetricCard label="Services degraded"   value={String(summary.degraded)}          tone={summary.degraded ? "critical" : "healthy"} />
            <MetricCard label="Active incidents"    value={String(summary.activeIncidents)}   tone={summary.activeIncidents ? "critical" : "healthy"} />
            <MetricCard label="Pending approvals"   value={String(summary.pendingApprovals)}  tone={summary.pendingApprovals ? "warning" : "neutral"} />
            <MetricCard label="Active executions"   value={String(summary.activeExecutions)}  tone={summary.activeExecutions ? "connected" : "neutral"} />
            <MetricCard label="Error budgets at risk" value={String(summary.errorBudgetsAtRisk)} tone={summary.errorBudgetsAtRisk ? "warning" : "ok"} />
          </div>
        )}
      </section>

      {/* Role switcher */}
      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-slate-600">Your role</h2>
          <span className="text-[11px] text-slate-500">Choose a role to personalize recommendations.</span>
        </div>
        <div role="radiogroup" aria-label="Demo role" className="flex flex-wrap gap-1.5">
          {demoRoles.map((r) => (
            <button
              key={r}
              role="radio"
              aria-checked={ops.role === r}
              onClick={() => ops.setRole(r)}
              className={cn(
                "rounded-full border px-3 py-1 text-[11.5px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
                ops.role === r
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </section>

      {/* Journey cards */}
      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-slate-600">
            Recommended for {ops.role}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {journeys.map((j) => {
            const Icon = j.icon;
            const recommended = j.recommendedFor.includes(ops.role);
            return (
              <Card key={j.key} className={cn("border-slate-200 transition hover:border-slate-300 hover:shadow-sm", recommended && "ring-1 ring-sky-200")}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("rounded-md border p-1.5", recommended ? "border-sky-200 bg-sky-50 text-sky-700" : "border-slate-200 bg-slate-50 text-slate-600")}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-[14px]">{j.title}</CardTitle>
                    </div>
                    {recommended && <Badge variant="outline" className="border-sky-300 bg-sky-50 text-[10px] uppercase text-sky-800">Recommended</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-[12.5px] text-slate-600">{j.description}</p>
                  <div className="mt-3">
                    <Button asChild size="sm" className="h-7 bg-slate-900 text-[11.5px] hover:bg-slate-800">
                      <Link to={j.route}>{j.cta}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {restrictedJourneys.length > 0 && (
          <div className="mt-3">
            <PermissionDeniedState
              title={`${restrictedJourneys.length} journey${restrictedJourneys.length === 1 ? "" : "s"} restricted for your role`}
              description={`${restrictedJourneys.map((j) => j.title).join(", ")} require elevated permissions. Switch role or contact your Platform Engineer.`}
            />
          </div>
        )}
      </section>

      {/* Activity grid */}
      <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Resume active work */}
        <Card className="border-slate-200 xl:col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-[14px]">Resume active work</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-[12.5px]">
            {noActiveWork ? (
              <EmptyState
                title="No active work"
                description="You are all clear. Explore a runbook or review reliability posture."
              />
            ) : (
              <>
                {ops.incident.state !== "Resolved" && (
                  <button
                    onClick={() => openIncidentDrawer(recentIncidents[0])}
                    className="w-full rounded-md border border-slate-200 p-2 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertOctagon className="h-3.5 w-3.5 text-red-600" />
                        <span className="font-medium text-slate-900">{ops.incident.id}</span>
                      </div>
                      <StatusIndicator tone="critical" label={ops.incident.severity} />
                    </div>
                    <div className="mt-0.5 truncate text-[12px] text-slate-600">{ops.incident.title}</div>
                  </button>
                )}
                {ops.execution.state === "Running" && (
                  <Link to={`/runops/executions/${ops.execution.id}`} className="block rounded-md border border-slate-200 p-2 hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Workflow className="h-3.5 w-3.5 text-sky-700" />
                        <span className="font-medium text-slate-900">{ops.execution.id}</span>
                      </div>
                      <StatusIndicator tone="info" label={ops.execution.state} />
                    </div>
                    <div className="mt-0.5 truncate text-[12px] text-slate-600">Runbook {ops.execution.runbookId}</div>
                  </Link>
                )}
                {pendingApprovals.length > 0 && (
                  <button
                    onClick={openApprovalDrawer}
                    className="w-full rounded-md border border-amber-200 bg-amber-50/60 p-2 text-left hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-amber-700" />
                        <span className="font-medium text-slate-900">{ops.approval.id}</span>
                      </div>
                      <StatusIndicator tone="warning" label={ops.approval.state} />
                    </div>
                    <div className="mt-0.5 truncate text-[12px] text-slate-600">{ops.approval.reason}</div>
                  </button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Autonomous actions */}
        <Card className="border-slate-200 xl:col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-[14px]">Recent autonomous actions</CardTitle></CardHeader>
          <CardContent>
            {autonomousActions.length === 0 ? (
              <EmptyState title="No autonomous actions yet" description="Digital workers have not acted in this stage." />
            ) : (
              <ul className="space-y-1.5 text-[12px]">
                {autonomousActions.map((a) => (
                  <li key={a.id}>
                    <button
                      onClick={() => openAuditDrawer(a)}
                      className="flex w-full items-center justify-between gap-2 rounded-md border border-slate-200 p-2 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Bot className="h-3.5 w-3.5 text-slate-600" />
                        <span className="truncate"><span className="font-medium text-slate-900">{a.actor}</span> · {a.action}</span>
                      </div>
                      <span className="shrink-0 text-[11px] text-slate-500">{a.at}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent incidents */}
        <Card className="border-slate-200 xl:col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-[14px]">Recent incidents</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-[12px]">
              {recentIncidents.map((inc) => (
                <li key={inc.id}>
                  <button
                    onClick={() => openIncidentDrawer(inc)}
                    className="flex w-full items-center justify-between gap-2 rounded-md border border-slate-200 p-2 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium text-slate-900">{inc.id}</div>
                      <div className="truncate text-[11.5px] text-slate-600">{inc.title}</div>
                    </div>
                    <StatusIndicator tone={inc.state === "Resolved" ? "healthy" : "critical"} label={inc.state} />
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Pending approvals */}
        <Card className="border-slate-200 xl:col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-[14px]">Pending approvals</CardTitle></CardHeader>
          <CardContent>
            {pendingApprovals.length === 0 ? (
              <EmptyState title="No pending approvals" description="Nothing waiting on your sign-off." />
            ) : (
              <ul className="space-y-1.5 text-[12px]">
                {pendingApprovals.map((a) => (
                  <li key={a.id}>
                    <button
                      onClick={openApprovalDrawer}
                      className="flex w-full items-center justify-between gap-2 rounded-md border border-amber-200 bg-amber-50/40 p-2 text-left hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium text-slate-900">{a.id}</div>
                        <div className="truncate text-[11.5px] text-slate-600">{a.reason}</div>
                      </div>
                      <StatusIndicator tone="warning" label={a.state} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recently edited runbooks */}
        <Card className="border-slate-200 xl:col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-[14px]">Recently edited runbooks</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-[12px]">
              {recentRunbooks.map((rb) => (
                <li key={rb.id}>
                  <button
                    onClick={() => openRunbookDrawer(rb)}
                    className="flex w-full items-center justify-between gap-2 rounded-md border border-slate-200 p-2 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <GitBranch className="h-3.5 w-3.5 text-slate-600" />
                      <div className="min-w-0">
                        <div className="truncate font-medium text-slate-900">{rb.name}</div>
                        <div className="truncate text-[11.5px] text-slate-600">{rb.id} · {rb.autonomy}</div>
                      </div>
                    </div>
                    <StatusIndicator tone={rb.state === "Certified" ? "ok" : "info"} label={rb.state} />
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Platform connection health */}
        <Card className="border-slate-200 xl:col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-[14px]">Platform connection health</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-[12px]">
              {connectorHealth.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => openConnectorDrawer(c)}
                    className="flex w-full items-center justify-between gap-2 rounded-md border border-slate-200 p-2 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Wrench className="h-3.5 w-3.5 text-slate-600" />
                      <div className="min-w-0">
                        <div className="truncate font-medium text-slate-900">{c.name}</div>
                        <div className="truncate text-[11.5px] text-slate-600">{c.type}</div>
                      </div>
                    </div>
                    <StatusIndicator
                      tone={c.status === "Healthy" ? "ok" : c.status === "Degraded" ? "warning" : "critical"}
                      label={c.status}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Guided tour dialog */}
      <Dialog open={tourOpen} onOpenChange={setTourOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[15px]">
              <PlayCircle className="h-4 w-4 text-sky-700" />
              {tourStep?.title}
            </DialogTitle>
            <DialogDescription className="text-[12.5px] text-slate-600">
              Step {tourIdx + 1} of {TOUR_STEPS.length}
            </DialogDescription>
          </DialogHeader>
          <p className="text-[13px] text-slate-700">{tourStep?.body}</p>
          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" className="h-8 text-[12px]" onClick={() => setTourOpen(false)}>Close</Button>
            {tourIdx > 0 && (
              <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => setTourIdx((i) => Math.max(0, i - 1))}>
                Back
              </Button>
            )}
            <Button size="sm" className="h-8 bg-slate-900 text-[12px] hover:bg-slate-800" onClick={tourNext}>
              {tourIdx >= TOUR_STEPS.length - 1 ? "Finish" : tourStep?.route ? "Open & continue" : "Next"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
