import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AutoBuildResult {
  created_ids: string[];
  skipped_existing_ids: string[];
  skipped_inactive_ids: string[];
}

export function useAutoBuildDomains() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      technologyId,
      masterDomainIds,
    }: {
      technologyId: string;
      masterDomainIds: string[];
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc("etdm_auto_build_domains", {
        _technology_id: technologyId,
        _master_domain_ids: masterDomainIds,
      });
      if (error) throw error;
      return data as AutoBuildResult;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["etdm-domains"] });
      qc.invalidateQueries({ queryKey: ["etdm-domain"] });
      qc.invalidateQueries({ queryKey: ["etdm-domains-for-tech"] });
    },
  });
}
