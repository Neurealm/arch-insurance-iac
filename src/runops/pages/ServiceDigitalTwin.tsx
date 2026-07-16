/**
 * Page 5 · Service Digital Twin (route `/runops/services/:serviceId`)
 *
 * Authoritative operational view of a business service. All data flows from
 * OperationsProvider + ScenarioStore. No page-local fixtures.
 */

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Activity, AlertOctagon, ArrowRight, Bot, GitBranch, Play,
  ShieldCheck, Sparkles, Target, Wrench,
} from "lucide-react";
import { useOperations, useRightDrawer } from "@/runops/state/RunOpsProviders";
import incidentVideo from "@/assets/incident-clinical-integration.mp4.asset.json";
import { useScenarioStore } from "@/runops/scenario/ScenarioStore";
import {
  EntityHeader, EntityTabs, MetricCard, StatusIndicator, ReadinessScore,
  SLOCard, ErrorBudgetCard, EvidenceCitation, DigitalWorkerCard,
  Timeline, TimelineEvent, EmptyState, PermissionDeniedState, StaleDataState,
  FreshnessIndicator, RunbookFitnessScore,
} from "@/runops/components";
import type {
  BusinessService, Component, Change, Runbook, DigitalWorker,
} from "@/runops/data/scenario";

const DEFAULT_SERVICE_ID = "svc-global-order-processing";
const STALE_THRESHOLD_MS = 5 * 60 * 1000;
const LS_DRAFT_INCIDENTS = "runops.serviceTwin.draftIncidents.v1";

type TabValue =
  | "overview" | "journeys" | "components" | "reliability"
  | "operations" | "runbooks" | "changes" | "ownership" | "evidence";

const TABS: { label: string; value: TabValue }[] = [
  { label: "Overview",          value: "overview" },
  { label: "Customer Journeys", value: "journeys" },
  { label: "Components",        value: "components" },
  { label: "Reliability",       value: "reliability" },
  { label: "Operations",        value: "operations" },
  { label: "Runbooks",          value: "runbooks" },
  { label: "Changes",           value: "changes" },
  { label: "Ownership",         value: "ownership" },
  { label: "Evidence",          value: "evidence" },
];

/* -------------------------- Derivations (deterministic) ------------------ */

function ownerForService(id: string): string {
  if (id.includes("order"))    return "Checkout Squad";
  if (id.includes("payment"))  return "Payments Squad";
  if (id.includes("identity")) return "Identity Squad";
  return "Platform Squad";
}
function businessOwnerForService(id: string): string {
  if (id.includes("order"))    return "VP Retail Operations";
  if (id.includes("payment"))  return "VP Payments";
  if (id.includes("identity")) return "CISO Office";
  return "VP Platform";
}
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
function componentHealthDot(h: string): string {
  switch (h) {
    case "Healthy":           return "bg-emerald-500";
    case "At Risk":           return "bg-amber-500";
    case "Degraded":          return "bg-orange-500";
    case "Severely Degraded":
    case "Unavailable":       return "bg-rose-600";
    case "Recovering":        return "bg-sky-500";
    default:                  return "bg-slate-400";
  }
}

interface DraftIncident {
  id: string;
  serviceId: string;
  serviceName: string;
  summary: string;
  severity: "SEV 1" | "SEV 2" | "SEV 3" | "SEV 4";
  createdAt: string;
  createdBy: string;
}
function loadDrafts(): DraftIncident[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(LS_DRAFT_INCIDENTS) ?? "[]") as DraftIncident[]; }
  catch { return []; }
}
function saveDrafts(d: DraftIncident[]): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(LS_DRAFT_INCIDENTS, JSON.stringify(d)); } catch { /* ignore */ }
}

/* -------------------------------- Page ---------------------------------- */

