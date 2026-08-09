import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowRight, BookOpen, Check, ChevronRight, Download, FileClock,
  KeyRound, ListFilter, Play, Plus, RefreshCw, Search, ShieldCheck, X, Network, Boxes,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ACCESS_MODE_LABEL, AWS_ENVIRONMENT_BREAKDOWN, CAPABILITY_IMPACT, CATEGORIES,
  DEFAULT_CAPABILITY_IMPACT, DEMO_STORY, DEPENDENCY_RULES, ENVIRONMENTS, EXPORT_STEPS,
  HEALTH_WEIGHTS, HISTORY_EVENTS, INTEGRATIONS, LOG_EVENTS, MATURITY_LABEL, ONBOARDING_PATTERN,
  RELATIONSHIP_EDGES, SCENARIOS, SECURITY_PRINCIPLES, STATUS_LABEL, STATUS_TOOLTIPS,
  USE_CASE_INTEGRATION_IDS, USE_CASE_REQUIREMENTS, applyScenario, isExecutionBlocked,
  productionReadiness, scenarioNotes,
  type ConnectivityScenario, type Integration, type IntegrationStatus,
} from "./platform/integrationsData";

/* ── primitives ─────────────────────────────────────────────── */

function Panel({ title, right, children, className }: { title?: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-[#E2E8F0] bg-white", className)}>
      {title && (
        <header className="flex items-center justify-between gap-2 border-b border-[#E2E8F0] px-3.5 py-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">{title}</h2>
          {right}
        </header>
      )}
      <div className="p-3.5">{children}</div>
    </section>
  );
}

const STATUS_STYLE: Record<IntegrationStatus, string> = {
  connected: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  degraded: "bg-amber-50 text-amber-700 ring-amber-200",
  not_configured: "bg-amber-50 text-amber-700 ring-amber-200",
  disabled: "bg-slate-100 text-slate-600 ring-slate-200",
  failed: "bg-rose-50 text-rose-700 ring-rose-200",
  testing: "bg-blue-50 text-blue-700 ring-blue-200",
  stale: "bg-amber-50 text-amber-800 ring-amber-200",
  blocked: "bg-rose-50 text-rose-700 ring-rose-200",
};

function StatusPill({ s }: { s: IntegrationStatus }) {
  return (
    <span title={STATUS_TOOLTIPS[s]} className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-[9.5px] font-semibold tracking-wide ring-1 ring-inset", STATUS_STYLE[s])}>
      {STATUS_LABEL[s]}
    </span>
  );
}

function HealthBar({ v }: { v: number }) {
  const tone = v === 0 ? "bg-slate-300" : v >= 90 ? "bg-emerald-500" : v >= 70 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-8 text-right font-mono text-[10.5px] text-slate-700">{v ? `${v}%` : "—"}</span>
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
        <span className={cn("block h-full rounded-full", tone)} style={{ width: `${v}%` }} />
      </span>
    </div>
  );
}

