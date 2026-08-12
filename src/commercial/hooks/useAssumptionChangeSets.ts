import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { commercialQueryKey } from "./useCommercialAccess";

const PROGRAM_CODE = "PROJECT_MOMENTOUS";

export type ChangeSetStatus = "draft" | "validated" | "applied" | "cancelled";

export type ChangeSet = {
  id: string;
  tenant_id: string;
  program_id: string;
  model_version_id: string;
  title: string;
  description: string | null;
  status: ChangeSetStatus;
  change_count: number;
  content_hash: string | null;
  validation_summary: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  validated_by: string | null;
  validated_at: string | null;
  applied_by: string | null;
  applied_at: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
};

export type ChangeSetItem = {
  id: string;
  change_set_id: string;
  scenario_id: string;
  assumption_code: string;
  previous_value_numeric: number | null;
  previous_value_text: string | null;
  proposed_value_numeric: number | null;
  proposed_value_text: string | null;
  unit: string | null;
  value_type: "numeric" | "text" | "boolean";
  rationale: string | null;
  validation_status: "unvalidated" | "valid" | "warning" | "error";
  validation_message: string | null;
  impact_scopes: string[];
  created_at: string;
  updated_at: string;
};

export type EffectiveAssumption = {
  id: string;
  scenario_id: string;
  assumption_code: string;
  label: string | null;
  numeric_value: number | null;
  text_value: string | null;
  unit: string | null;
  confidence: string | null;
  notes: string | null;
};

/** Program + model-version + scenarios bundle, mirroring the pattern used in other commercial hooks. */
export function useAssumptionsContext(tenantId: string | null) {
  return useQuery({
    enabled: !!tenantId,
    queryKey: commercialQueryKey(tenantId, "assumptions-context"),
    queryFn: async () => {
      const { data: program, error: pErr } = await supabase
        .from("commercial_programs")
        .select("id, code, name")
        .eq("tenant_id", tenantId!)
        .eq("code", PROGRAM_CODE)
        .maybeSingle();
      if (pErr) throw pErr;
      if (!program) return { program: null } as const;

      const [scen, ver, ass] = await Promise.all([
        supabase
          .from("commercial_scenarios")
          .select("id, code, name, is_baseline")
          .eq("program_id", program.id)
          .order("code"),
        supabase
          .from("commercial_model_versions")
          .select("id, version_code, status")
          .eq("program_id", program.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("commercial_scenario_assumptions")
          .select("id, scenario_id, assumption_code, label, numeric_value, text_value, unit, confidence, notes")
          .eq("tenant_id", tenantId!)
          .order("assumption_code"),
      ]);
      if (scen.error) throw scen.error;
      if (ver.error) throw ver.error;
      if (ass.error) throw ass.error;

      const draftVersion = (ver.data ?? []).find((v) => v.status === "draft") ?? ver.data?.[0] ?? null;

      return {
        program,
        scenarios: scen.data ?? [],
        draftVersion,
        assumptions: (ass.data ?? []) as EffectiveAssumption[],
      } as const;
    },
  });
}

export function useChangeSets(tenantId: string | null, programId: string | null) {
  return useQuery({
    enabled: !!tenantId && !!programId,
    queryKey: commercialQueryKey(tenantId, "change-sets", programId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commercial_assumption_change_sets")
        .select("*")
        .eq("tenant_id", tenantId!)
        .eq("program_id", programId!)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as ChangeSet[];
    },
  });
}

export function useChangeSetDetail(tenantId: string | null, id: string | null) {
  return useQuery({
    enabled: !!tenantId && !!id,
    queryKey: commercialQueryKey(tenantId, "change-set", id),
    queryFn: async () => {
      const [head, items] = await Promise.all([
        supabase
          .from("commercial_assumption_change_sets")
          .select("*")
          .eq("id", id!)
          .maybeSingle(),
        supabase
          .from("commercial_assumption_change_set_items")
          .select("*")
          .eq("change_set_id", id!)
          .order("assumption_code"),
      ]);
      if (head.error) throw head.error;
      if (items.error) throw items.error;
      return {
        header: head.data as ChangeSet | null,
        items: (items.data ?? []) as ChangeSetItem[],
      };
    },
  });
}

export type StalenessRow = {
  run_scope: string;
  scenario_id: string;
  latest_run_id: string | null;
  latest_completed_at: string | null;
  last_apply_at: string | null;
  is_stale: boolean;
};

export function useRunStaleness(programId: string | null) {
  return useQuery({
    enabled: !!programId,
    queryKey: ["commercial", "staleness", programId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("commercial_program_run_staleness", {
        _program_id: programId!,
      });
      if (error) throw error;
      return (data ?? []) as StalenessRow[];
    },
  });
}

/* ------------ Mutations ------------ */

export function useCreateChangeSet(tenantId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      program_id: string;
      model_version_id: string;
      title: string;
      description?: string;
    }) => {
      const { data, error } = await supabase.rpc("commercial_change_set_create", {
        _tenant_id: tenantId!,
        _program_id: input.program_id,
        _model_version_id: input.model_version_id,
        _title: input.title,
        _description: input.description ?? null,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commercialQueryKey(tenantId, "change-sets") });
    },
  });
}

