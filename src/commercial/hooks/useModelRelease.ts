import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { commercialQueryKey } from "./useCommercialAccess";

export type ReadinessControl = {
  control_code: string;
  category: string;
  label: string;
  status: "pass" | "warning" | "fail" | "not_applicable";
  severity: "info" | "warning" | "blocking";
  blocking: boolean;
  expected_value: string | null;
  actual_value: string | null;
  object_type: string | null;
  object_id: string | null;
  evidence_reference: string | null;
  remediation_hint: string | null;
};

export type ReleaseCertification = {
  id: string;
  tenant_id: string;
  program_id: string;
  model_version_id: string;
  status: "draft" | "ready" | "certified" | "invalidated";
  readiness_snapshot: ReadinessControl[];
  readiness_hash: string | null;
  release_manifest: Record<string, unknown>;
  manifest_hash: string | null;
  content_hash: string | null;
  control_count: number;
  pass_count: number;
  warning_count: number;
  blocking_failure_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  certified_at: string | null;
  invalidated_at: string | null;
  invalidation_reason: string | null;
};

export type ModelActivation = {
  id: string;
  tenant_id: string;
  program_id: string;
  model_version_id: string;
  certification_id: string;
  status: "active" | "superseded";
  snapshot_hash: string | null;
  readiness_hash: string | null;
  manifest_hash: string | null;
  certification_hash: string | null;
  lineage_summary: Record<string, unknown>;
  warning_count: number;
  blocking_failure_count: number;
  prior_active_version_id: string | null;
  activation_reason: string;
  activated_at: string;
  superseded_at: string | null;
  activation_snapshot: Record<string, unknown>;
};

export type ReleaseLineageRow = {
  id: string;
  upstream_type: string;
  upstream_id: string | null;
  downstream_type: string;
  downstream_id: string | null;
  relationship: string;
  scope: string | null;
  scenario_id: string | null;
  source_hash: string | null;
  target_hash: string | null;
};

export type ModelVersionRow = {
  id: string;
  tenant_id: string;
  program_id: string;
  version_code: string;
  name: string;
  status: string;
  formula_catalog_version: string;
  notes: string | null;
  created_at: string;
  activated_at?: string | null;
  superseded_at?: string | null;
  superseded_by_version_id?: string | null;
  supersedes_version_id?: string | null;
};

/** Program + model version list for the release workspace. */
export function useReleaseContext(tenantId: string | null) {
  return useQuery({
    enabled: !!tenantId,
    queryKey: commercialQueryKey(tenantId, "release-context"),
    queryFn: async () => {
      const { data: program, error: pErr } = await supabase
        .from("commercial_programs")
        .select("id, tenant_id, code, name")
        .eq("tenant_id", tenantId!)
        .order("created_at")
        .limit(1)
        .maybeSingle();
      if (pErr) throw pErr;
      if (!program) return { program: null, versions: [] as ModelVersionRow[] };

      const { data: versions, error: vErr } = await supabase
        .from("commercial_model_versions")
        .select("*")
        .eq("program_id", program.id)
        .order("created_at", { ascending: false });
      if (vErr) throw vErr;
      return { program, versions: (versions ?? []) as unknown as ModelVersionRow[] };
    },
  });
}

/** Server-authoritative readiness controls. Never computed in the browser. */
export function useReleaseReadiness(tenantId: string | null, modelVersionId: string | null) {
  return useQuery({
    enabled: !!tenantId && !!modelVersionId,
    queryKey: commercialQueryKey(tenantId, "release-readiness", modelVersionId),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("commercial_release_readiness", {
        _model_version_id: modelVersionId!,
      });
      if (error) throw error;
      return (data ?? []) as unknown as ReadinessControl[];
    },
  });
}

export function useReleaseCertifications(tenantId: string | null, modelVersionId: string | null) {
  return useQuery({
    enabled: !!tenantId && !!modelVersionId,
    queryKey: commercialQueryKey(tenantId, "release-certifications", modelVersionId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commercial_release_certifications")
        .select("*")
        .eq("model_version_id", modelVersionId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ReleaseCertification[];
    },
  });
}

export function useReleaseLineage(tenantId: string | null, certificationId: string | null) {
  return useQuery({
    enabled: !!tenantId && !!certificationId,
    queryKey: commercialQueryKey(tenantId, "release-lineage", certificationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commercial_release_lineage")
        .select("*")
        .eq("certification_id", certificationId!)
        .order("relationship");
      if (error) throw error;
      return (data ?? []) as unknown as ReleaseLineageRow[];
    },
  });
}

export function useActivationHistory(tenantId: string | null, programId: string | null) {
  return useQuery({
    enabled: !!tenantId && !!programId,
    queryKey: commercialQueryKey(tenantId, "activations", programId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commercial_model_activations")
        .select("*")
        .eq("program_id", programId!)
        .order("activated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ModelActivation[];
    },
  });
}

function invalidateRelease(qc: ReturnType<typeof useQueryClient>, tenantId: string | null) {
  qc.invalidateQueries({ queryKey: commercialQueryKey(tenantId) });
}

export function useCreateCertification(tenantId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { modelVersionId: string; notes?: string }) => {
      const { data, error } = await supabase.rpc("commercial_release_certification_create", {
        _model_version_id: p.modelVersionId,
        _notes: p.notes ?? null,
      });
      if (error) throw error;
      return data as unknown as string;
    },
    onSuccess: () => invalidateRelease(qc, tenantId),
  });
}

export function useRefreshCertification(tenantId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (certificationId: string) => {
      const { data, error } = await supabase.rpc("commercial_release_certification_refresh", {
        _certification_id: certificationId,
      });
      if (error) throw error;
      return data as unknown as string;
    },
    onSuccess: () => invalidateRelease(qc, tenantId),
  });
}

export function useCertifyRelease(tenantId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { certificationId: string; note?: string }) => {
      const { data, error } = await supabase.rpc("commercial_release_certification_certify", {
        _certification_id: p.certificationId,
        _note: p.note ?? null,
      });
      if (error) throw error;
      return data as unknown as string;
    },
    onSuccess: () => invalidateRelease(qc, tenantId),
  });
}

export function useInvalidateCertification(tenantId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { certificationId: string; reason: string }) => {
      const { data, error } = await supabase.rpc("commercial_release_certification_invalidate", {
        _certification_id: p.certificationId,
        _reason: p.reason,
      });
      if (error) throw error;
      return data as unknown as string;
    },
    onSuccess: () => invalidateRelease(qc, tenantId),
  });
}

export function useActivateModelVersion(tenantId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { modelVersionId: string; certificationId: string; reason: string }) => {
      const { data, error } = await supabase.rpc("commercial_model_version_activate", {
        _model_version_id: p.modelVersionId,
        _certification_id: p.certificationId,
        _reason: p.reason,
      });
      if (error) throw error;
      return data as unknown as string;
    },
    onSuccess: () => invalidateRelease(qc, tenantId),
  });
}

export function useCreateSuccessorVersion(tenantId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { modelVersionId: string; versionCode: string; name?: string }) => {
      const { data, error } = await supabase.rpc("commercial_model_version_create_successor", {
        _model_version_id: p.modelVersionId,
        _version_code: p.versionCode,
        _name: p.name ?? null,
      });
      if (error) throw error;
      return data as unknown as string;
    },
    onSuccess: () => invalidateRelease(qc, tenantId),
  });
}

export const READINESS_CATEGORY_ORDER = [
  "Model configuration",
  "Assumptions",
  "Revenue",
  "P&L",
  "Cash",
  "Comparison",
  "Sensitivity",
  "Documentation",
  "Security",
  "Lineage",
];
