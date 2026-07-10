import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search, Sparkles, Play, PlusCircle, ShieldCheck, Bell, RefreshCw,
  ChevronRight, User, Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  demoRoles, environments, regions, timeRanges, useOperations, useRightDrawer,
  type DemoRole, type Environment, type Region, type TimeRange,
} from "@/runops/state/RunOpsProviders";
import {
  approvalStateTone, errorBudgetTone, incidentStateTone, serviceHealthTone, severityTone,
} from "@/runops/tokens";
import { activeSectionForPath } from "@/runops/shell/RunOpsSidebar";
import { routes as routeTable } from "@/runops/shell/routes";

/* -------------------------------- Utils -------------------------------- */

function freshnessLabel(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const s = Math.round(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.round(m / 60)}h ago`;
}

/** Match a concrete pathname against a react-router-style path with :params. */
function matchRoutePattern(pathname: string): { title?: string; entityContext?: string; section?: string } {
  const abs = pathname.replace(/\/+$/, "");
  for (const r of routeTable) {
    const pattern = r.absolutePath;
    if (pattern === abs) return { title: r.title, entityContext: r.entityContext, section: r.section };
    if (!pattern.includes(":")) continue;
    const patternParts = pattern.split("/");
    const pathParts = abs.split("/");
    if (patternParts.length !== pathParts.length) continue;
    let ok = true;
    for (let i = 0; i < patternParts.length; i++) {
      const p = patternParts[i];
      if (p.startsWith(":")) continue;
      if (p !== pathParts[i]) { ok = false; break; }
    }
    if (ok) return { title: r.title, entityContext: r.entityContext, section: r.section };
  }
  return {};
}

/* ------------------------------ Breadcrumbs ---------------------------- */

function Breadcrumbs() {
  const { pathname } = useLocation();
  const section = activeSectionForPath(pathname);
  const match = matchRoutePattern(pathname);
  const trail = useMemo(() => {
    const items: { label: string; to?: string }[] = [{ label: "RunOps", to: "/runops" }];
    if (section) items.push({ label: section, to: undefined });
    if (match.title && match.title !== section && !(section === "Command" && match.title === "Command Center")) {
      items.push({ label: match.title });
    }
    return items;
  }, [section, match.title]);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11.5px] text-slate-500">
      {trail.map((it, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3 text-slate-300" />}
          {it.to ? (
            <Link to={it.to} className="hover:text-slate-800">{it.label}</Link>
          ) : (
            <span className={cn(i === trail.length - 1 && "font-medium text-slate-800")}>{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/* -------------------------- Context Bar ------------------------------- */

function ContextBar() {
  const {
    tenant, tenants, setTenant,
    services, selectedServiceId, selectedService, setSelectedService,
    environment, setEnvironment,
    region, setRegion,
    timeRange, setTimeRange,
    dataFreshnessAt, refreshData,
    incident,
    mode, setMode,
  } = useOperations();

  const healthChip = serviceHealthTone[selectedService.health];
  const incidentSev = severityTone[incident.severity];
  const incidentState = incidentStateTone[incident.state];
  const budgetChip = errorBudgetTone(selectedService.errorBudgetRemaining);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur">
      {/* Tenant */}
      <Select value={tenant.id} onValueChange={setTenant}>
        <SelectTrigger className="h-7 w-[170px] text-[11.5px]">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 mr-1">Tenant</span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {tenants.map((t) => <SelectItem key={t.id} value={t.id} className="text-[12px]">{t.name}</SelectItem>)}
        </SelectContent>
      </Select>

      {/* Service */}
      <Select value={selectedServiceId} onValueChange={setSelectedService}>
        <SelectTrigger className="h-7 w-[220px] text-[11.5px]">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 mr-1">Service</span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {services.map((s) => <SelectItem key={s.id} value={s.id} className="text-[12px]">{s.name}</SelectItem>)}
        </SelectContent>
      </Select>

      {/* Environment */}
      <Select value={environment} onValueChange={(v) => setEnvironment(v as Environment)}>
        <SelectTrigger className="h-7 w-[130px] text-[11.5px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {environments.map((e) => <SelectItem key={e} value={e} className="text-[12px]">{e}</SelectItem>)}
        </SelectContent>
      </Select>

      {/* Region */}
      <Select value={region} onValueChange={(v) => setRegion(v as Region)}>
        <SelectTrigger className="h-7 w-[120px] text-[11.5px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {regions.map((r) => <SelectItem key={r} value={r} className="text-[12px]">{r}</SelectItem>)}
        </SelectContent>
      </Select>

      {/* Time range */}
      <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
        <SelectTrigger className="h-7 w-[80px] text-[11.5px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {timeRanges.map((t) => <SelectItem key={t} value={t} className="text-[12px]">{t}</SelectItem>)}
        </SelectContent>
      </Select>

      {/* Data freshness */}
      <button
        type="button"
        onClick={refreshData}
        title="Refresh data"
        className="flex items-center gap-1.5 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-100"
      >
        <RefreshCw className="h-3 w-3" />
        <span className="tabular-nums">{freshnessLabel(dataFreshnessAt)}</span>
      </button>

      {/* Health */}
      <span className={cn("rounded-full border px-2 py-0.5 text-[10.5px] font-medium", healthChip.chip)}>
        {healthChip.label}
      </span>

      {/* SLO */}
      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10.5px] text-slate-700">
        SLO {selectedService.sloAvailability}%
      </span>

      {/* Error budget */}
      <span className={cn("rounded-full border px-2 py-0.5 text-[10.5px] font-medium", budgetChip.chip)}>
        Budget {selectedService.errorBudgetRemaining}%
      </span>

      {/* Active incident */}
      <Link
        to={`/runops/incidents/${incident.id}`}
        className={cn(
          "flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-medium hover:opacity-90",
          incidentSev.chip,
        )}
      >
        <Circle className="h-2 w-2 fill-current" />
        {incident.id} · {incident.severity}
        <span className={cn("ml-1 rounded-full border px-1 py-0 text-[9.5px] font-medium", incidentState.chip)}>
          {incidentState.label}
        </span>
      </Link>

      {/* Mode indicator */}
      <button
        type="button"
        onClick={() => setMode(mode === "demo" ? "connected" : "demo")}
        title="Toggle demo/connected mode"
        className={cn(
          "ml-auto rounded-full border px-2 py-0.5 text-[10.5px] font-medium",
          mode === "demo"
            ? "border-sky-300 bg-sky-50 text-sky-700"
            : "border-emerald-300 bg-emerald-50 text-emerald-700",
        )}
      >
        {mode === "demo" ? "Demo Mode" : "Connected Mode"}
      </button>
    </div>
  );
}

/* --------------------------- Global Actions --------------------------- */

function GlobalActions() {
  const {
    approval, unreadNotifications, notifications, markAllNotificationsRead,
    role, setRole, mode,
  } = useOperations();
  const { openDrawer } = useRightDrawer();

  const openSearch = () => openDrawer({
    title: "Search",
    subtitle: "Services · runbooks · incidents · workers",
    body: (
      <div className="space-y-3">
        <input
          type="search"
          placeholder="Type to search…"
          className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />
        <div className="text-[11.5px] text-slate-500">
          Global search is a foundation placeholder. Wire to OperationsProvider queries when detailed screens land.
        </div>
      </div>
    ),
  });

  const openNova = () => openDrawer({
    title: "Ask NOVA",
    subtitle: "AI operations copilot",
    body: (
      <div className="space-y-3">
        <div className="rounded border border-slate-200 bg-slate-50 p-3 text-[12px] text-slate-700">
          NOVA is scoped to the current tenant, service, and time range. Foundation shell only — model calls are
          disabled until AiProvider is connected.
        </div>
        <input
          type="text"
          placeholder="Ask about the current service, incident, or runbook…"
          className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-[12.5px]"
        />
      </div>
    ),
  });

  const openNotifications = () => {
    openDrawer({
      title: "Notifications",
      subtitle: `${unreadNotifications} unread`,
      body: (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className="rounded border border-slate-200 bg-white p-2.5">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "inline-block h-2 w-2 rounded-full",
                  n.kind === "critical" ? "bg-red-600" : n.kind === "warning" ? "bg-amber-500" : "bg-sky-500",
                )} />
                <span className="text-[12px] font-semibold text-slate-900">{n.title}</span>
                <span className="ml-auto text-[10.5px] text-slate-500">{n.at}</span>
              </div>
              {n.detail && <div className="mt-1 text-[11.5px] text-slate-600">{n.detail}</div>}
            </div>
          ))}
        </div>
      ),
    });
    markAllNotificationsRead();
  };

  const approvalTone = approvalStateTone[approval.state];

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 bg-white px-4 py-2">
      <Breadcrumbs />

      <div className="ml-auto flex flex-wrap items-center gap-1.5">
        <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={openSearch}>
          <Search className="mr-1 h-3 w-3" /> Search
        </Button>
        <Button size="sm" className="h-7 bg-slate-900 text-[11.5px] hover:bg-slate-800" onClick={openNova}>
          <Sparkles className="mr-1 h-3 w-3" /> Ask NOVA
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-[11.5px]" asChild>
          <Link to="/runops/runbooks"><Play className="mr-1 h-3 w-3" /> Launch Runbook</Link>
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-[11.5px]" asChild>
          <Link to="/runops/incidents/INC-10482"><PlusCircle className="mr-1 h-3 w-3" /> Create Incident</Link>
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-[11.5px]" asChild>
          <Link to="/runops/approvals">
            <ShieldCheck className="mr-1 h-3 w-3" /> Approvals
            <Badge variant="outline" className={cn("ml-1.5 h-4 px-1 text-[9.5px]", approvalTone.chip)}>
              {approval.state}
            </Badge>
          </Link>
        </Button>
        <button
          type="button"
          onClick={openNotifications}
          className="relative grid h-7 w-7 place-items-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
          aria-label="Notifications"
        >
          <Bell className="h-3.5 w-3.5" />
          {unreadNotifications > 0 && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[9px] font-semibold text-white">
              {unreadNotifications}
            </span>
          )}
        </button>

        {mode === "demo" && (
          <Select value={role} onValueChange={(v) => setRole(v as DemoRole)}>
            <SelectTrigger className="h-7 w-[190px] text-[11.5px]">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 mr-1">Role</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {demoRoles.map((r) => <SelectItem key={r} value={r} className="text-[12px]">{r}</SelectItem>)}
            </SelectContent>
          </Select>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
              aria-label="User menu"
            >
              <User className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="text-[12px] font-medium text-slate-900">Demo User</div>
              <div className="text-[10.5px] text-slate-500">{role}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/runops/platform">Platform settings</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/runops/governance">Governance</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/app">Exit to main app</Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/* ------------------------------ Composite ----------------------------- */

export function RunOpsTopBar() {
  return (
    <div className="sticky top-0 z-20">
      <ContextBar />
      <GlobalActions />
    </div>
  );
}
