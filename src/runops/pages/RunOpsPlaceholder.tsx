import { Link, useLocation, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Compass } from "lucide-react";
import { useOperations, useRightDrawer } from "@/runops/state/RunOpsProviders";
import { routes as routeTable, type DevStatus, type RouteMeta } from "@/runops/shell/routes";

/** Resolve the RouteMeta whose absolutePath pattern matches the current URL. */
function resolveMeta(pathname: string): RouteMeta | undefined {
  const abs = pathname.replace(/\/+$/, "");
  for (const r of routeTable) {
    if (r.absolutePath === abs) return r;
    if (!r.absolutePath.includes(":")) continue;
    const patternParts = r.absolutePath.split("/");
    const pathParts = abs.split("/");
    if (patternParts.length !== pathParts.length) continue;
    let ok = true;
    for (let i = 0; i < patternParts.length; i++) {
      const p = patternParts[i];
      if (p.startsWith(":")) continue;
      if (p !== pathParts[i]) { ok = false; break; }
    }
    if (ok) return r;
  }
  return undefined;
}

function statusChip(s: DevStatus): string {
  switch (s) {
    case "Built":      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Scaffolded": return "bg-sky-100 text-sky-800 border-sky-200";
    case "Planned":    return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export default function RunOpsPlaceholder() {
  const { pathname } = useLocation();
  const params = useParams();
  const meta = resolveMeta(pathname);
  const { tenant, selectedService, environment, region, timeRange, incident, mode } = useOperations();
  const { openDrawer } = useRightDrawer();

  const title = meta?.title ?? "RunOps";
  const section = meta?.section ?? "Command";
  const entityContext = meta?.entityContext ?? "—";
  const status: DevStatus = meta?.status ?? "Planned";

  const paramEntries = Object.entries(params).filter(([, v]) => typeof v === "string" && v.length > 0);

  const openContext = () => openDrawer({
    title: `${title} · context`,
    subtitle: `${section} · ${status}`,
    body: (
      <div className="space-y-3 text-[12px] text-slate-700">
        <div>
          <div className="text-[10.5px] uppercase tracking-wider text-slate-500">Route</div>
          <div className="font-mono text-[11.5px]">{meta?.absolutePath ?? pathname}</div>
        </div>
        <div>
          <div className="text-[10.5px] uppercase tracking-wider text-slate-500">Live URL</div>
          <div className="font-mono text-[11.5px]">{pathname}</div>
        </div>
        <div>
          <div className="text-[10.5px] uppercase tracking-wider text-slate-500">Expected entity context</div>
          <div>{entityContext}</div>
        </div>
        <div>
          <div className="text-[10.5px] uppercase tracking-wider text-slate-500">Persistent context</div>
          <ul className="mt-1 space-y-0.5 text-[11.5px]">
            <li>Tenant: {tenant.name}</li>
            <li>Service: {selectedService.name}</li>
            <li>Environment: {environment}</li>
            <li>Region: {region}</li>
            <li>Time range: {timeRange}</li>
            <li>Active incident: {incident.id}</li>
            <li>Mode: {mode}</li>
          </ul>
        </div>
      </div>
    ),
  });

  return (
    <div className="mx-auto max-w-[1200px] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-500">{section}</div>
          <h1 className="mt-0.5 text-[22px] font-semibold text-slate-900">{title}</h1>
          <p className="mt-1 max-w-3xl text-[12.5px] text-slate-600">
            This route is part of the RunOps Runbooks foundation. Detailed page content is not yet built — the
            navigation slot, entity context, providers, and audit hooks are wired.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={statusChip(status)}>{status}</Badge>
          <Button variant="outline" size="sm" className="h-7 text-[11.5px]" asChild>
            <Link to="/runops"><ArrowLeft className="mr-1 h-3 w-3" /> Command Center</Link>
          </Button>
          <Button size="sm" className="h-7 bg-slate-900 text-[11.5px] hover:bg-slate-800" onClick={openContext}>
            <Compass className="mr-1 h-3 w-3" /> Inspect Context
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 border-slate-200 xl:col-span-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-[14px]">Route metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-[12.5px]">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <MetaRow label="Page title"        value={title} />
              <MetaRow label="Navigation section" value={section} />
              <MetaRow label="Route pattern"     value={meta?.absolutePath ?? pathname} mono />
              <MetaRow label="Live path"         value={pathname} mono />
              <MetaRow label="Expected entity context" value={entityContext} full />
              <MetaRow label="Development status" value={status} />
            </div>
            {paramEntries.length > 0 && (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="text-[10.5px] uppercase tracking-wider text-slate-500">Route parameters</div>
                <div className="mt-1 grid grid-cols-1 gap-1 md:grid-cols-2">
                  {paramEntries.map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2 text-[12px]">
                      <span className="font-mono text-slate-500">:{k}</span>
                      <span className="font-mono text-slate-900">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-12 border-slate-200 xl:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-[14px]">Active context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-[12px]">
            <MetaRow label="Tenant"      value={tenant.name} />
            <MetaRow label="Service"     value={selectedService.name} />
            <MetaRow label="Environment" value={environment} />
            <MetaRow label="Region"      value={region} />
            <MetaRow label="Time range"  value={timeRange} />
            <MetaRow label="Incident"    value={incident.id} />
            <MetaRow label="Mode"        value={mode === "demo" ? "Demo Mode" : "Connected Mode"} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetaRow({ label, value, mono, full }: { label: string; value: string; mono?: boolean; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : undefined}>
      <div className="text-[10.5px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={mono ? "font-mono text-[11.5px] text-slate-800" : "text-[12.5px] text-slate-900"}>{value}</div>
    </div>
  );
}
