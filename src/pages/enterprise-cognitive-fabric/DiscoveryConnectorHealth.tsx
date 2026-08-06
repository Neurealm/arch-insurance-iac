import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

import {
  ActivityDetailDrawer, ActivityPanel, AlertsPanel, AuthenticationPanel, ConnectorDetailDrawer,
  ConnectorInventoryTable, ConnectorMatrixPanel, DiagnosticResultsDrawer, DownstreamImpactPanel,
  ErrorAnalysisPanel, HealthDistributionPanel, IncidentsPanel, PermissionDriftPanel, ThroughputPanel,
  TrendsPanel, connectorsToCsv, download, type Density, type GroupBy,
} from "./connector-health/panels";
import {
  AddConnectorDialog, BulkActionDialog, CreateIncidentDialog, ExportDialog, PauseResumeDialog,
  ReauthorizeDialog, RotateCredentialDialog, RunDiagnosticsDialog,
} from "./connector-health/dialogs";
import {
  authorizationSummary, connectorErrors, credentialRows, credentialWarnings, defaultFilters,
  demoScenarios, dependencyImpacts, kpiTrends, resolveActivity, resolveAlerts, resolveConnectors,
  resolveDrifts, scenarioSnapshots, seedIncidents, throughputRows, timeRanges,
  type ConnectorActivity, type ConnectorAlert, type ConnectorDiagnostic, type ConnectorHealthRecord,
  type ConnectorIncident, type DemoScenario, type PermissionDrift, type TrendMetric, type ViewMode,
} from "./connector-health/data";

function Kpi({ label, value, sub, trend, tone = "slate" }: {
  label: string; value: string; sub: string; trend: number[]; tone?: "green" | "amber" | "red" | "slate";
}) {
  const max = Math.max(...trend, 1);
  const min = Math.min(...trend);
  const points = trend.map((v, i) => `${(i / Math.max(1, trend.length - 1)) * 100},${28 - ((v - min) / Math.max(0.001, max - min)) * 24}`).join(" ");
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
      <p className="text-[10.5px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className={cn(
        "mt-0.5 text-[22px] font-semibold leading-none",
        tone === "green" ? "text-emerald-700" : tone === "amber" ? "text-amber-700" : tone === "red" ? "text-red-700" : "text-slate-900",
      )}>{value}</p>
      <p className="mt-0.5 text-[11px] text-slate-500">{sub}</p>
      <svg viewBox="0 0 100 30" className="mt-1 h-7 w-full" preserveAspectRatio="none" aria-hidden>
        <polyline points={points} fill="none" stroke="#94a3b8" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

const VIEWS: { id: ViewMode; label: string }[] = [
  { id: "executive", label: "Executive" },
  { id: "operations", label: "Operations" },
  { id: "security", label: "Security" },
  { id: "dependency", label: "Dependency" },
];