function Drawer({ open, title, subtitle, onClose, children, wide }: { open: boolean; title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30" onClick={onClose}>
      <div
        className={cn("flex h-full w-full flex-col bg-white shadow-xl", wide ? "max-w-[1000px]" : "max-w-[640px]")}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] px-5 py-3">
          <div>
            <h3 className="text-[14px] font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[11.5px] text-slate-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

function KV({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-[minmax(120px,180px)_1fr] gap-x-3 gap-y-1.5 text-[11.5px]">
      {rows.map((r) => (
        <div key={r.label} className="contents">
          <dt className="text-slate-500">{r.label}</dt>
          <dd className="font-medium text-slate-800">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Bullets({ items, tone = "slate" }: { items: string[]; tone?: "slate" | "emerald" | "rose" }) {
  const color = tone === "emerald" ? "text-emerald-600" : tone === "rose" ? "text-rose-600" : "text-slate-400";
  return (
    <ul className="space-y-1 text-[11.5px] text-slate-700">
      {items.map((t) => (
        <li key={t} className="flex gap-1.5">
          <span className={cn("mt-[3px] shrink-0", color)}>{tone === "rose" ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}</span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

const IMPACT_STYLE: Record<string, string> = {
  available: "text-emerald-700 bg-emerald-50",
  degraded: "text-amber-700 bg-amber-50",
  partial: "text-amber-700 bg-amber-50",
  blocked: "text-rose-700 bg-rose-50",
};

/* ── page ───────────────────────────────────────────────────── */

export default function IntegrationsConnectivity() {
  const [scenario, setScenario] = useState<ConnectivityScenario>("normal");
  const [category, setCategory] = useState<string>("All Integrations");
  const [query, setQuery] = useState("");
  const [envFilter, setEnvFilter] = useState<string>("All");
  const [sortKey, setSortKey] = useState<"name" | "health" | "status">("name");
  const [selectedId, setSelectedId] = useState<string>("aws");
  const [detailTab, setDetailTab] = useState("overview");
  const [view, setView] = useState<"inventory" | "map">("inventory");
  const [useCaseMode, setUseCaseMode] = useState(false);
  const [capabilityMode, setCapabilityMode] = useState(false);
  const [ownershipMode, setOwnershipMode] = useState(false);
  const [disabledExecution, setDisabledExecution] = useState<Record<string, boolean>>({});
  const [extraConnections, setExtraConnections] = useState<Integration[]>([]);
  const [schedule, setSchedule] = useState("3 minutes");

  const [drawer, setDrawer] = useState<null | "credentials" | "logs" | "history" | "tests" | "export" | "addConnection" | "disableExec" | "permissions">(null);
  const [testResults, setTestResults] = useState<{ id: string; name: string; passed: number; total: number }[]>([]);
  const [testRunning, setTestRunning] = useState(false);
  const [testScope, setTestScope] = useState("Test All");
  const [exportStep, setExportStep] = useState(-1);
  const [disableReason, setDisableReason] = useState("");
  const [story, setStory] = useState(-1);
  const [newConn, setNewConn] = useState({ name: "", category: "Cloud & Infrastructure", type: "REST API" });

  const base = useMemo(() => [...INTEGRATIONS, ...extraConnections], [extraConnections]);
  const integrations = useMemo(() => applyScenario(base, scenario, disabledExecution), [base, scenario, disabledExecution]);
  const scenarioDef = SCENARIOS.find((s) => s.id === scenario)!;

  const filtered = useMemo(() => {
    let list = integrations;
    if (category !== "All Integrations") list = list.filter((i) => i.category === category);
    if (envFilter !== "All") list = list.filter((i) => i.environments.includes(envFilter));
    if (useCaseMode) list = list.filter((i) => USE_CASE_INTEGRATION_IDS.includes(i.id));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((i) => [i.name, i.purpose, i.connectionType, i.domain, i.category].join(" ").toLowerCase().includes(q));
    }
    const order: IntegrationStatus[] = ["failed", "blocked", "stale", "degraded", "not_configured", "disabled", "testing", "connected"];
    return [...list].sort((a, b) => {
      if (sortKey === "health") return b.health - a.health;
      if (sortKey === "status") return order.indexOf(a.status) - order.indexOf(b.status);
      return a.name.localeCompare(b.name);
    });
  }, [integrations, category, envFilter, useCaseMode, query, sortKey]);

  const selected = integrations.find((i) => i.id === selectedId) ?? filtered[0] ?? integrations[0];

  const counts = useMemo(() => {
    const connected = integrations.filter((i) => i.status === "connected").length;
    const notConfigured = integrations.filter((i) => i.status === "not_configured").length;
    const inactive = integrations.filter((i) => i.status === "disabled").length;
    const problem = integrations.filter((i) => ["failed", "blocked", "degraded", "stale"].includes(i.status)).length;
    const configured = integrations.filter((i) => i.status !== "not_configured");
    const healthScore = configured.length
      ? Math.round(configured.reduce((s, i) => s + i.health, 0) / configured.length)
      : 0;
    const healthy = integrations.filter((i) => i.health >= 90).length;
    const warning = integrations.filter((i) => i.health >= 70 && i.health < 90).length;
    const unhealthy = integrations.filter((i) => i.health > 0 && i.health < 70).length;
    return { total: integrations.length, connected, notConfigured, inactive, problem, healthScore, healthy, warning, unhealthy };
  }, [integrations]);

  const requirements = useMemo(
    () =>
      USE_CASE_REQUIREMENTS.map((r) => {
        const i = integrations.find((x) => x.id === r.integrationId)!;
        const blocked = r.kind === "execution" ? isExecutionBlocked(i, scenario, disabledExecution) : false;
        const bad = ["failed", "not_configured", "disabled"].includes(i.status);
        const state: "PASS" | "FAIL" | "BLOCKED" = bad ? "FAIL" : blocked ? "BLOCKED" : "PASS";
        return { ...r, integration: i, state };
      }),
    [integrations, scenario, disabledExecution],
  );
  const readinessOverall = requirements.every((r) => r.state === "PASS") ? "READY" : "NOT READY";
  const requiredAvailable = USE_CASE_INTEGRATION_IDS.filter((id) => {
    const i = integrations.find((x) => x.id === id)!;
    return !["failed", "not_configured", "disabled", "blocked"].includes(i.status);
  }).length;

  const impact = CAPABILITY_IMPACT[selected?.id ?? ""] ?? DEFAULT_CAPABILITY_IMPACT;
  const readiness = selected ? productionReadiness(selected, scenario, disabledExecution) : null;
  const notes = selected ? scenarioNotes(scenario, selected.id) : [];

  function runTests() {
    setDrawer("tests");
    setTestRunning(true);
    setTestResults([]);
    const targets = (testScope === "Test Selected" && selected ? [selected] : integrations.filter((i) => i.status !== "not_configured")).slice(0, 12);
    targets.forEach((t, idx) => {
      setTimeout(() => {
        const failing = ["failed", "blocked"].includes(t.status);
        const degraded = ["degraded", "stale"].includes(t.status);
        const passed = failing ? Math.max(0, t.testCount - 3) : degraded ? t.testCount - 1 : t.testCount;
        setTestResults((r) => [...r, { id: t.id, name: t.name, passed, total: t.testCount }]);
        if (idx === targets.length - 1) setTestRunning(false);
      }, 260 * (idx + 1));
    });
  }

  function runExport() {
    setDrawer("export");
    setExportStep(0);
    EXPORT_STEPS.forEach((_, idx) => setTimeout(() => setExportStep(idx), 420 * (idx + 1)));
  }

  function applyStory(step: number) {
    setStory(step);
    if (step === 2) { setSelectedId("aws"); setDetailTab("overview"); }
    if (step === 3) { setSelectedId("aws"); setDetailTab("identity"); }
    if (step === 4) { setUseCaseMode(true); }
    if (step === 5) { setTestScope("Test All"); runTests(); }
    if (step === 6) { setScenario("sql_auth_failure"); setSelectedId("sqlserver"); setDetailTab("overview"); }
    if (step === 7) { setScenario("normal"); }
    if (step === 8) { setUseCaseMode(true); }
  }

  return (
    <div className="px-5 py-4">
      {/* header */}
      <nav className="mb-1.5 flex items-center gap-1.5 text-[11.5px] text-slate-500">
        <span>Platform Administration</span>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-slate-700">Integrations &amp; Connectivity</span>
      </nav>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-semibold text-slate-900">Integrations &amp; Connectivity</h1>
            <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700">Customer Hosted</span>
          </div>
          <p className="mt-0.5 text-[12.5px] text-slate-600">
            Manage connections to infrastructure, enterprise systems, and services used by Intelligent IaC.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value as ConnectivityScenario)}
            aria-label="Connectivity scenario"
            className="h-8 rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px] font-medium text-slate-700 outline-none"
          >
            {SCENARIOS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <button onClick={() => applyStory(0)} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50">
            <Play className="h-3.5 w-3.5" /> Demo Story
          </button>
          <button onClick={() => setDrawer("addConnection")} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#1B4F91] px-3 text-[12px] font-semibold text-white hover:bg-[#173f74]">
            <Plus className="h-3.5 w-3.5" /> Add Connection
          </button>
        </div>
      </div>

      {/* demo story bar */}
      {story >= 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-[#CFE0F3] bg-[#EFF4FB] px-3.5 py-2.5">
          <span className="rounded bg-[#1B4F91] px-1.5 py-0.5 text-[10px] font-semibold text-white">STEP {story + 1} / {DEMO_STORY.length}</span>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-semibold text-slate-900">{DEMO_STORY[story].title}</div>
            <div className="text-[11.5px] text-slate-700">{DEMO_STORY[story].message}</div>
          </div>
          <div className="flex items-center gap-1.5">
            <button disabled={story === 0} onClick={() => applyStory(story - 1)} className="h-7 rounded border border-[#CFE0F3] bg-white px-2 text-[11.5px] font-medium text-slate-700 disabled:opacity-40">Previous</button>
            <button disabled={story === DEMO_STORY.length - 1} onClick={() => applyStory(story + 1)} className="h-7 rounded bg-[#1B4F91] px-2.5 text-[11.5px] font-semibold text-white disabled:opacity-40">Next</button>
            <button onClick={() => setStory(-1)} className="h-7 rounded border border-[#CFE0F3] bg-white px-2 text-[11.5px] text-slate-600">Exit Story</button>
          </div>
        </div>
      )}

      {/* scenario banner */}
      {scenarioDef.headline && (
        <div className={cn(
          "mt-3 flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5",
          scenarioDef.severity === "critical" ? "border-rose-200 bg-rose-50" : "border-amber-200 bg-amber-50",
        )}>
          <AlertTriangle className={cn("mt-0.5 h-4 w-4 shrink-0", scenarioDef.severity === "critical" ? "text-rose-600" : "text-amber-600")} />
          <div>
            <div className={cn("text-[12px] font-bold tracking-wide", scenarioDef.severity === "critical" ? "text-rose-800" : "text-amber-800")}>{scenarioDef.headline}</div>
            <div className="text-[11.5px] text-slate-700">{scenarioDef.reason}</div>
            {scenarioDef.impact.length > 0 && (
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-slate-700">
                {scenarioDef.impact.map((t) => <li key={t}>{t}</li>)}
              </ul>
            )}
            {scenarioDef.recommended.length > 0 && (
              <div className="mt-1.5 text-[11px] text-slate-700">
                <span className="font-semibold">Recommended: </span>{scenarioDef.recommended.join(" · ")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* main grid */}
      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_296px]">
        <div className="min-w-0 space-y-3">
          {/* tabs + controls */}
          <div className="rounded-lg border border-[#E2E8F0] bg-white">
            <div className="flex flex-wrap items-center gap-1 border-b border-[#E2E8F0] px-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "border-b-2 px-3 py-2 text-[12px] transition-colors",
                    category === c ? "border-[#1B4F91] font-semibold text-[#1B4F91]" : "border-transparent text-slate-600 hover:text-slate-900",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* summary */}
            <div className="grid grid-cols-2 gap-3 p-3 md:grid-cols-5">
              {[
                { l: "Total Integrations", v: counts.total, sub: `Configured · ${counts.total - counts.notConfigured}` },
                { l: "Connected", v: counts.connected, sub: `${Math.round((counts.connected / counts.total) * 100)}%`, tone: "text-emerald-600" },
                { l: "Not Configured", v: counts.notConfigured, sub: `${Math.round((counts.notConfigured / counts.total) * 100)}%`, tone: "text-amber-600" },
                { l: "Degraded / Failed", v: counts.problem, sub: `${Math.round((counts.problem / counts.total) * 100)}%`, tone: counts.problem ? "text-rose-600" : "text-slate-900" },
                { l: "Health Score", v: `${counts.healthScore}%`, sub: counts.healthScore >= 90 ? "Excellent" : counts.healthScore >= 75 ? "Acceptable" : "Attention required", tone: counts.healthScore >= 90 ? "text-emerald-600" : "text-amber-600" },
              ].map((s) => (
                <div key={s.l} className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2">
                  <div className="text-[10.5px] text-slate-500">{s.l}</div>
                  <div className={cn("mt-0.5 text-[22px] font-bold leading-tight", s.tone ?? "text-slate-900")}>{s.v}</div>
                  <div className="text-[10.5px] text-slate-500">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* filters */}
            <div className="flex flex-wrap items-center gap-2 border-t border-[#E2E8F0] px-3 py-2">
              <label className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search connectors..."
                  className="h-7 w-[210px] rounded border border-[#E2E8F0] bg-[#F8FAFC] pl-7 pr-2 text-[11.5px] outline-none focus:bg-white"
                />
              </label>
              <select value={envFilter} onChange={(e) => setEnvFilter(e.target.value)} aria-label="Environment scope" className="h-7 rounded border border-[#E2E8F0] bg-white px-2 text-[11.5px] text-slate-700">
                <option value="All">All Environments</option>
                {ENVIRONMENTS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
              <select value={sortKey} onChange={(e) => setSortKey(e.target.value as typeof sortKey)} aria-label="Sort" className="h-7 rounded border border-[#E2E8F0] bg-white px-2 text-[11.5px] text-slate-700">
                <option value="name">Sort: Name</option>
                <option value="health">Sort: Health</option>
                <option value="status">Sort: Status</option>
              </select>

              <div className="ml-auto flex flex-wrap items-center gap-1.5">
                {[
                  { l: "Show SQL/EBS Use Case Dependencies", on: useCaseMode, set: setUseCaseMode },
                  { l: "Show Capability Impact", on: capabilityMode, set: setCapabilityMode },
                  { l: "Show Ownership", on: ownershipMode, set: setOwnershipMode },
                ].map((t) => (
                  <button
                    key={t.l}
                    onClick={() => t.set(!t.on)}
                    aria-pressed={t.on}
                    className={cn("h-7 rounded border px-2 text-[11px] font-medium", t.on ? "border-[#1B4F91] bg-[#EFF4FB] text-[#1B4F91]" : "border-[#E2E8F0] bg-white text-slate-600 hover:bg-slate-50")}
                  >
                    {t.l}
                  </button>
                ))}
                <div className="flex overflow-hidden rounded border border-[#E2E8F0]">
                  {(["inventory", "map"] as const).map((v) => (
                    <button key={v} onClick={() => setView(v)} className={cn("h-7 px-2 text-[11px] font-medium capitalize", view === v ? "bg-[#1B4F91] text-white" : "bg-white text-slate-600")}>
                      {v === "inventory" ? <span className="inline-flex items-center gap-1"><Boxes className="h-3 w-3" />Inventory</span> : <span className="inline-flex items-center gap-1"><Network className="h-3 w-3" />Relationship Map</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {useCaseMode && (
              <div className="flex flex-wrap items-center gap-2 border-t border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[11.5px]">
                <span className={cn("rounded px-1.5 py-0.5 text-[10.5px] font-bold", requiredAvailable === USE_CASE_INTEGRATION_IDS.length ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800")}>
                  {requiredAvailable} / {USE_CASE_INTEGRATION_IDS.length} REQUIRED INTEGRATIONS AVAILABLE
                </span>
                <span className="text-slate-600">Filtered to integrations required by change package CP-2026-01842.</span>
              </div>
            )}

            {/* inventory or map */}
            {view === "inventory" ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-[11.5px]">
                  <thead>
                    <tr className="border-y border-[#E2E8F0] bg-[#F8FAFC] text-left text-[10.5px] uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2 font-semibold">Name</th>
                      <th className="px-3 py-2 font-semibold">Category</th>
                      <th className="px-3 py-2 font-semibold">Purpose</th>
                      <th className="px-3 py-2 font-semibold">Connection Type</th>
                      <th className="px-3 py-2 font-semibold">Access</th>
                      <th className="px-3 py-2 font-semibold">Status</th>
                      <th className="px-3 py-2 font-semibold">Last Activity</th>
                      <th className="px-3 py-2 font-semibold">Health</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((i) => (
                      <tr
                        key={i.id}
                        onClick={() => setSelectedId(i.id)}
                        className={cn("cursor-pointer border-b border-[#EEF2F6] hover:bg-slate-50", selectedId === i.id && "bg-[#EFF4FB] hover:bg-[#EFF4FB]")}
                      >
                        <td className="px-3 py-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900">{i.name}</span>
                            {ownershipMode && <span className="rounded bg-slate-100 px-1 py-px text-[9px] font-semibold text-slate-600">{i.ownership}</span>}
                            {i.maturity !== "available" && <span className="rounded border border-slate-200 px-1 py-px text-[9px] text-slate-500">{MATURITY_LABEL[i.maturity]}</span>}
                          </div>
                          {useCaseMode && i.useCaseRole && <div className="mt-0.5 text-[10.5px] text-slate-500">{i.useCaseRole}</div>}
                        </td>
                        <td className="px-3 py-1.5 text-slate-600">{i.domain}</td>
                        <td className="px-3 py-1.5 text-slate-600">{i.purpose}</td>
                        <td className="px-3 py-1.5 text-slate-600">{i.connectionType}</td>
                        <td className="px-3 py-1.5 text-slate-600">{ACCESS_MODE_LABEL[i.accessMode]}</td>
                        <td className="px-3 py-1.5"><StatusPill s={i.status} /></td>
                        <td className="px-3 py-1.5 font-mono text-[10.5px] text-slate-600">{i.lastActivity}</td>
                        <td className="px-3 py-1.5"><HealthBar v={i.health} /></td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={8} className="px-3 py-6 text-center text-slate-500">No integrations match the current filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3.5">
                <div className="grid grid-cols-3 gap-2 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">
                  <div>Integration</div><div>Intelligent IaC Capability</div><div>Infrastructure Domain</div>
                </div>
                <div className="mt-1.5 space-y-1.5">
                  {RELATIONSHIP_EDGES.map((e, idx) => (
                    <div key={idx} className="grid grid-cols-3 items-center gap-2">
                      <div className="rounded border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1.5 text-[11.5px] font-medium text-slate-800">{e.integration}</div>
                      <div className="relative rounded border border-[#CFE0F3] bg-[#EFF4FB] px-2.5 py-1.5 text-[11.5px] text-[#1B4F91]">
                        <ArrowRight className="absolute -left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-300" />
                        {e.capability}
                      </div>
                      <div className="relative rounded border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-[11.5px] text-slate-700">
                        <ArrowRight className="absolute -left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-300" />
                        {e.domain}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* detail */}
          {selected && (
            <Panel
              title={`Integration Detail: ${selected.name}`}
              right={
                <div className="flex items-center gap-1.5">
                  <button onClick={() => { setTestScope("Test Selected"); runTests(); }} className="inline-flex h-7 items-center gap-1 rounded border border-[#E2E8F0] px-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">
                    <RefreshCw className="h-3 w-3" /> Test Connection
                  </button>
                  <button onClick={() => setDrawer("permissions")} className="h-7 rounded border border-[#E2E8F0] px-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">Discovery vs Execution</button>
                  {selected.executionCapable && (
                    <button onClick={() => setDrawer("disableExec")} className="h-7 rounded border border-[#E2E8F0] px-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">Execution Enablement</button>
                  )}
                </div>
              }
            >
              <div className="mb-3 flex flex-wrap gap-1">
                {[
                  ["overview", "Overview"], ["permissions", "Permissions"], ["identity", "Identity & Security"],
                  ["scope", "Scope"], ["health", "Health"], ["dependencies", "Dependencies"], ["owners", "Ownership"],
                ].map(([k, l]) => (
                  <button key={k} onClick={() => setDetailTab(k)} className={cn("h-7 rounded px-2.5 text-[11.5px]", detailTab === k ? "bg-[#1B4F91] font-semibold text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200")}>{l}</button>
                ))}
              </div>

              {notes.length > 0 && (
                <div className="mb-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-[11.5px] text-amber-900">
                  <ul className="list-disc space-y-0.5 pl-4">{notes.map((n) => <li key={n}>{n}</li>)}</ul>
                </div>
              )}

              {detailTab === "overview" && (
                <div className="grid gap-4 md:grid-cols-3">
                  <KV rows={[
                    { label: "Status", value: <StatusPill s={selected.status} /> },
                    { label: "Connection Type", value: selected.connectionType },
                    { label: "Access Mode", value: ACCESS_MODE_LABEL[selected.accessMode] },
                    { label: "Maturity", value: MATURITY_LABEL[selected.maturity] },
                    { label: "Last Sync", value: selected.lastActivity },
                    { label: "Next Scheduled Sync", value: schedule },
                  ]} />
                  <div>
                    <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Capabilities</div>
                    <Bullets items={selected.capabilities} tone="emerald" />
                  </div>
                  <div>
                    <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Production Readiness</div>
                    {readiness && (
                      <>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11.5px]">
                          {readiness.rows.map((r) => (
                            <div key={r.label} className="flex items-center justify-between gap-2">
                              <span className="text-slate-600">{r.label}</span>
                              <span className={cn("font-semibold", r.pass ? "text-emerald-600" : "text-rose-600")}>{r.pass ? "PASS" : "FAIL"}</span>
                            </div>
                          ))}
                        </div>
                        <div className={cn("mt-2 rounded px-2 py-1 text-center text-[11px] font-bold", readiness.overall === "READY" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
                          Overall: {readiness.overall}
                        </div>
                        {readiness.overall === "NOT READY" && (
                          <p className="mt-1 text-[10.5px] text-rose-700">Production mutation through this integration is blocked.</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {detailTab === "permissions" && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Discovery (Read-Only)</div>
                    <Bullets items={selected.discoveryPerms} tone="emerald" />
                  </div>
                  <div>
                    <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Execution (Scoped)</div>
                    {selected.executionPerms.length ? <Bullets items={selected.executionPerms} tone="emerald" /> : <p className="text-[11.5px] text-slate-500">No execution permissions — read-only integration.</p>}
                  </div>
                  <div>
                    <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Prohibited by Default</div>
                    <Bullets items={selected.excluded} tone="rose" />
                  </div>
                </div>
              )}

              {detailTab === "identity" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <KV rows={[
                    { label: "Discovery Identity", value: selected.discoveryIdentity },
                    { label: "Execution Identity", value: selected.executionIdentity ?? "None" },
                    { label: "Credential Source", value: selected.credentialSource },
                    { label: "Expiration", value: selected.expiration },
                    { label: "Rotation Status", value: selected.rotation },
                    { label: "Last Validation", value: selected.lastValidation },
                    { label: "Secret Value", value: "Never displayed" },
                  ]} />
                  <div className="rounded border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                    <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Security Posture</div>
                    <Bullets items={[
                      "Least privilege",
                      "Read and execution identities separated",
                      "Credentials resolved at execution time",
                      "No standing production credentials held by agents",
                      "No credential material in model context",
                    ]} tone="emerald" />
                  </div>
                </div>
              )}

              {detailTab === "scope" && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Authorized Resource Scope</div>
                    <KV rows={selected.scope.map((s) => ({ label: s.label, value: s.value }))} />
                  </div>
                  <div>
                    <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Environment Scope</div>
                    {selected.id === "aws" ? (
                      <table className="w-full text-[11.5px]">
                        <tbody>
                          {AWS_ENVIRONMENT_BREAKDOWN.map((e) => (
                            <tr key={e.label} className="border-b border-[#EEF2F6]">
                              <td className="py-1 text-slate-600">{e.label}</td>
                              <td className="py-1 font-medium text-slate-800">{e.value}</td>
                              <td className="py-1 text-right text-slate-500">{e.authority}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-[11.5px] text-slate-700">{selected.environments.join(" · ")}</p>
                    )}
                  </div>
                  <div>
                    <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Example Assets</div>
                    <div className="flex flex-wrap gap-1">
                      {selected.assets.map((a) => <span key={a} className="rounded border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 py-0.5 text-[10.5px] text-slate-700">{a}</span>)}
                    </div>
                  </div>
                </div>
              )}

              {detailTab === "health" && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Current Health</div>
                    <div className="text-[30px] font-bold text-slate-900">{selected.health || "—"}{selected.health ? "%" : ""}</div>
                    <HealthBar v={selected.health} />
                    <p className="mt-2 text-[11px] text-slate-600">Scored against the integration's intended operating mode. Discovery-only connections are not penalized for absent execution trust.</p>
                  </div>
                  <div>
                    <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Scoring Weights</div>
                    <KV rows={HEALTH_WEIGHTS.map((h) => ({ label: h.label, value: h.weight }))} />
                  </div>
                  <div>
                    <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Freshness</div>
                    <KV rows={[
                      { label: "State", value: selected.status === "stale" ? "Stale" : "Current" },
                      { label: "Last Known State", value: "Available" },
                      { label: "Confidence", value: selected.status === "stale" ? "Degraded" : "High" },
                      { label: "Digital Twin Retention", value: "Discovered objects are never deleted on failure" },
                    ]} />
                  </div>
                </div>
              )}

              {detailTab === "dependencies" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Depends On</div>
                    {selected.dependencies.length ? (
                      <Bullets items={selected.dependencies.map((d) => integrations.find((x) => x.id === d)?.name ?? d)} />
                    ) : <p className="text-[11.5px] text-slate-500">No upstream integration dependencies.</p>}
                    <div className="mt-3 mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Connectivity Dependency Rules</div>
                    <ul className="list-disc space-y-0.5 pl-4 text-[11px] text-slate-700">{DEPENDENCY_RULES.map((r) => <li key={r}>{r}</li>)}</ul>
                  </div>
                  <div>
                    <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Capability Impact if this integration fails</div>
                    <div className="space-y-1">
                      {impact.map((c) => (
                        <div key={c.capability} className="flex items-center justify-between rounded border border-[#EEF2F6] px-2 py-1 text-[11.5px]">
                          <span className="text-slate-700">{c.capability}</span>
                          <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold capitalize", IMPACT_STYLE[c.state])}>{c.state}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {detailTab === "owners" && (
                <KV rows={[
                  { label: "Business Owner", value: selected.businessOwner },
                  { label: "Technical Owner", value: selected.technicalOwner },
                  { label: "Support Group", value: selected.supportGroup },
                  { label: "Ownership Class", value: selected.ownership },
                  { label: "Environments", value: selected.environments.join(", ") },
                  { label: "Discovery Schedule", value: schedule },
                ]} />
              )}
            </Panel>
          )}

          {capabilityMode && selected && (
            <Panel title={`Capability Impact — ${selected.name}`}>
              <div className="grid gap-2 sm:grid-cols-3">
                {impact.map((c) => (
                  <div key={c.capability} className={cn("rounded border px-2.5 py-2", c.state === "blocked" ? "border-rose-200" : c.state === "available" ? "border-emerald-200" : "border-amber-200")}>
                    <div className="text-[11.5px] font-medium text-slate-800">{c.capability}</div>
                    <div className={cn("mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold capitalize", IMPACT_STYLE[c.state])}>{c.state}</div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {useCaseMode && (
            <Panel title="SQL/EBS Use Case Connectivity Readiness" right={<span className={cn("rounded px-2 py-0.5 text-[10.5px] font-bold", readinessOverall === "READY" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800")}>Overall: {readinessOverall}</span>}>
              <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {requirements.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded border border-[#EEF2F6] px-2.5 py-1.5 text-[11.5px]">
                    <span className="text-slate-700">{r.label}</span>
                    <span className={cn("font-semibold", r.state === "PASS" ? "text-emerald-600" : r.state === "BLOCKED" ? "text-amber-600" : "text-rose-600")}>{r.state}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-1.5 md:grid-cols-2">
                {integrations.filter((i) => USE_CASE_INTEGRATION_IDS.includes(i.id) && i.useCaseRole).map((i) => (
                  <div key={i.id} className="rounded border border-[#EEF2F6] bg-[#F8FAFC] px-2.5 py-1.5 text-[11px]">
                    <span className="font-semibold text-slate-800">{i.name}</span>
                    <span className="text-slate-600"> — {i.useCaseRole}</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          <Panel title="Recommended Onboarding Pattern">
            <ol className="grid gap-1 text-[11.5px] text-slate-700 sm:grid-cols-2 lg:grid-cols-5">
              {ONBOARDING_PATTERN.map((s, idx) => (
                <li key={s} className="rounded border border-[#EEF2F6] bg-[#F8FAFC] px-2 py-1.5">
                  <span className="mr-1 font-mono text-[10px] text-slate-400">{String(idx + 1).padStart(2, "0")}</span>{s}
                </li>
              ))}
            </ol>
          </Panel>

          <details className="rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2.5">
            <summary className="cursor-pointer text-[11.5px] font-semibold text-slate-800">Connection Security Principles</summary>
            <div className="mt-2 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {SECURITY_PRINCIPLES.map((p) => (
                <div key={p} className="flex items-start gap-1.5 text-[11.5px] text-slate-700">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />{p}
                </div>
              ))}
            </div>
          </details>
        </div>

        {/* right rail */}
        <aside className="space-y-3">
          <Panel title="Integration Health Overview">
            <div className="flex items-center gap-4">
              <div className="relative grid h-[92px] w-[92px] place-items-center rounded-full"
                style={{ background: `conic-gradient(#16a34a 0 ${counts.healthScore}%, #E2E8F0 ${counts.healthScore}% 100%)` }}>
                <div className="grid h-[70px] w-[70px] place-items-center rounded-full bg-white">
                  <span className="text-[17px] font-bold text-slate-900">{counts.healthScore}%</span>
                </div>
              </div>
              <ul className="space-y-1 text-[11.5px]">
                <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /><b>{counts.healthy}</b> Healthy <span className="text-slate-500">(≥ 90%)</span></li>
                <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /><b>{counts.warning}</b> Warning <span className="text-slate-500">(70–90%)</span></li>
                <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /><b>{counts.unhealthy}</b> Unhealthy <span className="text-slate-500">(&lt; 70%)</span></li>
              </ul>
            </div>
          </Panel>

          <Panel title="Last Discovery Activity">
            <ul className="space-y-1.5 text-[11.5px]">
              {integrations.filter((i) => i.lastActivity !== "—").slice(0, 6).map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-2">
                  <span className="truncate text-slate-700">{i.name}</span>
                  <span className="shrink-0 font-mono text-[10.5px] text-slate-500">{i.lastActivity}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center justify-between border-t border-[#EEF2F6] pt-2 text-[11.5px]">
              <span className="text-slate-600">Discovery schedule</span>
              <select value={schedule} onChange={(e) => setSchedule(e.target.value)} aria-label="Discovery schedule" className="h-7 rounded border border-[#E2E8F0] bg-white px-1.5 text-[11px] text-slate-700">
                {["3 minutes", "15 minutes", "1 hour", "6 hours", "Daily"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </Panel>

          <Panel title="Quick Actions">
            <div className="space-y-1.5">
              <select value={testScope} onChange={(e) => setTestScope(e.target.value)} aria-label="Test scope" className="h-8 w-full rounded border border-[#E2E8F0] bg-white px-2 text-[11.5px] text-slate-700">
                {["Test All", "Test Selected", "Test Discovery Only", "Test Execution Trust", "Test Telemetry"].map((s) => <option key={s}>{s}</option>)}
              </select>
              {[
                { l: "Run Connectivity Tests", icon: Activity, fn: runTests },
                { l: "View Credential Status", icon: KeyRound, fn: () => setDrawer("credentials") },
                { l: "View Integration Logs", icon: ListFilter, fn: () => setDrawer("logs") },
                { l: "Configuration History", icon: FileClock, fn: () => setDrawer("history") },
                { l: "Export Integration Report", icon: Download, fn: runExport },
              ].map((a) => (
                <button key={a.l} onClick={a.fn} className="flex h-8 w-full items-center gap-2 rounded border border-[#E2E8F0] bg-white px-2.5 text-[11.5px] font-medium text-slate-700 hover:bg-slate-50">
                  <a.icon className="h-3.5 w-3.5 text-[#1B4F91]" />{a.l}
                </button>
              ))}
            </div>
            <p className="mt-2 rounded bg-[#F8FAFC] px-2 py-1.5 text-[10.5px] text-slate-600">
              No infrastructure mutations performed during connectivity testing.
            </p>
          </Panel>

          <Panel title="Connectivity Status">
            <div className="flex items-start gap-2">
              <Activity className={cn("mt-0.5 h-4 w-4", scenarioDef.severity === "normal" ? "text-emerald-600" : scenarioDef.severity === "critical" ? "text-rose-600" : "text-amber-600")} />
              <div className="text-[11.5px]">
                <div className="font-semibold text-slate-900">{scenarioDef.label}</div>
                <div className="text-slate-500">Last check: 12:59:41 PM</div>
              </div>
            </div>
            <button onClick={() => setScenario("normal")} className="mt-2 h-7 w-full rounded border border-[#E2E8F0] text-[11px] font-medium text-slate-700 hover:bg-slate-50">
              Restore All Systems Operational
            </button>
          </Panel>

          <Panel title="Related">
            <div className="space-y-1 text-[11.5px]">
              <a href="/intelligent-iac/platform/deployment-architecture" className="flex items-center gap-1.5 text-[#1B4F91] hover:underline"><BookOpen className="h-3.5 w-3.5" />Customer Deployment Architecture</a>
              <a href="/intelligent-iac/platform/access-security" className="flex items-center gap-1.5 text-[#1B4F91] hover:underline"><KeyRound className="h-3.5 w-3.5" />Access &amp; Security</a>
            </div>
          </Panel>
        </aside>
      </div>

      {/* ── drawers ─────────────────────────────────────────── */}

      <Drawer open={drawer === "credentials"} title="Credential Status" subtitle="Credential references only — secret values are never displayed." onClose={() => setDrawer(null)} wide>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-[11.5px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-left text-[10.5px] uppercase text-slate-500">
                {["Integration", "Discovery Identity", "Execution Identity", "Credential Source", "Expiration", "Rotation", "Last Validation", "Status"].map((h) => <th key={h} className="py-1.5 pr-3 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {integrations.map((i) => (
                <tr key={i.id} className="border-b border-[#EEF2F6]">
                  <td className="py-1.5 pr-3 font-medium text-slate-800">{i.name}</td>
                  <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-600">{i.discoveryIdentity}</td>
                  <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-600">{i.executionIdentity ?? "—"}</td>
                  <td className="py-1.5 pr-3 text-slate-600">{i.credentialSource}</td>
                  <td className="py-1.5 pr-3 text-slate-600">{i.expiration}</td>
                  <td className="py-1.5 pr-3 text-slate-600">{i.rotation}</td>
                  <td className="py-1.5 pr-3 text-slate-600">{i.lastValidation}</td>
                  <td className="py-1.5 pr-3"><StatusPill s={i.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-slate-500">Secret values are never displayed, cached, or substituted. Fallback credential: None.</p>
      </Drawer>

      <Drawer open={drawer === "logs"} title="Integration Logs" subtitle="Structured operational events — no secret material is recorded." onClose={() => setDrawer(null)} wide>
        <table className="w-full text-[11.5px]">
          <thead>
            <tr className="border-b border-[#E2E8F0] text-left text-[10.5px] uppercase text-slate-500">
              {["Time", "Integration", "Severity", "Op", "Identity", "Event", "Status"].map((h) => <th key={h} className="py-1.5 pr-3 font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {LOG_EVENTS.map((l) => (
              <tr key={l.id} className="border-b border-[#EEF2F6]">
                <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-600">{l.time}</td>
                <td className="py-1.5 pr-3 text-slate-800">{l.integration}</td>
                <td className="py-1.5 pr-3">
                  <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                    l.severity === "error" ? "bg-rose-50 text-rose-700" : l.severity === "warning" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600")}>{l.severity}</span>
                </td>
                <td className="py-1.5 pr-3 uppercase text-slate-600">{l.operation}</td>
                <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-600">{l.identity}</td>
                <td className="py-1.5 pr-3 text-slate-700">{l.event}</td>
                <td className="py-1.5 pr-3 text-slate-600">{l.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Drawer>

      <Drawer open={drawer === "history"} title="Configuration History" subtitle="Enterprise audit trail for connection lifecycle changes." onClose={() => setDrawer(null)} wide>
        <table className="w-full text-[11.5px]">
          <thead>
            <tr className="border-b border-[#E2E8F0] text-left text-[10.5px] uppercase text-slate-500">
              {["Integration", "Action", "Actor", "Timestamp", "Reason", "Approval"].map((h) => <th key={h} className="py-1.5 pr-3 font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {HISTORY_EVENTS.map((h) => (
              <tr key={h.id} className="border-b border-[#EEF2F6]">
                <td className="py-1.5 pr-3 text-slate-800">{h.integration}</td>
                <td className="py-1.5 pr-3 font-medium text-slate-700">{h.action}</td>
                <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-600">{h.actor}</td>
                <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-600">{h.timestamp}</td>
                <td className="py-1.5 pr-3 text-slate-600">{h.reason}</td>
                <td className="py-1.5 pr-3 text-slate-600">{h.approval}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Drawer>

      <Drawer open={drawer === "tests"} title="Connectivity Test Suite" subtitle={`${testScope} — no infrastructure mutations are performed.`} onClose={() => setDrawer(null)}>
        <div className="space-y-1.5">
          {testResults.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded border border-[#EEF2F6] px-2.5 py-1.5 text-[11.5px]">
              <span className="text-slate-800">{t.name}</span>
              <span className={cn("font-mono font-semibold", t.passed === t.total ? "text-emerald-600" : "text-rose-600")}>{t.passed}/{t.total}</span>
            </div>
          ))}
          {testRunning && <div className="text-[11.5px] text-slate-500">Running tests…</div>}
          {!testRunning && testResults.length > 0 && (
            <div className={cn("mt-2 rounded px-3 py-2 text-center text-[12px] font-bold",
              testResults.every((t) => t.passed === t.total) ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800")}>
              Overall: {testResults.reduce((s, t) => s + t.passed, 0)} / {testResults.reduce((s, t) => s + t.total, 0)} Passed
            </div>
          )}
        </div>
        <div className="mt-4 rounded border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-[11px] text-slate-600">
          Execution trust tests validate role assumption, permission simulation, runner connectivity, API endpoint reachability and policy resolution. They never mutate infrastructure.
        </div>
      </Drawer>

      <Drawer open={drawer === "export"} title="Export Integration Report" subtitle="Simulated report compilation." onClose={() => setDrawer(null)}>
        <ol className="space-y-1.5 text-[11.5px]">
          {EXPORT_STEPS.map((s, idx) => (
            <li key={s} className={cn("flex items-center gap-2", idx <= exportStep ? "text-slate-800" : "text-slate-400")}>
              {idx <= exportStep ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <span className="h-3.5 w-3.5 rounded-full border border-slate-300" />}
              {s}
            </li>
          ))}
        </ol>
      </Drawer>

      <Drawer open={drawer === "permissions"} title={`Discovery vs Execution Access — ${selected?.name ?? ""}`} onClose={() => setDrawer(null)} wide>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded border border-[#E2E8F0] p-3">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-600">Discovery</div>
            <KV rows={[
              { label: "Identity", value: "Read-only" },
              { label: "Purpose", value: "Observe state" },
              { label: "Can Create", value: "No" },
              { label: "Can Modify", value: "No" },
              { label: "Can Delete", value: "No" },
              { label: "Approval Required", value: "No" },
            ]} />
          </div>
          <div className="rounded border border-[#E2E8F0] p-3">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-600">Execution</div>
            <KV rows={[
              { label: "Identity", value: "Scoped execution" },
              { label: "Purpose", value: "Perform approved transaction" },
              { label: "Can Create", value: "Policy dependent" },
              { label: "Can Modify", value: "Approved targets only" },
              { label: "Can Delete", value: "Prohibited by default" },
              { label: "Approval", value: "Required according to environment / risk" },
              { label: "Credential", value: "Resolved at runtime" },
            ]} />
          </div>
        </div>
      </Drawer>

      <Drawer open={drawer === "disableExec"} title={`Execution Enablement — ${selected?.name ?? ""}`} subtitle="Observation and mutation are controlled independently." onClose={() => setDrawer(null)}>
        <KV rows={[
          { label: "Discovery", value: "Enabled" },
          { label: "Engineering", value: "Enabled" },
          { label: "Execution", value: selected && disabledExecution[selected.id] ? "Execution Disabled" : "Policy Gated" },
        ]} />
        <div className="mt-3">
          <label className="text-[11.5px] font-medium text-slate-700">Reason (required)</label>
          <textarea
            value={disableReason}
            onChange={(e) => setDisableReason(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded border border-[#E2E8F0] p-2 text-[11.5px] outline-none focus:border-[#1B4F91]/40"
            placeholder="Why is execution being disabled?"
          />
        </div>
        <div className="mt-3 flex gap-2">
          <button
            disabled={!disableReason.trim() || !selected}
            onClick={() => { if (selected) { setDisabledExecution((d) => ({ ...d, [selected.id]: true })); setDrawer(null); setDisableReason(""); } }}
            className="h-8 rounded bg-rose-600 px-3 text-[11.5px] font-semibold text-white disabled:opacity-40"
          >
            Disable Execution
          </button>
          {selected && disabledExecution[selected.id] && (
            <button onClick={() => { setDisabledExecution((d) => ({ ...d, [selected.id]: false })); setDrawer(null); }} className="h-8 rounded border border-[#E2E8F0] px-3 text-[11.5px] font-semibold text-slate-700">
              Re-enable Execution
            </button>
          )}
        </div>
        <p className="mt-3 text-[11px] text-slate-500">Discovery is never removed automatically. The change is recorded in configuration history.</p>
        {selected && (
          <div className="mt-3">
            <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Affected Capabilities</div>
            <Bullets items={selected.capabilities} tone="rose" />
          </div>
        )}
      </Drawer>

      <Drawer open={drawer === "addConnection"} title="Add Connection" subtitle="Configure a discovery-only connection. No live credentials are requested or stored." onClose={() => setDrawer(null)}>
        <div className="space-y-3 text-[11.5px]">
          <div>
            <label className="font-medium text-slate-700">Connection Name</label>
            <input value={newConn.name} onChange={(e) => setNewConn({ ...newConn, name: e.target.value })} className="mt-1 h-8 w-full rounded border border-[#E2E8F0] px-2 outline-none" placeholder="e.g. Azure (Contoso Prod)" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-slate-700">Category</label>
              <select value={newConn.category} onChange={(e) => setNewConn({ ...newConn, category: e.target.value })} className="mt-1 h-8 w-full rounded border border-[#E2E8F0] px-2">
                {CATEGORIES.filter((c) => c !== "All Integrations").map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="font-medium text-slate-700">Connection Type</label>
              <select value={newConn.type} onChange={(e) => setNewConn({ ...newConn, type: e.target.value })} className="mt-1 h-8 w-full rounded border border-[#E2E8F0] px-2">
                {["REST API", "IAM Role (Read)", "Service Principal (Read)", "LDAPS", "WinRM (TLS)", "TDS"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="rounded border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Requested Permissions</div>
            <Bullets items={["Read-only inventory APIs", "Configuration state read", "No create / modify / delete", "No credential material stored by the platform"]} tone="emerald" />
          </div>
          <button
            disabled={!newConn.name.trim()}
            onClick={() => {
              const id = `custom-${Date.now()}`;
              setExtraConnections((c) => [...c, {
                ...INTEGRATIONS[0],
                id, name: newConn.name, category: newConn.category, domain: "Custom",
                purpose: "Discovery only", connectionType: newConn.type, accessMode: "discovery",
                status: "connected", health: 92, lastActivity: "just now", maturity: "customer_specific",
                executionCapable: false, executionIdentity: null, executionPerms: [], useCaseRole: undefined,
                dependencies: [], environments: ["Non-Production"],
              }]);
              setSelectedId(id); setDrawer(null); setNewConn({ name: "", category: "Cloud & Infrastructure", type: "REST API" });
            }}
            className="h-8 rounded bg-[#1B4F91] px-3 text-[11.5px] font-semibold text-white disabled:opacity-40"
          >
            Save Discovery-Only Connection
          </button>
        </div>
      </Drawer>
    </div>
  );
}
