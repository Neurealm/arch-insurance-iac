import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import {
  LayoutDashboard, Network, Cloud, Bot, GitBranch, ShieldCheck,
  Activity, Calculator, Map, ClipboardCheck, Sparkles, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { KPIStatCard } from "./components/primitives";
import ExecutiveOverview from "./tabs/ExecutiveOverview";
import ReferenceArchitecture from "./tabs/ReferenceArchitecture";
import AzureDeployment from "./tabs/AzureDeployment";
import MultiAgentRuntime from "./tabs/MultiAgentRuntime";
import DataFlow from "./tabs/DataFlow";
import SecurityGovernance from "./tabs/SecurityGovernance";
import ObservabilityOps from "./tabs/ObservabilityOps";
import ResourceEstimator from "./tabs/ResourceEstimator";
import ImplementationRoadmap from "./tabs/ImplementationRoadmap";
import ReadinessAssessment from "./tabs/ReadinessAssessment";
import type { ReadinessResult } from "./tabs/ReadinessAssessment";

const TABS = [
  { id: "overview", label: "Executive Overview", icon: LayoutDashboard, Component: ExecutiveOverview },
  { id: "reference", label: "Reference Architecture", icon: Network, Component: ReferenceArchitecture },
  { id: "azure", label: "Azure Deployment", icon: Cloud, Component: AzureDeployment },
  { id: "runtime", label: "Multi-Agent Runtime", icon: Bot, Component: MultiAgentRuntime },
  { id: "flow", label: "Data Flow", icon: GitBranch, Component: DataFlow },
  { id: "security", label: "Security & Governance", icon: ShieldCheck, Component: SecurityGovernance },
  { id: "observability", label: "Observability & Operations", icon: Activity, Component: ObservabilityOps },
  { id: "estimator", label: "Resource Estimator", icon: Calculator, Component: ResourceEstimator },
  { id: "roadmap", label: "Implementation Roadmap", icon: Map, Component: ImplementationRoadmap },
  { id: "readiness", label: "Readiness Assessment", icon: ClipboardCheck, Component: ReadinessAssessment },
] as const;

export default function NeurealmAgenticAI() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("overview");
  const [readiness, setReadiness] = useState<ReadinessResult | null>(null);
  const Active = useMemo(() => TABS.find((t) => t.id === active)!.Component, [active]);

  const readinessLabel = readiness ? `${readiness.score}/100 · ${readiness.stage}` : "Take assessment";

  return (
    <AppShell>
      <div className="min-h-full bg-slate-50/60">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#0b1437] via-[#111a4a] to-[#1e2570] text-white">
          <div className="max-w-[1600px] mx-auto px-6 py-6">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-200">
              <Sparkles className="h-3.5 w-3.5" /> Neurealm · Customer Architecture Studio
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">Neurealm Agentic AI Architecture Studio</h1>
            <p className="text-sm md:text-[15px] text-indigo-100/90 mt-1 max-w-4xl">
              Design, explain, and estimate enterprise-grade multi-agent AI platforms for customer environments.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
              <KpiPill label="Architecture Views" value="10" sub="Interactive twin" />
              <KpiPill label="Platform Layers" value="8" sub="Experience → AI services" />
              <KpiPill label="Deployment Patterns" value="4" sub="Azure Native · Hybrid · Private AI · VM" />
              <KpiPill label="Readiness Score" value={readiness ? String(readiness.score) : "—"} sub={readinessLabel} />
            </div>
          </div>

          {/* Tabs */}
          <div className="max-w-[1600px] mx-auto px-6">
            <div className="flex flex-wrap gap-1 -mb-px">
              {TABS.map((t, ti) => {
                const isActive = t.id === active;
                const Icon = t.icon;
                return (
                  <div key={t.id} className="contents">
                  <button
                    onClick={() => setActive(t.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-md border-b-2 transition-colors",
                      isActive
                        ? "bg-slate-50/60 text-slate-900 border-white"
                        : "text-indigo-100/80 border-transparent hover:text-white hover:bg-white/5",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t.label}
                  </button>
                  {/* Context / Evidence Layer administration — separate module */}
                  {ti === 0 && (
                    <Link
                      to="/context-evidence/overview"
                      className="flex items-center gap-1.5 rounded-t-md border-b-2 border-amber-300 bg-amber-300 px-3 py-2 text-xs font-semibold text-amber-950 transition-colors hover:bg-amber-200"
                    >
                      <Layers className="h-3.5 w-3.5" />
                      Context / Evidence Layer
                    </Link>
                  )}
                  {/* LLM + Model Routing administration — separate module */}
                  {ti === 0 && (
                    <Link
                      to="/models-routing/overview"
                      className="flex items-center gap-1.5 rounded-t-md border-b-2 border-amber-300 bg-amber-300 px-3 py-2 text-xs font-semibold text-amber-950 transition-colors hover:bg-amber-200"
                    >
                      <Layers className="h-3.5 w-3.5" />
                      LLM + Model Routing
                    </Link>
                  )}
                  {/* Agent Orchestration administration — separate module */}
                  {ti === 0 && (
                    <Link
                      to="/agent-orchestration/overview"
                      className="flex items-center gap-1.5 rounded-t-md border-b-2 border-amber-300 bg-amber-300 px-3 py-2 text-xs font-semibold text-amber-950 transition-colors hover:bg-amber-200"
                    >
                      <Layers className="h-3.5 w-3.5" />
                      Agent Orchestration Administration
                    </Link>
                  )}
                  {/* Agentic AI FinOps & Cost Management administration — separate module */}
                  {ti === 0 && (
                    <Link
                      to="/finops-admin/overview"
                      className="flex items-center gap-1.5 rounded-t-md border-b-2 border-amber-300 bg-amber-300 px-3 py-2 text-xs font-semibold text-amber-950 transition-colors hover:bg-amber-200"
                    >
                      <Layers className="h-3.5 w-3.5" />
                      Agent AI Cost Management
                    </Link>
                  )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Tab content */}
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          {(() => {
            const C = Active as any;
            return <C onReadinessChange={setReadiness} />;
          })()}
        </div>
      </div>
    </AppShell>
  );
}

function KpiPill({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur border border-white/15 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-indigo-200">{label}</div>
      <div className="text-2xl font-bold leading-tight mt-1">{value}</div>
      {sub && <div className="text-[11px] text-indigo-100/80 mt-0.5 truncate">{sub}</div>}
    </div>
  );
}
