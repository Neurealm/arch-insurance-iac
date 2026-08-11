// Global application shell for the neugain.io Context / Evidence Layer
// administration plane: fixed left rail, page header, purpose banner,
// outcome indicators and secondary tab navigation.

import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Bell, HelpCircle, ChevronDown, ChevronRight, PanelLeftClose, PanelLeft, Plus,
  Building2, Users, Database, Boxes, Bot, Cpu, Workflow, FileSearch, Settings, Search,
} from "lucide-react";
import { OUTCOMES, PRINCIPLES } from "./data";
import { InspectDrawer, RichTip, Bullets, SubHead, KV, Btn } from "./parts";
import { AddSourceWizard } from "./AddSourceWizard";
import { GlobalSearch } from "./GlobalSearch";
import { toast } from "sonner";

const SUB_NAV = [
  { to: "/context-evidence/overview", label: "Overview" },
  { to: "/context-evidence/sources", label: "Sources & Connectors" },
  { to: "/context-evidence/data-model", label: "Data Model & Schemas" },
  { to: "/context-evidence/indexing", label: "Indexing & Storage" },
  { to: "/context-evidence/policies", label: "Policies & Governance" },
  { to: "/context-evidence/quality", label: "Quality & Lineage" },
  { to: "/context-evidence/access", label: "Access & Security" },
  { to: "/context-evidence/settings", label: "Settings" },
];

const RAIL_TOP = [
  { label: "Tenant Overview", icon: Building2, to: "/context-evidence/overview" },
  { label: "Identity & Access", icon: Users, to: "/context-evidence/access" },
];

const RAIL_BOTTOM = [
  { label: "Agents & Coworkers", icon: Bot },
  { label: "Models & Routing", icon: Cpu },
  { label: "Workflows", icon: Workflow },
  { label: "Audit & Compliance", icon: FileSearch },
  { label: "Settings", icon: Settings },
];

const CE_CHILDREN = [
  { label: "Overview", to: "/context-evidence/overview" },
  { label: "Sources & Connectors", to: "/context-evidence/sources" },
  { label: "Data Model & Schemas", to: "/context-evidence/data-model" },
  { label: "Indexing & Storage", to: "/context-evidence/indexing" },
  { label: "Policies & Governance", to: "/context-evidence/policies" },
  { label: "Quality & Lineage", to: "/context-evidence/quality" },
];

