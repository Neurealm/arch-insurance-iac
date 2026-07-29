import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import { AccessProvider, useAccess } from "@/platform/access/AccessContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Rocket,
  FlaskConical,
  Briefcase,
  BookOpen,
  ChevronRight,
  Shield,
  ArrowLeft,
  Calculator,
  Settings,

} from "lucide-react";
import type { ComponentType } from "react";

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  end?: boolean;
  section?: string;
};

const NAV: NavItem[] = [
  { to: "/commercial", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/commercial/program", label: "Program", icon: Rocket },
  { to: "/commercial/program-timeline", label: "Program & Timeline", icon: CalendarRange },

  { to: "/commercial/scenarios", label: "Scenarios", icon: FlaskConical },
  { to: "/commercial/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/commercial/sources", label: "Sources", icon: BookOpen },
  { to: "/commercial/model/revenue", label: "Revenue", icon: Calculator, section: "Model" },
  { to: "/commercial/model/pnl", label: "P&L (Cost & EBITDA)", icon: Calculator, section: "Model" },
  { to: "/commercial/model/cash", label: "Cash & Sustainability", icon: Calculator, section: "Model" },
  { to: "/commercial/model/assumptions", label: "Assumptions & Change Sets", icon: Calculator, section: "Model" },
  { to: "/commercial/model/compare", label: "Scenario Comparison", icon: Calculator, section: "Model" },
  { to: "/commercial/model/sensitivity", label: "Sensitivity Analysis", icon: Calculator, section: "Model" },
  { to: "/commercial/model/release", label: "Release & Activation", icon: Shield, section: "Model" },
  { to: "/commercial/administration", label: "Administration", icon: Settings, section: "Administration" },
];



function Sidebar() {
  return (
    <aside className="w-60 shrink-0 border-r border-border bg-card" aria-label="Commercial navigation">
      <div className="px-4 py-4 border-b border-border">
        <Link
          to="/app"
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          NeuGAIN Command Center
        </Link>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          NeuGAIN
        </div>
        <div className="text-sm font-semibold text-foreground">Commercial</div>
      </div>
      <nav className="p-2 space-y-0.5">
        <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Commercial
        </div>
        {NAV.filter((n) => !n.section).map((t) => (
          <NavLinkItem key={t.to} item={t} />
        ))}
        {Array.from(new Set(NAV.filter((n) => n.section).map((n) => n.section!))).map((sec) => (
          <div key={sec} className="pt-3">
            <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {sec}
            </div>
            {NAV.filter((n) => n.section === sec).map((t) => (
              <NavLinkItem key={t.to} item={t} />
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

function NavLinkItem({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`
      }
    >
      <Icon className="h-4 w-4" />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
}

function Breadcrumb() {
  const { pathname } = useLocation();
  const item = NAV.find((n) => (n.end ? pathname === n.to : pathname === n.to || pathname.startsWith(n.to + "/")));
  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
      <span>Commercial</span>
      {item && !item.end && (
        <>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{item.label}</span>
        </>
      )}
    </nav>
  );
}

function Header() {
  const { tenants, activeTenantId, switchTenant, activeTenant, isPlatformAdmin } = useAccess();
  return (
    <header className="border-b border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
        <div className="min-w-0">
          <Breadcrumb />
          <h1 className="mt-0.5 truncate text-lg font-semibold text-foreground">
            {activeTenant?.name ?? "Select a workspace"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {isPlatformAdmin && <Badge variant="secondary">Platform Admin</Badge>}
          <div className="min-w-[240px]">
            <Select value={activeTenantId ?? undefined} onValueChange={(v) => switchTenant(v)}>
              <SelectTrigger aria-label="Active workspace"><SelectValue placeholder="Select workspace" /></SelectTrigger>
              <SelectContent>
                {tenants.map((t) => (
                  <SelectItem key={t.tenant_id} value={t.tenant_id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isPlatformAdmin && (
            <Button asChild variant="outline" size="sm">
              <Link to="/platform"><Shield className="mr-1 h-4 w-4" />Platform</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function TenantRequiredState() {
  return (
    <main className="min-h-dvh grid place-items-center px-6 text-center">
      <div className="max-w-md space-y-3">
        <h2 className="text-lg font-semibold text-foreground">No active workspace</h2>
        <p className="text-sm text-muted-foreground">
          Select or create the NeuGAIN Commercial workspace to continue.
        </p>
        <Button asChild variant="outline"><Link to="/platform">Open Platform</Link></Button>
      </div>
    </main>
  );
}

function Shell() {
  const { loading, activeTenantId, isPlatformAdmin } = useAccess();
  if (loading) {
    return <div className="min-h-dvh grid place-items-center text-muted-foreground">Loading workspace…</div>;
  }
  if (!activeTenantId && !isPlatformAdmin) {
    return <TenantRequiredState />;
  }
  return (
    <div className="min-h-dvh bg-background flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-6">
          {activeTenantId ? <Outlet /> : <TenantRequiredState />}
        </main>
      </div>
    </div>
  );
}

export default function CommercialLayout() {
  return (
    <ProtectedRoute>
      <AccessProvider>
        <Shell />
      </AccessProvider>
    </ProtectedRoute>
  );
}
