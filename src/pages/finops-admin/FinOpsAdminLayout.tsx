// Application shell for the neugain.io Agentic AI FinOps & Cost Management
// administration plane: fixed dark navy left rail, page header, dark navy
// purpose banner with core principles and tenant FinOps outcomes, and routable
// section tabs.

import { useEffect, useState } from "react";
import { NavLink, Outlet, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { railTop, railBottom } from "@/pages/_admin/rail";
import {
  Bell, HelpCircle, ChevronDown, PanelLeftClose, PanelLeft, Plus, Building2, Users,
  Database, Bot, Cpu, Workflow, FileSearch, Settings, Wallet, CircleDot, MoreHorizontal,
} from "lucide-react";
import { OUTCOMES, PRINCIPLES, HELP } from "./data";
import { InspectDrawer, RichTip, Bullets, SubHead, KV, Btn, HelpRegistry } from "./parts";
import { CreatePolicyWizard } from "./CreatePolicyWizard";
import { toast } from "sonner";

const SUB_NAV = [
  { to: "/finops-admin/overview", label: "Overview" },
  { to: "/finops-admin/cost-policies", label: "Cost Policies" },
  { to: "/finops-admin/cloud-accounts", label: "Cloud Accounts" },
  { to: "/finops-admin/optimization-registry", label: "Optimization Registry" },
  { to: "/finops-admin/unit-economics", label: "Unit Economics" },
  { to: "/finops-admin/approval-execution", label: "Approval & Execution" },
  { to: "/finops-admin/savings-validation", label: "Savings Validation" },
  { to: "/finops-admin/evaluations", label: "Evaluations" },
  { to: "/finops-admin/access-security", label: "Access & Security" },
];

const RAIL_TOP = railTop("finops");

const RAIL_BOTTOM = railBottom({ auditTo: "/finops-admin/savings-validation", settingsTo: "/finops-admin/settings" });

const OVERFLOW = [
  { label: "Add Cloud Account", detail: "Register a provider account, subscription, project or cluster for billing and telemetry ingestion." },
  { label: "Create Allocation Rule", detail: "Define how shared or untagged spend is attributed to accountable cost objects." },
  { label: "Create Savings Validation Policy", detail: "Define the evidence required before executed savings may be reported as realized." },
  { label: "Create Unit Economics Model", detail: "Bind allocated spend to a governed business demand driver." },
];

export default function FinOpsAdminLayout() {
  const [params] = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const [wizard, setWizard] = useState(false);
  const [overflow, setOverflow] = useState(false);
  const [principle, setPrinciple] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);

  useEffect(() => {
    if (!overflow) return;
    const h = () => setOverflow(false);
    window.addEventListener("click", h);
    return () => window.removeEventListener("click", h);
  }, [overflow]);

  const p = PRINCIPLES.find((x) => x.id === principle);
  const o = OUTCOMES.find((x) => x.id === outcome);

  return (
    <HelpRegistry value={HELP}>
      <div className="flex min-h-screen bg-[#F7F9FC] text-slate-900">
        <aside className={cn("sticky top-0 flex h-screen shrink-0 flex-col border-r border-slate-200 bg-[#0B1B33] text-slate-200 transition-all", collapsed ? "w-[64px]" : "w-[238px]")}>
          <div className="border-b border-white/10 px-4 py-3">
            <div className="text-[14px] font-semibold tracking-tight text-white">{collapsed ? "N" : "NEUGAIN.IO"}</div>
            {!collapsed && <div className="text-[10.5px] text-slate-400">Digital Coworker Platform</div>}
          </div>

          <nav className="flex-1 overflow-y-auto py-2" aria-label="Administration">
            {!collapsed && <div className="px-4 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Administration</div>}
            {RAIL_TOP.map((r) => <RailLink key={r.label} {...r} collapsed={collapsed} />)}

            <div className="mx-2 my-0.5 flex items-center gap-2 rounded-md bg-white/10 px-2.5 py-2 text-[12.5px] font-medium text-white">
              <Wallet className="h-4 w-4 shrink-0 text-emerald-300" />
              {!collapsed && <><span className="flex-1">AI Cost Management</span><ChevronDown className="h-3.5 w-3.5 text-slate-400" /></>}
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
                <CircleDot className="h-3 w-3" /> All Systems Operational
              </div>
              <button className="mt-1 text-[11px] text-sky-300 hover:underline"
                onClick={() => toast.info("FinOps platform status", {
                  description: "Ingestion, allocation, scoring, approval and validation services operational. Kubernetes metering agent degraded in AKS non-production.",
                })}>
                View status page
              </button>
              <div className="mt-1.5 text-[10.5px] text-slate-500">Version v2.18.4</div>
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
                <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-slate-900">
                  Agentic AI FinOps &amp; Cost Management Administration
                </h1>
                <p className="mt-0.5 max-w-4xl text-[12.5px] text-slate-500">
                  Tenant-level configuration of cloud cost governance, optimization policies, unit economics, execution approvals,
                  savings validation and financial controls used by neugain.io digital coworkers.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select aria-label="Tenant" className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[12px] font-medium text-slate-700">
                  <option>DUAL Insurance Group</option>
                  <option>Meridian Specialty</option>
                </select>
                <button aria-label="Notifications"
                  onClick={() => toast.warning("4 cloud accounts degraded", { description: "AKS non-production metering agent offline since 09:14 UTC. Kubernetes opportunities held in Attention." })}
                  className="relative grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100">
                  <Bell className="h-4 w-4" /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
                </button>
                <button aria-label="Help"
                  onClick={() => toast.info("FinOps administration help", { description: "Use the help markers on each panel for definitions, thresholds and control descriptions." })}
                  className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"><HelpCircle className="h-4 w-4" /></button>
                <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-slate-800 text-[11px] font-semibold text-white">RN</div>
                  <div className="leading-tight">
                    <div className="text-[12px] font-medium text-slate-800">Ravi N.</div>
                    <div className="text-[10.5px] text-slate-500">Platform Admin</div>
                  </div>
                </div>
                <Btn variant="primary" onClick={() => setWizard(true)} className="h-8"><Plus className="h-3.5 w-3.5" /> Create Optimization Policy</Btn>
                <div className="relative">
                  <button aria-label="More actions" aria-expanded={overflow}
                    onClick={(e) => { e.stopPropagation(); setOverflow((v) => !v); }}
                    className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {overflow && (
                    <div className="absolute right-0 top-9 z-40 w-[280px] rounded-md border border-slate-200 bg-white py-1 shadow-xl">
                      {OVERFLOW.map((a) => (
                        <button key={a.label} onClick={() => toast.info(a.label, { description: a.detail })}
                          className="block w-full px-3 py-1.5 text-left text-[12px] text-slate-700 hover:bg-slate-50">
                          {a.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <section className="border-b border-slate-200 bg-gradient-to-r from-[#0B1B33] to-[#12294A] px-5 py-4 text-white">
            <div className="flex flex-col gap-4 xl:flex-row">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-300">Powering neugain.io</div>
                <p className="mt-1 max-w-5xl text-[12.5px] leading-relaxed text-slate-200">
                  The Agentic AI FinOps &amp; Cost Management layer governs how digital coworkers identify, prioritize, approve, execute
                  and validate cloud cost optimization across enterprise cloud and platform spend while protecting performance,
                  reliability, security and business outcomes.
                </p>
                <p className="mt-2 max-w-5xl rounded border-l-2 border-emerald-400 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-emerald-200">
                  Engineering principle: optimization does not become value until the change is safely executed and the financial outcome is validated.
                </p>

                <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">neugain.io Core Principles</div>
                <div className="mt-1.5 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                  {PRINCIPLES.map((pr) => (
                    <RichTip key={pr.id} as="div" tip={{ term: pr.title, definition: pr.hover, why: pr.short }}>
                      <button onClick={() => setPrinciple(pr.id)}
                        className={cn("h-full w-full rounded-md border p-2.5 text-left transition-colors",
                          principle === pr.id ? "border-sky-400 bg-sky-400/15" : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10")}>
                        <div className="text-[12px] font-semibold text-white">{pr.title}</div>
                        <div className="mt-1 text-[11px] leading-snug text-slate-300">{pr.short}</div>
                      </button>
                    </RichTip>
                  ))}
                </div>
              </div>

              <div className="w-full shrink-0 xl:w-[300px]">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Tenant FinOps Outcomes</div>
                <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2 xl:grid-cols-1">
                  {OUTCOMES.map((oc) => (
                    <RichTip key={oc.id} as="div" tip={{
                      term: oc.label, definition: oc.definition,
                      rows: [["Target", oc.target], ["Current", oc.result], ["Formula", oc.calculation], ["Trend", oc.trend]],
                      why: oc.why,
                    }}>
                      <button onClick={() => setOutcome(oc.id)}
                        className={cn("flex w-full items-center justify-between gap-3 rounded-md border px-2.5 py-1.5 text-left transition-colors",
                          outcome === oc.id ? "border-sky-400 bg-sky-400/15" : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10")}>
                        <span className="min-w-0 text-[11.5px] text-slate-300">{oc.label}</span>
                        <span className="shrink-0 text-[14px] font-semibold tabular-nums text-white">{oc.result}</span>
                      </button>
                    </RichTip>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <nav className="sticky top-[86px] z-20 flex gap-0.5 overflow-x-auto border-b border-slate-200 bg-white px-4" aria-label="Sections">
            {[...SUB_NAV, { to: "/finops-admin/settings", label: "Settings" }].map((t) => (
              <NavLink key={t.to} to={{ pathname: t.to, search: params.toString() }} end
                className={({ isActive }) => cn(
                  "whitespace-nowrap border-b-2 px-3 py-2 text-[12.5px] transition-colors",
                  isActive ? "border-blue-600 font-medium text-blue-700" : "border-transparent text-slate-600 hover:text-slate-900")}>
                {t.label}
              </NavLink>
            ))}
          </nav>

          <main className="min-w-0 flex-1 px-5 py-4">
            <Outlet />
          </main>
        </div>

        <CreatePolicyWizard open={wizard} onClose={() => setWizard(false)}
          onPublished={(n, mode) => toast.success(
            mode === "Activate" ? "Optimization policy published and active." : `Optimization policy saved as ${mode}.`,
            { description: n })} />

        <InspectDrawer open={!!p} onClose={() => setPrinciple(null)} objectType="Platform Principle" name={p?.title ?? ""}
          tabs={[{ id: "detail", label: "Overview", content: p ? (
            <div>
              <p className="text-[12px] leading-relaxed text-slate-700">{p.hover}</p>
              <SubHead>Implementation principles</SubHead>
              <Bullets items={[...p.detail]} />
            </div>) : null }]} />

        <InspectDrawer open={!!o} onClose={() => setOutcome(null)} objectType="Tenant FinOps Outcome" name={o?.label ?? ""} status={o?.result} statusTone="ok"
          tabs={[{ id: "m", label: "Measurement", content: o ? (
            <div>
              <p className="text-[12px] leading-relaxed text-slate-700">{o.definition}</p>
              <SubHead>Measurement configuration</SubHead>
              <KV rows={[["Formula", o.calculation], ["Target", o.target], ["Current result", o.result], ["Trend", o.trend], ["Largest contributors", o.contributors]]} />
              <SubHead>Why it matters</SubHead>
              <p className="text-[11.5px] leading-relaxed text-slate-700">{o.why}</p>
            </div>) : null }]} />
      </div>
    </HelpRegistry>
  );
}

function RailLink({ label, icon: Icon, to, collapsed }: { label: string; icon: any; to: string; collapsed: boolean }) {
  return (
    <NavLink to={to} title={collapsed ? label : undefined}
      className="mx-2 my-0.5 flex items-center gap-2 rounded-md px-2.5 py-2 text-[12.5px] text-slate-300 transition-colors hover:bg-white/5 hover:text-white">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}
