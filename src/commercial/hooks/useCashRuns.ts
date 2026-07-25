import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { commercialQueryKey } from "./useCommercialAccess";
import type { ModelRun, ModelResult, ScenarioMeta, ProgramMeta, ModelVersionMeta } from "./useRevenueRuns";

const COMMERCIAL_PROGRAM_CODE = "PROJECT_MOMENTOUS";

export function useCommercialCashBundle(tenantId: string | null) {
  return useQuery({
    enabled: !!tenantId,
    queryKey: commercialQueryKey(tenantId, "cash-bundle"),
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
          .in("run_scope", ["pnl", "cash"])
          .order("created_at", { ascending: false })
          .limit(400),
      ]);
      if (scen.error) throw scen.error;
      if (ver.error) throw ver.error;
      if (runs.error) throw runs.error;

      const allRuns = (runs.data ?? []) as ModelRun[];
      const cashRuns = allRuns.filter((r) => r.run_scope === "cash");
      const pnlRuns = allRuns.filter((r) => r.run_scope === "pnl");

      const latestByScenario = new Map<string, ModelRun>();
      for (const r of cashRuns) {
        if (r.status !== "completed") continue;
        if (!latestByScenario.has(r.scenario_id)) latestByScenario.set(r.scenario_id, r);
      }
      const latestPnlByScenario = new Map<string, ModelRun>();
      for (const r of pnlRuns) {
        if (r.status !== "completed") continue;
        if (!latestPnlByScenario.has(r.scenario_id)) latestPnlByScenario.set(r.scenario_id, r);
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
        runs: cashRuns,
        latestByScenario,
        latestPnlByScenario,
        results,
      } as const;
    },
  });
}

export function useTriggerCashRun(tenantId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { program_id: string; model_version_id: string; scenario_ids?: string[] }) => {
      const { data, error } = await supabase.functions.invoke("commercial-run-scenario", {
        body: { ...args, run_scope: "cash" },
      });
      if (error) throw error;
      return data as {
        runs: Array<{ scenario_id: string; run_id?: string; reused?: boolean; metrics_written?: number; error?: string }>;
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commercialQueryKey(tenantId, "cash-bundle") });
    },
  });
}