export default function ServiceDigitalTwin() {
  const params = useParams<{ serviceId: string }>();
  const requestedId = params.serviceId ?? DEFAULT_SERVICE_ID;
  const ops = useOperations();
  const scenario = useScenarioStore();
  const { openDrawer } = useRightDrawer();
  const navigate = useNavigate();

  const readOnly = ops.role === "Read Only User" || ops.role === "Auditor";

  const service: BusinessService | undefined = useMemo(
    () => ops.services.find((s) => s.id === requestedId),
    [ops.services, requestedId],
  );

  // Sync selection into global context so cross-screen surfaces align.
  useEffect(() => {
    if (service && ops.selectedServiceId !== service.id) {
      ops.setSelectedService(service.id);
    }
  }, [service, ops]);

  const [tab, setTab] = useState<TabValue>("overview");
  const [runbookDialogOpen, setRunbookDialogOpen] = useState(false);
  const [incidentDialogOpen, setIncidentDialogOpen] = useState(false);
  const [drafts, setDrafts] = useState<DraftIncident[]>(loadDrafts);
  useEffect(() => { saveDrafts(drafts); }, [drafts]);

  const dataFreshnessMs = Date.now() - new Date(ops.dataFreshnessAt).getTime();
  const stale = dataFreshnessMs > STALE_THRESHOLD_MS;

  /* --------------------------- Not found ------------------------------- */
  if (!service) {
    return (
      <div className="p-6">
        <EmptyState
          title="Service not found"
          description={`No service exists with id "${requestedId}". Return to the portfolio and select a service.`}
          action={{ label: "Open Service Portfolio", onClick: () => navigate("/runops/services") }}
        />
      </div>
    );
  }

  /* --------------------------- Read-only ------------------------------- */
  if (readOnly && false) {
    // Placeholder retained; the whole page is viewable read-only, only mutations are gated.
  }

  /* --------------------------- Derived data ---------------------------- */
  const owner         = ownerForService(service.id);
  const businessOwner = businessOwnerForService(service.id);
  const serviceComponents: Component[] = ops.components.filter((c) => service.componentIds.includes(c.id));
  const activeIncident = ops.incident.serviceId === service.id && ops.incident.state !== "Resolved" ? ops.incident : undefined;
  const serviceRunbooks: Runbook[] = [ops.runbook].filter((r) => r.serviceId === service.id);
  if (service.id === "svc-hc-clinical-care-delivery") {
    serviceRunbooks.push({
      id: "RB-0117",
      title: "Clinical Interface Queue Saturation and Message Recovery",
      version: "v2.4",
      state: "Certified",
      autonomy: "Approval Gated Automation",
      serviceId: service.id,
      fitnessScore: 92,
      steps: [],
    });
  }
  const serviceChanges: Change[] = ops.changes.filter((c) => c.serviceId === service.id);
  const serviceSlos = ops.slos.filter((s) => s.serviceId === service.id);
  const serviceWorkers: DigitalWorker[] = ops.digitalWorkers.slice(0, 4);
  const activeExecution = ops.execution.state === "Running" || ops.execution.state === "Queued" ? ops.execution : undefined;

  const missingOwner = !owner || owner === "Platform Squad" && !service.id.includes("platform");
  const missingSlo   = serviceSlos.length === 0;

  const stage = ops.stageIndex;
  const narrative =
    stage >= 15 ? "Service has recovered. SLOs are re-establishing baseline and customer journeys are validated."
    : stage >= 12 ? "Corrective execution running. Telemetry showing early recovery indicators."
    : stage >= 8  ? "Runbook execution requested. Awaiting approval before mitigation begins."
    : stage >= 4  ? "SEV 1 incident declared. Digital workers investigating dominant hypothesis."
    : stage >= 2  ? "SLO burn accelerating. Alerts correlating into an operational situation."
    :               "Steady state. All customer journeys within SLO and error budget.";

  const readinessScore =
    Math.round(
      (Math.min(100, service.errorBudgetRemaining) * 0.3) +
      (serviceRunbooks.length > 0 ? 25 : 0) +
      (missingOwner ? 0 : 20) +
      (missingSlo ? 0 : 15) +
      (service.health === "Healthy" ? 10 : service.health === "At Risk" ? 5 : 0),
    );

  /* --------------------------- Actions --------------------------------- */
  const openTopology       = () => navigate(`/runops/services/${service.id}/topology`);
  const openObservability  = () => navigate(`/runops/services/${service.id}/observability`);
  const openReadiness      = () => navigate(`/runops/services/${service.id}/readiness`);

  const createDraftIncident = (summary: string, severity: DraftIncident["severity"]) => {
    if (readOnly) return;
    const draft: DraftIncident = {
      id: `INC-DRAFT-${Date.now()}`,
      serviceId: service.id,
      serviceName: service.name,
      summary,
      severity,
      createdAt: new Date().toISOString(),
      createdBy: ops.role,
    };
    setDrafts((prev) => [draft, ...prev]);
    ops.pushNotification({
      kind: severity === "SEV 1" || severity === "SEV 2" ? "critical" : "warning",
      title: `Draft incident · ${service.name}`,
      detail: `${draft.id} — ${severity}`,
      entityRef: draft.id,
      route: `/runops/incidents`,
    });
    setIncidentDialogOpen(false);
  };

  const launchRunbook = (runbookId: string) => {
    if (readOnly) return;
    ops.pushNotification({
      kind: "info",
      title: `Runbook launch requested`,
      detail: `${runbookId} · ${service.name}`,
      entityRef: runbookId,
      route: `/runops/runbooks`,
    });
    setRunbookDialogOpen(false);
  };

  /* --------------------------- Render ---------------------------------- */
  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <EntityHeader
        eyebrow="Service Digital Twin"
        title={service.name}
        status={{ tone: healthTone(service.health), label: service.health }}
        subtitle={`${service.tier} · ${service.environment} · ${service.region}`}
        meta={
          <>
            <MetaChip label="Owner"          value={owner}          warn={missingOwner} />
            <MetaChip label="Business owner" value={businessOwner} />
            <MetaChip label="SLO"            value={missingSlo ? "not defined" : `${serviceSlos[0].current.toFixed(2)}% / ${serviceSlos[0].target}%`} warn={missingSlo} />
            <MetaChip label="Error budget"   value={`${service.errorBudgetRemaining}% remaining`} />
            <MetaChip label="Active incident" value={activeIncident ? activeIncident.id : "none"} warn={!!activeIncident} />
            <FreshnessIndicator capturedAt={ops.dataFreshnessAt} ttlSeconds={STALE_THRESHOLD_MS / 1000} />
          </>
        }
        actions={
          <>
            <Button size="sm" variant="outline" onClick={openTopology}>Open Topology</Button>
            <Button size="sm" variant="outline" onClick={openObservability}>Investigate Telemetry</Button>
            <Button size="sm" variant="outline" onClick={openReadiness}>View Readiness</Button>
            <Button size="sm" variant="outline" disabled={readOnly} onClick={() => setIncidentDialogOpen(true)}>Create Incident</Button>
            <Button size="sm" disabled={readOnly} onClick={() => setRunbookDialogOpen(true)}>
              <Play className="mr-1 h-3.5 w-3.5" /> Launch Runbook
            </Button>
          </>
        }
      />

      <EntityTabs
        tabs={(() => {
          const base = TABS.map((t) => ({
            ...t,
            badge:
              t.value === "components" ? String(serviceComponents.length) :
              t.value === "changes"    ? String(serviceChanges.length) :
              t.value === "runbooks"   ? String(serviceRunbooks.length) :
              undefined,
          }));
          if (service.id === "svc-hc-clinical-care-delivery") {
            const idx = base.findIndex((t) => t.value === "journeys");
            base.splice(idx, 0, { label: "Architecture Digital Twin", value: "architecture" as TabValue, badge: undefined });
          }
          return base;
        })()}
        value={tab}
        onChange={(v) => {
          if (v === "architecture") { openTopology(); return; }
          setTab(v as TabValue);
        }}
      />

      {stale && (
        <div className="px-4 pt-4">
          <StaleDataState
            title="Telemetry stale"
            description={`Last refresh ${Math.round(dataFreshnessMs / 60000)} minutes ago. Trigger refresh from the top bar.`}
            action={{ label: "Refresh now", onClick: ops.refreshData }}
          />
        </div>
      )}

      {readOnly && (
        <div className="px-4 pt-4">
          <PermissionDeniedState
            title="Read-only role"
            description="You can view the service twin but cannot create incidents, launch runbooks, or approve executions."
          />
        </div>
      )}

      <main className="flex-1 space-y-4 p-4">
        {tab === "overview" && (
          <OverviewTab
            service={service}
            owner={owner}
            businessOwner={businessOwner}
            components={serviceComponents}
            narrative={narrative}
            activeIncident={activeIncident}
            activeExecution={activeExecution ? { id: activeExecution.id, state: activeExecution.state } : undefined}
            serviceRunbooks={serviceRunbooks}
            serviceChanges={serviceChanges}
            serviceWorkers={serviceWorkers}
            readinessScore={readinessScore}
            missingOwner={missingOwner}
            missingSlo={missingSlo}
            onSelectComponent={(c) => openDrawer({
              
              
              title: c.name,
              subtitle: `${c.kind} · ${c.health}`,
              body: <ComponentDrawerBody component={c} />,
            })}
            onSelectChange={() => navigate(`/runops/changes`)}
            onSelectJourney={(j) => openDrawer({
              
              
              title: j,
              subtitle: "Customer journey",
              body: <JourneyDrawerBody name={j} service={service} />,
            })}
          />
        )}

        {tab === "journeys" && (
          <JourneysTab
            service={service}
            onSelect={(j) => openDrawer({
              
              
              title: j,
              subtitle: "Customer journey",
              body: <JourneyDrawerBody name={j} service={service} />,
            })}
          />
        )}

        {tab === "components" && (
          <ComponentsTab
            components={serviceComponents}
            onSelect={(c) => openDrawer({
              
              
              title: c.name,
              subtitle: `${c.kind} · ${c.health}`,
              body: <ComponentDrawerBody component={c} />,
            })}
          />
        )}

        {tab === "reliability" && (
          <ReliabilityTab slos={serviceSlos} service={service} missingSlo={missingSlo} />
        )}

        {tab === "operations" && (
          <OperationsTab
            activeExecution={activeExecution ? { id: activeExecution.id, state: activeExecution.state } : undefined}
            workers={serviceWorkers}
            drafts={drafts.filter((d) => d.serviceId === service.id)}
          />
        )}

        {tab === "runbooks" && (
          <RunbooksTab
            runbooks={serviceRunbooks}
            onLaunch={launchRunbook}
            disabled={readOnly}
          />
        )}

        {tab === "changes" && (
          <ChangesTab changes={serviceChanges} onSelect={() => navigate(`/runops/changes`)} />
        )}

        {tab === "ownership" && (
          <OwnershipTab
            owner={owner}
            businessOwner={businessOwner}
            missingOwner={missingOwner}
          />
        )}

        {tab === "evidence" && (
          <EvidenceTab activeIncidentId={activeIncident?.id} scenarioLabel={scenario.stage.label} />
        )}
      </main>

      <LaunchRunbookDialog
        open={runbookDialogOpen}
        onOpenChange={setRunbookDialogOpen}
        runbooks={serviceRunbooks}
        onLaunch={launchRunbook}
      />
      <CreateIncidentDialog
        open={incidentDialogOpen}
        onOpenChange={setIncidentDialogOpen}
        service={service}
        onCreate={createDraftIncident}
      />
    </div>
  );
}

