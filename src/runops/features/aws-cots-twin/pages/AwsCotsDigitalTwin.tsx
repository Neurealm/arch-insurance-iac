import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Activity, AlertOctagon, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Cloud, DollarSign, Layers, Maximize2, Minimize2, RefreshCw, ShieldAlert,
  Users, Clock, Building2, GitBranch, Layout, Network, Route as RouteIcon, Server,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  getAwsCotsRepository,
  type AwsResource,
  type BusinessService,
  type Application,
  type AwsAccount,
} from "..";
import { ArchitectureCanvas } from "../components/ArchitectureCanvas";

/* -------------------------------------------------------------------------- */
/*  Static reference values (from seed / Prompt 2 spec)                        */
/* -------------------------------------------------------------------------- */

const TENANT_OPTIONS = [{ id: "tenant.meridian", name: "Meridian Enterprise" }];
const ENVIRONMENTS = ["Production", "Staging", "Development", "DR"] as const;
type ViewMode = "architecture" | "topology" | "dependency" | "risk" | "cost";
const VIEW_MODES: { id: ViewMode; label: string; icon: typeof Layout; enabled: boolean }[] = [
  { id: "architecture", label: "Architecture", icon: Layout, enabled: true },
  { id: "topology", label: "Topology", icon: Network, enabled: false },
  { id: "dependency", label: "Dependency", icon: GitBranch, enabled: false },
  { id: "risk", label: "Risk", icon: ShieldAlert, enabled: false },
  { id: "cost", label: "Cost", icon: DollarSign, enabled: false },
];

/* Business-service summary values (seeded per Prompt 2). Held here rather than
   in seed.ts because these are presentation-layer supplements to the entity
   already defined in the data model. */
const SERVICE_SUMMARY = {
  service_owner: "Priya Chandran, VP Enterprise Applications",
  technical_owner: "Marcus Whitfield, Principal SRE",
  service_tier: "Tier 1",
  availability_slo: "99.95%",
  current_availability: "99.98%",
  error_budget_remaining: "71%",
  rto_minutes: 60,
  rpo_minutes: 15,
  users_supported: 4850,
  support_group: "Enterprise Applications RunOps",
  current_change_window: "Sun 02:00–05:00 UTC",
  open_incidents: 1,
  pending_changes: 2,
};

const PAGE_STATS = {
  overall_health: "Operational",
  active_alerts: 3,
  availability: "99.98%",
  estimated_monthly_cost: "$18,460",
  data_source: "Simulated AWS telemetry",
};

/* -------------------------------------------------------------------------- */
/*  Utility hooks                                                              */
/* -------------------------------------------------------------------------- */

