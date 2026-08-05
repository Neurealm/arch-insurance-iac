/**
 * Taara Global Link Health Twin, Production Architecture.
 *
 * A proposed reference architecture and synthetic demonstration page inside the
 * Agentic SRE NOC module. Nothing described here is deployed at Taara
 * Communications. All interactions are local and deterministic.
 */

import { useMemo, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  ChevronRight, Download, Info, Layers, Maximize2, Minimize2, RotateCcw, Search,
  Share2, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Panel, Select, ToolbarButton } from "./components/NocPrimitives";
import {
  agents, architectureAssumptions, architectureDecisions, architectureEdges,
  architectureOutcomes, architectureStatement, architectureZones, autonomyLevels,
  cloudViews, deploymentReference, deploymentViews, detailLevels, engineeringPrinciples,
  flowTypes, integrationInventory, maturityPath, nonFunctional, scenario,
  validationChecklist, walkthrough,
  type ArchComponent, type ArchZone, type DetailLevel, type FlowKind,
} from "./data/architectureFixtures";

/* -------------------------------- helpers -------------------------------- */

const columnTitles: Record<number, string> = {
  1: "Sources", 2: "Ingestion", 3: "Processing and Storage", 4: "Digital Twin Context",
  5: "Analytics and Agents", 6: "Decision and Governance", 7: "Execution and Validation",
  8: "Customer Outcome and Learning",
};

function Badge({ tone, children }: { tone: "blue" | "slate" | "emerald" | "amber" | "purple"; children: React.ReactNode }) {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    purple: "border-violet-200 bg-violet-50 text-violet-700",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", tones[tone])}>
      {children}
    </span>
  );
}

function FlowLine({ kind }: { kind: FlowKind }) {
  const f = flowTypes.find((x) => x.key === kind)!;
  return (
    <svg viewBox="0 0 40 6" className="h-1.5 w-10 shrink-0" aria-hidden>
      <line x1="0" y1="3" x2="40" y2="3" stroke={f.color} strokeWidth="2"
        strokeDasharray={f.dash === "none" ? undefined : f.dash} />
    </svg>
  );
}

/* --------------------------------- page ---------------------------------- */

