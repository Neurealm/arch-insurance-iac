import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
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
  switchTenant: (tenantId: string) => void;
  refresh: () => Promise<void>;
};

const STORAGE_KEY = "platform:activeTenant";
const Ctx = createContext<AccessContextValue | null>(null);

export function AccessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
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

  // Auto-select first tenant if none selected or selected tenant no longer authorized.
  useEffect(() => {
    if (!tenants.length) return;
    const stillAuthorized = activeTenantId && tenants.some((t) => t.tenant_id === activeTenantId);
    if (!stillAuthorized) {
      const nextId = tenants[0].tenant_id;
      setActiveTenantId(nextId);
      try { window.localStorage.setItem(STORAGE_KEY, nextId); } catch {}
    }
  }, [tenants, activeTenantId]);

  const contextQuery = useQuery({
    queryKey: ["platform", "access-context", activeTenantId],
    enabled: !!user && !!activeTenantId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_current_access_context", {
        _tenant_id: activeTenantId!,
      });
      if (error) throw error;
      return data as any;
    },
  });

  const switchTenant = useCallback((tenantId: string) => {
    setActiveTenantId(tenantId);
    try { window.localStorage.setItem(STORAGE_KEY, tenantId); } catch {}
  }, []);

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

  const value: AccessContextValue = {
    loading: tenantsQuery.isLoading || contextQuery.isLoading,
    tenants,
    activeTenantId,
    activeTenant,
    isPlatformAdmin,
    permissions,
    hasPermission,
    switchTenant,
    refresh: async () => {
      await Promise.all([tenantsQuery.refetch(), contextQuery.refetch()]);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAccess(): AccessContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAccess must be used inside <AccessProvider>");
  return ctx;
}
