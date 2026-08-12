import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { commercialQueryKey } from "./useCommercialAccess";

export type ComparisonStatus = "draft" | "saved" | "archived";
export type ComparisonMode = "pairwise" | "three_way" | "historical";

export type ComparisonHeader = {
  id: string;
  tenant_id: string;
  program_id: string;
  model_version_id: string;
  title: string;
  description: string | null;
  status: ComparisonStatus;
  mode: ComparisonMode;
  baseline_scenario_id: string;
  compared_scenario_ids: string[];
  included_scopes: string[];
  source_run_manifest: Record<string, unknown>;
  source_run_manifest_hash: string | null;
  content_hash: string | null;
  stale_at_creation: boolean;
  warning_summary: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  saved_by: string | null;
  saved_at: string | null;
  archived_by: string | null;
  archived_at: string | null;
};

export type ComparisonResultRow = {
  id: string;
  comparison_id: string;
  metric_code: string;
  metric_group: string;
  fiscal_period: string | null;
  period_sequence: number | null;
  unit: string | null;
  compared_scenario_id: string;
  baseline_scenario_id: string;
  baseline_run_id: string | null;
  compared_run_id: string | null;
  baseline_value: number | null;
  compared_value: number | null;
  absolute_variance: number | null;
  percentage_variance: number | null;
  variance_direction: "favorable" | "unfavorable" | "neutral" | "not_applicable";
  direction_reason: string | null;
};

export type CalculationRow = Omit<ComparisonResultRow, "id" | "comparison_id" | "baseline_scenario_id">;

export type ReadinessRow = {
  scenario_id: string;
  scope: string;
  is_stale: boolean;
  latest_run_id: string | null;
  latest_completed_at: string | null;
  latest_apply_at: string | null;
  is_missing: boolean;
};

export type AssumptionCompareRow = {
  assumption_code: string;
  label: string | null;
  unit: string | null;
  scenario_id: string;
  numeric_value: number | null;
  text_value: string | null;
  is_baseline: boolean;
  differs_from_baseline: boolean;
};

export function useComparisons(tenantId: string | null, programId: string | null) {
  return useQuery({
    enabled: !!tenantId && !!programId,
    queryKey: commercialQueryKey(tenantId, "comparisons", programId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commercial_scenario_comparisons")
        .select("*")
        .eq("tenant_id", tenantId!)
        .eq("program_id", programId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ComparisonHeader[];
    },
  });
}

export function useComparison(tenantId: string | null, id: string | null) {
  return useQuery({
    enabled: !!tenantId && !!id,
    queryKey: commercialQueryKey(tenantId, "comparison", id),
    queryFn: async () => {
      const [header, results] = await Promise.all([
        supabase.from("commercial_scenario_comparisons").select("*").eq("id", id!).maybeSingle(),
        supabase.from("commercial_scenario_comparison_results").select("*").eq("comparison_id", id!).order("metric_group").order("period_sequence"),
      ]);
      if (header.error) throw header.error;
      if (results.error) throw results.error;
      return {
        header: header.data as ComparisonHeader | null,
        results: (results.data ?? []) as ComparisonResultRow[],
      };
    },
  });
}

export function useCalculateComparison(tenantId: string | null, id: string | null) {
  return useQuery({
    enabled: !!tenantId && !!id,
    queryKey: commercialQueryKey(tenantId, "comparison-calc", id),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("commercial_comparison_calculate", { _comparison_id: id! });
      if (error) throw error;
      return (data ?? []) as CalculationRow[];
    },
  });
}

export function useComparisonReadiness(tenantId: string | null, id: string | null) {
  return useQuery({
    enabled: !!tenantId && !!id,
    queryKey: commercialQueryKey(tenantId, "comparison-readiness", id),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("commercial_comparison_readiness", { _comparison_id: id! });
      if (error) throw error;
      return (data ?? []) as ReadinessRow[];
    },
  });
}

export function useComparisonAssumptions(tenantId: string | null, id: string | null) {
  return useQuery({
    enabled: !!tenantId && !!id,
    queryKey: commercialQueryKey(tenantId, "comparison-assumptions", id),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("commercial_comparison_assumptions", { _comparison_id: id! });
      if (error) throw error;
      return (data ?? []) as AssumptionCompareRow[];
    },
  });
}

export function useCreateComparison(tenantId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      program_id: string;
      model_version_id: string;
      mode: ComparisonMode;
      baseline_scenario_id: string;
      compared_scenario_ids: string[];
      included_scopes: string[];
      title: string;
      description?: string;
    }) => {
      const { data, error } = await supabase.rpc("commercial_comparison_create", {
        _program_id: args.program_id,
        _model_version_id: args.model_version_id,
        _mode: args.mode,
        _baseline_scenario_id: args.baseline_scenario_id,
        _compared_scenario_ids: args.compared_scenario_ids,
        _included_scopes: args.included_scopes,
        _title: args.title,
        _description: args.description ?? null,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: commercialQueryKey(tenantId, "comparisons") }),
  });
}

export function useSaveComparison(tenantId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.rpc("commercial_comparison_save", { _comparison_id: id });
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: commercialQueryKey(tenantId, "comparisons") });
      qc.invalidateQueries({ queryKey: commercialQueryKey(tenantId, "comparison", id) });
    },
  });
}

export function useArchiveComparison(tenantId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("commercial_comparison_archive", { _comparison_id: id });
      if (error) throw error;
    },
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: commercialQueryKey(tenantId, "comparisons") });
      qc.invalidateQueries({ queryKey: commercialQueryKey(tenantId, "comparison", id) });
    },
  });
}
