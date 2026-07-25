import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { commercialQueryKey } from "./useCommercialAccess";

const COMMERCIAL_PROGRAM_CODE = "PROJECT_MOMENTOUS";

export type ModelRun = {
  id: string;
  tenant_id: string;
  program_id: string;
  scenario_id: string;
  model_version_id: string;
  run_scope: string;
  status: "queued" | "running" | "completed" | "failed" | "superseded";
  input_hash: string;
  started_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
  error_code: string | null;
  error_message: string | null;
};

export type ModelResult = {
  id: string;
  run_id: string;
  metric_code: string;
  metric_group: string;
  formula_code: string;
  fiscal_period: string;
  period_sequence: number;
  value_numeric: number | string | null;
  value_text: string | null;
  unit: string;
  lineage_json: unknown;
  is_approximation: boolean;
};

export type ScenarioMeta = {
  id: string;
  code: string;
  name: string;
  is_baseline: boolean;
};

export type ProgramMeta = { id: string; code: string; name: string };
export type ModelVersionMeta = {
  id: string;
  version_code: string;
  status: string;
  formula_catalog_version: string;
};

export function useCommercialRevenueBundle(tenantId: string | null) {
  return useQuery({
    enabled: !!tenantId,
    queryKey: commercialQueryKey(tenantId, "revenue-bundle"),
    queryFn: async () => {
      const { data: program, error: pErr } = await supabase
        .from("commercial_programs")
        .select("id, code, name")
        .eq("tenant_id", tenantId!)
        .eq("code", COMMERCIAL_PROGRAM_CODE)
        .maybeSingle();
      if (pErr) throw pErr;
      if (!program) return { program: null } as const;

      const [scen, ver, runs] = await Promise.all([
        supabase
          .from("commercial_scenarios")
          .select("id, code, name, is_baseline")
          .eq("program_id", program.id)
          .order("code"),
        supabase
          .from("commercial_model_versions")
          .select("id, version_code, status, formula_catalog_version")
          .eq("program_id", program.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("commercial_model_runs")
          .select("*")
          .eq("program_id", program.id)
          .eq("run_scope", "revenue")
          .order("created_at", { ascending: false })
          .limit(200),
      ]);
      if (scen.error) throw scen.error;
      if (ver.error) throw ver.error;
      if (runs.error) throw runs.error;

      // Latest completed run per scenario
      const latestByScenario = new Map<string, ModelRun>();
      for (const r of (runs.data ?? []) as ModelRun[]) {
        if (r.status !== "completed") continue;
        if (!latestByScenario.has(r.scenario_id)) latestByScenario.set(r.scenario_id, r);
      }

      const runIds = Array.from(latestByScenario.values()).map((r) => r.id);
      let results: ModelResult[] = [];
      if (runIds.length > 0) {
        const { data: resRows, error: rErr } = await supabase
          .from("commercial_model_results")
          .select("*")
          .in("run_id", runIds)
          .order("period_sequence");
        if (rErr) throw rErr;
        results = (resRows ?? []) as ModelResult[];
      }

      return {
        program: program as ProgramMeta,
        scenarios: (scen.data ?? []) as ScenarioMeta[],
        versions: (ver.data ?? []) as ModelVersionMeta[],
        runs: (runs.data ?? []) as ModelRun[],
        latestByScenario,
        results,
      } as const;
    },
  });
}

export function useTriggerRevenueRun(tenantId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { program_id: string; model_version_id: string; scenario_ids?: string[] }) => {
      const { data, error } = await supabase.functions.invoke("commercial-run-scenario", {
        body: args,
      });
      if (error) throw error;
      return data as {
        runs: Array<{ scenario_id: string; run_id?: string; reused?: boolean; metrics_written?: number; error?: string }>;
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commercialQueryKey(tenantId, "revenue-bundle") });
    },
  });
}