function useFullscreen(target: React.RefObject<HTMLElement>) {
  const [isFull, setIsFull] = useState(false);
  useEffect(() => {
    const on = () => setIsFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);
  const supported = typeof document !== "undefined" && "requestFullscreen" in document.documentElement;
  const toggle = useCallback(() => {
    if (!target.current) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else target.current.requestFullscreen?.().catch(() => {});
  }, [target]);
  return { isFull, toggle, supported };
}

function formatRelative(fromISO: string, now = Date.now()): string {
  const diff = Math.max(0, Math.round((now - new Date(fromISO).getTime()) / 1000));
  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  return `${Math.floor(diff / 3600)} hours ago`;
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function AwsCotsDigitalTwinPage() {
  const [params, setParams] = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFull, toggle: toggleFull, supported: fsSupported } = useFullscreen(containerRef);

  // Server-loaded selection sources (single-tenant, single-service seed today).
  const [service, setService] = useState<BusinessService | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [account, setAccount] = useState<AwsAccount | null>(null);
  const [resources, setResources] = useState<AwsResource[]>([]);
  const [syncedAt, setSyncedAt] = useState<string>(() => new Date(Date.now() - 42_000).toISOString());
  const [refreshing, setRefreshing] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string | null>(null);

  // URL-driven selection state
  const tenantId = params.get("tenant") ?? "tenant.meridian";
  const serviceId = params.get("service") ?? "bs.erm";
  const applicationId = params.get("application") ?? "app.atlas-cots";
  const environment = (params.get("env") ?? "Production") as (typeof ENVIRONMENTS)[number];
  const view = (params.get("view") ?? "architecture") as ViewMode;

  const setParam = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next, { replace: true });
  }, [params, setParams]);

  const load = useCallback(async () => {
    const repo = getAwsCotsRepository();
    const [svc, app, accts, res] = await Promise.all([
      repo.getBusinessService(serviceId),
      repo.getApplication(applicationId),
      repo.getAwsAccounts(),
      repo.getResources({ businessServiceId: serviceId, applicationId }),
    ]);
    setService(svc);
    setApplication(app);
    setAccount(accts[0] ?? null);
    setResources(res);
  }, [serviceId, applicationId]);

  useEffect(() => { void load(); }, [load]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
      setSyncedAt(new Date().toISOString());
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  // Panel visibility (responsive collapse)
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [bottomOpen, setBottomOpen] = useState(true);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(id);
  }, []);
  const syncedLabel = useMemo(() => formatRelative(syncedAt, now), [syncedAt, now]);

  const activeAlerts = PAGE_STATS.active_alerts;
  const applicationOptions = useMemo(
    () => (application ? [application] : []),
    [application],
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div ref={containerRef} className="flex min-h-screen w-full flex-col bg-white text-slate-900">
        <PageHeader
          tenantId={tenantId}
          onTenantChange={(v) => setParam("tenant", v)}
          service={service}
          onServiceChange={(v) => setParam("service", v)}
          application={application}
          applicationOptions={applicationOptions}
          onApplicationChange={(v) => setParam("application", v)}
          environment={environment}
          onEnvironmentChange={(v) => setParam("env", v)}
          account={account}
          view={view}
          onViewChange={(v) => setParam("view", v)}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          syncedLabel={syncedLabel}
          activeAlerts={activeAlerts}
          isFullscreen={isFull}
          onToggleFullscreen={fsSupported ? toggleFull : undefined}
        />

        <BusinessServiceSummary service={service} />

        <main
          className={cn(
            "flex flex-1 min-h-0 gap-3 px-4 py-3",
            "flex-col md:flex-row",
          )}
        >
          {/* Left control panel */}
          <PanelSection
            title="Filters & Layers"
            icon={<Layers className="h-3.5 w-3.5 text-slate-500" />}
            side="left"
            open={leftOpen}
            onToggle={() => setLeftOpen((o) => !o)}
            widthOpen="w-full md:w-[240px]"
            widthClosed="md:w-10"
          >
            <Placeholder
              text="Control panel — filters, layers, and grouping controls will arrive in Prompt 3."
            />
          </PanelSection>

          {/* Center + Right + Bottom */}
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row">
              {/* Canvas */}
              <section className="flex min-w-0 flex-1 flex-col rounded-md border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
                  <div className="flex items-center gap-2 text-[12.5px] font-semibold text-slate-800">
                    <Server className="h-3.5 w-3.5 text-slate-500" />
                    Architecture Canvas
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {resources.length} resources · {environment} · {account?.alias ?? "—"}
                  </div>
                </div>
                <div className="flex-1 min-h-[420px] p-2">
                  {view === "architecture" ? (
                    <ArchitectureCanvas
                      selectedResourceId={selectedResourceId}
                      onSelectResource={setSelectedResourceId}
                      onSelectRelationship={setSelectedRelationshipId}
                    />
                  ) : (
                    <CanvasPlaceholder view={view} />
                  )}
                </div>
              </section>


              {/* Right details panel */}
              <PanelSection
                title="Resource Details"
                icon={<AlertOctagon className="h-3.5 w-3.5 text-slate-500" />}
                side="right"
                open={rightOpen}
                onToggle={() => setRightOpen((o) => !o)}
                widthOpen="w-full md:w-[320px]"
                widthClosed="md:w-10"
              >
                <Placeholder text="Persistent resource details panel (12 tabs) arrives in Prompt 5." />
              </PanelSection>
            </div>

            {/* Bottom telemetry panel */}
            <section
              className={cn(
                "rounded-md border border-slate-200 bg-white transition-[height]",
                bottomOpen ? "min-h-[140px]" : "h-9",
              )}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
                <div className="flex items-center gap-2 text-[12.5px] font-semibold text-slate-800">
                  <Activity className="h-3.5 w-3.5 text-slate-500" />
                  Telemetry
                </div>
                <button
                  type="button"
                  className="grid h-6 w-6 place-items-center rounded text-slate-500 hover:bg-slate-100"
                  aria-label={bottomOpen ? "Collapse telemetry panel" : "Expand telemetry panel"}
                  onClick={() => setBottomOpen((o) => !o)}
                >
                  {bottomOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                </button>
              </div>
              {bottomOpen && (
                <div className="p-3">
                  <Placeholder text="Bottom telemetry panel — metric strip and drill-down chart wire up alongside the details panel." />
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Header                                                                     */
/* -------------------------------------------------------------------------- */

interface PageHeaderProps {
  tenantId: string;
  onTenantChange: (v: string) => void;
  service: BusinessService | null;
  onServiceChange: (v: string) => void;
  application: Application | null;
  applicationOptions: Application[];
  onApplicationChange: (v: string) => void;
  environment: (typeof ENVIRONMENTS)[number];
  onEnvironmentChange: (v: string) => void;
  account: AwsAccount | null;
  view: ViewMode;
  onViewChange: (v: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
  syncedLabel: string;
  activeAlerts: number;
  isFullscreen: boolean;
  onToggleFullscreen?: () => void;
}

function PageHeader(p: PageHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-3 pb-2">
        <div className="min-w-0">
          <div className="text-[10.5px] uppercase tracking-wider text-slate-500">Services · AWS COTS Digital Twin</div>
          <h1 className="mt-0.5 flex items-center gap-2 text-[18px] font-semibold text-slate-900">
            <Cloud className="h-4.5 w-4.5 text-slate-700" aria-hidden />
            COTS Application, Single Region, Dual Availability Zone
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-slate-600">
            <HeaderStat icon={<ShieldAlert className="h-3 w-3 text-emerald-600" />} label="Health" value={PAGE_STATS.overall_health} valueClass="text-emerald-700" />
            <HeaderStat icon={<AlertOctagon className="h-3 w-3 text-amber-600" />} label="Active alerts" value={String(p.activeAlerts)} valueClass="text-amber-700" />
            <HeaderStat icon={<Activity className="h-3 w-3 text-slate-500" />} label="Availability" value={PAGE_STATS.availability} />
            <HeaderStat icon={<DollarSign className="h-3 w-3 text-slate-500" />} label="Est. monthly cost" value={PAGE_STATS.estimated_monthly_cost} />
            <HeaderStat icon={<Clock className="h-3 w-3 text-slate-500" />} label="Last sync" value={p.syncedLabel} />
            <HeaderStat icon={<RouteIcon className="h-3 w-3 text-slate-500" />} label="Data source" value={PAGE_STATS.data_source} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ViewSelector value={p.view} onChange={p.onViewChange} />
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={p.onRefresh}
            disabled={p.refreshing}
            aria-label="Refresh topology"
          >
            <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", p.refreshing && "animate-spin")} />
            Refresh
          </Button>
          {p.onToggleFullscreen && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" className="h-8" onClick={p.onToggleFullscreen} aria-label={p.isFullscreen ? "Exit full screen" : "Full screen"}>
                  {p.isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{p.isFullscreen ? "Exit full screen" : "Full screen"}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-2 text-[11.5px]">
        <SelectorField label="Tenant">
          <Select value={p.tenantId} onValueChange={p.onTenantChange}>
            <SelectTrigger className="h-7 w-[180px] text-[11.5px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TENANT_OPTIONS.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </SelectorField>
        <SelectorField label="Business service">
          <Select value={p.service?.id ?? "bs.erm"} onValueChange={p.onServiceChange}>
            <SelectTrigger className="h-7 w-[220px] text-[11.5px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="bs.erm">{p.service?.name ?? "Enterprise Resource Management"}</SelectItem>
            </SelectContent>
          </Select>
        </SelectorField>
        <SelectorField label="Application">
          <Select value={p.application?.id ?? "app.atlas-cots"} onValueChange={p.onApplicationChange}>
            <SelectTrigger className="h-7 w-[180px] text-[11.5px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(p.applicationOptions.length ? p.applicationOptions : [{ id: "app.atlas-cots", name: "Atlas COTS Platform" }]).map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SelectorField>
        <SelectorField label="Environment">
          <Select value={p.environment} onValueChange={p.onEnvironmentChange}>
            <SelectTrigger className="h-7 w-[130px] text-[11.5px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ENVIRONMENTS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
        </SelectorField>
        <div className="ml-auto flex items-center gap-1.5">
          <Badge variant="outline" className="border-slate-200 bg-white text-slate-700">
            <Building2 className="mr-1 h-3 w-3" /> {p.account?.alias ?? "7421-Production"}
          </Badge>
          <Badge variant="outline" className="border-slate-200 bg-white text-slate-700">
            <RouteIcon className="mr-1 h-3 w-3" /> us-east-1
          </Badge>
        </div>
      </div>
    </header>
  );
}

function HeaderStat({ icon, label, value, valueClass }: {
  icon: React.ReactNode; label: string; value: string; valueClass?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {icon}
      <span className="text-slate-500">{label}:</span>
      <span className={cn("font-medium text-slate-800", valueClass)}>{value}</span>
    </span>
  );
}

function SelectorField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="inline-flex items-center gap-1.5">
      <span className="text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function ViewSelector({ value, onChange }: { value: ViewMode; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex overflow-hidden rounded-md border border-slate-200 bg-white" role="tablist" aria-label="View selector">
      {VIEW_MODES.map((v) => {
        const Icon = v.icon;
        const active = value === v.id;
        const button = (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={!v.enabled}
            onClick={() => v.enabled && onChange(v.id)}
            className={cn(
              "inline-flex items-center gap-1.5 border-r border-slate-200 px-2.5 py-1.5 text-[11.5px] last:border-r-0",
              active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50",
              !v.enabled && "cursor-not-allowed text-slate-400",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {v.label}
          </button>
        );
        return v.enabled ? button : (
          <Tooltip key={v.id}>
            <TooltipTrigger asChild><span>{button}</span></TooltipTrigger>
            <TooltipContent>Coming in a later build phase</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Business-service summary                                                   */
/* -------------------------------------------------------------------------- */

function BusinessServiceSummary({ service }: { service: BusinessService | null }) {
  const s = SERVICE_SUMMARY;
  return (
    <section className="border-b border-slate-200 bg-white px-4 py-2.5">
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-4 xl:grid-cols-8">
        <SumField label="Business service" value={service?.name ?? "Enterprise Resource Management"} strong />
        <SumField label="Service owner" value={s.service_owner} />
        <SumField label="Technical owner" value={s.technical_owner} />
        <SumField label="Criticality" value={service?.business_criticality ?? "Business Critical"} />
        <SumField label="Service tier" value={s.service_tier} tone="warn" />
        <SumField label="Current health" value="Operational" tone="ok" />
        <SumField label="Availability SLO" value={s.availability_slo} />
        <SumField label="Current availability" value={s.current_availability} tone="ok" />
        <SumField label="Error budget remaining" value={s.error_budget_remaining} />
        <SumField label="RTO" value={`${s.rto_minutes} minutes`} />
        <SumField label="RPO" value={`${s.rpo_minutes} minutes`} />
        <SumField label="Users supported" value={s.users_supported.toLocaleString()} icon={<Users className="h-3 w-3 text-slate-400" />} />
        <SumField label="Support group" value={s.support_group} />
        <SumField label="Change window" value={s.current_change_window} />
        <SumField label="Open incidents" value={String(s.open_incidents)} tone={s.open_incidents ? "warn" : "ok"} />
        <SumField label="Pending changes" value={String(s.pending_changes)} />
      </div>
    </section>
  );
}

function SumField({ label, value, tone, icon, strong }: {
  label: string; value: string; tone?: "ok" | "warn" | "bad"; icon?: React.ReactNode; strong?: boolean;
}) {
  const toneCls =
    tone === "ok" ? "text-emerald-700" :
    tone === "warn" ? "text-amber-700" :
    tone === "bad" ? "text-red-700" : "text-slate-800";
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={cn("mt-0.5 flex items-center gap-1 truncate text-[12px]", toneCls, strong && "font-semibold")}>
        {icon}
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Reusable panel section                                                     */
/* -------------------------------------------------------------------------- */

interface PanelSectionProps {
  title: string;
  icon: React.ReactNode;
  side: "left" | "right";
  open: boolean;
  onToggle: () => void;
  widthOpen: string;
  widthClosed: string;
  children: React.ReactNode;
}

function PanelSection({ title, icon, side, open, onToggle, widthOpen, widthClosed, children }: PanelSectionProps) {
  const Toggle = side === "left"
    ? (open ? ChevronLeft : ChevronRight)
    : (open ? ChevronRight : ChevronLeft);
  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col rounded-md border border-slate-200 bg-white transition-[width]",
        open ? widthOpen : widthClosed,
      )}
      aria-label={title}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-2.5 py-2">
        {open && (
          <div className="flex items-center gap-2 text-[12.5px] font-semibold text-slate-800">
            {icon}
            {title}
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
          className={cn("grid h-6 w-6 place-items-center rounded text-slate-500 hover:bg-slate-100", !open && "mx-auto")}
        >
          <Toggle className="h-3.5 w-3.5" />
        </button>
      </div>
      {open && <div className="min-h-0 flex-1 overflow-auto p-3">{children}</div>}
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/*  Placeholders                                                               */
/* -------------------------------------------------------------------------- */

function Placeholder({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/60 p-3 text-[11.5px] leading-relaxed text-slate-600">
      {text}
    </div>
  );
}

function CanvasPlaceholder({ view }: { view: ViewMode }) {
  return (
    <div className="grid h-full min-h-[360px] w-full place-items-center rounded-md border border-dashed border-slate-200 bg-slate-50/50">
      <Card className="max-w-md border-slate-200 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-[13.5px]">Architecture canvas — awaiting Prompt 3</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-[12px] text-slate-600">
          <p>
            The current view is <span className="font-medium text-slate-800 capitalize">{view}</span>. The interactive
            architecture canvas (zoom, pan, hover cards, selection) is delivered in the next build phase.
          </p>
          <p className="text-[11.5px] text-slate-500">
            Data foundation (Prompt 1) is complete: business service, application, AWS account, region, availability
            zones, 60+ resources, relationships, telemetry, alerts, and runbooks are already reachable through the
            repository layer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