export default function ContextEvidenceLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [wizard, setWizard] = useState(false);
  const [search, setSearch] = useState(false);
  const [principle, setPrinciple] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) {
        e.preventDefault(); setSearch(true);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const p = useMemo(() => PRINCIPLES.find((x) => x.id === principle), [principle]);
  const o = useMemo(() => OUTCOMES.find((x) => x.id === outcome), [outcome]);

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] text-slate-900">
      {/* Left rail */}
      <aside className={cn("sticky top-0 flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200", collapsed ? "w-[64px]" : "w-[230px]")}>
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="text-[13px] font-bold tracking-tight text-slate-900">{collapsed ? "N" : "NEUGAIN.IO"}</div>
          {!collapsed && <div className="text-[10.5px] text-slate-500">Digital Coworker Platform</div>}
        </div>

        <nav className="flex-1 overflow-y-auto py-2" aria-label="Administration">
          {!collapsed && <div className="px-4 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Administration</div>}
          {RAIL_TOP.map((i) => (
            <RailLink key={i.label} {...i} collapsed={collapsed} />
          ))}

          <div>
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className={cn("mx-2 my-0.5 flex w-[calc(100%-16px)] items-center gap-2 rounded-md px-2.5 py-2 text-[12.5px] transition-colors",
                pathname.startsWith("/context-evidence") ? "bg-blue-50 font-medium text-blue-800" : "text-slate-700 hover:bg-slate-50")}
            >
              <Database className="h-4 w-4 shrink-0" />
              {!collapsed && <><span className="flex-1 truncate text-left">Context / Evidence Layer</span>
                {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}</>}
            </button>
            {expanded && !collapsed && (
              <div className="mb-1 ml-6 border-l border-slate-200 pl-2">
                {CE_CHILDREN.map((c) => (
                  <NavLink key={c.to} to={c.to} className={({ isActive }) => cn(
                    "block rounded px-2 py-1.5 text-[12px] transition-colors",
                    isActive ? "bg-blue-50 font-medium text-blue-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")}>
                    {c.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {RAIL_BOTTOM.map((i) => (
            <button key={i.label} onClick={() => toast.info(`${i.label} is administered outside the Context / Evidence Layer.`)}
              className="mx-2 my-0.5 flex w-[calc(100%-16px)] items-center gap-2 rounded-md px-2.5 py-2 text-[12.5px] text-slate-700 transition-colors hover:bg-slate-50">
              <i.icon className="h-4 w-4 shrink-0 text-slate-500" />
              {!collapsed && <span className="truncate">{i.label}</span>}
            </button>
          ))}
        </nav>

        <button onClick={() => setCollapsed((v) => !v)}
          className="flex items-center gap-2 border-t border-slate-200 px-4 py-2.5 text-[12px] text-slate-600 hover:bg-slate-50">
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          {!collapsed && "Collapse Navigation"}
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-5 py-3">
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-slate-900">Context / Evidence Layer Administration</h1>
              <p className="mt-0.5 text-[12.5px] text-slate-500">
                Tenant-level configuration of enterprise context, connectors, models, policy, and governance used by neugain.io digital coworkers.
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
              <Btn variant="primary" onClick={() => setWizard(true)} className="h-8"><Plus className="h-3.5 w-3.5" /> Add Source / Connector</Btn>
            </div>
          </div>
        </header>

        {/* Purpose banner */}
        <section className="border-b border-slate-200 bg-gradient-to-r from-[#0B1B33] to-[#12294A] px-5 py-4 text-white">
          <div className="flex flex-col gap-4 xl:flex-row">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-300">Powering neugain.io</div>
              <p className="mt-1 max-w-4xl text-[12.5px] leading-relaxed text-slate-200">
                The Context / Evidence Layer is the trusted enterprise evidence foundation for neugain.io. It transforms fragmented
                enterprise data into governed, connected, permission-aware context that digital coworkers can use to reason, decide, and act.
              </p>
              <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">neugain.io Core Principles</div>
              <div className="mt-1.5 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                {PRINCIPLES.map((pr) => (
                  <RichTip key={pr.id} as="div" tip={{ term: pr.title, definition: pr.hover }}>
                    <button onClick={() => setPrinciple(pr.id)}
                      className={cn("h-full w-full rounded-md border p-2 text-left transition-colors",
                        principle === pr.id ? "border-sky-400 bg-white/15" : "border-white/15 bg-white/5 hover:border-white/35 hover:bg-white/10")}>
                      <div className="text-[12px] font-semibold text-white">{pr.title}</div>
                      <p className="mt-0.5 text-[11px] leading-snug text-slate-300">{pr.short}</p>
                    </button>
                  </RichTip>
                ))}
              </div>
            </div>

            <div className="xl:w-[340px] xl:shrink-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Tenant Context Outcomes</div>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {OUTCOMES.map((m) => (
                  <RichTip key={m.id} as="div" tip={{
                    term: m.label, definition: m.definition,
                    rows: [["Calculation", m.calculation], ["Target", m.target], ["Current", m.result], ["Measured by", m.measuredBy]],
                    why: m.why,
                  }}>
                    <button onClick={() => setOutcome(m.id)}
                      className="h-full w-full rounded-md border border-white/15 bg-white/5 p-2 text-left transition-colors hover:border-white/35 hover:bg-white/10">
                      <div className="text-[18px] font-semibold leading-none tabular-nums">{m.value}</div>
                      <div className="mt-1 text-[10.5px] leading-snug text-slate-300">{m.label}</div>
                    </button>
                  </RichTip>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Secondary tabs */}
        <nav className="sticky top-0 z-20 flex gap-0.5 overflow-x-auto border-b border-slate-200 bg-white px-5" aria-label="Context Evidence sections">
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

      <AddSourceWizard open={wizard} onClose={() => setWizard(false)} onActivated={(n) => { setWizard(false); toast.success("Connector successfully registered.", { description: n }); }} />
      <GlobalSearch open={search} onClose={() => setSearch(false)} onSelect={(route) => { setSearch(false); navigate(route); }} />

      <InspectDrawer open={!!p} onClose={() => setPrinciple(null)} objectType="Platform Principle" name={p?.title ?? ""}
        tabs={[{ id: "detail", label: "Overview", content: p ? (<div><p className="text-[12px] leading-relaxed text-slate-700">{p.hover}</p><SubHead>Implementation principles</SubHead><Bullets items={p.detail} /></div>) : null }]} />

      <InspectDrawer open={!!o} onClose={() => setOutcome(null)} objectType="Tenant Context Outcome" name={o?.label ?? ""} status={o?.result} statusTone="ok"
        tabs={[{ id: "m", label: "Measurement", content: o ? (
          <div>
            <p className="text-[12px] leading-relaxed text-slate-700">{o.definition}</p>
            <SubHead>Measurement configuration</SubHead>
            <KV rows={[["Calculation", o.calculation], ["Target", o.target], ["Current result", o.result], ["Source of measurement", o.measuredBy]]} />
            <SubHead>Why it matters</SubHead>
            <p className="text-[11.5px] leading-relaxed text-slate-700">{o.why}</p>
          </div>) : null }]} />
    </div>
  );
}

function RailLink({ label, icon: Icon, to, collapsed }: { label: string; icon: any; to: string; collapsed: boolean }) {
  return (
    <NavLink to={to} className={({ isActive }) => cn(
      "mx-2 my-0.5 flex items-center gap-2 rounded-md px-2.5 py-2 text-[12.5px] transition-colors",
      isActive ? "bg-blue-50 font-medium text-blue-800" : "text-slate-700 hover:bg-slate-50")}>
      <Icon className="h-4 w-4 shrink-0 text-slate-500" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}
