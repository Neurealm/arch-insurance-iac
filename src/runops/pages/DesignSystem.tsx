// RunOps Design System showcase. Hidden route at /runops/design-system —
// accessible only to Platform Engineer and Demo Controller. All components
// are rendered with deterministic sample data so operators can validate
// visual behavior without running a real scenario.

import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useOperations } from "@/runops/state/RunOpsProviders";
import {
  AppShell, Breadcrumbs, ContextBar, EntityHeader, EntityTabs, PageToolbar,
  PrimaryNavigation, RightContextDrawer, ScenarioModeBanner,
  StatusIndicator, SeverityIndicator, RiskIndicator, ConfidenceIndicator,
  AutonomyIndicator, FreshnessIndicator, SourceProvenance,
  MetricCard, MetricTrend, SLOCard, ErrorBudgetCard, ReadinessScore,
  RunbookFitnessScore, Sparkline,
  EmptyState, LoadingState, ErrorState, StaleDataState,
  PermissionDeniedState, ConnectorUnavailableState,
  FilterBar, SearchInput, DataGrid, ColumnSelector, Pagination,
  Timeline, TimelineEvent,
  EntityQuickView, EvidencePanel, EvidenceCitation, ApprovalPanel,
  DecisionCard, RemediationComparison, DigitalWorkerCard, WorkerActivityPanel,
  AuditTrail, BeforeAfterComparison, CommentThread,
  WorkflowCanvas, WorkflowNode, TopologyCanvas, TopologyNode, CausalGraph,
  TelemetryChart, TraceWaterfall, LogTable,
  CommandPalette, NotificationCenter, ConfirmationDialog,
  tones, type StatusTone,
} from "@/runops/components";
import { Button } from "@/components/ui/button";
import { Layers, LayoutGrid } from "lucide-react";

/* ------------------------------ Sample data ---------------------------- */

const SAMPLE_ROWS = [
  { id: "svc-1", name: "Global Order Processing", tier: "Tier 1", health: "degraded" as StatusTone },
  { id: "svc-2", name: "Payments Platform",       tier: "Tier 1", health: "healthy"  as StatusTone },
  { id: "svc-3", name: "Identity Services",       tier: "Tier 1", health: "at-risk"  as StatusTone },
  { id: "svc-4", name: "Fulfillment",             tier: "Tier 2", health: "recovering" as StatusTone },
];

const ALL_TONES: StatusTone[] = [
  "healthy","at-risk","degraded","critical","recovering",
  "success","warning","failure","pending","paused","simulation","connected",
];

function Section({ title, description, children }:{ title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {description && <p className="text-xs text-slate-600">{description}</p>}
      </div>
      <div className="rounded border border-slate-200 bg-white p-3">{children}</div>
    </section>
  );
}

