import { AppShell } from "@/components/eoc/AppShell";
import { Link } from "react-router-dom";
import { Headphones, Briefcase } from "lucide-react";

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </main>
    </AppShell>
  );
}