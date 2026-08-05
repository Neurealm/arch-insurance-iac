// Traditional NOC — Global Optical Operations Center
// Route: /operations/traditional-noc/global-optical-operations

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle, Download, Filter, Gauge, RefreshCw, Shield, X,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Legend, Line, ReferenceLine,
  ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { GlobalOpticalMap } from "@/components/operations/GlobalOpticalMap";
import {
  DataFreshnessIndicator, EmptyState, LoadingState, OperationalMetricCard,
  OperationalStatusBadge, OpsPanel, RiskBadge, SeverityBadge, TableShell,
} from "@/components/operations/OperationsPrimitives";
import {
  DEFAULT_FILTERS, regionalScore, useOperationsData,
} from "@/hooks/useOpticalOperations";
import {
  NETWORK_DOMAINS, REGIONS, changeFailureRateBaselinePercent, changeFailureRatePercent,
  customerImpacts, leadershipActions, nocStrengths, opticalTerminals, shiftHandoff,
} from "@/data/opticalNetworkData";
import type {
  CustomerImpactRecord, OperationalIncident, OperationsFilters, OpticalLink,
  OpticalTerminal, ViewMode,
} from "@/types/opticalOperations";

const REFRESH_OPTIONS = [
  { label: "Off", seconds: null as number | null },
  { label: "30 seconds", seconds: 30 },
  { label: "60 seconds", seconds: 60 },
  { label: "5 minutes", seconds: 300 },
];

function useUtcClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);
  return now;
}

