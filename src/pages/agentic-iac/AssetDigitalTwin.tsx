import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown, ChevronRight, RefreshCw, Code2, Tags, Server, CheckCircle2, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RelationshipMap } from "./RelationshipMap";
import { ActionPreviewDrawer } from "./ActionPreviewDrawer";
import {
  ACTION_CATEGORIES, actions, asset, assetIntelligence, changeHistory, configSections,
  confidenceStrip, discoverySources, provenance, provenanceStats, REFRESH_STEPS,
  type ActionCategory, type AssetAction, type ChangeRecord, type RelatedNode,
} from "./data";

export default function AssetDigitalTwin() {
  const [openSections, setOpenSections] = useState<string[]>(configSections.map((s) => s.key));
  const [category, setCategory] = useState<ActionCategory>("Compute");
  const [selectedAction, setSelectedAction] = useState<AssetAction | null>(null);
  const [selectedNode, setSelectedNode] = useState<RelatedNode | null>(null);
  const [selectedChange, setSelectedChange] = useState<ChangeRecord | null>(null);
  const [provenanceOpen, setProvenanceOpen] = useState(false);
  const [refreshStep, setRefreshStep] = useState<number | null>(null);
  const [lastDiscovered, setLastDiscovered] = useState(asset.lastDiscovered);

  function toggleSection(key: string) {
    setOpenSections((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function refreshTwin() {
    if (refreshStep !== null) return;
    let i = 0;
    setRefreshStep(0);
    const timer = window.setInterval(() => {
      i += 1;
      if (i >= REFRESH_STEPS.length) {
        window.clearInterval(timer);
        setLastDiscovered("Just now");
        window.setTimeout(() => setRefreshStep(null), 900);
        setRefreshStep(REFRESH_STEPS.length - 1);
        return;
      }
      setRefreshStep(i);
    }, 650);
  }

  const categoryActions = actions.filter((a) => a.category === category);

  return (
    <div className="px-4 py-3">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1 text-[11.5px] text-slate-500">
        <Link to="/agentic-iac-engineering" className="hover:text-slate-800">Assets</Link>
        <span>/</span>
        <span className="hover:text-slate-800">Virtual Machines</span>
        <span>/</span>
        <span className="font-medium text-slate-800">{asset.name}</span>
      </nav>

      {/* Asset identity */}
      <section className="rounded-md border border-[#E2E8F0] bg-white">
        <div className="flex flex-wrap items-start gap-3 px-4 py-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[#CFE0F3] bg-[#EFF4FB] text-[#1B4F91]">
            <Server className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[19px] font-semibold leading-tight text-slate-900">{asset.name}</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                <CheckCircle2 className="h-3 w-3" /> Healthy
              </span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-slate-500">
              <span>{asset.assetType}</span><span>·</span>
              <span>{asset.os}</span><span>·</span>
              <span>{asset.workload}</span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={refreshTwin} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] px-2.5 text-[12px] text-slate-700 hover:bg-slate-50">
              <RefreshCw className={cn("h-3.5 w-3.5", refreshStep !== null && "animate-spin")} /> Refresh Twin
            </button>
            <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] px-2.5 text-[12px] text-slate-700 hover:bg-slate-50">
              <Code2 className="h-3.5 w-3.5" /> View Raw State
            </button>
            <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] px-2.5 text-[12px] text-slate-700 hover:bg-slate-50">
              <Tags className="h-3.5 w-3.5" /> Edit Tags
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[#E2E8F0] px-4 py-2.5 text-[12px] sm:grid-cols-3 xl:grid-cols-6">
          <Meta label="Environment" value={asset.environment} />
          <Meta label="Region" value={asset.region} />
          <Meta label="Owner" value={asset.owner} />
          <Meta label="Criticality" value={asset.criticality} tone="warn" />
          <Meta label="Last Discovered" value={lastDiscovered} />
          <Meta label="CMDB ID" value={asset.cmdbId} />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-t border-[#E2E8F0] px-4 py-2">
          {asset.tags.map((t) => (
            <span key={t} className="rounded border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 py-0.5 text-[11px] text-slate-600">{t}</span>
          ))}
        </div>
      </section>

      {/* Confidence strip */}
      <section className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1.5 rounded-md border border-[#E2E8F0] bg-white px-4 py-2">
        {confidenceStrip.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-[12px]">
            <span className="text-slate-500">{item.label}</span>
            <span className={cn("font-semibold", item.tone === "good" ? "text-emerald-700" : "text-slate-800")}>{item.value}</span>
          </div>
        ))}
        {refreshStep !== null && (
          <span className="ml-auto text-[12px] font-medium text-[#1B4F91]">{REFRESH_STEPS[refreshStep]}</span>
        )}
      </section>

      {/* Three-column workspace */}
      <div className="mt-2 grid gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* Current configuration */}
        <section className="rounded-md border border-[#E2E8F0] bg-white">
          <header className="border-b border-[#E2E8F0] px-3 py-2">
            <h2 className="text-[12.5px] font-semibold uppercase tracking-wide text-slate-700">Current Configuration</h2>
          </header>
          <div className="max-h-[640px] overflow-y-auto">
            {configSections.map((section) => {
              const open = openSections.includes(section.key);
              return (
                <div key={section.key} className="border-b border-[#EEF2F6] last:border-b-0">
                  <button
                    type="button"
                    onClick={() => toggleSection(section.key)}
                    className="flex w-full items-center gap-1.5 bg-[#F8FAFC] px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-600 hover:bg-slate-100"
                  >
                    {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    {section.title}
                  </button>
                  {open && (
                    <dl className="divide-y divide-[#F1F5F9]">
                      {section.properties.map((p) => (
                        <div key={`${section.key}-${p.label}-${p.value}`} className="flex items-center justify-between gap-3 px-3 py-1.5 text-[12px]">
                          <dt className="text-slate-500">{p.label}</dt>
                          <dd
                            title={p.hint}
                            className={cn(
                              "text-right font-medium",
                              p.tone === "warn" && "rounded bg-amber-50 px-1.5 py-0.5 text-amber-700 ring-1 ring-amber-200",
                              p.tone === "good" && "text-emerald-700",
                              p.tone === "bad" && "text-red-700",
                              !p.tone && "text-slate-800",
                            )}
                          >
                            {p.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <RelationshipMap selectedId={selectedNode?.id ?? null} onSelect={setSelectedNode} />

        {/* Available actions */}
        <section className="rounded-md border border-[#E2E8F0] bg-white">
          <header className="border-b border-[#E2E8F0] px-3 py-2">
            <h2 className="text-[12.5px] font-semibold uppercase tracking-wide text-slate-700">Available Actions</h2>
          </header>
          <div className="flex flex-wrap gap-1 border-b border-[#E2E8F0] px-2 py-1.5">
            {ACTION_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded border px-2 py-0.5 text-[11.5px] transition-colors",
                  category === c
                    ? "border-[#1B4F91] bg-[#EFF4FB] text-[#1B4F91]"
                    : "border-transparent text-slate-600 hover:bg-slate-50",
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <ul className="max-h-[600px] divide-y divide-[#F1F5F9] overflow-y-auto">
            {categoryActions.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setSelectedAction(a)}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-[#F8FAFC]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-medium text-slate-800">{a.name}</div>
                    <div className="text-[11.5px] text-slate-500">{a.description}</div>
                    <div className="mt-1 flex items-center gap-3 text-[10.5px]">
                      <span className="text-slate-500">
                        Automation ·{" "}
                        <span className={cn(a.automation === "Ready" ? "text-emerald-700" : a.automation === "Partial" ? "text-amber-700" : "text-slate-600")}>
                          {a.automation}
                        </span>
                      </span>
                      <span className="text-slate-500">
                        Risk ·{" "}
                        <span className={cn(a.risk === "Low" ? "text-emerald-700" : a.risk === "Medium" ? "text-amber-700" : "text-red-700")}>
                          {a.risk}
                        </span>
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Recent changes + asset intelligence */}
      <div className="mt-2 grid gap-2 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
        <section className="rounded-md border border-[#E2E8F0] bg-white">
          <header className="border-b border-[#E2E8F0] px-3 py-2">
            <h2 className="text-[12.5px] font-semibold uppercase tracking-wide text-slate-700">Recent Changes</h2>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-left text-[10.5px] uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-1.5 font-semibold">Date</th>
                  <th className="px-3 py-1.5 font-semibold">Action</th>
                  <th className="px-3 py-1.5 font-semibold">Initiated By</th>
                  <th className="px-3 py-1.5 font-semibold">Method</th>
                  <th className="px-3 py-1.5 font-semibold">Change ID</th>
                  <th className="px-3 py-1.5 font-semibold">Status</th>
                  <th className="px-3 py-1.5 font-semibold">Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {changeHistory.map((c) => (
                  <tr key={c.id} onClick={() => setSelectedChange(c)} className="cursor-pointer hover:bg-[#F8FAFC]">
                    <td className="px-3 py-1.5 text-slate-600">{c.date}</td>
                    <td className="px-3 py-1.5 font-medium text-slate-800">{c.action}</td>
                    <td className="px-3 py-1.5 text-slate-600">{c.initiatedBy}</td>
                    <td className="px-3 py-1.5 text-slate-600">{c.method}</td>
                    <td className="px-3 py-1.5 font-mono text-[11px] text-slate-600">{c.changeId}</td>
                    <td className="px-3 py-1.5 text-emerald-700">{c.status}</td>
                    <td className="px-3 py-1.5 text-slate-600">{c.validation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-md border border-[#E2E8F0] bg-white">
          <header className="border-b border-[#E2E8F0] px-3 py-2">
            <h2 className="text-[12.5px] font-semibold uppercase tracking-wide text-slate-700">Asset Intelligence</h2>
          </header>
          <dl className="divide-y divide-[#F1F5F9]">
            {assetIntelligence.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 px-3 py-1.5 text-[12px]">
                <dt className="text-slate-500">{row.label}</dt>
                <dd className={cn("font-medium", row.tone === "good" ? "text-emerald-700" : row.tone === "warn" ? "text-amber-700" : "text-slate-800")}>
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="border-t border-[#E2E8F0] px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Primary Discovery Sources</div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {discoverySources.map((s) => (
                <span key={s} className="rounded border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 py-0.5 text-[11px] text-slate-600">{s}</span>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Provenance */}
      <section className="mt-2 rounded-md border border-[#E2E8F0] bg-white">
        <button
          type="button"
          onClick={() => setProvenanceOpen((v) => !v)}
          className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-[12px] font-medium text-slate-700 hover:bg-[#F8FAFC]"
        >
          {provenanceOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          How This Twin Was Built
        </button>
        {provenanceOpen && (
          <div className="border-t border-[#E2E8F0] px-3 py-2.5">
            <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
              {provenance.map((p) => (
                <div key={p.domain} className="rounded border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1.5">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">{p.domain}</div>
                  <div className="text-[12px] font-medium text-slate-800">{p.source}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 border-t border-[#E2E8F0] pt-2 text-[11.5px] text-slate-600">
              {provenanceStats.map((s) => (
                <span key={s.label}>{s.label}: <span className="font-medium text-slate-800">{s.value}</span></span>
              ))}
            </div>
          </div>
        )}
      </section>

      <ActionPreviewDrawer action={selectedAction} onClose={() => setSelectedAction(null)} />

      {selectedChange && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button type="button" aria-label="Close change history" onClick={() => setSelectedChange(null)} className="flex-1 bg-slate-900/20" />
          <aside className="h-full w-full max-w-[420px] overflow-y-auto border-l border-[#E2E8F0] bg-white p-4">
            <div className="flex items-start gap-2">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Change</div>
                <h2 className="text-[15px] font-semibold text-slate-900">{selectedChange.action}</h2>
                <div className="text-[11.5px] text-slate-500">{selectedChange.changeId} · {selectedChange.method}</div>
              </div>
              <button type="button" onClick={() => setSelectedChange(null)} aria-label="Close" className="ml-auto grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 space-y-3 text-[12px]">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Intent</div>
                <p className="mt-1 text-slate-700">{selectedChange.intent}</p>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Generated Artifacts</div>
                <ul className="mt-1 space-y-1">
                  {selectedChange.artifacts.map((a) => (
                    <li key={a} className="rounded border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1 font-mono text-[11px] text-slate-700">{a}</li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Meta label="Execution Method" value={selectedChange.method} />
                <Meta label="Validation" value={selectedChange.validation} />
                <Meta label="Status" value={selectedChange.status} />
                <Meta label="Timestamp" value={selectedChange.timestamp} />
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Meta({ label, value, tone }: { label: string; value: string; tone?: "warn" }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={cn("truncate text-[12.5px] font-medium", tone === "warn" ? "text-amber-700" : "text-slate-800")}>{value}</div>
    </div>
  );
}
