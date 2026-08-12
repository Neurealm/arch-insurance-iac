// Application shell for the neugain.io Agentic AI IAM administration plane:
// fixed dark navy left rail, page header, dark navy purpose banner with the
// identity principles and the IAM service contract, and routable section tabs.

import { useEffect, useState } from "react";
import { NavLink, Outlet, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { railTop, railBottom } from "@/pages/_admin/rail";
import {
  Bell, HelpCircle, ChevronDown, PanelLeftClose, PanelLeft, Plus, Building2, Users,
  Database, Bot, Cpu, Workflow, FileSearch, Settings, ShieldCheck, CircleDot, MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { HELP, PRINCIPLES, SERVICE_CONTRACT, BOUNDARIES } from "./data";
import { HelpRegistry, InspectDrawer, RichTip, Bullets, SubHead, KV, Btn } from "./parts";
import { CreateCoworkerWizard } from "./panels";

const SUB_NAV = [
  { to: "/iam-admin/overview", label: "Overview" },
  { to: "/iam-admin/identities", label: "Identities" },
  { to: "/iam-admin/digital-coworkers", label: "Digital Coworkers" },
  { to: "/iam-admin/roles", label: "Roles & Permissions" },
  { to: "/iam-admin/policies", label: "Access Policies" },
  { to: "/iam-admin/delegation", label: "Delegation & JIT" },
  { to: "/iam-admin/credentials", label: "Credentials & Sessions" },
  { to: "/iam-admin/reviews", label: "Access Reviews" },
  { to: "/iam-admin/audit", label: "Audit & Evidence" },
];

const RAIL_TOP = railTop("iam");

const RAIL_BOTTOM = railBottom({ auditTo: "/iam-admin/audit", settingsTo: "/iam-admin/settings" });

const OVERFLOW = [
  { label: "Create Role", detail: "Define a scoped bundle of permissions, constraints and model capability entitlements." },
  { label: "Create Access Policy", detail: "Define subject, action, resource, condition and effect for runtime authorization." },
  { label: "Register Service Account", detail: "Register a non-human identity with an owner, credential method and rotation policy." },
  { label: "Start Access Review", detail: "Launch a recertification campaign for a class of identities or a privileged role." },
];

export default function IamAdminLayout() {
  const [params] = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const [wizard, setWizard] = useState(false);
  const [overflow, setOverflow] = useState(false);
  const [principle, setPrinciple] = useState<string | null>(null);
  const [contract, setContract] = useState(false);

  useEffect(() => {
    if (!overflow) return;
    const h = () => setOverflow(false);
    window.addEventListener("click", h);
    return () => window.removeEventListener("click", h);
  }, [overflow]);

  const p = PRINCIPLES.find((x) => x.id === principle);

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
              <Users className="h-4 w-4 shrink-0 text-sky-300" />
              {!collapsed && <><span className="flex-1">Identity &amp; Access</span><ChevronDown className="h-3.5 w-3.5 text-slate-400" /></>}
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
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Identity Services</div>
              <div className="mt-1 flex items-center gap-1.5 text-[11.5px] text-emerald-300">
                <CircleDot className="h-3 w-3" /> Authentication and policy decision healthy
              </div>
              <button className="mt-1 text-[11px] text-sky-300 hover:underline"
                onClick={() => toast.info("Identity service status", {
                  description: "Token issuance, policy decision point, delegation service and review engine operational. Secret rotation job degraded for 2 service accounts.",
                })}>
                View status page
              </button>
              <div className="mt-1.5 text-[10.5px] text-slate-500">Version v3.6.1</div>
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
                  Agentic AI IAM Administration
                </h1>
                <p className="mt-0.5 max-w-4xl text-[12.5px] text-slate-500">
                  Tenant-level identity and access control plane for digital coworkers, human users, service accounts, workload
                  identities and API clients: roles, permissions, policies, delegated authority, credentials, execution identity and review.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select aria-label="Tenant" className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[12px] font-medium text-slate-700">
                  <option>DUAL Insurance Group</option>
                  <option>Meridian Specialty</option>
                </select>
                <button aria-label="Notifications"
                  onClick={() => toast.warning("3 identity risks require attention", { description: "1 unowned service account, 1 privileged persistent secret overdue for rotation, 1 dormant coworker identity." })}
                  className="relative grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100">
                  <Bell className="h-4 w-4" /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
                </button>
                <button aria-label="Help"
                  onClick={() => toast.info("IAM administration help", { description: "Use the help markers on each panel for definitions, evaluation order and control descriptions." })}
                  className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"><HelpCircle className="h-4 w-4" /></button>
                <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-slate-800 text-[11px] font-semibold text-white">RN</div>
                  <div className="leading-tight">
                    <div className="text-[12px] font-medium text-slate-800">Ravi N.</div>
                    <div className="text-[10.5px] text-slate-500">Platform Admin</div>
                  </div>
                </div>
                <Btn variant="primary" onClick={() => setWizard(true)} className="h-8"><Plus className="h-3.5 w-3.5" /> Create Digital Coworker Identity</Btn>
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
                  The IAM layer determines who and what may act inside the tenant, what each identity may access, under which
                  conditions, for how long and with which evidence retained. Digital coworkers are governed as first-class
                  non-human identities, not as extensions of a human account.
                </p>
                <p className="mt-2 max-w-5xl rounded border-l-2 border-sky-400 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-sky-200">
                  Engineering principle: autonomy is only safe when identity, entitlement, context and expiry are all enforced at execution time.
                </p>

                <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">neugain.io Identity Principles</div>
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

              <div className="w-full shrink-0 xl:w-[320px]">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">IAM Service Contract</div>
                <button onClick={() => setContract(true)}
                  className="mt-1.5 w-full rounded-md border border-white/10 bg-white/5 p-2.5 text-left hover:border-white/25 hover:bg-white/10">
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-white">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" /> Every identity is
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {SERVICE_CONTRACT.map(([k]) => (
                      <span key={k} className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10.5px] text-slate-300">{k}</span>
                    ))}
                  </div>
                  <div className="mt-1.5 text-[11px] text-sky-300">Inspect contract →</div>
                </button>
              </div>
            </div>
          </section>

          <nav className="sticky top-[86px] z-20 flex gap-0.5 overflow-x-auto border-b border-slate-200 bg-white px-4" aria-label="Sections">
            {[...SUB_NAV, { to: "/iam-admin/settings", label: "Settings" }].map((t) => (
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

        <CreateCoworkerWizard open={wizard} onClose={() => setWizard(false)} />

        <InspectDrawer open={!!p} onClose={() => setPrinciple(null)} objectType="Identity Principle" name={p?.title ?? ""}
          tabs={[{ id: "detail", label: "Overview", content: p ? (
            <div>
              <p className="text-[12px] leading-relaxed text-slate-700">{p.hover}</p>
              <SubHead>Implementation principles</SubHead>
              <Bullets items={[...p.detail]} />
            </div>) : null }]} />

        <InspectDrawer open={contract} onClose={() => setContract(false)} objectType="Platform Contract" name="IAM Service Contract" status="Enforced" statusTone="ok"
          tabs={[
            { id: "contract", label: "Contract", content: <KV rows={SERVICE_CONTRACT} /> },
            { id: "boundaries", label: "Boundaries", content: (
              <div>
                <p className="text-[12px] leading-relaxed text-slate-700">
                  IAM authorizes. Other layers decide relevance, routing, participation and execution.
                </p>
                <SubHead>Layer responsibilities</SubHead>
                <KV rows={BOUNDARIES} />
              </div>
            ) },
          ]} />
      </div>
    </HelpRegistry>
  );
}

function RailLink({ label, icon: Icon, to, collapsed }: { label: string; icon: any; to: string; collapsed: boolean }) {
  return (
    <NavLink to={to} title={label}
      className="mx-2 my-px flex items-center gap-2 rounded-md px-2.5 py-2 text-[12.5px] text-slate-300 transition-colors hover:bg-white/5 hover:text-white">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}
