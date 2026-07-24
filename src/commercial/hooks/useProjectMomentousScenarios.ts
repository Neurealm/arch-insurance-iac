import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCommercialAccess, commercialQueryKey } from "@/commercial/hooks/useCommercialAccess";
import { PROJECT_MOMENTOUS_CODE } from "@/commercial/hooks/useProjectMomentous";

export type CommercialScenario = {
  id: string;
  program_id: string;
  code: string;
  name: string;
  description: string | null;
  status: string;
  is_baseline: boolean;
  source_status: string;
};

export type CommercialAssumption = {
  id: string;
  scenario_id: string;
  assumption_code: string;
  label: string;
  numeric_value: number | null;
  text_value: string | null;
  unit: string | null;
  confidence: string;
  source_reference_id: string | null;
  notes: string | null;
};

export function useProjectMomentousScenarios() {
  const { tenantId, canView } = useCommercialAccess();
  const enabled = !!tenantId && canView;

  return useQuery({
    enabled,
    queryKey: commercialQueryKey(tenantId, "project-momentous-scenarios"),
    queryFn: async () => {
      const { data: program, error: pErr } = await supabase
        .from("commercial_programs")
        .select("id")
        .eq("tenant_id", tenantId!)
        .eq("code", PROJECT_MOMENTOUS_CODE)
        .maybeSingle();
      if (pErr) throw pErr;
      if (!program) return { program: null, scenarios: [], assumptions: [] } as const;

      const [scRes, asRes] = await Promise.all([
        supabase
          .from("commercial_scenarios")
          .select("*")
          .eq("program_id", program.id)
          .order("code", { ascending: true }),
        supabase
          .from("commercial_scenario_assumptions")
          .select("*")
          .in(
            "scenario_id",
            (
              await supabase
                .from("commercial_scenarios")
                .select("id")
                .eq("program_id", program.id)
            ).data?.map((s: any) => s.id) ?? [],
          )
          .order("assumption_code", { ascending: true }),
      ]);
      if (scRes.error) throw scRes.error;
      if (asRes.error) throw asRes.error;

      return {
        program,
        scenarios: (scRes.data ?? []) as CommercialScenario[],
        assumptions: (asRes.data ?? []) as CommercialAssumption[],
      } as const;
    },
  });
}
