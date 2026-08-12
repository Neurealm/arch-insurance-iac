import { AppShell } from "@/components/eoc/AppShell";
import { Link } from "react-router-dom";
import { Headphones, Briefcase, Bot } from "lucide-react";

export default function Itsm() {
  return (
    <AppShell>
      <main className="flex-1 px-8 py-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-navy text-white grid place-items-center shadow-[var(--shadow-md)]">
            <Headphones className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">IT Service Desk & ITSM Operations</h1>
            <p className="text-sm text-muted-foreground">Service operations, executive insights, and ITSM performance.</p>
          </div>
        </div>

        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Dashboards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link to="/itsm/exec-biz-ops" className="group rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow">
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-navy text-white grid place-items-center shrink-0"><Briefcase className="h-5 w-5" /></div>
              <div>
                <h3 className="text-base font-semibold tracking-tight">Executive & Business Operations</h3>
                <p className="text-xs text-muted-foreground mt-1">6 executive dashboards</p>
                <span className="inline-block mt-3 text-xs font-medium text-navy group-hover:underline">Open →</span>
              </div>
            </div>
          </Link>
        </div>

        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Digital Coworkers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-sm)]">
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-indigo text-indigo-foreground grid place-items-center shrink-0">
                <Bot className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold tracking-tight">ServiceNow Auto Ticket Categorization</h3>
                  <span className="text-[10px] font-semibold uppercase tracking-wide rounded px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200">Live</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  AI-assisted intake, prediction, and routing for ServiceNow tickets. Monitors accuracy, confidence, SLA exposure, and agent workload.
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
                  <span className="rounded border border-border bg-secondary px-1.5 py-0.5">Categorizer v2.3</span>
                  <span className="rounded border border-border bg-secondary px-1.5 py-0.5">94.7% accuracy</span>
                  <span className="rounded border border-border bg-secondary px-1.5 py-0.5">86% auto-categorized</span>
                </div>
                <Link
                  to="/itsm/auto-ticket-categorization"
                  className="inline-flex items-center gap-1.5 mt-4 h-8 px-3 rounded-md bg-yellow-400 text-slate-900 text-xs font-semibold hover:bg-yellow-500 transition-colors border border-yellow-500"
                >
                  Details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
