import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen, Download, FileText, Info, Play, Pause, RotateCcw, ChevronLeft, ChevronRight,
  ShieldCheck, CheckCircle2, AlertCircle, CircleDot, XCircle, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Panel, Pill, KeyValue, ReviewDrawer, ReviewModal, type Tone } from "@/pages/agentic-iac/review/parts";
import {
  ALL_NODES, CONTROL_PLANE, CONTROL_PLANE_CHARACTERISTICS, DATA_CLASSIFICATION, DATA_FLOW_STEPS,
  DATA_SERVICES, DEPLOYMENT_MODELS, DEPLOYMENT_SUMMARY, ENTERPRISE_SERVICES, EXECUTION_ZONE,
  IDENTITY_CLASSES, LEGEND, MANAGED_INFRASTRUCTURE, MATURITY, READINESS, TRACE_STEPS,
  TRUST_CHAIN, TRUST_PRINCIPLES,
  type ArchNode, type DeploymentModel, type NodeId, type ReadinessStatus, type ViewMode,
} from "./platform/deploymentData";

const VIEWS: { id: ViewMode; label: string; sub: string }[] = [
  { id: "architecture", label: "Architecture", sub: "Infrastructure view" },
  { id: "trust", label: "Trust & Access", sub: "Identity & security" },
  { id: "dataflow", label: "Data Flow", sub: "Information flow" },
  { id: "demo", label: "Demo Transaction", sub: "Trace SQL/EBS scenario" },
];

const STATUS_TONE: Record<string, Tone> = {
  available: "info", planned: "neutral", "customer-specific": "warn", demo: "ok",
};
const STATUS_LABEL: Record<string, string> = {
  available: "Available", planned: "Planned", "customer-specific": "Customer Specific", demo: "Demo Enabled",
};

const READINESS_META: Record<ReadinessStatus, { label: string; tone: Tone; Icon: typeof CheckCircle2 }> = {
  ready: { label: "Ready", tone: "ok", Icon: CheckCircle2 },
  connected: { label: "Connected", tone: "ok", Icon: CheckCircle2 },
  configure: { label: "Configure", tone: "warn", Icon: AlertCircle },
  "not-enabled": { label: "Not Enabled", tone: "bad", Icon: XCircle },
  disabled: { label: "Disabled", tone: "neutral", Icon: CircleDot },
};

