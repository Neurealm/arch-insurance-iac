import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCommercialAccess, commercialQueryKey } from "@/commercial/hooks/useCommercialAccess";

export const PROJECT_MOMENTOUS_CODE = "PROJECT_MOMENTOUS";

export type CommercialProgram = {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  partner_name: string | null;
  market_segment: string | null;
  description: string | null;
  status: string;
  current_gate_code: string | null;
  source_status: string;
};

export type CommercialGate = {
  id: string;
  program_id: string;
  gate_code: string;
  sequence_number: number;
  name: string;
  account_scope_label: string | null;
  account_scope_count: number | null;
  operating_objective: string | null;
  economic_objective: string | null;
  unlock_conditions: string[];
  status: string;
};

export type CommercialMetric = {
  id: string;
  metric_code: string;
  label: string;
  numeric_value: number | null;
  text_value: string | null;
  unit: string | null;
  confidence: string;
  notes: string | null;
};

export type CommercialSource = {
  id: string;
  source_code: string;
  title: string;
  source_type: string;
  confidentiality: string;
  status: string;
  notes: string | null;
};

/** Loads the Project Momentous program bundle scoped to the active tenant. */
export function useProjectMomentous() {
  const { tenantId, canView } = useCommercialAccess();
  const enabled = !!tenantId && canView;

  return useQuery({
    enabled,
    queryKey: commercialQueryKey(tenantId, "project-momentous"),
    queryFn: async () => {
      const { data: program, error: pErr } = await supabase
        .from("commercial_programs")
        .select("*")
        .eq("tenant_id", tenantId!)
        .eq("code", PROJECT_MOMENTOUS_CODE)
        .maybeSingle();
      if (pErr) throw pErr;
      if (!program) {
        return { program: null, gates: [], metrics: [], sources: [] } as const;
      }
      const [gatesRes, metricsRes, sourcesRes] = await Promise.all([
        supabase
          .from("commercial_stage_gates")
          .select("*")
          .eq("program_id", program.id)
          .order("sequence_number", { ascending: true }),
        supabase
          .from("commercial_program_metrics")
          .select("*")
          .eq("program_id", program.id)
          .order("metric_code", { ascending: true }),
        supabase
          .from("commercial_source_references")
          .select("id,source_code,title,source_type,confidentiality,status,notes")
          .eq("program_id", program.id)
          .order("source_code", { ascending: true }),
      ]);
      if (gatesRes.error) throw gatesRes.error;
      if (metricsRes.error) throw metricsRes.error;
      if (sourcesRes.error) throw sourcesRes.error;
      return {
        program: program as CommercialProgram,
        gates: (gatesRes.data ?? []).map((g: any) => ({
          ...g,
          unlock_conditions: Array.isArray(g.unlock_conditions) ? g.unlock_conditions : [],
        })) as CommercialGate[],
        metrics: (metricsRes.data ?? []) as CommercialMetric[],
        sources: (sourcesRes.data ?? []) as CommercialSource[],
      } as const;
    },
  });
}
