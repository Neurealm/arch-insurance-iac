// Application shell for the neugain.io Agent Orchestration administration
// plane: fixed left rail, page header, dark navy purpose banner with core
// principles and tenant orchestration outcomes, and routable section tabs.

import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Bell, HelpCircle, ChevronDown, PanelLeftClose, PanelLeft, Plus, Building2, Users,
  Database, Bot, Cpu, Workflow, FileSearch, Settings, Search, CircleDot,
} from "lucide-react";
import { OUTCOMES, PRINCIPLES, HELP } from "./data";
import { InspectDrawer, RichTip, Bullets, SubHead, KV, Btn, HelpRegistry } from "./parts";
import { CreateWorkflowWizard } from "./CreateWorkflowWizard";
import { GlobalSearch } from "./GlobalSearch";
import { toast } from "sonner";

const SUB_NAV = [
  { to: "/agent-orchestration/overview", label: "Overview" },
  { to: "/agent-orchestration/workflows", label: "Workflow Registry" },
  { to: "/agent-orchestration/participants", label: "Participants & Assignment" },
  { to: "/agent-orchestration/state", label: "State & Recovery" },
  { to: "/agent-orchestration/policies", label: "Orchestration Policies" },
  { to: "/agent-orchestration/tools", label: "Tool Bindings" },
  { to: "/agent-orchestration/runs", label: "Runs & Traces" },
  { to: "/agent-orchestration/evaluation", label: "Evaluation" },
  { to: "/agent-orchestration/settings", label: "Settings" },
];

const RAIL_TOP = [
  { label: "Tenant Overview", icon: Building2, to: "/context-evidence/overview" },
  { label: "Identity & Access", icon: Users, to: "/iam-admin/overview" },
  { label: "Context / Evidence Layer", icon: Database, to: "/context-evidence/overview" },
  { label: "Models & Routing", icon: Cpu, to: "/models-routing/overview" },
  { label: "Agents & Coworkers", icon: Bot, to: "/agent-orchestration/participants" },
];

const RAIL_BOTTOM = [
  { label: "Audit & Compliance", icon: FileSearch, to: "/agent-orchestration/runs" },
  { label: "Settings", icon: Settings, to: "/agent-orchestration/settings" },
];

