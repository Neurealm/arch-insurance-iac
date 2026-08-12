import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type AuthorizedTenant = {
  tenant_id: string;
  name: string;
  slug: string;
  status: string;
  default_currency_code: string;
  default_timezone: string;
  membership_status: string | null;
  platform_admin: boolean;
};

type AccessContextValue = {
  loading: boolean;
  tenants: AuthorizedTenant[];
  activeTenantId: string | null;
  activeTenant: AuthorizedTenant | null;
  isPlatformAdmin: boolean;
  permissions: Set<string>;
  hasPermission: (code: string) => boolean;
  switchTenant: (tenantId: string) => Promise<void>;
  refresh: () => Promise<void>;
  refreshAll: () => Promise<void>;
};

const STORAGE_KEY = "platform:activeTenant";
const Ctx = createContext<AccessContextValue | null>(null);

export function AccessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeTenantId, setActiveTenantId] = useState<string | null>(
    () => (typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null),
  );

  const tenantsQuery = useQuery({
    queryKey: ["platform", "authorized-tenants", user?.id ?? null],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_authorized_tenants");
      if (error) throw error;
      return (data ?? []) as AuthorizedTenant[];
    },
  });

  const tenants = tenantsQuery.data ?? [];

  // Auto-select or repair active tenant if suspended/removed/deactivated.
  useEffect(() => {
    if (!tenants.length) {
      if (activeTenantId) persistTenant(null, setActiveTenantId);
      return;
    }
    const current = tenants.find((t) => t.tenant_id === activeTenantId);
    const isUsable = current && current.status === "active" &&
      (current.platform_admin || current.membership_status === "active");
    if (!isUsable) {
      const next = tenants.find((t) => t.status === "active" &&
        (t.platform_admin || t.membership_status === "active")) ?? tenants[0];
      persistTenant(next.tenant_id, setActiveTenantId);
    }
  }, [tenants, activeTenantId]);

  const contextQuery = useQuery({
    queryKey: ["platform", "access-context", activeTenantId],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_current_access_context", {
        _tenant_id: activeTenantId ?? undefined,
      });
      if (error) throw error;
      return data as any;
    },
  });

  const switchTenant = useCallback(async (tenantId: string) => {
    if (tenantId === activeTenantId) return;
    // Cancel and drop every tenant-scoped query before switching to avoid
    // stale-data flashes and back-button leakage.
    await qc.cancelQueries({ queryKey: ["platform"] });
    await qc.cancelQueries({ queryKey: ["commercial"] });
    qc.removeQueries({ queryKey: ["platform", "access-context"] });
    qc.removeQueries({ queryKey: ["platform", "members"] });
    qc.removeQueries({ queryKey: ["platform", "invitations"] });
    qc.removeQueries({ queryKey: ["platform", "roles"] });
    qc.removeQueries({ queryKey: ["platform", "audit"] });
    qc.removeQueries({ queryKey: ["platform", "home-summary"] });
    qc.removeQueries({ queryKey: ["commercial"] });
    persistTenant(tenantId, setActiveTenantId);
  }, [activeTenantId, qc]);

  const permissions = useMemo(() => {
    const list = (contextQuery.data?.effective_permissions ?? []) as string[];
    return new Set(list);
  }, [contextQuery.data]);

  const isPlatformAdmin = !!contextQuery.data?.is_platform_admin;
  const hasPermission = useCallback(
    (code: string) => isPlatformAdmin || permissions.has(code),
    [isPlatformAdmin, permissions],
  );

  const activeTenant = tenants.find((t) => t.tenant_id === activeTenantId) ?? null;

  const refresh = useCallback(async () => {
    await Promise.all([tenantsQuery.refetch(), contextQuery.refetch()]);
  }, [tenantsQuery, contextQuery]);

  const refreshAll = useCallback(async () => {
    await qc.invalidateQueries({ queryKey: ["platform"] });
  }, [qc]);

  const value: AccessContextValue = {
    loading: tenantsQuery.isLoading || contextQuery.isLoading,
    tenants,
    activeTenantId,
    activeTenant,
    isPlatformAdmin,
    permissions,
    hasPermission,
    switchTenant,
    refresh,
    refreshAll,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function persistTenant(id: string | null, setter: (v: string | null) => void) {
  setter(id);
  try {
    if (id) window.localStorage.setItem(STORAGE_KEY, id);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function useAccess(): AccessContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAccess must be used inside <AccessProvider>");
  return ctx;
}
