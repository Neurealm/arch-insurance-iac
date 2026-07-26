import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { commercialQueryKey } from "./useCommercialAccess";

export type SensitivityStatus = "draft" | "running" | "completed" | "failed" | "archived";
export type PerturbationStrategy = "absolute" | "pct_delta" | "increment_list" | "value_list";

export type SensitivityExperiment = {
  id: string;
  tenant_id: string;
  program_id: string;
  model_version_id: string;
  baseline_scenario_id: string;
  title: string;
  description: string | null;
  status: SensitivityStatus;
  assumption_code: string;
  included_scopes: string[];
  perturbation_strategy: PerturbationStrategy;
  perturbation_config: Record<string, unknown>;
  baseline_run_manifest: Record<string, unknown>;
  baseline_run_manifest_hash: string | null;
  content_hash: string | null;
  stale_at_creation: boolean;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
  archived_at: string | null;
};

export type SensitivityPerturbation = {
  id: string;
  experiment_id: string;
  perturbation_index: number;
  perturbation_label: string;
  perturbed_value: number;
  status: string;
  input_hash: string | null;
  runtime_fingerprint: string | null;
  temp_run_ids: Record<string, string>;
  error_code: string | null;
  error_message: string | null;
};

export type SensitivityResult = {
  id: string;
  experiment_id: string;
  perturbation_id: string;
  metric_code: string;
  metric_group: string;
  fiscal_period: string | null;
  period_sequence: number | null;
  unit: string | null;
  scope: string;
  baseline_value: number | null;
  perturbed_value: number | null;
  absolute_delta: number | null;
  percentage_delta: number | null;
  elasticity: number | null;
  elasticity_reason: string | null;
  variance_direction: string;
  direction_reason: string | null;
  impact_rank: number | null;
};

export function useSensitivityExperiments(tenantId: string | null, programId: string | null) {
  return useQuery({
    enabled: !!tenantId && !!programId,
    queryKey: commercialQueryKey(tenantId, "sensitivity", programId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commercial_sensitivity_experiments")
        .select("*")
        .eq("tenant_id", tenantId!)
        .eq("program_id", programId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SensitivityExperiment[];
    },
  });
}

export function useSensitivityExperiment(tenantId: string | null, id: string | null) {
  return useQuery({
    enabled: !!tenantId && !!id,
    queryKey: commercialQueryKey(tenantId, "sensitivity-detail", id),
    queryFn: async () => {
      const [h, p, r] = await Promise.all([
        supabase.from("commercial_sensitivity_experiments").select("*").eq("id", id!).maybeSingle(),
        supabase.from("commercial_sensitivity_perturbations").select("*")
          .eq("experiment_id", id!).order("perturbation_index"),
        supabase.from("commercial_sensitivity_results").select("*")
          .eq("experiment_id", id!).order("impact_rank"),
      ]);
      if (h.error) throw h.error;
      if (p.error) throw p.error;
      if (r.error) throw r.error;
      return {
        header: h.data as SensitivityExperiment | null,
        perturbations: (p.data ?? []) as SensitivityPerturbation[],
        results: (r.data ?? []) as SensitivityResult[],
      };
    },
  });
}

export function useCreateSensitivity(tenantId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: {
      program_id: string;
      model_version_id: string;
      baseline_scenario_id: string;
      assumption_code: string;
      included_scopes: string[];
      perturbation_strategy: PerturbationStrategy;
      perturbation_config: Record<string, unknown>;
      title: string;
      description?: string;
    }) => {
      const { data, error } = await supabase.rpc("commercial_sensitivity_create", {
        _program_id: v.program_id,
        _model_version_id: v.model_version_id,
        _baseline_scenario_id: v.baseline_scenario_id,
        _assumption_code: v.assumption_code,
        _included_scopes: v.included_scopes,
        _perturbation_strategy: v.perturbation_strategy,
        _perturbation_config: v.perturbation_config as never,
        _title: v.title,
        _description: v.description ?? null,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commercialQueryKey(tenantId, "sensitivity") });
    },
  });
}

export function useExecuteSensitivity(tenantId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { experiment_id: string; perturbations: Array<{ label: string; value: number }> }) => {
      // 1. Start execution: freeze manifest + insert perturbation rows
      const startRes = await supabase.rpc("commercial_sensitivity_start_execution", {
        _experiment_id: v.experiment_id,
        _perturbations: v.perturbations as never,
      });
      if (startRes.error) throw startRes.error;

      // 2. Fetch created perturbations
      const { data: pertRows, error: pErr } = await supabase
        .from("commercial_sensitivity_perturbations")
        .select("id, perturbation_index")
        .eq("experiment_id", v.experiment_id)
        .order("perturbation_index");
      if (pErr) throw pErr;

      // 3. Invoke edge function per perturbation
      for (const p of pertRows ?? []) {
        const res = await supabase.functions.invoke("commercial-run-scenario", {
          body: { sensitivity: { experiment_id: v.experiment_id, perturbation_id: p.id } },
        });
        if (res.error) {
          await supabase.rpc("commercial_sensitivity_fail", {
            _experiment_id: v.experiment_id,
            _error_code: "PERTURBATION_FAILED",
            _error_message: res.error.message ?? String(res.error),
          });
          throw res.error;
        }
      }

      // 4. Finalize
      const finRes = await supabase.rpc("commercial_sensitivity_finalize", { _experiment_id: v.experiment_id });
      if (finRes.error) throw finRes.error;
      return finRes.data;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: commercialQueryKey(tenantId, "sensitivity") });
      qc.invalidateQueries({ queryKey: commercialQueryKey(tenantId, "sensitivity-detail", v.experiment_id) });
    },
  });
}

export function useArchiveSensitivity(tenantId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (experiment_id: string) => {
      const { error } = await supabase.rpc("commercial_sensitivity_archive", { _experiment_id: experiment_id });
      if (error) throw error;
    },
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: commercialQueryKey(tenantId, "sensitivity") });
      qc.invalidateQueries({ queryKey: commercialQueryKey(tenantId, "sensitivity-detail", id) });
    },
  });
}

// Helper: expand strategy + config into concrete perturbation values
export function expandPerturbations(
  strategy: PerturbationStrategy,
  config: Record<string, unknown>,
  baselineValue: number | null,
): Array<{ label: string; value: number }> {
  const b = baselineValue ?? 0;
  switch (strategy) {
    case "absolute": {
      const v = Number(config.value);
      return isFinite(v) ? [{ label: String(v), value: v }] : [];
    }
    case "pct_delta": {
      const pct = Number(config.pct);
      const v = b * (1 + pct);
      return isFinite(v) ? [{ label: `${pct >= 0 ? "+" : ""}${(pct * 100).toFixed(1)}%`, value: v }] : [];
    }
    case "increment_list": {
      const list = (config.increments as number[]) ?? [];
      return list
        .map((pct) => ({ label: `${pct >= 0 ? "+" : ""}${(pct * 100).toFixed(1)}%`, value: b * (1 + pct) }))
        .filter((p) => isFinite(p.value));
    }
    case "value_list": {
      const list = (config.values as number[]) ?? [];
      return list.map((v) => ({ label: String(v), value: v })).filter((p) => isFinite(p.value));
    }
  }
}