export default function GlobalOpticalOperationsCenter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const now = useUtcClock();

  const [view, setView] = useState<ViewMode>(
    (searchParams.get("view") as ViewMode) === "NOC Director View" ? "NOC Director View" : "CTO View",
  );
  const [filters, setFilters] = useState<OperationsFilters>(() => ({
    ...DEFAULT_FILTERS,
    region: searchParams.get("region") ?? DEFAULT_FILTERS.region,
    severity: searchParams.get("severity") ?? DEFAULT_FILTERS.severity,
    linkStatus: searchParams.get("linkStatus") ?? DEFAULT_FILTERS.linkStatus,
  }));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshIndex, setRefreshIndex] = useState(2);
  const [refreshToken, setRefreshToken] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState(() => new Date());
  const [countdown, setCountdown] = useState<number | null>(60);
  const [showTerminals, setShowTerminals] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [impactOnly, setImpactOnly] = useState(false);
  const [weatherOnly, setWeatherOnly] = useState(false);
  const [selectedTerminal, setSelectedTerminal] = useState<OpticalTerminal | null>(null);
  const [selectedLink, setSelectedLink] = useState<OpticalLink | null>(null);
  const [openIncident, setOpenIncident] = useState<OperationalIncident | null>(null);
  const [openImpact, setOpenImpact] = useState<CustomerImpactRecord | null>(null);
  const [handoffAcknowledged, setHandoffAcknowledged] = useState(false);
  const exportRef = useRef<HTMLAnchorElement | null>(null);

  const data = useOperationsData(filters, refreshToken);
  const { metrics } = data;

  // URL persistence
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    next.set("view", view);
    if (filters.region !== DEFAULT_FILTERS.region) next.set("region", filters.region); else next.delete("region");
    if (filters.severity !== DEFAULT_FILTERS.severity) next.set("severity", filters.severity); else next.delete("severity");
    if (filters.linkStatus !== DEFAULT_FILTERS.linkStatus) next.set("linkStatus", filters.linkStatus); else next.delete("linkStatus");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, filters.region, filters.severity, filters.linkStatus]);

  // Auto refresh
  const refreshSeconds = REFRESH_OPTIONS[refreshIndex].seconds;
  const doRefresh = useCallback(() => {
    setRefreshToken((t) => t + 1);
    setLastRefreshed(new Date());
    setCountdown(refreshSeconds);
  }, [refreshSeconds]);

  useEffect(() => {
    setCountdown(refreshSeconds);
    if (refreshSeconds === null) return;
    const t = window.setInterval(() => {
      setCountdown((c) => {
        if (c === null) return null;
        if (c <= 1) { setRefreshToken((x) => x + 1); setLastRefreshed(new Date()); return refreshSeconds; }
        return c - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [refreshSeconds]);

  const telemetryDelaySec = useMemo(
    () => (data.terminals.length
      ? Math.max(...data.terminals.map((t) => t.telemetryDelaySec))
      : 0) + (refreshToken % 3),
    [data.terminals, refreshToken],
  );

  const setFilter = (key: keyof OperationsFilters, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const clearFilters = () => setFilters(DEFAULT_FILTERS);
  const activeFilterCount = Object.keys(filters).filter(
    (k) => filters[k as keyof OperationsFilters] !== DEFAULT_FILTERS[k as keyof OperationsFilters],
  ).length;

  const download = (name: string, content: string, type: string) => {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = exportRef.current;
    if (!a) return;
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const header = ["Link", "Region", "Status", "Capacity Gbps", "Utilisation %", "Margin dB", "Availability %", "Customers affected", "Incident"];
    const rows = data.links.map((l) => [
      l.name, l.region, l.status, l.capacityGbps, l.utilizationPercent,
      l.linkMarginDb, l.availability, l.customersAffected, l.incidentId ?? "",
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    download("global-optical-operations.csv", csv, "text/csv");
    return csv;
  };

  const exportJson = () => {
    download(
      "global-optical-operations-summary.json",
      JSON.stringify({ generatedAt: new Date().toISOString(), view, filters, metrics }, null, 2),
      "application/json",
    );
  };

  const cto = view === "CTO View";

  return (
    <div className="min-h-screen bg-white">
      <a ref={exportRef} className="hidden" aria-hidden href="#" />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-slate-500">Terra Communications</p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[18px] font-semibold leading-tight text-slate-900">Global Optical Operations Center</h1>
              <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                Traditional NOC
              </span>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="text-right text-[11px] text-slate-600">
              <div className="font-medium text-slate-900">{now.toISOString().slice(11, 19)} UTC</div>
              <div>{now.toISOString().slice(0, 10)}</div>
            </div>

            <div className="inline-flex rounded-md border border-slate-200 p-0.5" role="tablist" aria-label="Dashboard view">
              {(["CTO View", "NOC Director View"] as ViewMode[]).map((v) => (
                <button
                  key={v} type="button" role="tab" aria-selected={view === v}
                  onClick={() => setView(v)}
                  className={cn("rounded px-2.5 py-1 text-[11.5px] font-medium transition",
                    view === v ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100")}
                >{v}</button>
              ))}
            </div>

            <label className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only">Auto refresh interval</span>
              <select
                aria-label="Auto refresh interval"
                value={refreshIndex}
                onChange={(e) => setRefreshIndex(Number(e.target.value))}
                className="rounded border border-slate-200 px-1.5 py-1 text-[11.5px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {REFRESH_OPTIONS.map((o, i) => <option key={o.label} value={i}>{o.label}</option>)}
              </select>
            </label>

            <button type="button" onClick={doRefresh}
              className="rounded border border-slate-200 px-2 py-1 text-[11.5px] text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              Refresh
            </button>

            <button type="button" onClick={() => setFiltersOpen((o) => !o)}
              aria-expanded={filtersOpen}
              className="inline-flex items-center gap-1.5 rounded border border-slate-200 px-2 py-1 text-[11.5px] text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <Filter className="h-3.5 w-3.5" aria-hidden /> Filters
              {activeFilterCount > 0 && <span className="rounded-full bg-blue-600 px-1.5 text-[10px] text-white">{activeFilterCount}</span>}
            </button>

            <button type="button" onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded border border-slate-200 px-2 py-1 text-[11.5px] text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <Download className="h-3.5 w-3.5" aria-hidden /> CSV
            </button>
            <button type="button" onClick={exportJson}
              className="rounded border border-slate-200 px-2 py-1 text-[11.5px] text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              JSON
            </button>
          </div>

          <div className="w-full">
            <DataFreshnessIndicator lastRefreshed={lastRefreshed} nextRefreshSeconds={countdown} telemetryDelaySec={telemetryDelaySec} />
          </div>
        </div>

        {filtersOpen && (
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
            <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              <FilterSelect label="Time window" value={filters.timeWindow} onChange={(v) => setFilter("timeWindow", v)}
                options={[DEFAULT_FILTERS.timeWindow, "Last hour", "Last 8 hours", "Last 7 days"]} />
              <FilterSelect label="Region" value={filters.region} onChange={(v) => setFilter("region", v)}
                options={[DEFAULT_FILTERS.region, ...REGIONS]} />
              <FilterSelect label="Country" value={filters.country} onChange={(v) => setFilter("country", v)}
                options={[DEFAULT_FILTERS.country, ...Array.from(new Set(opticalTerminals.map((t) => t.country)))]} />
              <FilterSelect label="Network domain" value={filters.domain} onChange={(v) => setFilter("domain", v)}
                options={[DEFAULT_FILTERS.domain, ...NETWORK_DOMAINS]} />
              <FilterSelect label="Severity" value={filters.severity} onChange={(v) => setFilter("severity", v)}
                options={[DEFAULT_FILTERS.severity, "Critical", "Major", "Minor"]} />
              <FilterSelect label="Customer" value={filters.customer} onChange={(v) => setFilter("customer", v)}
                options={[DEFAULT_FILTERS.customer, ...Array.from(new Set(customerImpacts.map((c) => c.customer)))]} />
              <FilterSelect label="Service" value={filters.service} onChange={(v) => setFilter("service", v)}
                options={[DEFAULT_FILTERS.service, ...Array.from(new Set(customerImpacts.map((c) => c.service)))]} />
              <FilterSelect label="Site" value={filters.site} onChange={(v) => setFilter("site", v)}
                options={[DEFAULT_FILTERS.site, ...opticalTerminals.map((t) => t.city)]} />
              <FilterSelect label="Terminal" value={filters.terminal} onChange={(v) => setFilter("terminal", v)}
                options={[DEFAULT_FILTERS.terminal, ...opticalTerminals.map((t) => t.id)]} />
              <FilterSelect label="Link status" value={filters.linkStatus} onChange={(v) => setFilter("linkStatus", v)}
                options={[DEFAULT_FILTERS.linkStatus, "healthy", "degraded", "critical", "maintenance"]} />
              <FilterSelect label="Incident status" value={filters.incidentStatus} onChange={(v) => setFilter("incidentStatus", v)}
                options={[DEFAULT_FILTERS.incidentStatus, "Open", "Monitoring", "Resolved"]} />
              <FilterSelect label="Maintenance" value={filters.maintenanceStatus} onChange={(v) => setFilter("maintenanceStatus", v)}
                options={[DEFAULT_FILTERS.maintenanceStatus, "Active", "Upcoming", "Recent change"]} />
            </div>
            <div className="mx-auto mt-2 flex max-w-[1600px] justify-end">
              <button type="button" onClick={clearFilters}
                className="rounded border border-slate-200 bg-white px-2.5 py-1 text-[11.5px] text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                Clear filters
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-[1600px] space-y-4 bg-slate-50/60 px-4 py-4">
        {data.error && (
          <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
            {data.error}
          </p>
        )}

        {/* Metric cards */}
        <section aria-label="Top level outcome metrics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <OperationalMetricCard
            title="Global network availability" value={`${metrics.availability.toFixed(2)}%`}
            tone={metrics.availability >= 99.95 ? "good" : "warn"}
            onClick={() => setFilter("linkStatus", "critical")}
            lines={[
              { label: "Target", value: "99.95%" },
              { label: "30-day trend", value: `${metrics.availabilityDelta} pp` },
              { label: "Unavailable links", value: String(metrics.unavailableLinks) },
            ]} />
          <OperationalMetricCard
            title="Customer impact" value={metrics.customersAffected.toLocaleString()} unit="customers"
            tone={metrics.customersAffected > 0 ? "bad" : "good"}
            onClick={() => setImpactOnly(true)}
            lines={[
              { label: "Services affected", value: String(metrics.servicesAffected) },
              { label: "Enterprise customers", value: String(metrics.criticalCustomers) },
              { label: "Estimated duration", value: `${metrics.estimatedDurationMinutes} min` },
            ]} />
          <OperationalMetricCard
            title="Active major incidents" value={String(metrics.criticalIncidents + metrics.majorIncidents)}
            tone={metrics.criticalIncidents > 0 ? "bad" : "warn"}
            onClick={() => setFilter("incidentStatus", "Open")}
            lines={[
              { label: "Critical", value: String(metrics.criticalIncidents) },
              { label: "Major", value: String(metrics.majorIncidents) },
              { label: "Oldest active", value: `${metrics.oldestIncidentMinutes} min` },
              { label: "Awaiting ownership", value: String(metrics.unownedIncidents) },
            ]} />
          <OperationalMetricCard
            title="Optical link health" value={`${metrics.healthyLinks}/${data.links.length}`} unit="healthy"
            tone={metrics.unavailableLinks > 0 ? "bad" : metrics.degradedLinks > 0 ? "warn" : "good"}
            onClick={() => setFilter("linkStatus", "degraded")}
            lines={[
              { label: "Degraded", value: String(metrics.degradedLinks) },
              { label: "Unavailable", value: String(metrics.unavailableLinks) },
              { label: "Below margin threshold", value: String(metrics.belowMargin) },
            ]} />
          <OperationalMetricCard
            title="Site and terminal health" value={String(metrics.healthyTerminals)} unit="healthy terminals"
            tone={metrics.offlineTerminals > 0 ? "bad" : metrics.degradedTerminals > 0 ? "warn" : "good"}
            onClick={() => setFilter("linkStatus", DEFAULT_FILTERS.linkStatus)}
            lines={[
              { label: "Degraded", value: String(metrics.degradedTerminals) },
              { label: "Offline or critical", value: String(metrics.offlineTerminals) },
              { label: "In maintenance", value: String(metrics.maintenanceTerminals) },
            ]} />
          <OperationalMetricCard
            title="Global capacity utilisation" value={`${metrics.utilization.toFixed(0)}%`}
            tone={metrics.utilization >= 80 ? "warn" : "good"}
            onClick={() => setFilter("domain", "Long-haul")}
            lines={[
              { label: "Peak utilisation", value: `${metrics.peakUtilization}%` },
              { label: "Links above 80%", value: String(metrics.linksAbove80) },
              { label: "Forecast breaches", value: String(metrics.linksAbove90) },
            ]} />
          <OperationalMetricCard
            title="Change and maintenance exposure" value={String(metrics.activeChanges)} unit="active changes"
            tone={metrics.highRiskChanges > 0 ? "warn" : "neutral"}
            onClick={() => setFilter("maintenanceStatus", "Upcoming")}
            lines={[
              { label: "Upcoming maintenance", value: String(metrics.upcomingMaintenance) },
              { label: "High-risk changes", value: String(metrics.highRiskChanges) },
              { label: "Change failure rate", value: `${changeFailureRatePercent}%` },
            ]} />
          <OperationalMetricCard
            title="Operational risk" value={String(metrics.highRiskLinks)} unit="high-risk links"
            tone={metrics.highRiskLinks > 2 ? "bad" : "warn"}
            onClick={() => setWeatherOnly(true)}
            lines={[
              { label: "Weather-exposed links", value: String(metrics.weatherExposedLinks) },
              { label: "Capacity risks", value: String(metrics.capacityRisks) },
              { label: "Aging incidents", value: String(metrics.agingIncidents) },
            ]} />
        </section>

        {/* Row 1 */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
          <OpsPanel
            className="lg:col-span-8" title="Global Optical Network"
            subtitle="Operational status, customer impact, optical routes and terminal health"
            action={
              <div className="flex flex-wrap items-center gap-1.5">
                <MapToggle label="Terminals" active={showTerminals} onClick={() => setShowTerminals((v) => !v)} />
                <MapToggle label="Routes" active={showRoutes} onClick={() => setShowRoutes((v) => !v)} />
                <MapToggle label="Customer impact" active={impactOnly} onClick={() => setImpactOnly((v) => !v)} />
                <MapToggle label="Weather exposure" active={weatherOnly} onClick={() => setWeatherOnly((v) => !v)} />
                <button type="button"
                  onClick={() => { setSelectedTerminal(null); setSelectedLink(null); setImpactOnly(false); setWeatherOnly(false); }}
                  className="rounded border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50">
                  Reset map
                </button>
              </div>
            }
          >
            {data.loading ? <LoadingState rows={6} /> : (
              <GlobalOpticalMap
                terminals={data.terminals} links={data.links}
                showTerminals={showTerminals} showRoutes={showRoutes}
                customerImpactOnly={impactOnly} weatherExposureOnly={weatherOnly}
                selectedTerminalId={selectedTerminal?.id ?? null}
                selectedLinkId={selectedLink?.id ?? null}
                onTerminalSelect={(t) => { setSelectedTerminal(t); setSelectedLink(null); }}
                onLinkSelect={(l) => { setSelectedLink(l); setSelectedTerminal(null); }}
              />
            )}
            {(selectedTerminal || selectedLink) && (
              <div className="mt-3 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-[11.5px] text-slate-700">
                <span className="font-semibold text-slate-900">Selected: </span>
                {selectedTerminal
                  ? `${selectedTerminal.name} — ${selectedTerminal.city}, ${selectedTerminal.country}, availability ${selectedTerminal.availability.toFixed(2)}%, ${selectedTerminal.activeAlarms} active alarms`
                  : `${selectedLink!.name} — ${selectedLink!.status}, margin ${selectedLink!.linkMarginDb.toFixed(1)} dB, ${selectedLink!.customersAffected.toLocaleString()} customers affected`}
              </div>
            )}
          </OpsPanel>

          <OpsPanel className="lg:col-span-4" title="Leadership Attention Required" subtitle="Decisions requiring senior ownership now">
            <ol className="space-y-2.5">
              {leadershipActions
                .filter((a) => filters.region === DEFAULT_FILTERS.region || a.region === filters.region)
                .slice(0, 5)
                .map((a) => (
                  <li key={a.id} className="rounded border border-slate-200 p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("rounded border px-1.5 py-0.5 text-[10.5px] font-semibold",
                        a.priority === "Critical" ? "border-red-200 bg-red-50 text-red-700" :
                        a.priority === "High" ? "border-amber-200 bg-amber-50 text-amber-700" :
                        "border-blue-200 bg-blue-50 text-blue-700")}>{a.priority}</span>
                      <span className="text-[10.5px] text-slate-500">Decision required within {a.decisionDeadlineMinutes} min</span>
                    </div>
                    <p className="mt-1 text-[12.5px] font-semibold text-slate-900">{a.issue}</p>
                    <p className="text-[11.5px] text-slate-600">{a.impact}</p>
                    <dl className="mt-1 grid grid-cols-2 gap-x-3 text-[11px] text-slate-600">
                      <div><dt className="inline text-slate-500">Duration: </dt><dd className="inline">{Math.floor(a.durationMinutes / 60)}h {a.durationMinutes % 60}m</dd></div>
                      <div><dt className="inline text-slate-500">Owner: </dt><dd className="inline">{a.owner}</dd></div>
                    </dl>
                    <p className="mt-1 text-[11.5px] text-slate-700"><span className="text-slate-500">Next action: </span>{a.nextAction}</p>
                    <button type="button"
                      onClick={() => setOpenIncident(data.incidents.find((i) => i.id === a.incidentId) ?? null)}
                      className="mt-2 rounded bg-blue-600 px-2.5 py-1 text-[11.5px] font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                      Open Situation
                    </button>
                  </li>
                ))}
            </ol>
          </OpsPanel>
        </section>

        {/* Row 2 */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <OpsPanel className="lg:col-span-4" title="Customer and Service Impact" subtitle="Impact by customer, service, severity and SLA exposure">
            {data.loading ? <LoadingState /> : data.impacts.length === 0 ? <EmptyState message="No customer impact for the current filters." /> : (
              <>
                <dl className="mb-2 grid grid-cols-2 gap-2 text-[11px]">
                  <Stat label="Customers affected" value={metrics.customersAffected.toLocaleString()} />
                  <Stat label="Enterprise customers" value={String(data.impacts.filter((c) => c.enterprise).length)} />
                  <Stat label="Services degraded" value={String(data.impacts.filter((c) => c.state === "Degraded").length)} />
                  <Stat label="Services unavailable" value={String(data.impacts.filter((c) => c.state === "Unavailable").length)} />
                  <Stat label="SLA minutes at risk" value={String(data.impacts.reduce((s, c) => s + c.slaMinutesAtRisk, 0))} />
                </dl>
                <TableShell caption="Customer and service impact" headers={["Customer", "Service", "Severity", "Traffic", "Restore"]}>
                  {data.impacts.map((c) => (
                    <tr key={c.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setOpenImpact(c)}>
                      <th scope="row" className="px-2 py-1.5 text-left font-medium text-slate-900">{c.customer}</th>
                      <td className="px-2 py-1.5 text-slate-600">{c.service}</td>
                      <td className="px-2 py-1.5"><SeverityBadge severity={c.severity} /></td>
                      <td className="px-2 py-1.5 text-slate-600">{c.affectedTrafficGbps} Gbps</td>
                      <td className="px-2 py-1.5 text-slate-600">{c.estimatedRestoration}</td>
                    </tr>
                  ))}
                </TableShell>
              </>
            )}
          </OpsPanel>

          <OpsPanel className="lg:col-span-4" title="Active Major Incidents" subtitle="Ownership, phase and estimated restoration">
            {data.loading ? <LoadingState /> : data.incidents.length === 0 ? <EmptyState message="No incidents match the current filters." /> : (
              <TableShell caption="Active major incidents" headers={["Incident", "Severity", "Region", "Customers", "Phase", "Commander"]}>
                {data.incidents.map((i) => (
                  <tr key={i.id} tabIndex={0} className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                    onClick={() => setOpenIncident(i)}
                    onKeyDown={(e) => { if (e.key === "Enter") setOpenIncident(i); }}>
                    <th scope="row" className="px-2 py-1.5 text-left font-medium text-blue-700">{i.id}</th>
                    <td className="px-2 py-1.5"><SeverityBadge severity={i.severity} /></td>
                    <td className="px-2 py-1.5 text-slate-600">{i.region}</td>
                    <td className="px-2 py-1.5 text-slate-600">{i.customersAffected.toLocaleString()}</td>
                    <td className="px-2 py-1.5 text-slate-600">{i.phase}</td>
                    <td className="px-2 py-1.5 text-slate-600">{i.commander}</td>
                  </tr>
                ))}
              </TableShell>
            )}
          </OpsPanel>

          <OpsPanel className="lg:col-span-4" title="Predictive and Emerging Risk" subtitle="Derived from monitoring thresholds and operational analysis">
            {data.risks.length === 0 ? <EmptyState message="No emerging risk for the current filters." /> : (
              <TableShell caption="Emerging operational risk" headers={["Link", "Driver", "Probability", "Time to threshold", "Level"]}>
                {data.risks.map((r) => (
                  <tr key={r.id}>
                    <th scope="row" className="px-2 py-1.5 text-left font-medium text-slate-900">
                      {r.linkName}
                      <span className="block text-[10.5px] font-normal text-slate-500">{r.preparation}</span>
                    </th>
                    <td className="px-2 py-1.5 text-slate-600">{r.driver}</td>
                    <td className="px-2 py-1.5 text-slate-600">{r.probabilityPercent}%</td>
                    <td className="px-2 py-1.5 text-slate-600">{r.timeToThresholdHours} h</td>
                    <td className="px-2 py-1.5"><RiskBadge level={r.level} /></td>
                  </tr>
                ))}
              </TableShell>
            )}
          </OpsPanel>
        </section>

        {/* Row 3 */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <OpsPanel className="lg:col-span-6" title="Optical Link Performance" subtitle={cto ? "Exceptions ranked by customer impact" : "Exceptions ranked by lowest link margin"}>
            {data.links.length === 0 ? <EmptyState message="No optical links match the current filters." /> : (
              <TableShell caption="Optical link performance"
                headers={["Link", "Status", "Avail", "Rx / Tx", "Margin", "BER", "Loss", "Latency", "Util", "Alignment"]}>
                {[...data.links].sort((a, b) => {
                  const rank = { critical: 0, degraded: 1, maintenance: 2, healthy: 3 } as const;
                  if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
                  return cto ? b.customersAffected - a.customersAffected : a.linkMarginDb - b.linkMarginDb;
                }).map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <th scope="row" className="px-2 py-1.5 text-left font-medium text-slate-900">
                      {l.name}
                      {l.weatherExposed && <span className="ml-1 text-[10px] text-blue-700">weather exposed</span>}
                    </th>
                    <td className="px-2 py-1.5"><OperationalStatusBadge status={l.status} /></td>
                    <td className="px-2 py-1.5 text-slate-600">{l.availability.toFixed(2)}%</td>
                    <td className="px-2 py-1.5 text-slate-600">{l.receivedPowerDbm} / {l.transmitPowerDbm} dBm</td>
                    <td className={cn("px-2 py-1.5", l.linkMarginDb < 3.5 ? "font-semibold text-red-600" : "text-slate-600")}>{l.linkMarginDb.toFixed(1)} dB</td>
                    <td className="px-2 py-1.5 text-slate-600">{l.bitErrorRate}</td>
                    <td className="px-2 py-1.5 text-slate-600">{l.packetLossPercent}%</td>
                    <td className="px-2 py-1.5 text-slate-600">{l.latencyMs} ms</td>
                    <td className="px-2 py-1.5 text-slate-600">{l.utilizationPercent}% of {l.capacityGbps} Gbps</td>
                    <td className="px-2 py-1.5 text-slate-600">{l.alignmentState}</td>
                  </tr>
                ))}
              </TableShell>
            )}
          </OpsPanel>

          <OpsPanel className="lg:col-span-6" title="Traffic and Capacity" subtitle="24-hour global traffic against available capacity">
            <dl className="mb-2 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
              <Stat label="Global traffic" value={`${data.traffic[data.traffic.length - 1].trafficTbps} Tbps`} />
              <Stat label="Available capacity" value="30.2 Tbps" />
              <Stat label="Peak utilisation" value={`${Math.max(...data.traffic.map((t) => t.utilizationPercent))}%`} />
              <Stat label="Links above 70 / 80 / 90%" value={`${metrics.linksAbove70} / ${metrics.linksAbove80} / ${metrics.linksAbove90}`} />
            </dl>
            <div className="h-56" role="img" aria-label="24 hour traffic trend in terabits per second against a capacity threshold of 24 terabits per second">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.traffic} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#64748b" }} label={{ value: "UTC hour", position: "insideBottom", offset: -2, fontSize: 10, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} label={{ value: "Tbps", angle: -90, position: "insideLeft", fontSize: 10, fill: "#64748b" }} />
                  <RTooltip formatter={(v: number, n: string) => [`${v} ${n === "utilizationPercent" ? "%" : "Tbps"}`, n === "trafficTbps" ? "Traffic" : n]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="trafficTbps" name="Traffic (Tbps)" stroke="#2563eb" fill="#dbeafe" />
                  <Line type="monotone" dataKey="capacityTbps" name="Capacity (Tbps)" stroke="#94a3b8" dot={false} strokeDasharray="4 4" />
                  <ReferenceLine y={24} stroke="#d97706" strokeDasharray="6 3" label={{ value: "Threshold 24 Tbps", fontSize: 10, fill: "#d97706", position: "insideTopRight" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Forecast threshold breaches: {metrics.linksAbove90} link(s) projected above 90% during evening peak.
            </p>
          </OpsPanel>
        </section>

        {/* Row 4 */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <OpsPanel className="lg:col-span-4" title="Site and Terminal Health" subtitle="Highest-risk terminals first">
            {data.terminals.length === 0 ? <EmptyState message="No terminals match the current filters." /> : (
              <TableShell caption="Site and terminal health" headers={["Terminal", "Status", "Alarms", "Issues", "Telemetry"]}>
                {[...data.terminals].sort((a, b) => {
                  const rank = { critical: 0, degraded: 1, maintenance: 2, healthy: 3 } as const;
                  return rank[a.status] - rank[b.status] || b.activeAlarms - a.activeAlarms;
                }).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <th scope="row" className="px-2 py-1.5 text-left font-medium text-slate-900">
                      {t.name}<span className="block text-[10.5px] font-normal text-slate-500">{t.city}, {t.country}</span>
                    </th>
                    <td className="px-2 py-1.5"><OperationalStatusBadge status={t.status} /></td>
                    <td className="px-2 py-1.5 text-slate-600">{t.activeAlarms}</td>
                    <td className="px-2 py-1.5 text-slate-600">
                      {[t.powerIssue && "Power", t.connectivityIssue && "Connectivity", t.alignmentIssue && "Alignment"]
                        .filter(Boolean).join(", ") || "None"}
                    </td>
                    <td className="px-2 py-1.5 text-slate-600">{t.telemetryDelaySec}s old</td>
                  </tr>
                ))}
              </TableShell>
            )}
          </OpsPanel>

          <OpsPanel className="lg:col-span-4" title="Weather and Environmental Impact" subtitle="Conditions linked to affected optical routes">
            {data.weather.length === 0 ? <EmptyState message="No active environmental exposure for the current filters." /> : (
              <ul className="space-y-2">
                {data.weather.map((w) => (
                  <li key={w.id} className="rounded border border-slate-200 p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[12.5px] font-semibold text-slate-900">{w.condition} — {w.linkName}</p>
                      <RiskBadge level={w.level} />
                    </div>
                    <p className="text-[11px] text-slate-600">{w.measure} · {w.region}</p>
                    <dl className="mt-1 grid grid-cols-3 gap-2 text-[11px]">
                      <Stat label="Link margin" value={`${w.linkMarginDb.toFixed(1)} dB`} />
                      <Stat label="Customers" value={w.customersAffected.toLocaleString()} />
                      <Stat label="Duration" value={`${w.expectedDurationHours} h`} />
                    </dl>
                    <p className="mt-1 text-[11.5px] text-slate-700">{w.recommendation}</p>
                  </li>
                ))}
              </ul>
            )}
          </OpsPanel>

          <OpsPanel className="lg:col-span-4" title="Maintenance and Change Activity"
            subtitle={`Change failure rate ${changeFailureRatePercent}% against a 30-day average of ${changeFailureRateBaselinePercent}%`}>
            {(["Active", "Upcoming", "Recent change"] as const).map((kind) => {
              const rows = data.maintenance.filter((m) => m.kind === kind);
              return (
                <div key={kind} className="mb-3 last:mb-0">
                  <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {kind === "Recent change" ? "Recent changes" : `${kind} maintenance`}
                  </h3>
                  {rows.length === 0 ? <EmptyState message={`No ${kind.toLowerCase()} records.`} /> : (
                    <TableShell caption={`${kind} maintenance`} headers={["ID", "Region", "Exposure", "Window", "Owner", "Risk", "Status", "Rollback"]}>
                      {rows.map((m) => (
                        <tr key={m.id}>
                          <th scope="row" className="px-2 py-1.5 text-left font-medium text-slate-900">{m.id}</th>
                          <td className="px-2 py-1.5 text-slate-600">{m.region}</td>
                          <td className="px-2 py-1.5 text-slate-600">{m.customerExposure.toLocaleString()}</td>
                          <td className="px-2 py-1.5 text-slate-600">{m.startTime.slice(11, 16)}–{m.endTime.slice(11, 16)} UTC</td>
                          <td className="px-2 py-1.5 text-slate-600">{m.owner}</td>
                          <td className="px-2 py-1.5"><RiskBadge level={m.risk} /></td>
                          <td className="px-2 py-1.5 text-slate-600">{m.status}</td>
                          <td className="px-2 py-1.5 text-slate-600">{m.rollbackReadiness}</td>
                        </tr>
                      ))}
                    </TableShell>
                  )}
                </div>
              );
            })}
          </OpsPanel>
        </section>

        {/* Row 5 */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <OpsPanel className="lg:col-span-8" title="Regional Operational Scorecard" subtitle="Weighted status: availability 30, customer impact 25, incidents 20, degradation 10, capacity 5, weather 5, change 5">
            {data.regions.length === 0 ? <EmptyState message="No regions match the current filters." /> : (
              <TableShell caption="Regional operational scorecard"
                headers={["Region", "Availability", "Customers", "Critical", "Degraded links", "Offline terminals", "Capacity", "Weather", "Change risk", "Status"]}>
                {data.regions.map((r) => {
                  const { score, status } = regionalScore(r);
                  return (
                    <tr key={r.region} className="cursor-pointer hover:bg-slate-50" onClick={() => setFilter("region", r.region)}>
                      <th scope="row" className="px-2 py-1.5 text-left font-medium text-slate-900">{r.region}</th>
                      <td className="px-2 py-1.5 text-slate-600">{r.availability.toFixed(2)}%</td>
                      <td className="px-2 py-1.5 text-slate-600">{r.customersAffected.toLocaleString()}</td>
                      <td className="px-2 py-1.5 text-slate-600">{r.criticalIncidents}</td>
                      <td className="px-2 py-1.5 text-slate-600">{r.degradedLinks}</td>
                      <td className="px-2 py-1.5 text-slate-600">{r.offlineTerminals}</td>
                      <td className="px-2 py-1.5 text-slate-600">{r.capacityPressurePercent}%</td>
                      <td className="px-2 py-1.5 text-slate-600">{r.weatherExposedLinks} links</td>
                      <td className="px-2 py-1.5 text-slate-600">{r.changeRiskPercent}%</td>
                      <td className="px-2 py-1.5"><OperationalStatusBadge status={status} label={`${status.charAt(0).toUpperCase() + status.slice(1)} · ${score}`} /></td>
                    </tr>
                  );
                })}
              </TableShell>
            )}
          </OpsPanel>

          <OpsPanel className="lg:col-span-4" title="Shift Handoff and Ownership" subtitle={shiftHandoff.currentShift}>
            <dl className="grid grid-cols-2 gap-2 text-[11px]">
              <Stat label="Outgoing lead" value={shiftHandoff.outgoingLead} />
              <Stat label="Incoming lead" value={shiftHandoff.incomingLead} />
              <Stat label="Open incidents" value={String(shiftHandoff.openIncidents)} />
              <Stat label="Pending escalations" value={String(shiftHandoff.pendingEscalations)} />
              <Stat label="Unacknowledged alarms" value={String(shiftHandoff.unacknowledgedAlarms)} />
              <Stat label="Maintenance in progress" value={String(shiftHandoff.maintenanceInProgress)} />
            </dl>
            <h3 className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Actions due in the next hour</h3>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-[11.5px] text-slate-700">
              {shiftHandoff.actionsDueNextHour.map((a) => <li key={a}>{a}</li>)}
            </ul>
            <h3 className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Known operational concerns</h3>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-[11.5px] text-slate-700">
              {shiftHandoff.concerns.map((c) => <li key={c}>{c}</li>)}
            </ul>
            <button type="button" onClick={() => setHandoffAcknowledged(true)}
              disabled={handoffAcknowledged}
              className="mt-3 rounded bg-blue-600 px-2.5 py-1 text-[11.5px] font-medium text-white hover:bg-blue-700 disabled:bg-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              {handoffAcknowledged ? "Handoff acknowledged" : "Acknowledge handoff"}
            </button>
          </OpsPanel>
        </section>

        {/* Strengths */}
        <OpsPanel title="Why We Do Traditional NOC Well" subtitle="Operating-model strengths this dashboard makes visible">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {nocStrengths.map((s, i) => (
              <div key={s.title} className="rounded border border-slate-200 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-blue-700">
                  {i === 0 ? <Gauge className="h-4 w-4" aria-hidden /> : i === 1 ? <AlertTriangle className="h-4 w-4" aria-hidden /> : <Shield className="h-4 w-4" aria-hidden />}
                  <h3 className="text-[12.5px] font-semibold text-slate-900">{s.title}</h3>
                </div>
                <p className="text-[11.5px] text-slate-600">{s.description}</p>
              </div>
            ))}
          </div>
        </OpsPanel>
      </main>

      {/* Incident drawer */}
      {openIncident && (
        <Drawer title={`${openIncident.id} — ${openIncident.title}`} onClose={() => setOpenIncident(null)}>
          <div className="space-y-3 text-[12px] text-slate-700">
            <dl className="grid grid-cols-2 gap-2 text-[11px]">
              <Stat label="Severity" value={openIncident.severity} />
              <Stat label="Phase" value={openIncident.phase} />
              <Stat label="Commander" value={openIncident.commander} />
              <Stat label="Technical owner" value={openIncident.technicalOwner} />
              <Stat label="Customers affected" value={openIncident.customersAffected.toLocaleString()} />
              <Stat label="Estimated restoration" value={openIncident.estimatedRestoration} />
            </dl>
            <Section title="Current hypothesis"><p>{openIncident.hypothesis}</p></Section>
            <Section title="Affected services"><List items={openIncident.affectedServices} /></Section>
            <Section title="Affected links"><List items={openIncident.affectedLinkIds} /></Section>
            <Section title="Affected terminals"><List items={openIncident.affectedTerminalIds} /></Section>
            <Section title="Actions completed"><List items={openIncident.actionsCompleted} /></Section>
            <Section title="Next actions"><List items={openIncident.nextActions} /></Section>
            <Section title="Escalations"><List items={openIncident.escalations.length ? openIncident.escalations : ["No escalations raised"]} /></Section>
            <Section title="Communications"><p>{openIncident.communications}</p></Section>
            <Section title="Incident timeline">
              <ol className="space-y-1">
                {openIncident.timeline.map((e) => (
                  <li key={e.at + e.event} className="flex gap-2">
                    <span className="w-20 shrink-0 text-slate-500">{e.at}</span>
                    <span>{e.event} <span className="text-slate-500">· {e.actor}</span></span>
                  </li>
                ))}
              </ol>
            </Section>
          </div>
        </Drawer>
      )}

      {/* Customer impact drawer */}
      {openImpact && (
        <Drawer title={`${openImpact.customer} — ${openImpact.service}`} onClose={() => setOpenImpact(null)}>
          <dl className="grid grid-cols-2 gap-2 text-[11px]">
            <Stat label="Region" value={openImpact.region} />
            <Stat label="Severity" value={openImpact.severity} />
            <Stat label="State" value={openImpact.state} />
            <Stat label="Duration" value={`${openImpact.durationMinutes} min`} />
            <Stat label="Affected traffic" value={`${openImpact.affectedTrafficGbps} Gbps`} />
            <Stat label="SLA minutes at risk" value={String(openImpact.slaMinutesAtRisk)} />
            <Stat label="Estimated restoration" value={openImpact.estimatedRestoration} />
            <Stat label="Affected links" value={openImpact.linkIds.join(", ")} />
          </dl>
        </Drawer>
      )}
    </div>
  );
}

/* ------------------------------- helpers ------------------------------- */

function FilterSelect({
  label, value, options, onChange,
}: { label: string; value: string; options: readonly string[]; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-0.5 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">
      {label}
      <select
        aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}
        className="rounded border border-slate-200 bg-white px-2 py-1 text-[11.5px] font-normal normal-case tracking-normal text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function MapToggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={cn("rounded border px-2 py-1 text-[11px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        active ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
      {label}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1">
      <dt className="text-[10px] uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-[11.5px] font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      {children}
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return <ul className="list-disc space-y-0.5 pl-4">{items.map((i) => <li key={i}>{i}</li>)}</ul>;
}

function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20" role="dialog" aria-modal="true" aria-label={title}>
      <div className="h-full w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h2 className="text-[14px] font-semibold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close details"
            className="rounded p-1 text-slate-500 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