export default function ProductionArchitecture() {
  const [deploymentView, setDeploymentView] = useState<string>(deploymentViews[0]);
  const [cloudView, setCloudView] = useState<string>(cloudViews[0]);
  const [detail, setDetail] = useState<DetailLevel>("Full Detail");
  const [query, setQuery] = useState("");
  const [activeFlows, setActiveFlows] = useState<FlowKind[]>(flowTypes.map((f) => f.key));
  const [selected, setSelected] = useState<{ zone: ArchZone; comp: ArchComponent } | null>(null);
  const [fullScreen, setFullScreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [step, setStep] = useState(1);
  const detailRef = useRef<HTMLDivElement>(null);

  const toggleFlow = (k: FlowKind) =>
    setActiveFlows((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));

  const reset = () => {
    setDeploymentView(deploymentViews[0]); setCloudView(cloudViews[0]); setDetail("Full Detail");
    setQuery(""); setActiveFlows(flowTypes.map((f) => f.key)); setSelected(null); setFullScreen(false); setStep(1);
  };

  const q = query.trim().toLowerCase();

  const visibleZones = useMemo(() => architectureZones.map((z) => {
    const comps = z.components.filter((c) => {
      if (!c.detail.includes(detail)) return false;
      if (!q) return true;
      return (c.name + c.role + c.technology.join(" ") + z.title).toLowerCase().includes(q);
    });
    const flowMatch = z.flows.some((f) => activeFlows.includes(f));
    const viewMatch = z.views.includes(deploymentView) || z.band === "cross";
    return { zone: z, comps, dim: !flowMatch, emphasised: viewMatch };
  }).filter((z) => z.comps.length > 0 || !q), [detail, q, activeFlows, deploymentView]);

  const columns = useMemo(() => {
    const map = new Map<number, typeof visibleZones>();
    visibleZones.forEach((v) => {
      const arr = map.get(v.zone.column) ?? [];
      arr.push(v); map.set(v.zone.column, arr);
    });
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [visibleZones]);

  const visibleEdges = architectureEdges.filter((e) => activeFlows.includes(e.kind));
  const activeStep = walkthrough.find((w) => w.index === step) ?? walkthrough[0];

  const exportView = () => {
    const payload = {
      page: "Taara Global Link Health Twin, Production Architecture",
      note: "Proposed reference architecture, synthetic demonstration data.",
      deploymentView, cloudView, detail, activeFlows, query, scenario: scenario.id,
      zones: architectureZones.map((z) => ({ zone: z.title, components: z.components.map((c) => c.name) })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "glht-production-architecture.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const shareView = () => {
    const params = new URLSearchParams({ view: deploymentView, cloud: cloudView, detail });
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    void navigator.clipboard?.writeText(url);
    setShowNotes(true);
  };

  const selectComponent = (zone: ArchZone, comp: ArchComponent) => {
    setSelected({ zone, comp });
    window.requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  /* ------------------------------- canvas -------------------------------- */

  const coreColumns = columns
    .map(([col, zones]) => [col, zones.filter((z) => z.zone.band === "core")] as const)
    .filter(([, zones]) => zones.length > 0);
  const crossZones = visibleZones.filter((z) => z.zone.band === "cross");

  const zoneAccent: Record<string, { bar: string; title: string; ring: string }> = {
    sources: { bar: "bg-sky-50", title: "text-sky-800", ring: "border-sky-200" },
    ingestion: { bar: "bg-sky-50", title: "text-sky-800", ring: "border-sky-200" },
    bus: { bar: "bg-amber-50", title: "text-amber-800", ring: "border-amber-200" },
    processing: { bar: "bg-sky-50", title: "text-sky-800", ring: "border-sky-200" },
    storage: { bar: "bg-sky-50", title: "text-sky-800", ring: "border-sky-200" },
    twin: { bar: "bg-indigo-50", title: "text-indigo-800", ring: "border-indigo-200" },
    analytics: { bar: "bg-violet-50", title: "text-violet-800", ring: "border-violet-200" },
    agentic: { bar: "bg-violet-50", title: "text-violet-800", ring: "border-violet-200" },
    reasoning: { bar: "bg-violet-50", title: "text-violet-800", ring: "border-violet-200" },
    policy: { bar: "bg-amber-50", title: "text-amber-800", ring: "border-amber-200" },
    action: { bar: "bg-emerald-50", title: "text-emerald-800", ring: "border-emerald-200" },
    targets: { bar: "bg-emerald-50", title: "text-emerald-800", ring: "border-emerald-200" },
    api: { bar: "bg-sky-50", title: "text-sky-800", ring: "border-sky-200" },
    presentation: { bar: "bg-sky-50", title: "text-sky-800", ring: "border-sky-200" },
    observability: { bar: "bg-slate-100", title: "text-slate-800", ring: "border-slate-200" },
    governance: { bar: "bg-amber-50", title: "text-amber-800", ring: "border-amber-200" },
    cloud: { bar: "bg-sky-50", title: "text-sky-800", ring: "border-sky-200" },
    learning: { bar: "bg-violet-50", title: "text-violet-800", ring: "border-violet-200" },
  };

  const accentOf = (id: string) => zoneAccent[id] ?? { bar: "bg-slate-100", title: "text-slate-800", ring: "border-slate-200" };

  const ComponentTile = ({ zone, c }: { zone: ArchZone; c: ArchComponent }) => {
    const active = selected?.comp.id === c.id;
    return (
      <button
        type="button"
        onClick={() => selectComponent(zone, c)}
        aria-pressed={active}
        className={cn(
          "w-full rounded-md border bg-white px-2 py-1.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          active ? "border-blue-400 bg-blue-50 ring-1 ring-blue-200" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
        )}
      >
        <span className="block text-[11px] font-semibold leading-tight text-slate-900">{c.name}</span>
        <span className="mt-0.5 block text-[10px] leading-snug text-slate-600">{c.role}</span>
        <span className="mt-0.5 block text-[9.5px] leading-snug text-slate-400">
          {cloudView === "Google Cloud Example" ? c.gcp : c.technology.slice(0, 3).join(" · ")}
        </span>
      </button>
    );
  };

  const ZoneCard = ({ zone, comps, dim, emphasised, horizontal }: {
    zone: ArchZone; comps: ArchComponent[]; dim: boolean; emphasised: boolean; horizontal?: boolean;
  }) => {
    const a = accentOf(zone.id);
    return (
      <section
        aria-label={zone.title}
        className={cn(
          "overflow-hidden rounded-lg border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-opacity",
          emphasised ? a.ring : "border-slate-200",
          dim && "opacity-40",
        )}
      >
        <header className={cn("flex items-baseline justify-between gap-2 px-2 py-1.5", a.bar)}>
          <h3 className={cn("text-[10.5px] font-bold uppercase tracking-[0.06em]", a.title)}>{zone.title}</h3>
          <span className="flex shrink-0 gap-1">{zone.flows.map((f) => <FlowLine key={f} kind={f} />)}</span>
        </header>
        <p className="border-b border-slate-100 px-2 py-1 text-[9.5px] leading-snug text-slate-500">{zone.purpose}</p>
        <div className={cn("p-1.5", horizontal ? "grid grid-cols-2 gap-1.5 md:grid-cols-3 xl:grid-cols-5" : "space-y-1.5")}>
          {comps.map((c) => <ComponentTile key={c.id} zone={zone} c={c} />)}
          {comps.length === 0 && (
            <p className="rounded border border-dashed border-slate-200 px-1.5 py-1 text-[10px] text-slate-400">
              No components at this detail level
            </p>
          )}
        </div>
      </section>
    );
  };

  const canvas = (
    <div className="space-y-3">
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-[1240px] items-stretch gap-2">
          {coreColumns.map(([col, zones], ci) => (
            <div key={col} className="flex flex-1 items-stretch gap-2">
              <div className="flex min-w-[195px] flex-1 flex-col gap-2">
                <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  {col}. {columnTitles[col]}
                </div>
                {zones.map(({ zone, comps, dim, emphasised }) => (
                  <ZoneCard key={zone.id} zone={zone} comps={comps} dim={dim} emphasised={emphasised} />
                ))}
              </div>
              {ci < coreColumns.length - 1 && (
                <div className="flex items-center" aria-hidden>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {crossZones.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            Cross-cutting layers, applied across every zone above
          </p>
          {crossZones.map(({ zone, comps, dim, emphasised }) => (
            <ZoneCard key={zone.id} zone={zone} comps={comps} dim={dim} emphasised={emphasised} horizontal />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        {flowTypes.map((f) => (
          <span key={f.key} className={cn("inline-flex items-center gap-1.5 text-[10.5px] text-slate-600", !activeFlows.includes(f.key) && "opacity-40")}>
            <FlowLine kind={f.key} />{f.label}
          </span>
        ))}
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-white">
      <div className={cn("mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6", fullScreen && "max-w-none")}>

        {/* --------------------------- 1. Header --------------------------- */}
        <header>
          <nav aria-label="Breadcrumb" className="text-[11px] text-slate-500">
            <ol className="flex flex-wrap items-center gap-1">
              <li>SRE</li><li aria-hidden>/</li>
              <li><RouterLink to="/agentic-sre-noc" className="hover:text-slate-800 hover:underline">Agentic SRE NOC</RouterLink></li>
              <li aria-hidden>/</li><li>Digital Twins</li><li aria-hidden>/</li>
              <li>
                <RouterLink to="/agentic-sre-noc/global-link-health-twin" className="hover:text-slate-800 hover:underline">
                  Global Link Health Twin
                </RouterLink>
              </li>
              <li aria-hidden>/</li>
              <li className="font-medium text-slate-700">Production Architecture</li>
            </ol>
          </nav>

          <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                  Taara Global Link Health Twin, Production Architecture
                </h1>
                <Badge tone="blue"><Layers className="h-3 w-3" aria-hidden />Proposed Production Architecture</Badge>
                <Badge tone="slate">Synthetic Taara-aligned reference implementation</Badge>
              </div>
              <p className="mt-0.5 text-[12.5px] text-slate-600">
                Reference architecture for service-aware, agentic operations across optical wireless networks
              </p>
              <p className="mt-1 max-w-4xl text-[12px] font-medium text-slate-800">
                The Global Link Health Twin converts optical, network, environmental, service, and customer data into
                evidence-driven decisions and governed operational action.
              </p>
              <p className="mt-0.5 max-w-4xl text-[11.5px] text-slate-600">
                The architecture combines deterministic engineering analytics, a service-aware Digital Twin, specialized
                agents, explicit policy controls, safe execution, continuous validation, and operational learning.
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-slate-600 sm:grid-cols-2">
              <div><dt className="text-slate-500">Owner</dt><dd className="font-medium text-slate-900">Solution Architecture and Optical Engineering</dd></div>
              <div><dt className="text-slate-500">Architecture version</dt><dd className="font-medium text-slate-900">v1.4 (proposed)</dd></div>
              <div><dt className="text-slate-500">Last architecture update</dt><dd className="font-medium text-slate-900">2026-08-05</dd></div>
              <div><dt className="text-slate-500">Audience</dt><dd className="font-medium text-slate-900">NetOps, Optical, SRE, Data, Security, Platform, Customer Ops</dd></div>
            </dl>
          </div>

          {/* Controls */}
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <Select label="Deployment view" value={deploymentView} options={deploymentViews} onChange={setDeploymentView} />
              <Select label="Cloud view" value={cloudView} options={cloudViews} onChange={setCloudView} />
              <Select label="Detail level" value={detail} options={detailLevels} onChange={(v) => setDetail(v as DetailLevel)} />
              <label className="flex items-center gap-1.5">
                <span className="sr-only">Search architecture</span>
                <span className="relative">
                  <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden />
                  <input
                    value={query} onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search components"
                    aria-label="Search architecture components"
                    className="w-48 rounded-md border border-slate-200 bg-white py-1 pl-7 pr-2 text-[11.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                </span>
              </label>
              <ToolbarButton onClick={reset}><RotateCcw className="h-3.5 w-3.5" aria-hidden />Reset view</ToolbarButton>
              <ToolbarButton onClick={() => setFullScreen((f) => !f)}>
                {fullScreen ? <Minimize2 className="h-3.5 w-3.5" aria-hidden /> : <Maximize2 className="h-3.5 w-3.5" aria-hidden />}
                {fullScreen ? "Exit full screen" : "Full screen"}
              </ToolbarButton>
              <ToolbarButton onClick={exportView}><Download className="h-3.5 w-3.5" aria-hidden />Export</ToolbarButton>
              <ToolbarButton onClick={shareView}><Share2 className="h-3.5 w-3.5" aria-hidden />Share view</ToolbarButton>
              <ToolbarButton onClick={() => setShowNotes((s) => !s)}><Info className="h-3.5 w-3.5" aria-hidden />Architecture notes</ToolbarButton>
              <ToolbarButton onClick={() => setShowAssumptions((s) => !s)}><ShieldCheck className="h-3.5 w-3.5" aria-hidden />Assumptions</ToolbarButton>
            </div>

            {/* Flow-type filter */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5" role="group" aria-label="Flow type filter">
              {flowTypes.map((f) => {
                const on = activeFlows.includes(f.key);
                return (
                  <button
                    key={f.key} type="button" aria-pressed={on} onClick={() => toggleFlow(f.key)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-1 text-[10.5px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                      on ? "border-slate-300 bg-white text-slate-800" : "border-slate-200 bg-slate-100 text-slate-400",
                    )}
                  >
                    <FlowLine kind={f.key} />
                    {f.label}
                  </button>
                );
              })}
            </div>

            {showNotes && (
              <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2 text-[11.5px] text-slate-700">
                <h2 className="text-[12px] font-semibold text-slate-900">Architecture notes</h2>
                <p className="mt-0.5">
                  This page is a proposed reference architecture and a synthetic demonstration. It is not a description of
                  any deployed Taara Communications system. Cloud services are shown as one worked example; the core
                  architecture is cloud neutral. Selecting a deployment view emphasises the zones most relevant to that
                  perspective. The share action copies a link describing the current view selections.
                </p>
              </div>
            )}
            {showAssumptions && (
              <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2">
                <h2 className="text-[12px] font-semibold text-slate-900">Assumptions</h2>
                <ul className="mt-1 grid gap-0.5 text-[11.5px] text-slate-700 md:grid-cols-2">
                  {architectureAssumptions.map((a) => (
                    <li key={a} className="flex gap-1.5">
                      <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />{a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </header>

        {/* --------------- 2. Outcome and operating principles -------------- */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <Panel title="What This Architecture Delivers" subtitle="Outcomes the reference design is accountable for" className="xl:col-span-5">
            <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {architectureOutcomes.map((o) => (
                <li key={o} className="flex gap-1.5 text-[11.5px] text-slate-700">
                  <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-500" />{o}
                </li>
              ))}
            </ul>
            <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-[11.5px] italic text-slate-700">
              {architectureStatement}
            </p>
          </Panel>

          <Panel title="Key Engineering Principles" subtitle="How the architecture behaves under pressure" className="xl:col-span-7">
            <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {engineeringPrinciples.map((p) => (
                <li key={p.name} className="rounded-md border border-slate-200 p-2">
                  <h3 className="text-[11.5px] font-semibold text-slate-900">{p.name}</h3>
                  <p className="mt-0.5 text-[10.5px] leading-snug text-slate-600">{p.text}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* -------------------- 3. Architecture canvas ---------------------- */}
        <Panel
          title="Production Architecture Canvas"
          subtitle={`Reads left to right · ${deploymentView} · ${cloudView} · ${detail} detail`}
          action={<span className="text-[11px] text-slate-500">{visibleZones.length} zones shown</span>}
        >
          {canvas}
        </Panel>

        {/* ----------------------- 4. Flow legend --------------------------- */}
        <Panel title="Architecture Flow Legend" subtitle="Colour, line style and label are used together so the diagram stays readable without colour">
          <ul className="grid grid-cols-1 gap-1.5 md:grid-cols-2 xl:grid-cols-3">
            {flowTypes.map((f) => (
              <li key={f.key} className={cn("flex items-start gap-2 rounded-md border border-slate-200 p-2", !activeFlows.includes(f.key) && "opacity-50")}>
                <span className="mt-1"><FlowLine kind={f.key} /></span>
                <span>
                  <span className="block text-[11.5px] font-medium text-slate-900">{f.label} <span className="font-normal text-slate-500">({f.lineLabel})</span></span>
                  <span className="block text-[10.5px] text-slate-600">{f.description}</span>
                </span>
              </li>
            ))}
          </ul>

          <h3 className="mt-3 text-[12px] font-semibold text-slate-900">Zone connectors</h3>
          <div className="mt-1 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[11px]">
              <thead className="text-slate-500">
                <tr><th className="py-1 pr-3 font-medium">From</th><th className="py-1 pr-3 font-medium">To</th><th className="py-1 pr-3 font-medium">Flow</th><th className="py-1 font-medium">Carries</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {visibleEdges.map((e) => {
                  const from = architectureZones.find((z) => z.id === e.from)?.title;
                  const to = architectureZones.find((z) => z.id === e.to)?.title;
                  return (
                    <tr key={`${e.from}-${e.to}-${e.kind}`}>
                      <td className="py-1 pr-3">{from}</td>
                      <td className="py-1 pr-3">{to}</td>
                      <td className="py-1 pr-3"><span className="inline-flex items-center gap-1.5"><FlowLine kind={e.kind} />{flowTypes.find((f) => f.key === e.kind)?.label}</span></td>
                      <td className="py-1">{e.label}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* ------------------ 5. Selected component detail ------------------ */}
        <div ref={detailRef}>
          <Panel
            title="Selected Component Detail"
            subtitle={selected ? `${selected.zone.title} · ${selected.comp.name}` : "Select any component in the canvas to inspect it"}
            action={selected ? <ToolbarButton onClick={() => setSelected(null)}>Clear selection</ToolbarButton> : undefined}
          >
            {!selected ? (
              <p className="text-[11.5px] text-slate-500">
                No component selected. Choose a component from the architecture canvas above to see its role, interfaces,
                data, failure behaviour, security posture, target metrics and synthetic demonstration value.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  <h3 className="text-[13px] font-semibold text-slate-900">{selected.comp.name}</h3>
                  <p className="mt-0.5 text-[11.5px] text-slate-700">{selected.comp.role}</p>
                  <dl className="mt-2 space-y-1 text-[11px]">
                    <div><dt className="text-slate-500">Zone</dt><dd className="text-slate-900">{selected.zone.title}</dd></div>
                    <div><dt className="text-slate-500">Technology options</dt><dd className="text-slate-900">{selected.comp.technology.join(" · ")}</dd></div>
                    <div><dt className="text-slate-500">Google Cloud example</dt><dd className="text-slate-900">{selected.comp.gcp}</dd></div>
                    <div><dt className="text-slate-500">Detail levels</dt><dd className="text-slate-900">{selected.comp.detail.join(", ")}</dd></div>
                  </dl>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:col-span-2">
                  {[
                    { label: "Inputs", value: selected.comp.inputs.join(" · ") },
                    { label: "Outputs", value: selected.comp.outputs.join(" · ") },
                    { label: "Interfaces", value: selected.comp.interfaces.join(" · ") },
                    { label: "Data handled", value: selected.comp.data.join(" · ") },
                    { label: "Failure behaviour", value: selected.comp.failure },
                    { label: "Security posture", value: selected.comp.security },
                    { label: "Target metrics", value: selected.comp.metrics.join(" · ") },
                    { label: "Synthetic demonstration value", value: selected.comp.synthetic },
                  ].map((f) => (
                    <div key={f.label} className="rounded-md border border-slate-200 p-2">
                      <p className="text-[10.5px] font-medium uppercase tracking-wide text-slate-500">{f.label}</p>
                      <p className="mt-0.5 text-[11.5px] text-slate-800">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Panel>
        </div>

        {/* ------------------- 6. End-to-end walkthrough -------------------- */}
        <Panel title="End-to-End Operational Walkthrough" subtitle="Sixteen steps from signal arrival to operational learning, using the synthetic Chennai scenario">
          <ol className="flex flex-wrap gap-1" aria-label="Walkthrough steps">
            {walkthrough.map((w) => (
              <li key={w.index}>
                <button
                  type="button" aria-pressed={step === w.index} aria-current={step === w.index ? "step" : undefined}
                  onClick={() => setStep(w.index)}
                  className={cn(
                    "rounded border px-1.5 py-1 text-[10.5px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    step === w.index ? "border-blue-400 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  )}
                >
                  {w.index}. {w.title}
                </button>
              </li>
            ))}
          </ol>

          <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[12.5px] font-semibold text-slate-900">{activeStep.index}. {activeStep.title}</h3>
              <span className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10.5px] text-slate-700">
                <FlowLine kind={activeStep.flow} />{flowTypes.find((f) => f.key === activeStep.flow)?.label}
              </span>
              <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10.5px] text-slate-700">
                Zone: {architectureZones.find((z) => z.id === activeStep.zone)?.title}
              </span>
            </div>
            <p className="mt-1 text-[11.5px] text-slate-700">{activeStep.what}</p>
            <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-[11px] sm:grid-cols-2">
              <div><dt className="text-slate-500">Systems involved</dt><dd className="text-slate-800">{activeStep.systems}</dd></div>
              <div><dt className="text-slate-500">Evidence produced</dt><dd className="text-slate-800">{activeStep.evidence}</dd></div>
              <div><dt className="text-slate-500">Guardrail</dt><dd className="text-slate-800">{activeStep.guardrail}</dd></div>
              <div><dt className="text-slate-500">Synthetic result</dt><dd className="text-slate-800">{activeStep.result}</dd></div>
            </dl>
            <div className="mt-2 flex gap-1.5">
              <ToolbarButton onClick={() => setStep((s) => Math.max(1, s - 1))}>Previous step</ToolbarButton>
              <ToolbarButton onClick={() => setStep((s) => Math.min(walkthrough.length, s + 1))}>Next step</ToolbarButton>
            </div>
          </div>
        </Panel>

        {/* ------------- 7. Agentic intelligence and orchestration ---------- */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <Panel title="Agentic Intelligence and Orchestration" subtitle="Specialised agents with explicit tools, boundaries and autonomy levels" className="xl:col-span-8">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-[11px]">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-1 pr-3 font-medium">Agent</th><th className="py-1 pr-3 font-medium">Responsibility</th>
                    <th className="py-1 pr-3 font-medium">Tools</th><th className="py-1 pr-3 font-medium">Output</th>
                    <th className="py-1 pr-3 font-medium">Boundary</th><th className="py-1 font-medium">Autonomy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {agents.map((a) => (
                    <tr key={a.id}>
                      <td className="py-1 pr-3 font-medium text-slate-900">{a.name}</td>
                      <td className="py-1 pr-3">{a.responsibility}</td>
                      <td className="py-1 pr-3">{a.tools.join(" · ")}</td>
                      <td className="py-1 pr-3">{a.outputs}</td>
                      <td className="py-1 pr-3">{a.boundary}</td>
                      <td className="py-1"><Badge tone="purple">{a.autonomy}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Autonomy Levels" subtitle="Automation is earned per action class, on evidence" className="xl:col-span-4">
            <ol className="space-y-1.5">
              {autonomyLevels.map((l) => (
                <li key={l.level} className="rounded-md border border-slate-200 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11.5px] font-semibold text-slate-900">{l.level} {l.name}</span>
                    <Badge tone={l.state === "In use" ? "emerald" : l.state === "Proposed" ? "amber" : "slate"}>{l.state}</Badge>
                  </div>
                  <p className="mt-0.5 text-[10.5px] text-slate-600">{l.text}</p>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        {/* ------------- 8. Data and Digital Twin model detail -------------- */}
        <Panel title="Data and Digital Twin Model" subtitle="How raw signals become a service-aware model of the estate">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
            {architectureZones.filter((z) => ["processing", "storage", "twin", "governance"].includes(z.id)).map((z) => (
              <div key={z.id} className="rounded-lg border border-slate-200 p-2">
                <h3 className="text-[11.5px] font-semibold text-slate-900">{z.title}</h3>
                <p className="mt-0.5 text-[10.5px] text-slate-600">{z.purpose}</p>
                <ul className="mt-1.5 space-y-1">
                  {z.components.map((c) => (
                    <li key={c.id} className="text-[10.5px] text-slate-700">
                      <span className="font-medium text-slate-900">{c.name}</span> — {c.data.join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>

        {/* ------ 9. Safe action, approval, validation and rollback --------- */}
        <Panel title="Safe Action, Approval, Validation and Rollback" subtitle="Every action passes policy, approval, execution guardrails, validation and a ready rollback path">
          <ol className="grid grid-cols-1 gap-2 md:grid-cols-3 xl:grid-cols-5">
            {[
              { t: "Policy evaluation", d: "Autonomy level, blast radius, change freeze and entitlements are evaluated. Fails closed.", tone: "slate" as const },
              { t: "Human approval", d: "Named approver, expiry, delegation and separation of duties from the recommender.", tone: "slate" as const },
              { t: "Guardrailed execution", d: "Preconditions, idempotency keys, rate limits, circuit breakers and short-lived credentials.", tone: "emerald" as const },
              { t: "Validation", d: "Service reachability, throughput, latency, loss, beam lock and SLO state re-checked.", tone: "blue" as const },
              { t: "Rollback", d: "Inverse operation validated before the action is offered and held ready through validation.", tone: "amber" as const },
            ].map((s, i) => (
              <li key={s.t} className="rounded-lg border border-slate-200 p-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-slate-500">{i + 1}</span>
                  <h3 className="text-[11.5px] font-semibold text-slate-900">{s.t}</h3>
                </div>
                <p className="mt-0.5 text-[10.5px] text-slate-600">{s.d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-700">
            No action is offered to an operator unless its rollback path is defined, validated and available for the full
            execution and validation window. Failed validation automatically proposes rollback rather than waiting for a human to notice.
          </p>
        </Panel>

        {/* ---------- 10. Security, governance and observability ------------ */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Panel title="Security and Data Governance" subtitle="Controls that surround every layer of the architecture">
            <ul className="space-y-1.5">
              {architectureZones.find((z) => z.id === "governance")!.components.map((c) => (
                <li key={c.id} className="rounded-md border border-slate-200 p-2">
                  <h3 className="text-[11.5px] font-semibold text-slate-900">{c.name}</h3>
                  <p className="mt-0.5 text-[10.5px] text-slate-600">{c.role}</p>
                  <p className="mt-0.5 text-[10.5px] text-slate-700"><span className="text-slate-500">Control: </span>{c.security}</p>
                  <p className="text-[10.5px] text-slate-700"><span className="text-slate-500">Failure: </span>{c.failure}</p>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Observability and Platform Operations" subtitle="The platform must be as observable as the estate it protects">
            <ul className="space-y-1.5">
              {architectureZones.find((z) => z.id === "observability")!.components.map((c) => (
                <li key={c.id} className="rounded-md border border-slate-200 p-2">
                  <h3 className="text-[11.5px] font-semibold text-slate-900">{c.name}</h3>
                  <p className="mt-0.5 text-[10.5px] text-slate-600">{c.role}</p>
                  <p className="mt-0.5 text-[10.5px] text-slate-700"><span className="text-slate-500">Target: </span>{c.metrics.join(" · ")}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* -------------- 11. Production deployment reference --------------- */}
        <Panel title="Production Deployment Reference" subtitle="The core architecture is cloud neutral. A Google Cloud mapping is one worked example.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-[11px]">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-1 pr-3 font-medium">Deployment option</th><th className="py-1 pr-3 font-medium">Runtime summary</th>
                  <th className="py-1 pr-3 font-medium">Control plane</th><th className="py-1 pr-3 font-medium">Data residency</th><th className="py-1 font-medium">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {deploymentReference.map((d) => (
                  <tr key={d.view} className={cn(d.view === cloudView && "bg-blue-50/60")}>
                    <td className="py-1 pr-3 font-medium text-slate-900">{d.view}</td>
                    <td className="py-1 pr-3">{d.summary}</td>
                    <td className="py-1 pr-3">{d.control}</td>
                    <td className="py-1 pr-3">{d.data}</td>
                    <td className="py-1">{d.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* ----------------- 12. Nonfunctional requirements ----------------- */}
        <Panel title="Nonfunctional Requirements" subtitle="Proposed targets for a production implementation at reference scale">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[11px]">
              <thead className="text-slate-500">
                <tr><th className="py-1 pr-3 font-medium">Area</th><th className="py-1 pr-3 font-medium">Target</th><th className="py-1 font-medium">Engineering note</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {nonFunctional.map((n) => (
                  <tr key={n.area}>
                    <td className="py-1 pr-3 font-medium text-slate-900">{n.area}</td>
                    <td className="py-1 pr-3">{n.target}</td>
                    <td className="py-1">{n.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* --------------------- 13. Integration inventory ------------------ */}
        <Panel title="Integration Inventory" subtitle="Systems the architecture reads from, writes to, or coordinates with">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-[11px]">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-1 pr-3 font-medium">System</th><th className="py-1 pr-3 font-medium">Type</th>
                  <th className="py-1 pr-3 font-medium">Direction</th><th className="py-1 pr-3 font-medium">Protocol</th>
                  <th className="py-1 pr-3 font-medium">Frequency</th><th className="py-1 pr-3 font-medium">Owner</th>
                  <th className="py-1 font-medium">Criticality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {integrationInventory.map((i) => (
                  <tr key={i.system}>
                    <td className="py-1 pr-3 font-medium text-slate-900">{i.system}</td>
                    <td className="py-1 pr-3">{i.type}</td>
                    <td className="py-1 pr-3">{i.direction}</td>
                    <td className="py-1 pr-3">{i.protocol}</td>
                    <td className="py-1 pr-3">{i.frequency}</td>
                    <td className="py-1 pr-3">{i.owner}</td>
                    <td className="py-1">
                      <Badge tone={i.criticality === "Critical" ? "amber" : i.criticality === "High" ? "blue" : "slate"}>{i.criticality}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* --------------- 14. Delivery maturity and autonomy --------------- */}
        <Panel title="Delivery Maturity and Autonomy Path" subtitle="Proposed phasing from observation to governed autonomy">
          <ol className="grid grid-cols-1 gap-2 md:grid-cols-3 xl:grid-cols-5">
            {maturityPath.map((p) => (
              <li key={p.phase} className="rounded-lg border border-slate-200 p-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[11.5px] font-semibold text-slate-900">{p.phase}. {p.name}</h3>
                  <span className="text-[10px] text-slate-500">{p.weeks}</span>
                </div>
                <p className="mt-0.5 text-[10.5px] text-slate-600">{p.scope}</p>
                <p className="mt-1 text-[10.5px] text-slate-700"><span className="text-slate-500">Exit criteria: </span>{p.exit}</p>
              </li>
            ))}
          </ol>
        </Panel>

        {/* ------------- 15. Architecture decisions and assumptions --------- */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <Panel title="Architecture Decisions" subtitle="Decisions taken in this proposed design, with the alternatives considered" className="xl:col-span-8">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-[11px]">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-1 pr-3 font-medium">ID</th><th className="py-1 pr-3 font-medium">Decision</th>
                    <th className="py-1 pr-3 font-medium">Rationale</th><th className="py-1 pr-3 font-medium">Alternative</th><th className="py-1 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {architectureDecisions.map((d) => (
                    <tr key={d.id}>
                      <td className="py-1 pr-3 font-medium text-slate-900">{d.id}</td>
                      <td className="py-1 pr-3">{d.decision}</td>
                      <td className="py-1 pr-3">{d.rationale}</td>
                      <td className="py-1 pr-3">{d.alternatives}</td>
                      <td className="py-1"><Badge tone="emerald">{d.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Assumptions" subtitle="Conditions this reference architecture depends on" className="xl:col-span-4">
            <ul className="space-y-1 text-[11.5px] text-slate-700">
              {architectureAssumptions.map((a) => (
                <li key={a} className="flex gap-1.5">
                  <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />{a}
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* -------------------- 16. Demonstration scenario ------------------ */}
        <Panel
          title="Demonstration Scenario"
          subtitle={`${scenario.id} · ${scenario.name}`}
          action={
            <RouterLink
              to="/agentic-sre-noc/global-link-health-twin"
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Open the operational screen<ChevronRight className="h-3 w-3" aria-hidden />
            </RouterLink>
          }
        >
          <p className="text-[11.5px] text-slate-700">{scenario.summary}</p>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] sm:grid-cols-3 xl:grid-cols-5">
            {scenario.facts.map((f) => (
              <div key={f.label} className="rounded-md border border-slate-200 p-2">
                <dt className="text-[10.5px] text-slate-500">{f.label}</dt>
                <dd className="text-[12px] font-semibold text-slate-900">{f.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-[11px] text-slate-500">
            This scenario is synthetic. It demonstrates how the proposed architecture would behave; it does not represent a
            real Taara Communications event.
          </p>
        </Panel>

        {/* ----------------- 17. Architecture validation -------------------- */}
        <Panel title="Architecture Validation Checklist" subtitle="Review gates applied to this reference design">
          <ul className="grid grid-cols-1 gap-1 md:grid-cols-2">
            {validationChecklist.map((c) => (
              <li key={c.item} className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-2 py-1">
                <span className="text-[11.5px] text-slate-700">{c.item}</span>
                <Badge tone={c.status === "Met" ? "emerald" : "amber"}>{c.status}</Badge>
              </li>
            ))}
          </ul>
        </Panel>

        <p className="pb-4 text-[11px] text-slate-500">
          Proposed reference architecture and synthetic demonstration. Not a description of any system currently deployed
          within Taara Communications.
        </p>
      </div>
    </div>
  );
}
