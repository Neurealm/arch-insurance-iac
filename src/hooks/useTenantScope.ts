import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useMemo } from "react";

export type TenantScope = {
  scoped: boolean;
  loading: boolean;
  tenantId: string | null;
  tenantName: string | null;
  tenantSlug: string | null;
  routes: Set<string>;
  keys: Set<string>;
};

export function useTenantScope(): TenantScope {
  // Tenant/workspace scoping has been retired — every authenticated user sees
  // the full navigation, and page-level access is enforced inside each route.
  const emptySet = useMemo(() => new Set<string>(), []);
  return {
    scoped: false,
    loading: false,
    tenantId: null,
    tenantName: null,
    tenantSlug: null,
    routes: emptySet,
    keys: emptySet,
  };
}