export default function DesignSystem() {
  const { role } = useOperations();
  const allowed = role === "Platform Engineer" || role === "Demo Controller";
  if (!allowed) return <Navigate to="/runops" replace />;

  const [tab, setTab] = useState("indicators");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [visibleCols, setVisibleCols] = useState<Set<string>>(new Set(["name","tier","health"]));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const tabs = [
    { label: "Indicators", value: "indicators" },
    { label: "Metrics",    value: "metrics"    },
    { label: "States",     value: "states"     },
    { label: "Data",       value: "data"       },
    { label: "Panels",     value: "panels"     },
    { label: "Graphs",     value: "graphs"     },
    { label: "Telemetry",  value: "telemetry"  },
    { label: "Dialogs",    value: "dialogs"    },
    { label: "Shell",      value: "shell"      },
  ];

  return (
    <div className="min-h-full bg-slate-50">
      <ScenarioModeBanner mode="demo" stageLabel="Design System preview" />
      <div className="border-b border-slate-200 bg-white px-4 py-2">
        <Breadcrumbs items={[
          { label: "RunOps", href: "/runops" },
          { label: "Platform", href: "/runops/platform" },
          { label: "Design System" },
        ]} />
      </div>
      <EntityHeader
        eyebrow="Internal"
        title="RunOps Component Library"
        subtitle="Reference implementations for every reusable component. Deterministic sample data."
        status={{ tone: "connected", label: "v1" }}
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => setPaletteOpen(true)}>Command palette</Button>
            <Button size="sm" variant="outline" onClick={() => setNotifOpen(true)}>Notifications</Button>
            <Button size="sm" variant="outline" onClick={() => setDrawerOpen(true)}>Open drawer</Button>
          </>
        }
      />
      <EntityTabs tabs={tabs} value={tab} onChange={setTab} />

      <div className="mx-auto max-w-6xl space-y-6 p-4">

        {tab === "indicators" && (
          <>
            <Section title="Status tones" description="Every tone in the shared palette. Text label is always paired with the color glyph.">
              <div className="flex flex-wrap gap-2">
                {ALL_TONES.map((t) => <StatusIndicator key={t} tone={t} />)}
              </div>
            </Section>
            <Section title="Severity, risk, confidence, autonomy">
              <div className="flex flex-wrap gap-2">
                <SeverityIndicator severity="SEV 1" />
                <SeverityIndicator severity="SEV 2" />
                <SeverityIndicator severity="SEV 3" />
                <SeverityIndicator severity="SEV 4" />
                <RiskIndicator risk="Low" />
                <RiskIndicator risk="Medium" />
                <RiskIndicator risk="High" />
                <RiskIndicator risk="Critical" />
                <AutonomyIndicator level="Approval Gated Automation" />
                <AutonomyIndicator level="Supervised Autonomous" />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <ConfidenceIndicator value={92} />
                <ConfidenceIndicator value={68} />
                <ConfidenceIndicator value={41} />
              </div>
            </Section>
            <Section title="Freshness and provenance">
              <div className="flex flex-wrap items-center gap-3">
                <FreshnessIndicator capturedAt={new Date(Date.now() - 12_000).toISOString()} />
                <FreshnessIndicator capturedAt={new Date(Date.now() - 120_000).toISOString()} />
                <SourceProvenance provenance={{ source: "demo" }} />
                <SourceProvenance provenance={{ source: "connected", system: "Prometheus" }} />
                <SourceProvenance provenance={{ source: "cached", system: "SNOW" }} />
                <SourceProvenance provenance={{ source: "manual" }} />
              </div>
            </Section>
          </>
        )}

        {tab === "metrics" && (
          <>
            <Section title="Metric cards">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <MetricCard label="Availability" value="99.82" unit="%" tone="at-risk" trend={{ direction: "down", delta: "-0.17" }} />
                <MetricCard label="p95 latency" value="2,810" unit="ms" tone="degraded" trend={{ direction: "up", delta: "+2.4×" }} hint="target 750ms" />
                <MetricCard label="Active incidents" value={1} tone="critical" hint="SEV 1" />
                <MetricCard label="Automations today" value={42} tone="healthy" trend={{ direction: "up", delta: "+8" }} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded border border-slate-200 bg-white p-2">
                  <div className="text-[11px] text-slate-500">Latency sparkline</div>
                  <Sparkline data={[420,440,510,900,1600,2400,2810,2760,2100,900,610,460]} tone="degraded" />
                </div>
                <div className="rounded border border-slate-200 bg-white p-2">
                  <div className="text-[11px] text-slate-500">Recovery sparkline</div>
                  <Sparkline data={[10,20,30,40,55,60,68,75,82,90,95,97]} tone="healthy" />
                </div>
              </div>
            </Section>
            <Section title="SLO / Error budget / Readiness / Fitness">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                <SLOCard name="Availability 30d" target={99.95} actual={99.82} window="30d" />
                <ErrorBudgetCard name="Availability" remainingPct={28} burnRate={4.7} window="30d" />
                <ReadinessScore score={72} details="6/8 runbooks certified" />
                <RunbookFitnessScore score={87} coverage="4 scenarios" lastCertified="14d ago" />
              </div>
            </Section>
            <Section title="Trends">
              <div className="flex flex-wrap gap-3 text-sm">
                <MetricTrend direction="up" delta="+12%" positiveIs="up" />
                <MetricTrend direction="down" delta="-4%" positiveIs="up" />
                <MetricTrend direction="down" delta="-0.7ms" positiveIs="down" />
                <MetricTrend direction="flat" delta="0" />
              </div>
            </Section>
          </>
        )}

        {tab === "states" && (
          <div className="grid gap-3 md:grid-cols-2">
            <EmptyState title="No incidents in this window" description="Try widening the time range or clearing filters." />
            <LoadingState description="Fetching runbook telemetry…" />
            <ErrorState action={{ label: "Retry", onClick: () => {} }} />
            <StaleDataState action={{ label: "Refresh", onClick: () => {} }} />
            <PermissionDeniedState />
            <ConnectorUnavailableState connectorName="Datadog" action={{ label: "Reconnect", onClick: () => {} }} />
          </div>
        )}

        {tab === "data" && (
          <>
            <Section title="Search + filter bar">
              <FilterBar
                chips={[
                  { key: "env", label: "env: Production", onRemove: () => {} },
                  { key: "tier", label: "tier: Tier 1", onRemove: () => {} },
                ]}
                right={
                  <>
                    <SearchInput value={q} onChange={setQ} className="w-56" />
                    <ColumnSelector
                      columns={[
                        { key: "name",   header: "Name" },
                        { key: "tier",   header: "Tier" },
                        { key: "health", header: "Health" },
                      ]}
                      visible={visibleCols}
                      onChange={setVisibleCols}
                    />
                  </>
                }
              />
            </Section>
            <Section title="DataGrid + pagination">
              <DataGrid
                rows={SAMPLE_ROWS.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()))}
                getRowId={(r) => r.id}
                selection={{ selected, onChange: setSelected }}
                visibleColumns={visibleCols}
                caption="Services"
                columns={[
                  { key: "name", header: "Name",  accessor: (r) => r.name, sort: (r) => r.name },
                  { key: "tier", header: "Tier",  accessor: (r) => r.tier, sort: (r) => r.tier },
                  { key: "health", header: "Health", accessor: (r) => <StatusIndicator tone={r.health} /> },
                ]}
              />
              <div className="mt-2">
                <Pagination page={page} pageSize={10} total={42} onPageChange={setPage} />
              </div>
            </Section>
          </>
        )}

        {tab === "panels" && (
          <div className="grid gap-3 md:grid-cols-2">
            <EntityQuickView
              eyebrow="Service"
              title="Global Order Processing"
              subtitle="Tier 1 · US Central · Production"
              status={{ tone: "degraded" }}
              fields={[
                { label: "Availability", value: "99.82%" },
                { label: "Error budget", value: "28%" },
                { label: "Runbooks",     value: "6" },
                { label: "Owner team",   value: "Order Platform" },
              ]}
              footer="Last incident: 10:14 CT · SEV 1"
            />
            <ApprovalPanel
              approvalId="APR-4471" requestedBy="DW-IC-01" requestedAt="10:23 CT"
              reason="Revert CHG-20391 index and recycle a controlled subset of checkout pods."
              state="Pending" onApprove={() => {}} onDeny={() => {}}
            />
            <EvidencePanel items={[
              { id: "e1", title: "Query plan diff", source: "SQL Primary", snippet: "Cost 4.7× baseline after CHG-20391.", supports: "supports", ref: "trace://12ab" },
              { id: "e2", title: "App CPU nominal", source: "APM", snippet: "Checkout pod CPU within normal range.", supports: "contradicts" },
            ]} />
            <RemediationComparison options={[
              {
                id: "d1", title: "Revert CHG-20391", confidence: 88,
                conclusion: "Restores plan cache to pre-change baseline.",
                supporting: ["Onset aligns with CHG-20391","Query plan cost 4.7× baseline"],
                contradicting: ["Cannot fully rule out app-tier regression without canary"],
                nextActions: ["Approve EXE-8841","Notify DW-COMMS-06"],
              },
              {
                id: "d2", title: "Raise connection pool cap", confidence: 62,
                conclusion: "Bridge mitigation only; underlying regression persists.",
                supporting: ["Immediate relief of saturation"],
                contradicting: ["Likely to reoccur under peak load"],
              },
            ]} />
            <DigitalWorkerCard id="DW-DB-03" name="DW-DB-03" role="Database SRE" status="Recommending" autonomy="AI Recommended" />
            <WorkerActivityPanel entries={[
              { id: "w1", at: "10:19 CT", workerId: "DW-DB-03", message: "Raised hypothesis: query-plan regression" },
              { id: "w2", at: "10:22 CT", workerId: "DW-IC-01", message: "Requested approval for RB-0042" },
            ]} />
            <AuditTrail entries={[
              { id: "a1", at: "10:14 CT", actor: "system",   action: "incident.declared", target: "INC-10482", detail: "SEV 1" },
              { id: "a2", at: "10:23 CT", actor: "DW-IC-01", action: "approval.requested", target: "APR-4471" },
            ]} />
            <BeforeAfterComparison
              before={[{label:"p95",value:"2,810ms"},{label:"Success",value:"91.4%"}]}
              after ={[{label:"p95",value:"460ms"}, {label:"Success",value:"99.7%"}]}
            />
            <CommentThread
              comments={[
                { id: "c1", at: "10:26 CT", author: "sarah.k", body: "Approving — evidence is strong and rollback path is proven." },
                { id: "c2", at: "10:27 CT", author: "DW-IC-01", body: "Executing EXE-8841." },
              ]}
              onSubmit={() => {}}
            />
            <EvidenceCitation evidence={{ id:"x", title:"Runbook step s3", source:"RB-0042", snippet:"Drop and recreate the previous index definition in a controlled window.", ref:"RB-0042#s3", supports:"neutral" }} />
          </div>
        )}

        {tab === "graphs" && (
          <>
            <Section title="Workflow canvas">
              <WorkflowCanvas
                height={200}
                nodes={[
                  { id: "s1", label: "Confirm signature", tone: "success" },
                  { id: "s2", label: "Identify index",     tone: "success" },
                  { id: "s3", label: "Revert index",       tone: "recovering" },
                  { id: "s4", label: "Recycle pods",       tone: "pending" },
                  { id: "s5", label: "Validate journey",   tone: "pending" },
                ]}
                edges={[
                  { source: "s1", target: "s2" }, { source: "s2", target: "s3" },
                  { source: "s3", target: "s4" }, { source: "s4", target: "s5" },
                ]}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <WorkflowNode node={{ id:"a", label:"Diagnose", tone:"healthy" }} />
                <TopologyNode node={{ id:"b", label:"SQL Primary", sublabel:"database", tone:"critical" }} />
              </div>
            </Section>
            <Section title="Topology canvas">
              <TopologyCanvas
                height={260}
                nodes={[
                  { id: "gw",     label: "API Gateway",   tone: "healthy" },
                  { id: "co",     label: "Checkout API",  tone: "degraded" },
                  { id: "or",     label: "Orders API",    tone: "at-risk" },
                  { id: "aks",    label: "AKS Cluster",   tone: "at-risk" },
                  { id: "sql",    label: "SQL Primary",   tone: "critical" },
                  { id: "cache",  label: "Redis",         tone: "healthy" },
                  { id: "queue",  label: "Kafka",         tone: "at-risk" },
                ]}
                edges={[
                  { source: "gw", target: "co" }, { source: "gw", target: "or" },
                  { source: "co", target: "aks" }, { source: "aks", target: "sql" },
                  { source: "aks", target: "cache" }, { source: "or", target: "queue" },
                ]}
              />
            </Section>
            <Section title="Causal graph">
              <CausalGraph
                height={240}
                nodes={[
                  { id: "chg", label: "CHG-20391", sublabel: "index deploy", tone: "warning" },
                  { id: "plan", label: "Query plan regression", tone: "degraded" },
                  { id: "sat",  label: "Pool saturation", tone: "critical" },
                  { id: "lat",  label: "Checkout p95 spike", tone: "critical" },
                  { id: "err",  label: "Transaction failures", tone: "failure" },
                ]}
                edges={[
                  { source: "chg", target: "plan" },
                  { source: "plan", target: "sat" },
                  { source: "sat", target: "lat" },
                  { source: "lat", target: "err", dashed: true },
                ]}
              />
            </Section>
          </>
        )}

        {tab === "telemetry" && (
          <>
            <Section title="Telemetry chart">
              <TelemetryChart
                yUnit="ms"
                series={[
                  { key: "p50", label: "p50", tone: "healthy",
                    points: [{t:"10:00",v:120},{t:"10:05",v:140},{t:"10:10",v:180},{t:"10:15",v:260},{t:"10:20",v:200},{t:"10:25",v:140}] },
                  { key: "p95", label: "p95", tone: "critical",
                    points: [{t:"10:00",v:420},{t:"10:05",v:520},{t:"10:10",v:1600},{t:"10:15",v:2810},{t:"10:20",v:1400},{t:"10:25",v:520}] },
                ]}
              />
            </Section>
            <Section title="Trace waterfall">
              <TraceWaterfall spans={[
                { id: "s1", label: "GET /checkout", service: "gateway",       startMs: 0,    durationMs: 2810, tone: "critical" },
                { id: "s2", label: "checkout.handle", service: "checkout-api", startMs: 20,   durationMs: 2760, tone: "critical" },
                { id: "s3", label: "sql.query",     service: "sql-primary",    startMs: 40,   durationMs: 2680, tone: "critical" },
                { id: "s4", label: "cache.get",     service: "redis",          startMs: 2720, durationMs: 40,   tone: "healthy"  },
              ]} />
            </Section>
            <Section title="Log table">
              <LogTable rows={[
                { id: "l1", at: "10:07:12", level: "warn",  service: "checkout-api", message: "p95 latency threshold exceeded" },
                { id: "l2", at: "10:07:45", level: "error", service: "sql-primary",  message: "connection pool saturation" },
                { id: "l3", at: "10:08:01", level: "info",  service: "gateway",      message: "5xx spike detected" },
              ]} />
            </Section>
          </>
        )}

        {tab === "dialogs" && (
          <Section title="Dialogs & overlays">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setPaletteOpen(true)}>Open command palette</Button>
              <Button size="sm" onClick={() => setNotifOpen(true)}>Open notifications</Button>
              <Button size="sm" onClick={() => setDrawerOpen(true)}>Open right drawer</Button>
              <Button size="sm" variant="destructive" onClick={() => setConfirmOpen(true)}>Open confirmation</Button>
            </div>
          </Section>
        )}

        {tab === "shell" && (
          <>
            <Section title="AppShell + PrimaryNavigation" description="Layout primitive. Preview shown inline; also used to render this page.">
              <div className="h-[280px] overflow-hidden rounded border border-slate-200">
                <AppShell
                  className="min-h-0"
                  sidebar={
                    <aside className="h-full w-[200px] border-r border-slate-200 bg-white">
                      <PrimaryNavigation
                        groups={[
                          { label: "Ops", items: [
                            { label: "Command",    href: "/runops",           icon: LayoutGrid },
                            { label: "Services",   href: "/runops/services",   icon: LayoutGrid },
                            { label: "Runbooks",   href: "/runops/runbooks",   icon: LayoutGrid },
                          ]},
                        ]}
                      />
                    </aside>
                  }
                  topBar={
                    <>
                      <ContextBar>
                        <span>Tenant: <b>Contoso Global</b></span>
                        <span>Env: Production</span>
                        <span>Region: US Central</span>
                      </ContextBar>
                      <PageToolbar
                        left={<Breadcrumbs items={[{label:"RunOps",href:"/runops"},{label:"Services"}]} />}
                        right={<Button size="sm">Create</Button>}
                      />
                    </>
                  }
                >
                  <div className="p-4 text-xs text-slate-600">Page content renders here.</div>
                </AppShell>
              </div>
            </Section>
            <Section title="Timeline">
              <Timeline>
                <TimelineEvent at="10:07 CT" title="Degradation detected" tone="warning" actor="APM" detail="Checkout p95 crossed threshold." />
                <TimelineEvent at="10:14 CT" title="SEV 1 declared"       tone="critical" actor="DW-IC-01" />
                <TimelineEvent at="10:23 CT" title="Approval requested"   tone="pending" actor="DW-IC-01" detail="APR-4471 · RB-0042" />
                <TimelineEvent at="10:26 CT" title="Execution started"    tone="recovering" actor="human.operator" />
                <TimelineEvent at="10:34 CT" title="Incident resolved"    tone="success" actor="DW-IC-01" />
              </Timeline>
            </Section>
            <Section title="ScenarioModeBanner">
              <ScenarioModeBanner mode="demo" stageLabel="Stage 9 — Human approval requested" onOpenController={() => {}} />
            </Section>
          </>
        )}
      </div>

      {/* Overlays */}
      <RightContextDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title="Context" subtitle="Selected entity details">
        <EntityQuickView title="INC-10482" subtitle="Global Order Processing" status={{ tone: "critical", label: "SEV 1" }}
          fields={[{label:"State",value:"Investigating"},{label:"Commander",value:"DW-IC-01"}]} />
      </RightContextDrawer>
      <CommandPalette
        open={paletteOpen} onOpenChange={setPaletteOpen}
        items={[
          { id: "1", label: "Go to Command",  group: "Navigate", onSelect: () => {} },
          { id: "2", label: "Open incident INC-10482", group: "Navigate", onSelect: () => {} },
          { id: "3", label: "Approve APR-4471", group: "Actions", onSelect: () => {} },
        ]}
      />
      <NotificationCenter
        open={notifOpen} onOpenChange={setNotifOpen}
        onMarkAllRead={() => {}}
        notifications={[
          { id: "n1", at: "10:14 CT", tone: "critical", title: "SEV 1 declared", detail: "INC-10482", read: false },
          { id: "n2", at: "10:23 CT", tone: "pending",  title: "Approval requested", detail: "APR-4471", read: false },
          { id: "n3", at: "10:34 CT", tone: "success",  title: "Incident resolved", detail: "INC-10482", read: true },
        ]}
      />
      <ConfirmationDialog
        open={confirmOpen} onOpenChange={setConfirmOpen}
        destructive title="Cancel execution?" description="EXE-8841 will be stopped and its remaining steps skipped."
        confirmLabel="Cancel execution" onConfirm={() => setConfirmOpen(false)}
      />

      {/* Design token legend */}
      <footer className="border-t border-slate-200 bg-white p-4 text-[10px] text-slate-500">
        <div className="mx-auto max-w-6xl">
          Palette registry — {Object.keys(tones).length} tones. All indicators pair color with a text label.
        </div>
      </footer>
    </div>
  );
}
