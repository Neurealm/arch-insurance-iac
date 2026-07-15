import { useNavigate } from "react-router-dom";
import { Plus, Sparkles, Command, ArrowRight, FileText, Workflow, LayoutDashboard, Laptop, Headset, ShieldCheck, Database, Server, Network, KeyRound, Cloud } from "lucide-react";
import { AppShell } from "@/components/eoc/AppShell";
import { CoworkersBackLink } from "@/components/eoc/CoworkersBackLink";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CoworkersCarveOut() {
  const nav = useNavigate();
  return (
    <AppShell>
      <CoworkersBackLink />
      <header className="bg-card border-b border-border">
        <div className="px-8 pt-5 pb-5 flex items-start gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-[26px] font-bold tracking-tight text-foreground leading-tight">
              Digital Coworkers — <span className="text-slate-700">IT Carve-Out & Separation</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              AI-powered teammates that accelerate divestiture, separation, and Day-1 readiness across infrastructure, apps, data, and identity.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-1">
            <Button onClick={() => nav("/carve-out")} className="h-11 px-5 font-semibold bg-navy hover:bg-navy/90 text-white shadow-[var(--shadow-md)]">
              <Sparkles className="h-4 w-4" /> Open Carve-Out Hub
            </Button>
            <Button onClick={() => nav("/coworkers/deploy")} className="bg-crimson hover:bg-crimson/90 text-crimson-foreground h-11 px-5 font-semibold shadow-[var(--shadow-md)]">
              <Plus className="h-4 w-4" /> Deploy New Digital Coworker
            </Button>
          </div>
        </div>

        <div className="px-8 pb-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { t: "Accelerate Separation", d: "Compress months of effort." },
            { t: "De-Risk Cutover", d: "Validate every dependency." },
            { t: "Exit TSAs Faster", d: "Reduce parent dependency cost." },
            { t: "Stabilize Day 1", d: "Automated hypercare triage." },
          ].map((p) => (
            <div key={p.t} className="rounded-xl bg-secondary/60 border border-border px-3.5 py-2.5">
              <div className="text-[11px] font-bold tracking-wide uppercase text-foreground">{p.t}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{p.d}</div>
            </div>
          ))}
        </div>
      </header>

      <main className="flex-1 px-8 py-6 animate-fade-in">
        <div className="mb-5">
          <h2 className="text-[15px] font-bold tracking-tight">Carve-Out Coworkers</h2>
          <p className="text-xs text-muted-foreground mt-0.5">AI-powered agents for separation orchestration and Day-1 readiness.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <article className="group bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)] card-hover flex flex-col">
            <div className="flex items-start gap-3">
              <div className={cn("h-12 w-12 rounded-xl grid place-items-center shrink-0 ring-1 bg-violet-500/10 text-violet-600 ring-violet-500/20")}>
                <Command className="h-6 w-6" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold grid place-items-center bg-violet-500/10 text-violet-600">01</span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Carve-Out Agent</span>
                </div>
                <h3 className="text-[15px] font-bold leading-snug mt-1.5">Enterprise Separation Command Center</h3>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-snug mt-4 flex-1">
              AI-powered mission control that orchestrates every workstream, uncovers risks early, and ensures Day-1 readiness for a successful separation and integration program.
            </p>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
              {[
                { label: "Overview",              icon: FileText,        to: "/coworkers/it-carve-out-and-separation/escc/overview" },
                { label: "Solution Design",       icon: Workflow,        to: "/coworkers/it-carve-out-and-separation/escc/solution-design" },
                { label: "Operational Dashboard", icon: LayoutDashboard, to: "/coworkers/it-carve-out-and-separation/escc/operational-dashboard" },
              ].map((b) => (
                <button
                  key={b.label}
                  onClick={() => nav(b.to)}
                  className="group/btn flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-lg border border-border bg-secondary/50 hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-700 transition-colors text-[10px] font-semibold text-foreground text-center leading-tight"
                >
                  <b.icon className="h-4 w-4" />
                  {b.label}
                </button>
              ))}
            </div>
          </article>

          <article className="group bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)] card-hover flex flex-col">
            <div className="flex items-start gap-3">
              <div className={cn("h-12 w-12 rounded-xl grid place-items-center shrink-0 ring-1 bg-blue-500/10 text-blue-600 ring-blue-500/20")}>
                <Laptop className="h-6 w-6" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold grid place-items-center bg-blue-500/10 text-blue-600">02</span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Carve-Out Agent</span>
                </div>
                <h3 className="text-[15px] font-bold leading-snug mt-1.5">EUC Provisioning Coworker</h3>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-snug mt-4 flex-1">
              AI-powered factory to deliver the right device, to the right user, on time—securely and at scale across the end-to-end provisioning lifecycle.
            </p>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
              {[
                { label: "Overview",              icon: FileText,        to: "/coworkers/it-carve-out-and-separation/euc/overview" },
                { label: "Solution Design",       icon: Workflow,        to: "/coworkers/it-carve-out-and-separation/euc/solution-design" },
                { label: "Operational Dashboard", icon: LayoutDashboard, to: "/coworkers/it-carve-out-and-separation/euc/operational-dashboard" },
              ].map((b) => (
                <button
                  key={b.label}
                  onClick={() => nav(b.to)}
                  className="group/btn flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-lg border border-border bg-secondary/50 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-700 transition-colors text-[10px] font-semibold text-foreground text-center leading-tight"
                >
                  <b.icon className="h-4 w-4" />
                  {b.label}
                </button>
              ))}
            </div>
          </article>

          <article className="group bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)] card-hover flex flex-col">
            <div className="flex items-start gap-3">
              <div className={cn("h-12 w-12 rounded-xl grid place-items-center shrink-0 ring-1 bg-emerald-500/10 text-emerald-600 ring-emerald-500/20")}>
                <Headset className="h-6 w-6" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold grid place-items-center bg-emerald-500/10 text-emerald-600">03</span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Carve-Out Agent</span>
                </div>
                <h3 className="text-[15px] font-bold leading-snug mt-1.5">Service Desk Triage Coworker</h3>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-snug mt-4 flex-1">
              AI-powered frontline support that resolves faster, deflects more, and lets your GCC focus on high-value work.
            </p>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
              {[
                { label: "Overview",              icon: FileText,        to: "/coworkers/it-carve-out-and-separation/sdt/overview" },
                { label: "Solution Design",       icon: Workflow,        to: "/coworkers/it-carve-out-and-separation/sdt/solution-design" },
                { label: "Operational Dashboard", icon: LayoutDashboard, to: "/coworkers/it-carve-out-and-separation/sdt/operational-dashboard" },
              ].map((b) => (
                <button
                  key={b.label}
                  onClick={() => nav(b.to)}
                  className="group/btn flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-lg border border-border bg-secondary/50 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-700 transition-colors text-[10px] font-semibold text-foreground text-center leading-tight"
                >
                  <b.icon className="h-4 w-4" />
                  {b.label}
                </button>
              ))}
            </div>
          </article>

          <article className="group bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)] card-hover flex flex-col">
            <div className="flex items-start gap-3">
              <div className={cn("h-12 w-12 rounded-xl grid place-items-center shrink-0 ring-1 bg-amber-500/10 text-amber-600 ring-amber-500/20")}>
                <ShieldCheck className="h-6 w-6" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold grid place-items-center bg-amber-500/10 text-amber-600">04</span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Carve-Out Agent</span>
                </div>
                <h3 className="text-[15px] font-bold leading-snug mt-1.5">Security Hygiene & Exposure Reduction Coworker</h3>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-snug mt-4 flex-1">
              AI-powered guardian that continuously reduces risk, closes exposure, and ensures secure Day 1 operations across users, apps, infrastructure and data.
            </p>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
              {[
                { label: "Overview",              icon: FileText,        to: "/coworkers/it-carve-out-and-separation/shx/overview" },
                { label: "Solution Design",       icon: Workflow,        to: "/coworkers/it-carve-out-and-separation/shx/solution-design" },
                { label: "Operational Dashboard", icon: LayoutDashboard, to: "/coworkers/it-carve-out-and-separation/shx/operational-dashboard" },
              ].map((b) => (
                <button
                  key={b.label}
                  onClick={() => nav(b.to)}
                  className="group/btn flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-lg border border-border bg-secondary/50 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-700 transition-colors text-[10px] font-semibold text-foreground text-center leading-tight"
                >
                  <b.icon className="h-4 w-4" />
                  {b.label}
                </button>
              ))}
            </div>
          </article>

          <article className="group bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)] card-hover flex flex-col">
            <div className="flex items-start gap-3">
              <div className={cn("h-12 w-12 rounded-xl grid place-items-center shrink-0 ring-1 bg-rose-500/10 text-rose-600 ring-rose-500/20")}>
                <Database className="h-6 w-6" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold grid place-items-center bg-rose-500/10 text-rose-600">05</span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Carve-Out Agent</span>
                </div>
                <h3 className="text-[15px] font-bold leading-snug mt-1.5">Application & Data Separation Coworker</h3>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-snug mt-4 flex-1">
              AI-powered separation of applications and data—accurate, secure, and ready for Day 1 across discovery, migration, cutover and validation.
            </p>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
              {[
                { label: "Overview",              icon: FileText,        to: "/coworkers/it-carve-out-and-separation/ads/overview" },
                { label: "Solution Design",       icon: Workflow,        to: "/coworkers/it-carve-out-and-separation/ads/solution-design" },
                { label: "Operational Dashboard", icon: LayoutDashboard, to: "/coworkers/it-carve-out-and-separation/ads/operational-dashboard" },
              ].map((b) => (
                <button
                  key={b.label}
                  onClick={() => nav(b.to)}
                  className="group/btn flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-lg border border-border bg-secondary/50 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-700 transition-colors text-[10px] font-semibold text-foreground text-center leading-tight"
                >
                  <b.icon className="h-4 w-4" />
                  {b.label}
                </button>
              ))}
            </div>
          </article>

          <article className="group bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)] card-hover flex flex-col">
            <div className="flex items-start gap-3">
              <div className={cn("h-12 w-12 rounded-xl grid place-items-center shrink-0 ring-1 bg-cyan-500/10 text-cyan-600 ring-cyan-500/20")}>
                <Server className="h-6 w-6" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold grid place-items-center bg-cyan-500/10 text-cyan-600">06</span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Carve-Out Agent</span>
                </div>
                <h3 className="text-[15px] font-bold leading-snug mt-1.5">Infrastructure & Operations Continuity Coworker</h3>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-snug mt-4 flex-1">
              AI-powered guardian of infrastructure, networks, and environments—ensuring resilient Day 1 operations with zero surprises across separation and integration.
            </p>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
              {[
                { label: "Overview",              icon: FileText,        to: "/coworkers/it-carve-out-and-separation/ioc/overview" },
                { label: "Solution Design",       icon: Workflow,        to: "/coworkers/it-carve-out-and-separation/ioc/solution-design" },
                { label: "Operational Dashboard", icon: LayoutDashboard, to: "/coworkers/it-carve-out-and-separation/ioc/operational-dashboard" },
              ].map((b) => (
                <button
                  key={b.label}
                  onClick={() => nav(b.to)}
                  className="group/btn flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-lg border border-border bg-secondary/50 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-700 transition-colors text-[10px] font-semibold text-foreground text-center leading-tight"
                >
                  <b.icon className="h-4 w-4" />
                  {b.label}
                </button>
              ))}
            </div>
          </article>

          <article className="group bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)] card-hover flex flex-col">
            <div className="flex items-start gap-3">
              <div className={cn("h-12 w-12 rounded-xl grid place-items-center shrink-0 ring-1 bg-indigo-500/10 text-indigo-600 ring-indigo-500/20")}>
                <Network className="h-6 w-6" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold grid place-items-center bg-indigo-500/10 text-indigo-600">07</span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Carve-Out Agent</span>
                </div>
                <h3 className="text-[15px] font-bold leading-snug mt-1.5">Network Cutover & Connectivity Coworker</h3>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-snug mt-4 flex-1">
              AI-powered orchestration of network cutovers and connectivity—executed safely, with zero surprises and full visibility across global sites on Day 1 and beyond.
            </p>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
              {[
                { label: "Overview",              icon: FileText,        to: "/coworkers/it-carve-out-and-separation/ncc/overview" },
                { label: "Solution Design",       icon: Workflow,        to: "/coworkers/it-carve-out-and-separation/ncc/solution-design" },
                { label: "Operational Dashboard", icon: LayoutDashboard, to: "/coworkers/it-carve-out-and-separation/ncc/operational-dashboard" },
              ].map((b) => (
                <button
                  key={b.label}
                  onClick={() => nav(b.to)}
                  className="group/btn flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-lg border border-border bg-secondary/50 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-700 transition-colors text-[10px] font-semibold text-foreground text-center leading-tight"
                >
                  <b.icon className="h-4 w-4" />
                  {b.label}
                </button>
              ))}
            </div>
          </article>

          <article className="group bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)] card-hover flex flex-col">
            <div className="flex items-start gap-3">
              <div className={cn("h-12 w-12 rounded-xl grid place-items-center shrink-0 ring-1 bg-purple-500/10 text-purple-600 ring-purple-500/20")}>
                <KeyRound className="h-6 w-6" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold grid place-items-center bg-purple-500/10 text-purple-600">08</span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Carve-Out Agent</span>
                </div>
                <h3 className="text-[15px] font-bold leading-snug mt-1.5">Identity & Access Transition Coworker</h3>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-snug mt-4 flex-1">
              AI-powered identity and access orchestration—ensuring the right access, for the right people, at the right time, securely on Day 1 and beyond.
            </p>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
              {[
                { label: "Overview",              icon: FileText,        to: "/coworkers/it-carve-out-and-separation/iat/overview" },
                { label: "Solution Design",       icon: Workflow,        to: "/coworkers/it-carve-out-and-separation/iat/solution-design" },
                { label: "Operational Dashboard", icon: LayoutDashboard, to: "/coworkers/it-carve-out-and-separation/iat/operational-dashboard" },
              ].map((b) => (
                <button
                  key={b.label}
                  onClick={() => nav(b.to)}
                  className="group/btn flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-lg border border-border bg-secondary/50 hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-700 transition-colors text-[10px] font-semibold text-foreground text-center leading-tight"
                >
                  <b.icon className="h-4 w-4" />
                  {b.label}
                </button>
              ))}
            </div>
          </article>

          <article className="group bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)] card-hover flex flex-col">
            <div className="flex items-start gap-3">
              <div className={cn("h-12 w-12 rounded-xl grid place-items-center shrink-0 ring-1 bg-sky-500/10 text-sky-600 ring-sky-500/20")}>
                <Cloud className="h-6 w-6" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold grid place-items-center bg-sky-500/10 text-sky-600">09</span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Carve-Out Agent</span>
                </div>
                <h3 className="text-[15px] font-bold leading-snug mt-1.5">Cloud Migration & Modernization Coworker</h3>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-snug mt-4 flex-1">
              AI-powered orchestration of cloud migrations and modernization—secure, cost-optimized, and built for performance from Day 1 and beyond.
            </p>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
              {[
                { label: "Overview",              icon: FileText,        to: "/coworkers/it-carve-out-and-separation/cmm/overview" },
                { label: "Solution Design",       icon: Workflow,        to: "/coworkers/it-carve-out-and-separation/cmm/solution-design" },
                { label: "Operational Dashboard", icon: LayoutDashboard, to: "/coworkers/it-carve-out-and-separation/cmm/operational-dashboard" },
              ].map((b) => (
                <button
                  key={b.label}
                  onClick={() => nav(b.to)}
                  className="group/btn flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-lg border border-border bg-secondary/50 hover:bg-sky-500/10 hover:border-sky-500/30 hover:text-sky-700 transition-colors text-[10px] font-semibold text-foreground text-center leading-tight"
                >
                  <b.icon className="h-4 w-4" />
                  {b.label}
                </button>
              ))}
            </div>
          </article>
        </div>
      </main>
    </AppShell>
  );
}