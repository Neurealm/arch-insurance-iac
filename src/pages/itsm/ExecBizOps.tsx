import { AppShell } from "@/components/eoc/AppShell";
import { Link } from "react-router-dom";
import { Briefcase, LayoutGrid, Boxes, DollarSign, Smile, Target, ShieldX } from "lucide-react";

const subpages = [
  { to: "/itsm/exec-biz-ops/executive-command-center", title: "Executive Command Center", desc: "Real-time IT health, business impact, and operational performance.", icon: LayoutGrid },
  { to: "/itsm/exec-biz-ops/business-services",        title: "Business Services (Service Portfolio & Health)", desc: "Service portfolio inventory and health posture.", icon: Boxes },
  { to: "/itsm/exec-biz-ops/customer-experience",      title: "Customer Experience & Journey Health (XLA)", desc: "XLA-driven journey health and satisfaction trends.", icon: Smile },
  { to: "/itsm/exec-biz-ops/sla-slo-error-budget",     title: "SLA / SLO / Error Budget Performance", desc: "Service-level achievement and error-budget burn.", icon: Target },
  { to: "/itsm/exec-biz-ops/risk-exposure",            title: "Risk & Operational Exposure View", desc: "Operational, security, and compliance exposure.", icon: ShieldX },
];

export default function ExecBizOps() {
  return (
    <AppShell>
      <main className="flex-1 px-8 py-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-navy text-white grid place-items-center shadow-[var(--shadow-md)]">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Executive & Business Operations</h1>
            <p className="text-sm text-muted-foreground">C-suite dashboards spanning service health, business impact, experience, SLOs, and risk.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subpages.map((p) => {
            const Icon = p.icon;
            return (
              <Link key={p.to} to={p.to} className="group rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-xl bg-navy text-white grid place-items-center shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold tracking-tight">{p.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
                    <span className="inline-block mt-3 text-xs font-medium text-navy group-hover:underline">Open dashboard →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </AppShell>
  );
}