export default function AgentOrchestrationLayout() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [wizard, setWizard] = useState(false);
  const [search, setSearch] = useState(false);
  const [principle, setPrinciple] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) { e.preventDefault(); setSearch(true); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const p = PRINCIPLES.find((x) => x.id === principle);
  const o = OUTCOMES.find((x) => x.id === outcome);

  return (
    <HelpRegistry value={HELP}>
    <div className="flex min-h-screen bg-[#F7F9FC] text-slate-900">
      <aside className={cn("sticky top-0 flex h-screen shrink-0 flex-col border-r border-slate-200 bg-[#0B1B33] text-slate-200 transition-all", collapsed ? "w-[64px]" : "w-[230px]")}>
        <div className="border-b border-white/10 px-4 py-3">
          <div className="text-[14px] font-semibold tracking-tight text-white">{collapsed ? "N" : "NEUGAIN.IO"}</div>
          {!collapsed && <div className="text-[10.5px] text-slate-400">Digital Coworker Platform</div>}
        </div>

        <nav className="flex-1 overflow-y-auto py-2" aria-label="Administration">
          {!collapsed && <div className="px-4 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Administration</div>}
          {RAIL_TOP.map((r) => <RailLink key={r.label} {...r} collapsed={collapsed} />)}

          <div className="mx-2 my-0.5 flex items-center gap-2 rounded-md bg-white/10 px-2.5 py-2 text-[12.5px] font-medium text-white">
            <Workflow className="h-4 w-4 shrink-0 text-sky-300" />
            {!collapsed && <><span className="flex-1">Agent Orchestration</span><ChevronDown className="h-3.5 w-3.5 text-slate-400" /></>}
          </div>
          {!collapsed && SUB_NAV.map((c) => (
            <NavLink key={c.to} to={{ pathname: c.to, search: params.toString() }} end
              className={({ isActive }) => cn(
                "mx-2 my-px flex items-center gap-2 rounded-md py-1.5 pl-9 pr-2.5 text-[12px] transition-colors",
                isActive ? "bg-sky-500/20 font-medium text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200")}>
              <span className="truncate">{c.label}</span>
            </NavLink>
          ))}

          {RAIL_BOTTOM.map((r) => <RailLink key={r.label} {...r} collapsed={collapsed} />)}
        </nav>

        {!collapsed && (
          <div className="mx-3 mb-2 rounded-md border border-white/10 bg-white/5 px-3 py-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Platform Status</div>
            <div className="mt-1 flex items-center gap-1.5 text-[11.5px] text-emerald-300">
              <CircleDot className="h-3 w-3" /> Orchestration Engine Operational
            </div>
            <button className="mt-1 text-[11px] text-sky-300 hover:underline"
              onClick={() => toast.info("Orchestration engine status", { description: "All execution workers, state stores and approval services operational." })}>
              View status page
            </button>
            <div className="mt-1.5 text-[10.5px] text-slate-500">v2.18.4</div>
          </div>
        )}

        <button onClick={() => setCollapsed((v) => !v)}
          className="flex items-center gap-2 border-t border-white/10 px-4 py-2.5 text-[12px] text-slate-400 hover:bg-white/5">
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          {!collapsed && "Collapse Navigation"}
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-5 py-3">
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-slate-900">Agent Orchestration Administration</h1>
              <p className="mt-0.5 max-w-4xl text-[12.5px] text-slate-500">
                Tenant-level configuration of workflows, digital coworker participation, execution sequencing, durable state, handoffs,
                approvals, tool bindings, failure recovery and outcome validation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSearch(true)} aria-label="Search (press /)"
                className="flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-[12px] text-slate-500 hover:bg-white">
                <Search className="h-3.5 w-3.5" /> Search… <kbd className="rounded border border-slate-300 bg-white px-1 text-[10px]">/</kbd>
              </button>
              <select aria-label="Tenant" className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[12px] font-medium text-slate-700">
                <option>DUAL Insurance Group</option>
                <option>Meridian Specialty</option>
              </select>
              <button aria-label="Notifications" className="relative grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100">
                <Bell className="h-4 w-4" /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
              </button>
              <button aria-label="Help" className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"><HelpCircle className="h-4 w-4" /></button>
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <div className="grid h-7 w-7 place-items-center rounded-full bg-slate-800 text-[11px] font-semibold text-white">RN</div>
                <div className="leading-tight">
                  <div className="text-[12px] font-medium text-slate-800">Ravi N.</div>
                  <div className="text-[10.5px] text-slate-500">Platform Admin</div>
                </div>
              </div>
              <Btn variant="primary" onClick={() => setWizard(true)} className="h-8"><Plus className="h-3.5 w-3.5" /> Create Workflow</Btn>
            </div>
          </div>
        </header>

        <section className="border-b border-slate-200 bg-gradient-to-r from-[#0B1B33] to-[#12294A] px-5 py-4 text-white">
          <div className="flex flex-col gap-4 xl:flex-row">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-300">Powering neugain.io</div>
              <p className="mt-1 max-w-5xl text-[12.5px] leading-relaxed text-slate-200">
                Agent Orchestration is the coordination control plane for neugain.io digital coworkers. It decides what executes, in what
                order, by which participant, under which policy, with what state, and with which approvals — so autonomous work stays
                governed, recoverable, and explainable. Individual agent behaviour, model selection, and enterprise evidence are governed
                by their own planes; this plane governs coordination.
              </p>
              <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">neugain.io Core Principles</div>
              <div className="mt-1.5 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                {PRINCIPLES.map((pr) => (
                  <RichTip key={pr.id} as="div" tip={{ term: pr.title, definition: pr.hover }}>
                    <button onClick={() => setPrinciple(pr.id)} aria-label={`Inspect principle: ${pr.title}`}
                      className={cn("h-full w-full rounded-md border p-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
                        principle === pr.id ? "border-sky-400 bg-white/15" : "border-white/15 bg-white/5 hover:border-white/35 hover:bg-white/10")}>
                      <div className="text-[12px] font-semibold text-white">{pr.title}</div>
                      <p className="mt-0.5 text-[11px] leading-snug text-slate-300">{pr.short}</p>
                    </button>
                  </RichTip>
                ))}
              </div>
            </div>

            <div className="xl:w-[340px] xl:shrink-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Tenant Orchestration Outcomes</div>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {OUTCOMES.map((m) => (
                  <RichTip key={m.id} as="div" tip={{
                    term: m.label, definition: m.definition,
                    rows: [["Calculation", m.calculation], ["Target", m.target], ["Current", m.result], ["Trend", m.trend], ["Contributors", m.contributors]],
                    why: m.why,
                  }}>
                    <button onClick={() => setOutcome(m.id)} aria-label={`Inspect outcome: ${m.label}`}
                      className="h-full w-full rounded-md border border-white/15 bg-white/5 p-2 text-left transition-colors hover:border-white/35 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
                      <div className="text-[18px] font-semibold leading-none tabular-nums">{m.value}</div>
                      <div className="mt-1 text-[10.5px] leading-snug text-slate-300">{m.label}</div>
                    </button>
                  </RichTip>
                ))}
              </div>
            </div>
          </div>
        </section>

        <nav className="sticky top-0 z-20 flex gap-0.5 overflow-x-auto border-b border-slate-200 bg-white px-5" aria-label="Orchestration sections">
          {SUB_NAV.map((t) => (
            <NavLink key={t.to} to={{ pathname: t.to, search: params.toString() }} className={({ isActive }) => cn(
              "whitespace-nowrap border-b-2 px-3 py-2.5 text-[12.5px] transition-colors",
              isActive ? "border-blue-600 font-medium text-blue-700" : "border-transparent text-slate-600 hover:text-slate-900")}>
              {t.label}
            </NavLink>
          ))}
        </nav>

        <main className="min-w-0 flex-1 px-5 py-4">
          <Outlet />
        </main>
      </div>

      <CreateWorkflowWizard open={wizard} onClose={() => setWizard(false)}
        onPublished={(n, mode) => toast.success(
          mode === "Activate" ? "Workflow activated and available for orchestration." : `Workflow saved as ${mode}.`,
          { description: n })} />

      <GlobalSearch open={search} onClose={() => setSearch(false)}
        onSelect={(drawer) => { setSearch(false); navigate({ pathname: "/agent-orchestration/overview", search: `?drawer=${drawer}` }); }} />

      <InspectDrawer open={!!p} onClose={() => setPrinciple(null)} objectType="Platform Principle" name={p?.title ?? ""}
        tabs={[{ id: "detail", label: "Overview", content: p ? (
          <div>
            <p className="text-[12px] leading-relaxed text-slate-700">{p.hover}</p>
            <SubHead>Implementation principles</SubHead>
            <Bullets items={p.detail} />
          </div>) : null }]} />

      <InspectDrawer open={!!o} onClose={() => setOutcome(null)} objectType="Tenant Orchestration Outcome" name={o?.label ?? ""} status={o?.result} statusTone="ok"
        tabs={[{ id: "m", label: "Measurement", content: o ? (
          <div>
            <p className="text-[12px] leading-relaxed text-slate-700">{o.definition}</p>
            <SubHead>Measurement configuration</SubHead>
            <KV rows={[["Calculation", o.calculation], ["Target", o.target], ["Current result", o.result], ["Trend", o.trend], ["Largest contributors", o.contributors]]} />
            <SubHead>Why it matters</SubHead>
            <p className="text-[11.5px] leading-relaxed text-slate-700">{o.why}</p>
          </div>) : null }]} />
    </div>
    </HelpRegistry>
  );
}

function RailLink({ label, icon: Icon, to, collapsed }: { label: string; icon: any; to: string; collapsed: boolean }) {
  return (
    <NavLink to={to} className="mx-2 my-0.5 flex items-center gap-2 rounded-md px-2.5 py-2 text-[12.5px] text-slate-300 transition-colors hover:bg-white/5 hover:text-white">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}
