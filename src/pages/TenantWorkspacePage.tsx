import { useEffect, useMemo, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Activity, Clock, AlertTriangle, Bell, CheckCircle2, Award,
  LayoutDashboard, Shield, ArrowRight, Building2, LogOut, ExternalLink,
} from "lucide-react";
import { kpis as kpiSeed } from "@/data/eoc";
import { KpiCard } from "@/components/eoc/KpiCard";

type Tenant = { id: string; name: string; slug: string; logo_url: string | null; status: boolean };
type Tool = {
  id: string; key: string; name: string; description: string;
  category: string; route: string | null; icon: string | null;
};

const iconMap: Record<string, any> = {
  Activity, Clock, AlertTriangle, Bell, CheckCircle2, Award, LayoutDashboard, Shield,
};

const kpiKeyToId: Record<string, string> = {
  "kpi-health": "health",
  "kpi-mttr": "mttr",
  "kpi-incidents": "incidents",
  "kpi-alerts": "alerts",
  "kpi-change": "change",
  "kpi-vendor": "vendor",
};

export default function TenantWorkspacePage() {
  const { slug = "" } = useParams();
  const { user, loading: authLoading, signOut } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);

  const { data: tenant, isLoading: tLoading } = useQuery({
    queryKey: ["tenant-by-slug", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tenants").select("id,name,slug,logo_url,status").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data as Tenant | null;
    },
  });

  const { data: membership, isLoading: mLoading } = useQuery({
    queryKey: ["tenant-membership", tenant?.id, user?.id],
    enabled: !!tenant?.id && !!user?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tenant_memberships")
        .select("id")
        .eq("tenant_id", tenant!.id)
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!tenant || !user || mLoading) return;
    if (!membership) {
      supabase.auth.signOut();
    }
  }, [tenant, user, membership, mLoading]);

  const { data: enabled = [], isLoading } = useQuery({
    queryKey: ["tenant-workspace-tools", tenant?.id],
    enabled: !!tenant?.id && !!membership,
    queryFn: async () => {
      const { data: assigns, error: e1 } = await (supabase as any)
        .from("tenant_tool_assignments")
        .select("tool_id,enabled")
        .eq("tenant_id", tenant!.id)
        .eq("enabled", true);
      if (e1) throw e1;
      const ids = (assigns ?? []).map((a) => a.tool_id);
      if (!ids.length) return [] as Tool[];
      const { data: tools, error: e2 } = await supabase
        .from("tools_catalog")
        .select("id,key,name,description,category,route,icon")
        .in("id", ids)
        .eq("is_active", true)
        .order("category").order("name");
      if (e2) throw e2;
      return (tools ?? []) as Tool[];
    },
  });

  useEffect(() => {
    if (!selected && enabled.length) setSelected(enabled[0].id);
  }, [enabled, selected]);

  const grouped = useMemo(() => {
    const map: Record<string, Tool[]> = {};
    enabled.forEach((t) => {
      const k = t.category || "Other";
      (map[k] = map[k] || []).push(t);
    });
    return map;
  }, [enabled]);

  const enabledKpis = enabled.filter((t) => t.category === "KPI");
  const kpisToShow = kpiSeed.filter((k) =>
    enabledKpis.some((e) => kpiKeyToId[e.key] === k.id)
  );
  const selectedTool = enabled.find((t) => t.id === selected) ?? null;

  if (authLoading || tLoading) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  }
  if (!tenant) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Workspace not found</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }
  if (!tenant.status) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>{tenant.name}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            This workspace is currently inactive.
          </CardContent>
        </Card>
      </div>
    );
  }
  if (!user) return <Navigate to={`/t/${slug}/auth`} replace />;
  if (mLoading) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  }
  if (!membership) return <Navigate to={`/t/${slug}/auth`} replace />;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left rail */}
      <aside className="w-[280px] shrink-0 border-r bg-sidebar text-sidebar-foreground flex flex-col h-dvh sticky top-0">
        <div className="flex items-center gap-3 px-4 h-[68px] border-b border-sidebar-border shrink-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo to-ai grid place-items-center shrink-0">
            {tenant.logo_url
              ? <img src={tenant.logo_url} alt={tenant.name} className="h-8 w-8 rounded-lg object-cover" />
              : <Building2 className="h-5 w-5 text-white" />}
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-sm font-bold truncate">{tenant.name}</div>
            <div className="text-[10px] text-sidebar-foreground/60 truncate">/t/{tenant.slug}</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {isLoading ? (
            <div className="px-3 text-xs text-muted-foreground">Loading…</div>
          ) : enabled.length === 0 ? (
            <div className="px-3 text-xs text-muted-foreground">
              Nothing assigned yet. Contact your administrator.
            </div>
          ) : (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="mb-4">
                <div className="px-3 mb-1 text-[10px] uppercase tracking-wider font-bold text-sidebar-foreground/50">
                  {cat}
                </div>
                <ul className="space-y-0.5">
                  {items.map((t) => {
                    const Icon = (t.icon && iconMap[t.icon]) || LayoutDashboard;
                    const active = selected === t.id;
                    return (
                      <li key={t.id}>
                        <button
                          onClick={() => setSelected(t.id)}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-left text-sm",
                            active
                              ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                              : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{t.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => signOut()}>
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Right details */}
      <main className="flex-1 overflow-y-auto">
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{tenant.name} Workspace</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {enabled.length} item{enabled.length === 1 ? "" : "s"} available
              </p>
            </div>
            <Badge variant="outline">Tenant</Badge>
          </div>
        </header>

        <div className="p-6 max-w-[1600px] mx-auto w-full space-y-8">
          {kpisToShow.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">KPIs</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {kpisToShow.map((k) => <KpiCard key={k.id} kpi={k} />)}
              </div>
            </section>
          )}

          {selectedTool && selectedTool.category !== "KPI" && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Selected
              </h2>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {(() => {
                      const Icon = (selectedTool.icon && iconMap[selectedTool.icon]) || LayoutDashboard;
                      return <span className="h-10 w-10 rounded-lg bg-ai-soft text-ai grid place-items-center"><Icon className="h-5 w-5" /></span>;
                    })()}
                    <span className="flex-1">{selectedTool.name}</span>
                    {selectedTool.route && (
                      <Button asChild variant="default" size="sm">
                        <Link to={selectedTool.route}>
                          Open <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                        </Link>
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{selectedTool.description}</p>
                  <Badge variant="outline" className="mt-3 text-xs">{selectedTool.category}</Badge>
                </CardContent>
              </Card>
            </section>
          )}

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">All dashboards</h2>
            {enabled.filter((t) => t.category !== "KPI").length === 0 ? (
              <Card><CardContent className="p-12 text-center text-muted-foreground">No dashboards assigned.</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {enabled.filter((t) => t.category !== "KPI").map((t) => {
                  const Icon = (t.icon && iconMap[t.icon]) || LayoutDashboard;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelected(t.id)}
                      className="text-left"
                    >
                      <Card className={cn("hover:border-indigo/60 transition-colors h-full", selected === t.id && "border-indigo")}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <span className="h-9 w-9 rounded-lg bg-ai-soft text-ai grid place-items-center">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="flex-1">{t.name}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="text-sm text-muted-foreground line-clamp-2">{t.description}</div>
                          <Badge variant="outline" className="mt-3 text-xs">{t.category || "Dashboard"}</Badge>
                        </CardContent>
                      </Card>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}