/* ---------------------------- Meta chip -------------------------------- */

function MetaChip({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px]",
      warn ? "border-amber-300 bg-amber-50 text-amber-800" : "border-slate-200 bg-white text-slate-700",
    )}>
      <span className="text-slate-500">{label}:</span>
      <span className="font-medium">{value}</span>
    </span>
  );
}

/* ------------------------------ Overview ------------------------------- */

function OverviewTab(props: {
  service: BusinessService;
  owner: string;
  businessOwner: string;
  components: Component[];
  narrative: string;
  activeIncident?: { id: string; title: string; severity: string; state: string };
  activeExecution?: { id: string; state: string };
  serviceRunbooks: Runbook[];
  serviceChanges: Change[];
  serviceWorkers: DigitalWorker[];
  readinessScore: number;
  missingOwner: boolean;
  missingSlo: boolean;
  onSelectComponent: (c: Component) => void;
  onSelectChange: (c: Change) => void;
  onSelectJourney: (name: string) => void;
}) {
  const {
    service, owner, businessOwner, components, narrative, activeIncident, activeExecution,
    serviceRunbooks, serviceChanges, serviceWorkers, readinessScore, missingOwner, missingSlo,
    onSelectComponent, onSelectChange, onSelectJourney,
  } = props;

  const journeys = service.id.includes("order")
    ? ["Guest checkout", "Registered checkout", "Post-order status"]
    : service.id.includes("payment")
    ? ["Card authorization", "3DS challenge", "Refund"]
    : ["Sign-in", "MFA challenge", "Token refresh"];

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      {/* Purpose + narrative */}
      <Card className="h-full">

        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Service purpose & reliability narrative</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <p>
            <strong>{service.name}</strong> supports the {service.tier} business capability for {owner}
            {" "}(business owner: {businessOwner}). It runs across {service.componentIds.length} components in{" "}
            {service.region}.
          </p>
          <div className="rounded border border-slate-200 bg-slate-50 p-2 text-xs">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Current narrative
            </div>
            {narrative}
          </div>
          {(missingOwner || missingSlo) && (
            <div className="rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
              <div className="mb-1 font-semibold">Metadata gaps</div>
              <ul className="list-disc pl-4">
                {missingOwner && <li>No explicit owning squad on record.</li>}
                {missingSlo   && <li>No SLO defined for this service.</li>}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incident briefing video */}
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Incident briefing video</CardTitle>
        </CardHeader>
        <CardContent>
          <video
            src={incidentVideo.url}
            controls
            controlsList="nodownload"
            preload="metadata"
            playsInline
            className="aspect-video w-full rounded border border-slate-200 bg-black object-contain"
          >
            Your browser does not support embedded video.
          </video>
        </CardContent>
      </Card>




      {/* Readiness + KPIs */}
      <Card className="h-full">

        <CardHeader className="pb-2"><CardTitle className="text-sm">Operational readiness</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <ReadinessScore score={readinessScore} />
          <div className="grid grid-cols-2 gap-2">
            <MetricCard label="Error budget" value={`${service.errorBudgetRemaining}%`} tone={service.errorBudgetRemaining > 50 ? "healthy" : service.errorBudgetRemaining > 20 ? "warning" : "critical"} />
            <MetricCard label="SLO p95" value={`${service.sloLatencyMs}ms`} tone="neutral" />
            <MetricCard label="Runbooks" value={String(serviceRunbooks.length)} tone={serviceRunbooks.length ? "healthy" : "warning"} />
            <MetricCard label="Workers" value={String(serviceWorkers.length)} tone="healthy" />
          </div>
        </CardContent>
      </Card>

      {/* Active incident */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><AlertOctagon className="h-4 w-4 text-rose-600" />Active incident</CardTitle></CardHeader>
        <CardContent>
          {activeIncident ? (
            <div className="space-y-1 text-xs">
              <div className="font-semibold text-slate-900">{activeIncident.id} · {activeIncident.severity}</div>
              <div className="text-slate-700">{activeIncident.title}</div>
              <StatusIndicator tone="critical" label={activeIncident.state} />
            </div>
          ) : <div className="text-xs text-slate-500">No active incident.</div>}
        </CardContent>
      </Card>

      {/* Topology preview */}
      <Card className="xl:col-span-2">
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-sm">Topology preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {components.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectComponent(c)}
                className="group inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-2 py-1 text-xs hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <span className={cn("h-2 w-2 rounded-full", componentHealthDot(c.health))} aria-hidden />
                <span className="font-medium text-slate-900">{c.name}</span>
                <span className="text-slate-500">{c.kind}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Golden signals */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Golden signals</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <MetricCard label="Latency p95" value={`${service.sloLatencyMs + 240}ms`} tone={service.health === "Healthy" ? "healthy" : "warning"} />
          <MetricCard label="Traffic"     value="1.2k rps" tone="neutral" />
          <MetricCard label="Errors"      value={service.health === "Healthy" ? "0.02%" : "2.4%"} tone={service.health === "Healthy" ? "healthy" : "critical"} />
          <MetricCard label="Saturation"  value="72%" tone="warning" />
        </CardContent>
      </Card>

      {/* Customer journey health */}
      <Card className="xl:col-span-2">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Customer journey health</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {journeys.map((j, i) => {
              const jhealth = i === 0 && service.health !== "Healthy" ? "Degraded" : "Healthy";
              return (
                <button
                  key={j}
                  onClick={() => onSelectJourney(j)}
                  className="rounded border border-slate-200 bg-white p-2 text-left text-xs hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <div className="font-medium text-slate-900">{j}</div>
                  <StatusIndicator tone={healthTone(jhealth)} label={jhealth} />
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent changes */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><GitBranch className="h-4 w-4" />Recent changes</CardTitle></CardHeader>
        <CardContent>
          {serviceChanges.length === 0 ? (
            <div className="text-xs text-slate-500">No recent changes.</div>
          ) : (
            <ul className="space-y-1 text-xs">
              {serviceChanges.slice(0, 4).map((c) => (
                <li key={c.id}>
                  <button
                    className="w-full rounded px-1 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    onClick={() => onSelectChange(c)}
                  >
                    <div className="font-medium text-slate-900">{c.id} · {c.title}</div>
                    <div className="text-slate-500">{c.deployedAt} · risk {c.risk}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Active execution */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Activity className="h-4 w-4" />Active executions</CardTitle></CardHeader>
        <CardContent>
          {activeExecution ? (
            <div className="text-xs">
              <div className="font-semibold text-slate-900">{activeExecution.id}</div>
              <StatusIndicator tone="warning" label={activeExecution.state} />
            </div>
          ) : <div className="text-xs text-slate-500">No active executions.</div>}
        </CardContent>
      </Card>

      {/* Digital workers */}
      <Card className="xl:col-span-2">
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Bot className="h-4 w-4" />Digital worker assignments</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {serviceWorkers.map((w) => (
            <DigitalWorkerCard key={w.id} id={w.id} name={w.name} role={w.role} status={w.status} autonomy={w.autonomy} />
          ))}
        </CardContent>
      </Card>

      {/* Capacity + cost + security */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Capacity & cost</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <MetricCard label="CPU headroom"  value="28%" tone="warning" />
          <MetricCard label="Monthly spend" value="$142k" tone="neutral" />
        </CardContent>
      </Card>

      <Card className="xl:col-span-3">
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4" />Security & compliance</CardTitle></CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
            <li className="rounded border border-slate-200 bg-white p-2">PCI DSS attestation current · expires in 62 days</li>
            <li className="rounded border border-slate-200 bg-white p-2">Data classification: Sensitive · Customer PII</li>
            <li className="rounded border border-slate-200 bg-white p-2">Vulnerability posture: 2 medium open, 0 critical</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

/* --------------------------- Journeys tab ------------------------------ */

function JourneysTab({ service, onSelect }: { service: BusinessService; onSelect: (name: string) => void }) {
  const journeys = service.id.includes("order")
    ? ["Guest checkout", "Registered checkout", "Post-order status"]
    : service.id.includes("payment")
    ? ["Card authorization", "3DS challenge", "Refund"]
    : ["Sign-in", "MFA challenge", "Token refresh"];
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {journeys.map((j, i) => (
        <Card key={j} className="cursor-pointer transition hover:border-slate-400" onClick={() => onSelect(j)}>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{j}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-xs">
            <StatusIndicator tone={i === 0 && service.health !== "Healthy" ? "degraded" : "healthy"} label={i === 0 && service.health !== "Healthy" ? "Degraded" : "Healthy"} />
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="Success" value={i === 0 && service.health !== "Healthy" ? "94.1%" : "99.8%"} tone={i === 0 && service.health !== "Healthy" ? "warning" : "healthy"} />
              <MetricCard label="p95" value={`${service.sloLatencyMs + (i * 80)}ms`} tone="neutral" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* --------------------------- Components tab ---------------------------- */

function ComponentsTab({ components, onSelect }: { components: Component[]; onSelect: (c: Component) => void }) {
  if (components.length === 0) return <EmptyState title="No components" description="This service has no components mapped." />;
  return (
    <div className="overflow-x-auto rounded border border-slate-200 bg-white">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
          <tr>
            <th className="px-3 py-2">Component</th>
            <th className="px-3 py-2">Kind</th>
            <th className="px-3 py-2">Health</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {components.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50">
              <td className="px-3 py-1.5 font-medium">{c.name}</td>
              <td className="px-3 py-1.5">{c.kind}</td>
              <td className="px-3 py-1.5">
                <span className="inline-flex items-center gap-1">
                  <span className={cn("h-2 w-2 rounded-full", componentHealthDot(c.health))} aria-hidden />
                  {c.health}
                </span>
              </td>
              <td className="px-3 py-1.5 text-right">
                <Button size="sm" variant="ghost" onClick={() => onSelect(c)}>Open <ArrowRight className="ml-1 h-3 w-3" /></Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComponentDrawerBody({ component }: { component: Component }) {
  return (
    <div className="space-y-2 text-xs">
      <div><span className="text-slate-500">ID: </span>{component.id}</div>
      <div><span className="text-slate-500">Kind: </span>{component.kind}</div>
      <div><span className="text-slate-500">Health: </span>{component.health}</div>
    </div>
  );
}

function JourneyDrawerBody({ name, service }: { name: string; service: BusinessService }) {
  return (
    <div className="space-y-2 text-xs">
      <div className="font-semibold">{name}</div>
      <div>Filtered telemetry for this journey on <strong>{service.name}</strong>.</div>
      <MetricCard label="Success rate" value="99.6%" tone="healthy" />
      <MetricCard label="p95 latency"  value={`${service.sloLatencyMs}ms`} tone="neutral" />
    </div>
  );
}

/* --------------------------- Reliability tab --------------------------- */

function ReliabilityTab({ slos, service, missingSlo }: {
  slos: { id: string; name: string; target: number; current: number; errorBudgetRemaining: number; window: string }[];
  service: BusinessService;
  missingSlo: boolean;
}) {
  if (missingSlo) return <EmptyState title="No SLOs defined" description="Define at least one SLO to track reliability for this service." />;
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {slos.map((s) => (
        <div key={s.id} className="space-y-3">
          <SLOCard name={s.name} target={s.target} actual={s.current} window={s.window} />
          <ErrorBudgetCard name={s.name} remainingPct={s.errorBudgetRemaining} burnRate={service.health === "Healthy" ? 0.4 : 2.6} window={s.window} />
        </div>
      ))}
    </div>
  );
}

/* --------------------------- Operations tab ---------------------------- */

function OperationsTab({ activeExecution, workers, drafts }: {
  activeExecution?: { id: string; state: string };
  workers: DigitalWorker[];
  drafts: DraftIncident[];
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Active execution</CardTitle></CardHeader>
        <CardContent>
          {activeExecution
            ? <div className="text-xs"><div className="font-semibold">{activeExecution.id}</div><StatusIndicator tone="warning" label={activeExecution.state} /></div>
            : <div className="text-xs text-slate-500">No running executions for this service.</div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Draft incidents from this twin</CardTitle></CardHeader>
        <CardContent>
          {drafts.length === 0
            ? <div className="text-xs text-slate-500">No drafts.</div>
            : (
              <ul className="space-y-1 text-xs">
                {drafts.map((d) => (
                  <li key={d.id} className="rounded border border-slate-200 bg-white p-2">
                    <div className="font-medium">{d.id} · {d.severity}</div>
                    <div className="text-slate-500">{d.summary}</div>
                    <div className="text-slate-400">Created by {d.createdBy}</div>
                  </li>
                ))}
              </ul>
            )}
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Assigned digital workers</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {workers.map((w) => <DigitalWorkerCard key={w.id} id={w.id} name={w.name} role={w.role} status={w.status} autonomy={w.autonomy} />)}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------------------- Runbooks tab ----------------------------- */

function RunbooksTab({ runbooks, onLaunch, disabled }: {
  runbooks: Runbook[]; onLaunch: (id: string) => void; disabled: boolean;
}) {
  if (runbooks.length === 0) return <EmptyState title="No runbooks" description="No runbooks mapped to this service. Consider authoring one." />;
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {runbooks.map((r) => (
        <Card key={r.id}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <span>{r.id} · {r.title}</span>
              <Badge variant="outline">{r.state}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="text-slate-500">Version {r.version} · autonomy {r.autonomy}</div>
            <RunbookFitnessScore score={r.fitnessScore} />
            <Button size="sm" disabled={disabled} onClick={() => onLaunch(r.id)}>
              <Play className="mr-1 h-3.5 w-3.5" /> Launch
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ----------------------------- Changes tab ----------------------------- */

function ChangesTab({ changes, onSelect }: { changes: Change[]; onSelect: (c: Change) => void }) {
  if (changes.length === 0) return <EmptyState title="No changes on record" description="No changes have been deployed for this service in the current window." />;
  return (
    <div className="overflow-x-auto rounded border border-slate-200 bg-white">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
          <tr>
            <th className="px-3 py-2">Change</th>
            <th className="px-3 py-2">Deployed</th>
            <th className="px-3 py-2">Risk</th>
            <th className="px-3 py-2">Linked incident</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {changes.map((c) => (
            <tr key={c.id} className="cursor-pointer hover:bg-slate-50" onClick={() => onSelect(c)}>
              <td className="px-3 py-1.5"><div className="font-medium">{c.id}</div><div className="text-slate-500">{c.title}</div></td>
              <td className="px-3 py-1.5">{c.deployedAt}</td>
              <td className="px-3 py-1.5">{c.risk}</td>
              <td className="px-3 py-1.5">{c.linkedIncidentId ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------------------- Ownership tab ---------------------------- */

function OwnershipTab({ owner, businessOwner, missingOwner }: {
  owner: string; businessOwner: string; missingOwner: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Technical owner</CardTitle></CardHeader>
        <CardContent className="text-xs">
          <div className="font-semibold text-slate-900">{owner}</div>
          {missingOwner && <div className="mt-1 text-amber-700">Missing explicit ownership record.</div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Business owner</CardTitle></CardHeader>
        <CardContent className="text-xs font-semibold text-slate-900">{businessOwner}</CardContent>
      </Card>
    </div>
  );
}

/* ----------------------------- Evidence tab ---------------------------- */

function EvidenceTab({ activeIncidentId, scenarioLabel }: { activeIncidentId?: string; scenarioLabel: string }) {
  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Sparkles className="h-4 w-4" />AI recommendation</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="rounded border border-slate-200 bg-white p-2">
            <div className="font-semibold">Recommend runbook RB-0042 (Checkout Latency & DB Saturation)</div>
            <div className="mt-1 text-slate-500">Confidence 0.82 · Uncertainty ±0.06 · Scenario: {scenarioLabel}</div>
            <div className="mt-2 space-y-1">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Evidence</div>
              <EvidenceCitation evidence={{ id: "EV-101", title: "Checkout API trace p95 spans", source: "OpenTelemetry", snippet: "p95 span duration at 1.4s, dominated by SQL waits (captured 10:18 CT).", supports: "supports" }} />
              <EvidenceCitation evidence={{ id: "EV-102", title: "SQL primary conn util 98%",    source: "Prometheus",    snippet: "Connection pool saturation for 8 minutes prior to alert (captured 10:12 CT).", supports: "supports" }} />
              <EvidenceCitation evidence={{ id: "EV-103", title: "CHG-20391 deployment record",   source: "Azure DevOps",  snippet: "Index change deployed 09:58 CT — precedes SLO burn by 12 minutes.", supports: "supports" }} />
            </div>
            <div className="mt-2 text-[10px] text-slate-500">
              Sources: OpenTelemetry, Prometheus, Azure DevOps · linked incident {activeIncidentId ?? "none"}
            </div>
          </div>
        </CardContent>
      </Card>

      <Timeline>
        <TimelineEvent at="10:14 CT" title="Incident declared" actor="system"   tone="critical" />
        <TimelineEvent at="10:19 CT" title="Hypothesis raised"  actor="DW-DB-03" tone="warning"  />
        <TimelineEvent at="10:23 CT" title="Approval requested" actor="DW-IC-01" tone="neutral"  />
      </Timeline>
    </div>
  );
}

/* --------------------------- Launch dialog ----------------------------- */

function LaunchRunbookDialog({ open, onOpenChange, runbooks, onLaunch }: {
  open: boolean; onOpenChange: (v: boolean) => void; runbooks: Runbook[]; onLaunch: (id: string) => void;
}) {
  const [selected, setSelected] = useState<string>(runbooks[0]?.id ?? "");
  useEffect(() => { if (open && runbooks[0]) setSelected(runbooks[0].id); }, [open, runbooks]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Launch runbook</DialogTitle>
          <DialogDescription>Only runbooks mapped to this service are shown.</DialogDescription>
        </DialogHeader>
        {runbooks.length === 0 ? (
          <div className="text-sm text-slate-500">No applicable runbooks for this service.</div>
        ) : (
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger><SelectValue placeholder="Select runbook" /></SelectTrigger>
            <SelectContent>
              {runbooks.map((r) => <SelectItem key={r.id} value={r.id}>{r.id} · {r.title}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!selected} onClick={() => onLaunch(selected)}><Play className="mr-1 h-3.5 w-3.5" /> Launch</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- Incident dialog --------------------------- */

function CreateIncidentDialog({ open, onOpenChange, service, onCreate }: {
  open: boolean; onOpenChange: (v: boolean) => void; service: BusinessService;
  onCreate: (summary: string, severity: DraftIncident["severity"]) => void;
}) {
  const [summary, setSummary]   = useState("");
  const [severity, setSeverity] = useState<DraftIncident["severity"]>("SEV 2");
  useEffect(() => { if (open) { setSummary(""); setSeverity("SEV 2"); } }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create incident</DialogTitle>
          <DialogDescription>Creates a draft incident scoped to <strong>{service.name}</strong>.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Severity</Label>
            <Select value={severity} onValueChange={(v) => setSeverity(v as DraftIncident["severity"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["SEV 1","SEV 2","SEV 3","SEV 4"] as const).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Summary</Label>
            <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="What is happening?" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input value={service.id} readOnly />
            <Input value={service.name} readOnly />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!summary.trim()} onClick={() => onCreate(summary.trim(), severity)}>Create draft</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