/** Screen 07 — Customer Deployment Architecture (Platform Administration). */
export default function DeploymentArchitecture() {
  const [model, setModel] = useState<DeploymentModel>("customer");
  const [view, setView] = useState<ViewMode>("architecture");
  const [nodeDrawer, setNodeDrawer] = useState<ArchNode | null>(null);
  const [layerDrawer, setLayerDrawer] = useState<1 | 2 | 3 | 4 | null>(null);
  const [readinessDrawer, setReadinessDrawer] = useState<string | null>(null);
  const [maturityDrawer, setMaturityDrawer] = useState<string | null>(null);
  const [modal, setModal] = useState<null | "learn" | "guide" | "export">(null);
  const [readyOverrides, setReadyOverrides] = useState<Record<string, boolean>>({});

  // Data flow + trace sequencing
  const [flowStep, setFlowStep] = useState(0); // 0 = none
  const [traceStep, setTraceStep] = useState(1);
  const [playing, setPlaying] = useState(false);

  const activeModel = DEPLOYMENT_MODELS.find((m) => m.id === model)!;

  useEffect(() => { setPlaying(false); }, [view]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      if (view === "demo") {
        setTraceStep((s) => (s >= TRACE_STEPS.length ? (setPlaying(false), s) : s + 1));
      } else if (view === "dataflow") {
        setFlowStep((s) => (s >= DATA_FLOW_STEPS.length ? (setPlaying(false), s) : s + 1));
      }
    }, 1500);
    return () => window.clearInterval(id);
  }, [playing, view]);

  const activeTrace = TRACE_STEPS[traceStep - 1];
  const highlighted: Set<NodeId> = useMemo(() => {
    if (view === "demo") return new Set(activeTrace?.nodes ?? []);
    if (view === "dataflow" && flowStep > 0) return new Set(DATA_FLOW_STEPS[flowStep - 1].nodes);
    return new Set();
  }, [view, activeTrace, flowStep]);

  const dimming = highlighted.size > 0;
  const isDim = useCallback((id: NodeId) => dimming && !highlighted.has(id), [dimming, highlighted]);

  const readinessOf = (id: string, status: ReadinessStatus): ReadinessStatus =>
    readyOverrides[id] ? "ready" : status;
  const readyCount = READINESS.filter((r) => ["ready", "connected"].includes(readinessOf(r.id, r.status))).length;
  const readyPct = Math.round((readyCount / READINESS.length) * 100);

  const node = (n: ArchNode, opts?: { compact?: boolean }) => (
    <button
      key={n.id}
      onClick={() => setNodeDrawer(n)}
      className={cn(
        "group flex w-full flex-col items-start gap-0.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 py-2 text-left transition-all hover:border-[#1B4F91]/50 hover:shadow-sm",
        opts?.compact && "px-2 py-1.5",
        isDim(n.id) && "opacity-25",
        highlighted.has(n.id) && "border-[#1B4F91] ring-2 ring-[#1B4F91]/20",
      )}
    >
      <span className="flex w-full items-center gap-1.5">
        <span className="truncate text-[11.5px] font-medium text-slate-800">{n.label}</span>
        {n.status && (
          <span className={cn("ml-auto h-1.5 w-1.5 shrink-0 rounded-full",
            n.status === "demo" ? "bg-emerald-500" : n.status === "available" ? "bg-sky-500" :
            n.status === "customer-specific" ? "bg-amber-500" : "bg-slate-300")} />
        )}
      </span>
      {!opts?.compact && <span className="line-clamp-2 text-[10px] leading-tight text-slate-500">{n.purpose}</span>}
    </button>
  );

  const layerHeader = (n: 1 | 2 | 3 | 4, title: string, desc: string) => (
    <button
      onClick={() => setLayerDrawer(n)}
      className="flex w-[168px] shrink-0 flex-col items-start gap-1 rounded-md border border-transparent px-2 py-1 text-left hover:border-[#E2E8F0] hover:bg-white"
    >
      <span className="flex items-center gap-2">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[#1B4F91] text-[10px] font-semibold text-white">{n}</span>
        <span className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-slate-700">{title}</span>
      </span>
      <span className="text-[10.5px] leading-tight text-slate-500">{desc}</span>
      <span className="text-[10px] font-medium text-[#1B4F91]">View Details</span>
    </button>
  );

  return (
    <div className="min-h-full bg-[#F6F8FA] px-5 py-4">
      {/* Breadcrumb */}
      <nav className="mb-2 flex items-center gap-1.5 text-[11.5px] text-slate-500">
        <span>Platform Administration</span><span>/</span>
        <span className="font-medium text-slate-700">Deployment Architecture</span>
      </nav>

      {/* Header */}
      <header className="mb-3 flex flex-wrap items-start gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-semibold leading-tight text-slate-900">Customer Deployment Architecture</h1>
            <Pill tone={activeModel.conceptual ? "warn" : "ok"}>{activeModel.badge}</Pill>
          </div>
          <p className="mt-0.5 text-[12px] text-slate-600">
            Visualize how Intelligent IaC is deployed, secured, connected, and operated inside the customer environment.
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <div className="rounded-md border border-[#E2E8F0] bg-white p-1">
            <div className="px-1.5 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              Deployment Model
            </div>
            <div className="flex gap-1">
              {DEPLOYMENT_MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className={cn("rounded px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                    model === m.id ? "bg-[#EFF4FB] text-[#1B4F91] ring-1 ring-inset ring-[#CFE0F3]" : "text-slate-600 hover:bg-slate-50")}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HeaderBtn icon={Info} label="Learn More" onClick={() => setModal("learn")} />
            <HeaderBtn icon={BookOpen} label="View Deployment Guide" onClick={() => setModal("guide")} />
            <HeaderBtn icon={Download} label="Export Architecture" onClick={() => setModal("export")} />
          </div>
        </div>
      </header>

      {/* View tabs */}
      <div className="mb-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={cn("rounded-lg border bg-white px-3 py-2.5 text-left transition-all",
              view === v.id ? "border-[#1B4F91] ring-2 ring-[#1B4F91]/15" : "border-[#E2E8F0] hover:border-slate-300")}
          >
            <div className={cn("text-[13px] font-semibold", view === v.id ? "text-[#1B4F91]" : "text-slate-800")}>{v.label}</div>
            <div className="text-[11px] text-slate-500">{v.sub}</div>
          </button>
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_330px]">
        {/* ---------------- Canvas ---------------- */}
        <div className="min-w-0 space-y-3">
          <section className="rounded-lg border border-[#E2E8F0] bg-white">
            <header className="flex flex-wrap items-center gap-3 border-b border-[#E2E8F0] px-3 py-2">
              <div>
                <h2 className="text-[12.5px] font-semibold text-slate-800">Architecture Overview</h2>
                <p className="text-[11px] text-slate-500">{activeModel.statement}</p>
              </div>
              <div className="ml-auto flex flex-wrap items-center gap-3 text-[10.5px] text-slate-600">
                {LEGEND.map((l) => (
                  <span key={l.label} className="flex items-center gap-1.5" title={l.description}>
                    <span className={cn("inline-block h-0 w-7 border-t-2 border-slate-500",
                      l.style === "dashed" && "border-dashed border-emerald-600",
                      l.style === "dotted" && "border-dotted border-violet-600",
                      l.style === "thin" && "border-t border-slate-400")} />
                    {l.label}
                  </span>
                ))}
              </div>
            </header>

            {view === "trust" && (
              <div className="flex items-center gap-2 border-b border-[#E2E8F0] bg-emerald-50 px-3 py-2 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-emerald-800">
                <ShieldCheck className="h-4 w-4" /> Agents do not hold production credentials
              </div>
            )}
            {view === "demo" && (
              <div className="flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] bg-[#EFF4FB] px-3 py-2 text-[12px] text-[#1B4F91]">
                <span className="font-semibold">Trace: SQL-PROD-07 Transaction Log Remediation</span>
                <span className="text-slate-600">CP-2026-01842</span>
                <span className="ml-auto font-medium">Step {traceStep} of {TRACE_STEPS.length}</span>
              </div>
            )}

            <div className="space-y-3 p-3">
              {/* Layer 1 */}
              <LayerShell tone="blue">
                {layerHeader(1, "Intelligent IaC Control Plane", model === "vendor" ? "Vendor-managed environment" : "Deployed inside your cloud account / subscription / project")}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">{CONTROL_PLANE.map((n) => node(n))}</div>
                  <div className="grid grid-cols-2 gap-2 border-t border-dashed border-[#CFE0F3] pt-2 sm:grid-cols-4">
                    {DATA_SERVICES.map((n) => node(n, { compact: true }))}
                  </div>
                </div>
              </LayerShell>

              <Connector view={view} />

              {/* Layer 2 */}
              <LayerShell tone="green">
                {layerHeader(2, "Customer Execution Zone", "Customer-controlled runners and connectors")}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{EXECUTION_ZONE.map((n) => node(n))}</div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-md bg-white/70 px-2.5 py-1.5 text-[10.5px] text-slate-600">
                    <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-emerald-600" />
                      Credentials are resolved at execution time. No standing production credentials are stored by agents.</span>
                    <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-emerald-600" />
                      Execution runners may only execute actions contained within an authorized change package.</span>
                  </div>
                </div>
              </LayerShell>

              <Connector view={view} />

              {/* Layer 3 */}
              <LayerShell tone="violet">
                {layerHeader(3, "Managed Infrastructure", "Your infrastructure and workloads")}
                <div className="grid min-w-0 flex-1 grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
                  {MANAGED_INFRASTRUCTURE.map((n) => node(n, { compact: true }))}
                </div>
              </LayerShell>

              <Connector view={view} />

              {/* Layer 4 */}
              <LayerShell tone="amber">
                {layerHeader(4, "Customer Enterprise Services", "Enterprise systems used by Intelligent IaC")}
                <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                  {ENTERPRISE_SERVICES.map((n) => node(n, { compact: true }))}
                </div>
              </LayerShell>
            </div>
          </section>

          {/* Mode-specific supporting content */}
          {view === "trust" && (
            <div className="grid gap-3 lg:grid-cols-2">
              <Panel title="Trust Chain">
                <ol className="space-y-1.5">
                  {TRUST_CHAIN.map((t, i) => (
                    <li key={i} className="rounded-md border border-dashed border-emerald-200 bg-emerald-50/40 px-2.5 py-1.5">
                      <div className="text-[11.5px] font-medium text-slate-800">{t.from} <span className="text-emerald-700">→</span> {t.to}</div>
                      <div className="text-[10.5px] text-slate-500">{t.note}</div>
                    </li>
                  ))}
                </ol>
              </Panel>
              <Panel title="Identity Classes">
                <div className="space-y-2">
                  {IDENTITY_CLASSES.map((ic) => (
                    <div key={ic.id} className={cn("rounded-md border px-2.5 py-2",
                      ic.id === "execution" ? "border-rose-200 bg-rose-50/50" : ic.id === "discovery" ? "border-sky-200 bg-sky-50/50" : "border-slate-200 bg-slate-50/60")}>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-semibold text-slate-800">{ic.label}</span>
                        <Pill tone={ic.id === "execution" ? "bad" : ic.id === "discovery" ? "info" : "neutral"}>{ic.permissions}</Pill>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-600">{ic.purpose}</div>
                      <div className="mt-1">{ic.extra.map((e) => <KeyValue key={e.label} label={e.label} value={e.value} />)}</div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}

          {view === "dataflow" && (
            <Panel title="Information Flow" actions={
              <div className="flex items-center gap-1.5">
                <SmallBtn onClick={() => { setPlaying(!playing); if (flowStep === 0) setFlowStep(1); }}>
                  {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />} {playing ? "Pause" : "Play Data Flow"}
                </SmallBtn>
                <SmallBtn onClick={() => { setPlaying(false); setFlowStep(0); }}><RotateCcw className="h-3.5 w-3.5" /> Reset</SmallBtn>
              </div>
            }>
              <ol className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {DATA_FLOW_STEPS.map((s) => (
                  <li key={s.n}>
                    <button
                      onClick={() => { setPlaying(false); setFlowStep(s.n); }}
                      className={cn("w-full rounded-md border px-2.5 py-2 text-left",
                        flowStep === s.n ? "border-[#1B4F91] bg-[#EFF4FB]" : "border-[#E2E8F0] bg-white hover:border-slate-300")}
                    >
                      <div className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-slate-800">
                        {String(s.n).padStart(2, "0")} {s.title}
                      </div>
                      <div className="text-[10.5px] text-slate-500">{s.from} → {s.to}</div>
                    </button>
                  </li>
                ))}
              </ol>
            </Panel>
          )}

          {view === "demo" && (
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
              <Panel title="Transaction Trace" actions={
                <div className="flex items-center gap-1.5">
                  <SmallBtn onClick={() => { setPlaying(false); setTraceStep((s) => Math.max(1, s - 1)); }}><ChevronLeft className="h-3.5 w-3.5" /> Previous</SmallBtn>
                  <SmallBtn onClick={() => { setPlaying(false); setTraceStep((s) => Math.min(TRACE_STEPS.length, s + 1)); }}>Next <ChevronRight className="h-3.5 w-3.5" /></SmallBtn>
                  <SmallBtn onClick={() => setPlaying(!playing)}>{playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />} {playing ? "Pause" : "Play Trace"}</SmallBtn>
                  <SmallBtn onClick={() => { setPlaying(false); setTraceStep(1); }}><RotateCcw className="h-3.5 w-3.5" /> Reset</SmallBtn>
                </div>
              }>
                <ol className="grid gap-1.5 sm:grid-cols-2">
                  {TRACE_STEPS.map((s) => (
                    <li key={s.n}>
                      <button
                        onClick={() => { setPlaying(false); setTraceStep(s.n); }}
                        className={cn("w-full rounded-md border px-2.5 py-1.5 text-left",
                          traceStep === s.n ? "border-[#1B4F91] bg-[#EFF4FB]" : "border-[#E2E8F0] hover:border-slate-300")}
                      >
                        <div className="text-[11.5px] font-semibold text-slate-800">{String(s.n).padStart(2, "0")} {s.title}</div>
                        <div className="text-[10.5px] leading-tight text-slate-500">{s.lines[0]}</div>
                      </button>
                    </li>
                  ))}
                </ol>
              </Panel>
              <Panel title={`Step ${traceStep} of ${TRACE_STEPS.length}`}>
                <div className="text-[12.5px] font-semibold text-slate-900">{activeTrace.title}</div>
                <ul className="mt-1 space-y-0.5">
                  {activeTrace.lines.map((l) => <li key={l} className="text-[11.5px] text-slate-600">{l}</li>)}
                </ul>
                <div className="mt-2 border-t border-slate-100 pt-1">
                  {activeTrace.card.map((c) => <KeyValue key={c.label} label={c.label} value={c.value} />)}
                </div>
              </Panel>
            </div>
          )}
        </div>

        {/* ---------------- Right rail ---------------- */}
        <aside className="space-y-3">
          <Panel title="Deployment Readiness">
            <div className="flex items-center gap-3">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-4 border-emerald-500/70">
                <div className="text-center leading-none">
                  <div className="text-[15px] font-bold text-slate-900">{readyCount}</div>
                  <div className="text-[9px] text-slate-500">of {READINESS.length}</div>
                </div>
              </div>
              <div>
                <div className="text-[13px] font-semibold text-slate-900">{readyPct}% Complete</div>
                <p className="text-[11px] text-slate-500">Continue configuring to enable production execution.</p>
              </div>
            </div>
            <ul className="mt-2 divide-y divide-slate-100">
              {READINESS.map((r) => {
                const st = readinessOf(r.id, r.status);
                const meta = READINESS_META[st];
                return (
                  <li key={r.id}>
                    <button onClick={() => setReadinessDrawer(r.id)} className="flex w-full items-center gap-2 py-1.5 text-left hover:bg-slate-50">
                      <span className="w-5 shrink-0 font-mono text-[10.5px] text-slate-400">{r.n}</span>
                      <span className="min-w-0 flex-1 truncate text-[11.5px] text-slate-700">{r.label}</span>
                      <meta.Icon className={cn("h-3.5 w-3.5 shrink-0",
                        meta.tone === "ok" ? "text-emerald-600" : meta.tone === "warn" ? "text-amber-500" :
                        meta.tone === "bad" ? "text-rose-600" : "text-slate-400")} />
                      <span className="w-[76px] shrink-0 text-right text-[10.5px] text-slate-600">{meta.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 rounded-md bg-emerald-50 px-2 py-1.5 text-[10.5px] text-emerald-800">
              Discovery can be enabled before production execution.
            </p>
          </Panel>

          {view === "architecture" && (
            <Panel title="Deployment Summary">
              {DEPLOYMENT_SUMMARY.map((s) => <KeyValue key={s.label} label={s.label} value={s.value} />)}
              <div className="mt-2 space-y-0.5 border-t border-slate-100 pt-2">
                {activeModel.summary.map((s) => <KeyValue key={s.label} label={s.label} value={s.value} />)}
              </div>
            </Panel>
          )}

          {view === "trust" && (
            <Panel title="Trust Principles">
              <ul className="space-y-1">
                {TRUST_PRINCIPLES.map((p) => (
                  <li key={p} className="flex items-start gap-1.5 text-[11.5px] text-slate-700">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />{p}
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {view === "dataflow" && (
            <Panel title="Data Classification">
              <div className="space-y-1.5">
                {DATA_CLASSIFICATION.map((d) => (
                  <div key={d.label} className={cn("rounded-md border px-2 py-1.5", d.sensitive ? "border-rose-200 bg-rose-50/50" : "border-slate-200")}>
                    <div className="flex items-center gap-2">
                      <span className="text-[11.5px] font-medium text-slate-800">{d.label}</span>
                      {d.sensitive && <Pill tone="bad">Never stored</Pill>}
                    </div>
                    <div className="text-[10.5px] text-slate-500">{d.storage}</div>
                    <div className="text-[10.5px] text-slate-500">{d.note}</div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {view === "demo" && (
            <Panel title="Change Package">
              <KeyValue label="Package" value="CP-2026-01842" mono />
              <KeyValue label="Authorization" value="EXEC-AUTH-01842" mono />
              <KeyValue label="Evidence" value="EV-2026-01842" mono />
              <KeyValue label="Asset" value="SQL-PROD-07" />
              <KeyValue label="Mutation" value="EBS 500 GB → 750 GB" />
              <KeyValue label="Validation" value="21 / 21 Passed" />
            </Panel>
          )}
        </aside>
      </div>

      {/* Deployment maturity */}
      <section className="mt-3 rounded-lg border border-[#E2E8F0] bg-white p-3">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">Deployment Maturity</h3>
        <div className="flex flex-wrap items-center gap-2">
          {MATURITY.map((m, i) => (
            <div key={m.id} className="flex items-center gap-2">
              <button
                onClick={() => setMaturityDrawer(m.id)}
                className="flex min-w-[110px] flex-col items-center gap-1 rounded-md border border-[#E2E8F0] px-3 py-2 hover:border-[#1B4F91]/50"
              >
                <span className="text-[12px] font-medium text-slate-800">{m.label}</span>
                <Pill tone={m.state === "complete" ? "ok" : m.state === "ready" ? "info" : m.state === "configure" ? "warn" : "neutral"}>
                  {m.state === "complete" ? "Complete" : m.state === "ready" ? "Ready" : m.state === "configure" ? "Configure" : "Disabled"}
                </Pill>
              </button>
              {i < MATURITY.length - 1 && <span className="text-slate-300">→</span>}
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Drawers & modals ---------------- */}
      <ReviewDrawer open={!!nodeDrawer} title={nodeDrawer?.label ?? ""} subtitle={nodeDrawer?.purpose} onClose={() => setNodeDrawer(null)}>
        {nodeDrawer && (
          <div className="space-y-3">
            {nodeDrawer.status && (
              <Pill tone={STATUS_TONE[nodeDrawer.status]}>{STATUS_LABEL[nodeDrawer.status]}</Pill>
            )}
            <div>
              <KeyValue label="Layer" value={["", "Intelligent IaC Control Plane", "Customer Execution Zone", "Managed Infrastructure", "Customer Enterprise Services"][nodeDrawer.layer]} />
              {(nodeDrawer.detail ?? []).map((d) => <KeyValue key={d.label} label={d.label} value={d.value} />)}
            </div>
            {nodeDrawer.id === "run-tf" && (
              <div className="rounded-md border border-[#E2E8F0] bg-slate-50 p-2 font-mono text-[11px] text-slate-700">
                <div>CP-2026-01842</div>
                <div>aws_ebs_volume.sql_prod_07_log</div>
                <div>size: 500 GB → 750 GB</div>
              </div>
            )}
          </div>
        )}
      </ReviewDrawer>

      <ReviewDrawer
        open={layerDrawer !== null}
        title={layerDrawer === 1 ? "Control Plane Deployment" : layerDrawer === 2 ? "Customer Execution Zone" : layerDrawer === 3 ? "Managed Infrastructure" : "Customer Enterprise Services"}
        subtitle="Conceptual deployment characteristics"
        onClose={() => setLayerDrawer(null)}
      >
        {layerDrawer === 1 && <div>{CONTROL_PLANE_CHARACTERISTICS.map((c) => <KeyValue key={c.label} label={c.label} value={c.value} />)}</div>}
        {layerDrawer === 2 && (
          <div className="space-y-2">
            <p>Runners and connectors are deployed and operated by the customer. They execute only actions contained within an authorized change package and retrieve credentials at execution time.</p>
            {EXECUTION_ZONE.map((r) => <KeyValue key={r.id} label={r.label} value={STATUS_LABEL[r.status ?? "planned"]} />)}
          </div>
        )}
        {layerDrawer === 3 && (
          <div className="space-y-2">
            <p>Coverage classifications indicate current prototype support. Not every connector is implemented.</p>
            {MANAGED_INFRASTRUCTURE.map((r) => <KeyValue key={r.id} label={r.label} value={STATUS_LABEL[r.status ?? "planned"]} />)}
          </div>
        )}
        {layerDrawer === 4 && (
          <div className="space-y-2">
            {ENTERPRISE_SERVICES.map((r) => <KeyValue key={r.id} label={r.label} value={r.purpose} />)}
          </div>
        )}
      </ReviewDrawer>

      <ReviewDrawer
        open={!!readinessDrawer}
        title={(() => { const r = READINESS.find((x) => x.id === readinessDrawer); return r ? `${r.n} ${r.label}` : ""; })()}
        subtitle="Deployment readiness item"
        onClose={() => setReadinessDrawer(null)}
      >
        {(() => {
          const r = READINESS.find((x) => x.id === readinessDrawer);
          if (!r) return null;
          const st = readinessOf(r.id, r.status);
          return (
            <div className="space-y-3">
              <Pill tone={READINESS_META[st].tone}>{READINESS_META[st].label}</Pill>
              <p>{r.purpose}</p>
              <div>
                <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Required</h4>
                <ul className="list-disc pl-4">{r.required.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
              <div>
                <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Security Requirements</h4>
                <ul className="list-disc pl-4">{r.security.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
              <button
                onClick={() => setReadyOverrides((o) => ({ ...o, [r.id]: true }))}
                disabled={st === "ready" || st === "connected"}
                className="rounded-md bg-[#1B4F91] px-3 py-1.5 text-[12px] font-medium text-white disabled:opacity-40"
              >
                Mark Ready for Demo
              </button>
              <p className="text-[10.5px] text-slate-500">Changes local demo state only.</p>
            </div>
          );
        })()}
      </ReviewDrawer>

      <ReviewDrawer
        open={!!maturityDrawer}
        title={MATURITY.find((m) => m.id === maturityDrawer)?.label ?? ""}
        subtitle="Deployment maturity stage"
        onClose={() => setMaturityDrawer(null)}
      >
        {(() => {
          const m = MATURITY.find((x) => x.id === maturityDrawer);
          if (!m) return null;
          return (
            <div className="space-y-2">
              <Pill tone={m.state === "complete" ? "ok" : m.state === "ready" ? "info" : m.state === "configure" ? "warn" : "neutral"}>{m.state}</Pill>
              <p>{m.detail}</p>
              <h4 className="mt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Requirements</h4>
              <ul className="list-disc pl-4">{m.requirements.map((r) => <li key={r}>{r}</li>)}</ul>
            </div>
          );
        })()}
      </ReviewDrawer>

      <ReviewModal
        open={modal !== null}
        title={modal === "learn" ? "About This Architecture" : modal === "guide" ? "Deployment Guide" : "Export Architecture"}
        onClose={() => setModal(null)}
        footer={<button onClick={() => setModal(null)} className="rounded-md border border-[#E2E8F0] px-3 py-1.5 text-[12px] text-slate-700">Close</button>}
      >
        {modal === "learn" && (
          <div className="space-y-2">
            <p>Intelligent IaC is deployed inside the customer environment by default. The control plane, execution runners, operational data and evidence all remain under customer control.</p>
            <p>Agents reason over the Digital Twin and generate change packages, but never hold production credentials and never mutate infrastructure outside an approved execution package.</p>
            <p className="text-slate-500">Conceptual reference architecture. Implementation technologies are illustrative.</p>
          </div>
        )}
        {modal === "guide" && (
          <ol className="list-decimal space-y-1 pl-4">
            {READINESS.map((r) => <li key={r.id}>{r.label} — {r.purpose}</li>)}
          </ol>
        )}
        {modal === "export" && (
          <div className="space-y-2">
            <p className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#1B4F91]" /> Architecture export prepared (simulated).</p>
            <KeyValue label="Format" value="PDF + SVG" />
            <KeyValue label="Deployment Model" value={activeModel.label} />
            <KeyValue label="View" value={VIEWS.find((v) => v.id === view)?.label ?? ""} />
            <p className="text-[10.5px] text-slate-500">No file is generated in this prototype.</p>
          </div>
        )}
      </ReviewModal>
    </div>
  );
}

function HeaderBtn({ icon: Icon, label, onClick }: { icon: typeof Info; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-slate-700 hover:border-slate-300">
      <Icon className="h-3.5 w-3.5 text-[#1B4F91]" />{label}
    </button>
  );
}

function SmallBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 rounded-md border border-[#E2E8F0] bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:border-slate-300">
      {children}
    </button>
  );
}

function LayerShell({ tone, children }: { tone: "blue" | "green" | "violet" | "amber"; children: React.ReactNode }) {
  const map = {
    blue: "border-[#CFE0F3] bg-[#F7FAFE]",
    green: "border-emerald-200 bg-emerald-50/40",
    violet: "border-violet-200 bg-violet-50/40",
    amber: "border-amber-200 bg-amber-50/40",
  } as const;
  return <div className={cn("flex flex-col gap-3 rounded-lg border p-2.5 lg:flex-row", map[tone])}>{children}</div>;
}

function Connector({ view }: { view: ViewMode }) {
  return (
    <div className="flex justify-center gap-6" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={cn("block h-4 w-0 border-l-2",
          view === "trust" ? "border-dashed border-emerald-500" :
          view === "dataflow" ? "border-dotted border-violet-500" : "border-slate-300")} />
      ))}
    </div>
  );
}
