import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search, Sparkles, Play, ShieldCheck,
  ChevronRight, User, Circle, RefreshCw,
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
  demoRoles, environments, regions, timeRanges, useOperations,
  type DemoRole, type Environment, type Region, type TimeRange,
} from "@/runops/state/RunOpsProviders";
import {
  approvalStateTone, errorBudgetTone, incidentStateTone, serviceHealthTone, severityTone,
} from "@/runops/tokens";
import { activeSectionForPath } from "@/runops/shell/RunOpsSidebar";
import { routes as routeTable } from "@/runops/shell/routes";
import { useCommandPalette } from "@/runops/shell/CommandPalette";
import { useAskNova } from "@/runops/shell/AskNovaPanel";
import { NotificationCenter } from "@/runops/shell/NotificationCenter";
import { CreateMenu } from "@/runops/shell/CreateMenu";


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
  const { approval, role, setRole, mode } = useOperations();
  const { setOpen: setPaletteOpen } = useCommandPalette();
  const nova = useAskNova();
  const approvalTone = approvalStateTone[approval.state];
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 bg-white px-4 py-2">
      <Breadcrumbs />

      <div className="ml-auto flex flex-wrap items-center gap-1.5">
        <Button
          size="sm" variant="outline"
          className="h-7 gap-1 text-[11.5px]"
          onClick={() => setPaletteOpen(true)}
          aria-keyshortcuts={isMac ? "Meta+K" : "Control+K"}
        >
          <Search className="h-3 w-3" /> Search
          <kbd className="ml-1 rounded border border-slate-200 bg-slate-50 px-1 text-[9.5px] text-slate-500">
            {isMac ? "⌘K" : "Ctrl K"}
          </kbd>
        </Button>
        <Button
          size="sm"
          className={cn("h-7 text-[11.5px]", nova.open ? "bg-violet-600 hover:bg-violet-500" : "bg-slate-900 hover:bg-slate-800")}
          onClick={nova.toggle}
          aria-pressed={nova.open}
        >
          <Sparkles className="mr-1 h-3 w-3" /> Ask NOVA
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-[11.5px]" asChild>
          <Link to="/runops/runbooks"><Play className="mr-1 h-3 w-3" /> Launch Runbook</Link>
        </Button>
        <CreateMenu />
        <Button size="sm" variant="outline" className="h-7 text-[11.5px]" asChild>
          <Link to="/runops/approvals">
            <ShieldCheck className="mr-1 h-3 w-3" /> Approvals
            <Badge variant="outline" className={cn("ml-1.5 h-4 px-1 text-[9.5px]", approvalTone.chip)}>
              {approval.state}
            </Badge>
          </Link>
        </Button>
        <NotificationCenter />


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
