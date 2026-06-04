import { useParams, Link, Navigate } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Eye, LayoutDashboard, ArrowRight, Activity, Clock, AlertTriangle, Bell, CheckCircle2, Award, Shield } from "lucide-react";
import { kpis as kpiSeed } from "@/data/eoc";
import { KpiCard } from "@/components/eoc/KpiCard";

type Tool = {
  id: string; key: string; name: string; description: string;
  category: string; route: string | null; icon: string | null;
};

const iconMap: Record<string, any> = {
  Activity, Clock, AlertTriangle, Bell, CheckCircle2, Award,
  LayoutDashboard, Shield,
};

// Map catalog KPI keys back to the seed KPI ids for preview rendering.
const kpiKeyToId: Record<string, string> = {
  "kpi-health": "health",
  "kpi-mttr": "mttr",
  "kpi-incidents": "incidents",
  "kpi-alerts": "alerts",
  "kpi-change": "change",
  "kpi-vendor": "vendor",
};

export default function TenantPreviewPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const { isAdmin, roleLoading } = useAuth();

  const isUuid = !!tenantId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantId);
  const { data: tenant } = useQuery({
    queryKey: ["tenant", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const col = isUuid ? "id" : "slug";
      const { data, error } = await supabase
        .from("tenants").select("id,name,slug").eq(col, tenantId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const realTenantId = tenant?.id;

  const { data: enabled = [], isLoading } = useQuery({
    queryKey: ["tenant-enabled-tools", realTenantId],
    enabled: !!realTenantId,
    queryFn: async () => {
      const { data: assigns, error: e1 } = await supabase
        .from("tenant_tool_assignments")
        .select("tool_id,enabled")
        .eq("tenant_id", realTenantId!)
        .eq("enabled", true);
      if (e1) throw e1;
      const ids = (assigns ?? []).map((a) => a.tool_id);
      if (!ids.length) return [] as Tool[];
      const { data: tools, error: e2 } = await supabase
        .from("tools_catalog")
        .select("id,key,name,description,category,route,icon")
        .in("id", ids)
        .eq("is_active", true)
        .order("category")
        .order("name");
      if (e2) throw e2;
      return (tools ?? []) as Tool[];
    },
  });

  if (roleLoading) return <AppShell><div className="p-8 text-muted-foreground">Loading…</div></AppShell>;
  if (!isAdmin) return <Navigate to="/crm/tenants" replace />;
  if (isUuid && tenant?.slug) return <Navigate to={`/crm/tenants/${tenant.slug}/preview`} replace />;

  const enabledKpis = enabled.filter((t) => t.category === "KPI");
  const enabledDashboards = enabled.filter((t) => t.category !== "KPI");
  const kpisToShow = kpiSeed.filter((k) =>
    enabledKpis.some((e) => kpiKeyToId[e.key] === k.id)
  );

  return (
    <AppShell>
      <div className="p-6 max-w-[1600px] mx-auto w-full">
        <Link
          to={`/crm/tenants/${tenant?.slug ?? tenantId}/settings`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> Back to tenant settings
        </Link>

        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Eye className="h-6 w-6 text-indigo" /> Tenant preview · {tenant?.name ?? "…"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Read-only view of what this tenant sees on their dashboard based on your assignments.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">Super-admin preview</Badge>
        </header>

        {isLoading ? (
          <div className="p-12 text-muted-foreground">Loading enabled items…</div>
        ) : enabled.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              Nothing is enabled yet for this tenant. Go to{" "}
              <Link className="text-indigo underline" to={`/crm/tenants/${tenant?.slug ?? tenantId}/settings`}>
                Dashboards &amp; KPIs
              </Link>{" "}
              and turn things on.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {kpisToShow.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">KPIs</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                  {kpisToShow.map((k) => <KpiCard key={k.id} kpi={k} />)}
                </div>
              </section>
            )}

            {enabledDashboards.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Dashboards</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {enabledDashboards.map((t) => {
                    const Icon = (t.icon && iconMap[t.icon]) || LayoutDashboard;
                    const content = (
                      <Card className="hover:border-indigo/60 transition-colors h-full">
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
                    );
                    return t.route ? (
                      <Link key={t.id} to={t.route}>{content}</Link>
                    ) : (
                      <div key={t.id}>{content}</div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}