export function useUpsertChangeSetItem(tenantId: string | null, changeSetId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      change_set_id: string;
      scenario_id: string;
      assumption_code: string;
      proposed_value_numeric?: number | null;
      proposed_value_text?: string | null;
      rationale?: string | null;
    }) => {
      const { data, error } = await supabase.rpc("commercial_change_set_upsert_item", {
        _change_set_id: input.change_set_id,
        _scenario_id: input.scenario_id,
        _assumption_code: input.assumption_code,
        _proposed_value_numeric: input.proposed_value_numeric ?? null,
        _proposed_value_text: input.proposed_value_text ?? null,
        _rationale: input.rationale ?? null,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commercialQueryKey(tenantId, "change-set", changeSetId) });
      qc.invalidateQueries({ queryKey: commercialQueryKey(tenantId, "change-sets") });
    },
  });
}

export function useRemoveChangeSetItem(tenantId: string | null, changeSetId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.rpc("commercial_change_set_remove_item", { _item_id: itemId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commercialQueryKey(tenantId, "change-set", changeSetId) });
    },
  });
}

export function useValidateChangeSet(tenantId: string | null, changeSetId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("commercial_change_set_validate", {
        _change_set_id: changeSetId!,
      });
      if (error) throw error;
      return data as Record<string, unknown>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commercialQueryKey(tenantId, "change-set", changeSetId) });
      qc.invalidateQueries({ queryKey: commercialQueryKey(tenantId, "change-sets") });
    },
  });
}

export function useApplyChangeSet(tenantId: string | null, changeSetId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("commercial_change_set_apply", {
        _change_set_id: changeSetId!,
      });
      if (error) throw error;
      return data as Record<string, unknown>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commercialQueryKey(tenantId, "change-set", changeSetId) });
      qc.invalidateQueries({ queryKey: commercialQueryKey(tenantId, "change-sets") });
      qc.invalidateQueries({ queryKey: commercialQueryKey(tenantId, "assumptions-context") });
      qc.invalidateQueries({ queryKey: ["commercial", "staleness"] });
    },
  });
}

export function useCancelChangeSet(tenantId: string | null, changeSetId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reason?: string) => {
      const { error } = await supabase.rpc("commercial_change_set_cancel", {
        _change_set_id: changeSetId!,
        _reason: reason ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commercialQueryKey(tenantId, "change-set", changeSetId) });
      qc.invalidateQueries({ queryKey: commercialQueryKey(tenantId, "change-sets") });
    },
  });
}

/** Classify a raw assumption code the same way the server does — used for pre-submit hints. */
export function classifyImpact(code: string): string[] {
  if (!code) return ["unknown"];
  if (["PAY_LAG_DAYS", "Q1_TRAVEL_FRONTLOAD_PCT", "Q1_ACT_FUND_TIMING_PCT"].includes(code)) return ["cash"];
  if (code.startsWith("COD_") || code.startsWith("OPEX_") || code === "COST_ESCALATOR_PCT") return ["pnl", "cash"];
  if (
    code.startsWith("ACT_RAMP_") ||
    code.startsWith("AVG_ARR_") ||
    code.startsWith("ARR_PROXY_") ||
    code.startsWith("ACTIVATION_FUND_") ||
    code.startsWith("MARKETPLACE_") ||
    code.startsWith("INCR_ARR_") ||
    code.startsWith("CONV_") ||
    code.startsWith("EAR_POOL_") ||
    code.startsWith("BASE_RENEWAL_") ||
    code.startsWith("FLEX_MIGRATION_") ||
    code.startsWith("GROWTH_ACCEL_")
  ) {
    return ["revenue", "pnl", "cash"];
  }
  return ["unknown"];
}