export default function DiscoveryConnectorHealth() {
  const [view, setView] = useState<ViewMode>("operations");
  const [scenario, setScenario] = useState<DemoScenario>("healthy");
  const [range, setRange] = useState(timeRanges[2] ?? "Last 24 hours");
  const [statusFilter, setStatusFilter] = useState("All");
  const [overrides, setOverrides] = useState<Record<string, Partial<ConnectorHealthRecord>>>({});
  const [extraConnectors, setExtraConnectors] = useState<ConnectorHealthRecord[]>([]);
  const [alertStatuses, setAlertStatuses] = useState<Record<string, ConnectorAlert["status"]>>({});
  const [extraAlerts] = useState<ConnectorAlert[]>([]);
  const [extraActivity, setExtraActivity] = useState<ConnectorActivity[]>([]);
  const [driftStatuses, setDriftStatuses] = useState<Record<string, PermissionDrift["status"]>>({});
  const [incidents, setIncidents] = useState<ConnectorIncident[]>(seedIncidents);

  const [groupBy, setGroupBy] = useState<GroupBy>("Category");
  const [layout, setLayout] = useState<"cards" | "table">("cards");
  const [matrixDensity, setMatrixDensity] = useState<Density>("comfortable");
  const [tableDensity, setTableDensity] = useState<"compact" | "comfortable">("compact");
  const [selected, setSelected] = useState<string[]>([]);
  const [savedViews, setSavedViews] = useState<string[]>([]);
  const [metric, setMetric] = useState<TrendMetric>("Availability");
  const [errorCategory, setErrorCategory] = useState("All");

  const [detail, setDetail] = useState<ConnectorHealthRecord | null>(null);
  const [activity, setActivity] = useState<ConnectorActivity | null>(null);
  const [diagnostic, setDiagnostic] = useState<ConnectorDiagnostic | null>(null);
  const [diagOpen, setDiagOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [reauth, setReauth] = useState<ConnectorHealthRecord | null>(null);
  const [rotate, setRotate] = useState<ConnectorHealthRecord | null>(null);
  const [pause, setPause] = useState<{ c: ConnectorHealthRecord; mode: "Pause" | "Resume" } | null>(null);
  const [incidentFor, setIncidentFor] = useState<ConnectorHealthRecord | null>(null);
  const [bulk, setBulk] = useState<string | null>(null);

  const snap = scenarioSnapshots[scenario];

  const allRows = useMemo(
    () => resolveConnectors(scenario, defaultFilters, overrides, extraConnectors),
    [scenario, overrides, extraConnectors],
  );
  const rows = useMemo(
    () => (statusFilter === "All" ? allRows : allRows.filter((c) => c.healthStatus === statusFilter)),
    [allRows, statusFilter],
  );
  const alerts = useMemo(() => resolveAlerts(scenario, alertStatuses, extraAlerts), [scenario, alertStatuses, extraAlerts]);
  const activities = useMemo(() => resolveActivity(scenario, extraActivity), [scenario, extraActivity]);
  const drifts = useMemo(() => resolveDrifts(scenario, driftStatuses), [scenario, driftStatuses]);

  const logActivity = (action: string, c: ConnectorHealthRecord, result = "Success") =>
    setExtraActivity((prev) => [{
      id: `ACT-${Date.now()}`, connectorId: c.id, connectorName: c.name, action,
      category: "Operator action", description: `${action} performed from the Connector Health workspace.`,
      result, owner: "Current operator", auditId: `AUD-${Math.floor(Math.random() * 9000) + 1000}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    } as ConnectorActivity, ...prev]);

  const handleAction = (action: string, c: ConnectorHealthRecord) => {
    switch (action) {
      case "Open Connector": setDetail(c); return;
      case "Run Diagnostics": setSelected([c.id]); setDiagOpen(true); return;
      case "Reauthorize": setReauth(c); return;
      case "Rotate Simulated Credential": setRotate(c); return;
      case "Pause": setPause({ c, mode: "Pause" }); return;
      case "Resume": setPause({ c, mode: "Resume" }); return;
      case "Create Incident": setIncidentFor(c); return;
      case "Export Connector Report":
        download(`${c.id}-health.csv`, connectorsToCsv([c]), "text/csv");
        toast.success("Connector report exported", { description: `${c.name} health record downloaded.` });
        return;
      case "View Related Sources":
      case "View Downstream Impact":
        document.getElementById("panel-impact")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      default:
        logActivity(action, c);
        toast.success(action, { description: `${action} completed for ${c.name}. No source content was modified.` });
    }
  };

  const resetFilters = () => { setStatusFilter("All"); setSelected([]); toast.info("Filters cleared"); };

  return (
    <div className="space-y-3 p-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[19px] font-semibold text-slate-900">Connector Health</h1>
          <p className="max-w-3xl text-[12.5px] text-slate-600">
            Operational control plane for every connector that discovers and ingests organizational knowledge. Availability,
            authentication, authorization, throughput, error behaviour, and downstream impact in one workspace.
          </p>
          <p className="mt-1 text-[11.5px] text-slate-500">
            Network state: <span className="font-medium text-slate-800">{snap.networkState}</span> · {allRows.length} connectors monitored · {range.toLowerCase()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <div role="group" aria-label="View mode" className="inline-flex overflow-hidden rounded-md border border-slate-200">
            {VIEWS.map((v) => (
              <button
                key={v.id} type="button" aria-pressed={view === v.id} onClick={() => setView(v.id)}
                className={cn("px-2.5 py-1 text-[11.5px]", view === v.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50")}
              >
                {v.label}
              </button>
            ))}
          </div>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="h-8 w-[150px] text-[11.5px]" aria-label="Time range"><SelectValue /></SelectTrigger>
            <SelectContent>{timeRanges.map((r) => <SelectItem key={r} value={r} className="text-[12px]">{r}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={scenario} onValueChange={(v) => setScenario(v as DemoScenario)}>
            <SelectTrigger className="h-8 w-[210px] text-[11.5px]" aria-label="Demo scenario"><SelectValue /></SelectTrigger>
            <SelectContent>{demoScenarios.map((d) => <SelectItem key={d.id} value={d.id} className="text-[12px]">{d.label}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-8 text-[11.5px]" onClick={() => setDiagOpen(true)}>Run Diagnostics</Button>
          <Button size="sm" variant="outline" className="h-8 text-[11.5px]" onClick={() => setExportOpen(true)}>Export</Button>
          <Button size="sm" className="h-8 text-[11.5px]" onClick={() => setAddOpen(true)}>Add Connector</Button>
        </div>
      </header>

      {snap.banner && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900" role="status">{snap.banner}</div>
      )}

      <section aria-label="Connector health indicators" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
        <Kpi label="Connectors monitored" value={String(snap.totalConnectors)} sub="Registered across the fabric" trend={kpiTrends.total} />
        <Kpi label="Healthy connectors" value={String(snap.healthyConnectors)} sub={`${snap.attention} require attention`} trend={kpiTrends.healthy} tone={snap.attention > 0 ? "amber" : "green"} />
        <Kpi label="Requiring attention" value={String(snap.attention)} sub={`${snap.warningCount} warning · ${snap.degradedCount} degraded`} trend={kpiTrends.attention} tone={snap.degradedCount > 0 ? "red" : snap.attention > 0 ? "amber" : "green"} />
        <Kpi label="Authentication validity" value={`${snap.authValidity}%`} sub={`${snap.authValid} valid · ${snap.authExpiring} expiring · ${snap.authFailed} failed`} trend={kpiTrends.auth} tone={snap.authFailed > 0 ? "red" : "green"} />
        <Kpi label="Average availability" value={`${snap.availability}%`} sub="Rolling 24 hours against target" trend={kpiTrends.availability} />
        <Kpi label="Downstream at risk" value={String(snap.downstreamAtRisk)} sub="Sources, personas, and evaluations" trend={kpiTrends.downstream} tone={snap.downstreamAtRisk > 0 ? "amber" : "green"} />
      </section>

      <ConnectorMatrixPanel
        rows={rows} highlightIds={snap.highlightConnectorIds} groupBy={groupBy} onGroupBy={setGroupBy}
        layout={layout} onLayout={setLayout} density={matrixDensity} onDensity={setMatrixDensity}
        spotlight={snap.focusPanel === "panel-matrix"}
        onOpen={setDetail} onAction={handleAction} onEmptyAction={resetFilters}
      />

      <div className="grid gap-3 xl:grid-cols-2">
        <HealthDistributionPanel
          activeStatus={statusFilter}
          onSegment={(s) => setStatusFilter((cur) => (cur === s ? "All" : s))}
          spotlight={snap.focusPanel === "panel-distribution"}
        />
        <TrendsPanel
          metric={metric} onMetric={setMetric} range={range} onRange={setRange}
          degraded={snap.degradedCharts} spotlight={snap.focusPanel === "panel-trends"}
          onPointFilter={() => document.getElementById("panel-inventory")?.scrollIntoView({ behavior: "smooth", block: "start" })}
        />
      </div>

      <ConnectorInventoryTable
        view={view} rows={rows} highlightIds={snap.highlightConnectorIds}
        selected={selected} onSelected={setSelected} onOpen={setDetail}
        onRowAction={handleAction}
        onBulkAction={(action) => setBulk(action)}
        onExport={() => setExportOpen(true)}
        density={tableDensity} onDensity={setTableDensity}
        savedViews={savedViews}
        onSaveView={() => {
          const name = `${view} view ${savedViews.length + 1}`;
          setSavedViews((v) => [...v, name]);
          toast.success("View saved", { description: `${name} is now available from Saved views.` });
        }}
        onLoadView={(name) => toast.info("View loaded", { description: `${name} applied to the inventory.` })}
        filterControls={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-7 w-[150px] text-[11.5px]" aria-label="Filter by health status"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["All", "Healthy", "Warning", "Degraded", "Unauthorized", "Paused", "Maintenance", "Unavailable"].map((s) => (
                <SelectItem key={s} value={s} className="text-[12px]">{s === "All" ? "All statuses" : s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        emptyAction={resetFilters}
        spotlight={snap.focusPanel === "panel-inventory"}
      />

      <AuthenticationPanel
        rows={credentialRows} warnings={credentialWarnings}
        spotlight={snap.focusPanel === "panel-auth"}
        onAction={(action, id) => {
          const c = allRows.find((r) => r.id === id);
          if (!c) return;
          if (action === "Reauthorize") setReauth(c);
          else if (action === "Rotate Simulated Credential") setRotate(c);
          else handleAction(action, c);
        }}
      />

      <PermissionDriftPanel
        drifts={drifts} summary={authorizationSummary}
        spotlight={snap.focusPanel === "panel-drift"}
        onAction={(action, d) => {
          if (action === "Restore Approved Scope") {
            setDriftStatuses((s) => ({ ...s, [d.connectorId]: "Restored" }));
            setOverrides((o) => ({ ...o, [d.connectorId]: { ...o[d.connectorId], authorizationStatus: "Valid", healthStatus: "Healthy", warningCount: 0 } }));
            toast.success("Approved scope restored", { description: `${d.connectorName} now matches its approved permission template.` });
            return;
          }
          if (action === "Acknowledge") setDriftStatuses((s) => ({ ...s, [d.connectorId]: "Acknowledged" }));
          toast.success(action, { description: `${action} recorded for ${d.connectorName}.` });
        }}
      />

      <div className="grid gap-3 xl:grid-cols-2">
        <ThroughputPanel
          rows={throughputRows}
          spotlight={snap.focusPanel === "panel-throughput"}
          onOpen={(id) => setDetail(allRows.find((c) => c.id === id) ?? null)}
        />
        <AlertsPanel
          alerts={alerts} spotlight={snap.focusPanel === "panel-alerts"}
          onAction={(action, a) => {
            const c = allRows.find((r) => r.id === a.connectorId) ?? null;
            if (action === "Acknowledge") setAlertStatuses((s) => ({ ...s, [a.id]: "Acknowledged" }));
            else if (action === "Resolve") setAlertStatuses((s) => ({ ...s, [a.id]: "Resolved" }));
            else if (action === "Snooze") setAlertStatuses((s) => ({ ...s, [a.id]: "Snoozed" }));
            else if (action === "Open Detail" && c) { setDetail(c); return; }
            else if (action === "Create Incident" && c) { setIncidentFor(c); return; }
            else if (action === "Run Diagnostics" && c) { setSelected([c.id]); setDiagOpen(true); return; }
            toast.success(action, { description: `${action} applied to ${a.title}.` });
          }}
        />
      </div>

      <ErrorAnalysisPanel
        activeCategory={errorCategory} onCategory={setErrorCategory} errors={connectorErrors}
        spotlight={snap.focusPanel === "panel-errors"}
        onErrorAction={(action, e) => {
          const c = allRows.find((r) => r.id === e.connectorId);
          if (action === "Open Connector" && c) { setDetail(c); return; }
          if (action === "Create Incident" && c) { setIncidentFor(c); return; }
          toast.success(action, { description: `${action} completed for ${e.errorCode}.` });
        }}
      />

      <DownstreamImpactPanel
        impacts={dependencyImpacts}
        spotlight={snap.focusPanel === "panel-impact"}
        onEntity={(type, name) => toast.info(`${type} selected`, { description: `${name} traced from the connector dependency chain.` })}
      />

      <div className="grid gap-3 xl:grid-cols-2">
        <IncidentsPanel
          incidents={incidents}
          onOpen={(i) => {
            const c = allRows.find((r) => r.id === i.connectorId);
            if (c) setDetail(c);
          }}
        />
        <ActivityPanel activities={activities} onOpen={setActivity} spotlight={snap.focusPanel === "panel-activity"} />
      </div>

      <ConnectorDetailDrawer connector={detail} incidents={incidents} onOpenChange={(v) => !v && setDetail(null)} onAction={handleAction} />
      <ActivityDetailDrawer activity={activity} onOpenChange={(v) => !v && setActivity(null)} />
      <DiagnosticResultsDrawer
        diagnostic={diagnostic}
        onOpenChange={(v) => !v && setDiagnostic(null)}
        onExport={() => {
          if (!diagnostic) return;
          download("connector-diagnostics.json", JSON.stringify(diagnostic, null, 2), "application/json");
          toast.success("Diagnostics exported");
        }}
      />

      <RunDiagnosticsDialog open={diagOpen} onOpenChange={setDiagOpen} selectedIds={selected} onComplete={setDiagnostic} />
      <AddConnectorDialog
        open={addOpen} onOpenChange={setAddOpen} nextIndex={extraConnectors.length}
        onCreated={(c) => setExtraConnectors((prev) => [...prev, c])}
      />
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} rows={rows} selectedIds={selected} />
      <ReauthorizeDialog
        connector={reauth} onOpenChange={(v) => !v && setReauth(null)}
        onConfirm={(id) => {
          setOverrides((o) => ({ ...o, [id]: { ...o[id], authenticationStatus: "Valid", healthStatus: "Healthy", failedAuthAttempts: 0, warningCount: 0 } }));
          const c = allRows.find((r) => r.id === id);
          if (c) logActivity("Reauthorize", c);
        }}
      />
      <RotateCredentialDialog
        connector={rotate} onOpenChange={(v) => !v && setRotate(null)}
        onConfirm={(id) => setOverrides((o) => ({
          ...o,
          [id]: { ...o[id], credentialAge: "0 days", credentialExpiration: "in 90 days", credentialExpiresInDays: 90, authenticationStatus: "Valid" },
        }))}
      />
      {pause && (
        <PauseResumeDialog
          connector={pause.c} mode={pause.mode} onOpenChange={(v) => !v && setPause(null)}
          onConfirm={(id, mode) => setOverrides((o) => ({ ...o, [id]: { ...o[id], healthStatus: mode === "Pause" ? "Paused" : "Healthy" } }))}
        />
      )}
      <CreateIncidentDialog
        connector={incidentFor} onOpenChange={(v) => !v && setIncidentFor(null)}
        onCreate={(p) => {
          const c = allRows.find((r) => r.id === p.connectorId);
          const id = `INC-${5000 + incidents.length + 1}`;
          setIncidents((prev) => [{
            id, connectorId: p.connectorId, connectorName: c?.name ?? p.connectorId, summary: p.summary,
            description: p.description, severity: p.severity, priority: p.priority, status: "Open",
            resolverGroup: p.resolverGroup, createdAt: "just now", mttaMinutes: 0, mttrMinutes: null,
            affectedSources: c?.sourceIds.length ?? 0, affectedPersonas: c?.personaIds.length ?? 0,
          } as ConnectorIncident, ...prev]);
          toast.success("Incident created", { description: `${id} raised for ${c?.name ?? p.connectorId}.` });
        }}
      />
      <BulkActionDialog
        action={bulk} ids={selected} onOpenChange={(v) => !v && setBulk(null)}
        onConfirm={(action, ids) => {
          if (action === "Pause" || action === "Resume") {
            setOverrides((o) => {
              const next = { ...o };
              ids.forEach((id) => { next[id] = { ...next[id], healthStatus: action === "Pause" ? "Paused" : "Healthy" }; });
              return next;
            });
          }
          setSelected([]);
        }}
      />
    </div>
  );
}
