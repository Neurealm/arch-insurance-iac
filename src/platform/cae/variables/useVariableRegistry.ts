/**
 * Loads the governed variable registry for the active tenant.
 *
 * The registry — including the authorisation verdict for each variable — is
 * produced entirely by `audio_variable_registry` in the database.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { buildRegistry, toVariableDefinition } from "./registry";
import type { CaeVariableDefinition } from "./types";

export function caeVariableRegistryKey(tenantId: string | null) {
  return ["platform", "cae", "variable-registry", tenantId] as const;
}

export function useVariableRegistry(tenantId: string | null) {
  return useQuery({
    queryKey: caeVariableRegistryKey(tenantId),
    enabled: !!tenantId,
    queryFn: async (): Promise<CaeVariableDefinition[]> => {
      const { data, error } = await supabase.rpc("audio_variable_registry", {
        _tenant_id: tenantId,
      } as never);
      if (error) throw error;
      const rows = (data ?? []) as Record<string, unknown>[];
      return rows.map(toVariableDefinition);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRegistryMap(definitions: CaeVariableDefinition[] | undefined) {
  return buildRegistry(definitions ?? []);
}
