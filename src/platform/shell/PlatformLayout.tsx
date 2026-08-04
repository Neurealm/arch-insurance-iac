import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AccessProvider, useAccess } from "@/platform/access/AccessContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreateTenantDialog } from "@/platform/components/CreateTenantDialog";
import {
  Home,
  Users,
  ShieldCheck,
  ClipboardList,
  Settings as SettingsIcon,
  UserCircle2,
  FlaskConical,
  ChevronRight,
  AudioLines,
  Mic2,
  MapPin,
  BookA,
  BarChart3,
  Boxes,
  Network,
} from "lucide-react";
import type { ComponentType } from "react";

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  permission?: string;
  adminOnly?: boolean;
  end?: boolean;
};

const NAV: NavItem[] = [
  { to: "/platform", label: "Platform Home", icon: Home, permission: "tenant.view", end: true },
  { to: "/platform/members", label: "Members", icon: Users, permission: "members.view" },
  { to: "/platform/roles", label: "Roles", icon: ShieldCheck, permission: "roles.view" },
  { to: "/platform/audit", label: "Audit", icon: ClipboardList, permission: "audit.view" },
  { to: "/platform/settings", label: "Settings", icon: SettingsIcon, permission: "tenant.view" },
  { to: "/platform/profile", label: "Profile", icon: UserCircle2 },
  { to: "/platform/test-hub", label: "Platform Test Hub", icon: FlaskConical, adminOnly: true },
  { to: "/platform/modules", label: "Module Registry", icon: Boxes, adminOnly: true },
  { to: "/platform/capability-intelligence", label: "Capability Intelligence", icon: Network, adminOnly: true },
];

/** Contextual Audio Enrichment Manager — shared across every NeuGAIN.io module. */
const AUDIO_NAV: NavItem[] = [
  { to: "/platform/audio", label: "Narrative Library", icon: AudioLines, permission: "audio.view", end: true },
  { to: "/platform/audio/profiles", label: "Speech Profiles", icon: Mic2, permission: "audio.view" },
  { to: "/platform/audio/placements", label: "Placement Map", icon: MapPin, permission: "audio.view" },
  { to: "/platform/audio/pronunciation", label: "Pronunciation Dictionary", icon: BookA, permission: "audio.view" },
  { to: "/platform/audio/analytics", label: "Audio Analytics", icon: BarChart3, permission: "audio.analytics.view" },
];

function Sidebar() {
  const { isPlatformAdmin, hasPermission } = useAccess();
  const allow = (t: NavItem) =>
    (!t.permission || hasPermission(t.permission) || isPlatformAdmin) && (!t.adminOnly || isPlatformAdmin);
  const items = NAV.filter(allow);
  const audioItems = AUDIO_NAV.filter(allow);
  return (
    <aside className="w-60 shrink-0 border-r border-border bg-card" aria-label="Platform navigation">
      <div className="px-4 py-4 border-b border-border">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          NeuGAIN
        </div>
        <div className="text-sm font-semibold text-foreground">Platform</div>
      </div>
      <nav className="p-2 space-y-0.5">
        <NavLink
          to="/app"
          className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <Home className="h-4 w-4" />
          <span className="truncate">NeuGAIN Command Center</span>
        </NavLink>
        <div className="my-1 h-px bg-border" aria-hidden />
        <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Platform
        </div>
        {items.map((t) => {
          const Icon = t.icon;
          return (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{t.label}</span>
            </NavLink>
          );
        })}
        {audioItems.length > 0 && (
          <>
            <div className="my-1 h-px bg-border" aria-hidden />
            <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Contextual Audio
            </div>
            {audioItems.map((t) => {
              const Icon = t.icon;
              return (
                <NavLink
                  key={t.to}
                  to={t.to}
                  end={t.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{t.label}</span>
                </NavLink>
              );
            })}
          </>
        )}
      </nav>
    </aside>
  );
}

function Breadcrumb() {
  const { pathname } = useLocation();
  const item = [...NAV, ...AUDIO_NAV].find((n) => (n.end ? pathname === n.to : pathname === n.to || pathname.startsWith(n.to + "/")));
  const label = item?.to === "/platform/test-hub" ? "Test Hub" : item?.label ?? "";
  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
      <span>Platform</span>
      {label && label !== "Platform Home" && (
        <>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{label}</span>
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
                  <SelectItem key={t.tenant_id} value={t.tenant_id}>
                    {t.name}
                    {t.membership_status && t.membership_status !== "active" && !t.platform_admin && (
                      <span className="ml-2 text-xs text-muted-foreground">({t.membership_status})</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isPlatformAdmin && <CreateTenantDialog />}
        </div>
      </div>
    </header>
  );
}

function Shell() {
  const { loading, tenants, activeTenantId, isPlatformAdmin } = useAccess();
  if (loading && !activeTenantId && !isPlatformAdmin) {
    return <div className="min-h-dvh grid place-items-center text-muted-foreground">Loading workspace…</div>;
  }
  if (!tenants.length && !isPlatformAdmin) {
    return (
      <main className="min-h-dvh grid place-items-center px-6 text-center">
        <div className="max-w-md space-y-3">
          <h2 className="text-lg font-semibold text-foreground">No workspaces available</h2>
          <p className="text-sm text-muted-foreground">
            You are signed in but have not been added to a tenant workspace. Ask an administrator to invite you.
          </p>
        </div>
      </main>
    );
  }
  return (
    <div className="min-h-dvh bg-background flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <main className="flex-1 w-full px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function PlatformLayout() {
  return (
    <ProtectedRoute>
      <AccessProvider>
        <Shell />
      </AccessProvider>
    </ProtectedRoute>
  );
}
