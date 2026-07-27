import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { commercialQueryKey, useCommercialAccess } from "./useCommercialAccess";

export type CommercialNarration = {
  id: string;
  narration_key: string;
  title: string;
  description: string | null;
  script: string;
  voice: string;
  instructions: string;
  speed: number;
  version: number;
};

/**
 * Loads the database-managed narration script for a given key within the
 * active commercial tenant. The script itself is re-read server-side by the
 * tts-speak function; this hook powers labelling and the record-id affordance.
 */
export function useNarration(narrationKey: string) {
  const { tenantId } = useCommercialAccess();

  return useQuery({
    queryKey: commercialQueryKey(tenantId, "narration", narrationKey),
    enabled: Boolean(tenantId),
    queryFn: async (): Promise<CommercialNarration | null> => {
      const { data, error } = await supabase
        .from("commercial_narrations")
        .select("id, narration_key, title, description, script, voice, instructions, speed, version")
        .eq("tenant_id", tenantId!)
        .eq("narration_key", narrationKey)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return (data as CommercialNarration | null) ?? null;
    },
  });
}
