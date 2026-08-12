import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/* -------------------- Controlled lists (mirror DB enums) -------------------- */

export const ETDM_DOMAIN_LIFECYCLE = [
  "Emerging","Evaluation","Strategic","Active","Maintenance","Legacy","Deprecated","End of Support","Retired",
] as const;
export type EtdmDomainLifecycle = typeof ETDM_DOMAIN_LIFECYCLE[number];

export const ETDM_DOMAIN_APPROVAL = ["Draft","In Review","Approved","Rejected","Retired"] as const;
export type EtdmDomainApproval = typeof ETDM_DOMAIN_APPROVAL[number];

export const ETDM_DOMAIN_CRITICALITY = [
  "Mission Critical","Business Critical","Important","Standard","Noncritical",
] as const;
export type EtdmDomainCriticality = typeof ETDM_DOMAIN_CRITICALITY[number];

/* --------------------------------- Types ---------------------------------- */

export interface Domain {
  id: string;
  tenant_id: string | null;
  technology_id: string;
  master_domain_id: string;
  domain_display_name: string;
  short_name: string | null;
  slug: string;
  description: string | null;
  display_order: number;
  tags: string[];
  scope_summary: string | null;
  business_purpose: string | null;
  business_criticality: EtdmDomainCriticality;
  lifecycle_status: EtdmDomainLifecycle;
  approval_status: EtdmDomainApproval;
  is_active: boolean;
  is_deleted: boolean;
  effective_date: string | null;
  review_date: string | null;
  expiration_date: string | null;
  governance_notes: string | null;
  source_of_record: string | null;
  external_reference_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  published_version: number;
  cloned_from_domain_id: string | null;
  deleted_by: string | null;
  deleted_at: string | null;
  // joined
  master_domain?: { id: string; name: string } | null;
  technology?: { id: string; technology_name: string } | null;
  [k: string]: unknown;
}

export interface MasterDomain {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

export interface DomainFilters {
  search?: string;
  technology_id?: string;
  technology_ids?: string[];
  master_domain_ids?: string[];
  lifecycle_status?: EtdmDomainLifecycle[];
  approval_status?: EtdmDomainApproval[];
  business_criticality?: EtdmDomainCriticality[];
  active?: "all" | "active" | "inactive";
  showDeleted?: boolean;
  createdFrom?: string;
  createdTo?: string;
  modifiedFrom?: string;
  modifiedTo?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

const TABLE = "etdm_domains";
const MASTER_TABLE = "etdm_master_domains";

/* --------------------------------- Hooks ---------------------------------- */

export function useMasterDomains() {
  return useQuery({
    queryKey: ["etdm-master-domains"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from(MASTER_TABLE)
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MasterDomain[];
    },
  });
}

export function useDomains(f: DomainFilters) {
  return useQuery({
    queryKey: ["etdm-domains", f],
    queryFn: async () => {
      const from = (f.page ?? 0) * (f.pageSize ?? 25);
      const to = from + (f.pageSize ?? 25) - 1;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = supabase
        .from(TABLE)
        .select(
          "*, master_domain:master_domain_id(id,name), technology:technology_id(id,technology_name)",
          { count: "exact" },
        );

      q = q.eq("is_deleted", !!f.showDeleted);
      if (f.technology_id) q = q.eq("technology_id", f.technology_id);
      if (f.technology_ids?.length) q = q.in("technology_id", f.technology_ids);
      if (f.master_domain_ids?.length) q = q.in("master_domain_id", f.master_domain_ids);
      if (f.lifecycle_status?.length) q = q.in("lifecycle_status", f.lifecycle_status);
      if (f.approval_status?.length) q = q.in("approval_status", f.approval_status);
      if (f.business_criticality?.length) q = q.in("business_criticality", f.business_criticality);
      if (f.active === "active") q = q.eq("is_active", true);
      if (f.active === "inactive") q = q.eq("is_active", false);
      if (f.createdFrom) q = q.gte("created_at", f.createdFrom);
      if (f.createdTo) q = q.lte("created_at", f.createdTo);
      if (f.modifiedFrom) q = q.gte("updated_at", f.modifiedFrom);
      if (f.modifiedTo) q = q.lte("updated_at", f.modifiedTo);

      if (f.search?.trim()) {
        const s = f.search.trim().replace(/[%,]/g, "");
        q = q.or(
          [
            `domain_display_name.ilike.%${s}%`,
            `short_name.ilike.%${s}%`,
            `description.ilike.%${s}%`,
            `source_of_record.ilike.%${s}%`,
            `external_reference_id.ilike.%${s}%`,
          ].join(","),
        );
      }

      const sortBy = f.sortBy ?? "updated_at";
      q = q.order(sortBy, { ascending: f.sortDir === "asc" });
      q = q.range(from, to);

      const { data, error, count } = await q;
      if (error) throw error;
      return { rows: (data ?? []) as Domain[], count: count ?? 0 };
    },
  });
}

export function useDomainsForTechnology(technologyId: string | undefined) {
  return useQuery({
    enabled: !!technologyId,
    queryKey: ["etdm-domains-for-tech", technologyId],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from(TABLE) as any)
        .select("*, master_domain:master_domain_id(id,name)")
        .eq("technology_id", technologyId!)
        .eq("is_deleted", false)
        .order("display_order", { ascending: true })
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Domain[];
    },
  });
}

export function useDomain(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ["etdm-domain", id],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from(TABLE) as any)
        .select("*, master_domain:master_domain_id(id,name), technology:technology_id(id,technology_name)")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data as Domain | null;
    },
  });
}

function invalidateDomains(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["etdm-domains"] });
  qc.invalidateQueries({ queryKey: ["etdm-domain"] });
  qc.invalidateQueries({ queryKey: ["etdm-domains-for-tech"] });
}

export function useUpsertDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Domain> & { id?: string }) => {
      const { id, master_domain, technology, ...rest } = payload as Partial<Domain> & {
        id?: string; master_domain?: unknown; technology?: unknown;
      };
      void master_domain; void technology;
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase.from(TABLE) as any;
      if (id) {
        const { data, error } = await client
          .update({ ...rest, updated_by: uid })
          .eq("id", id)
          .select("*, master_domain:master_domain_id(id,name), technology:technology_id(id,technology_name)")
          .single();
        if (error) throw error;
        return data as Domain;
      }
      const { data, error } = await client
        .insert({ ...rest, created_by: uid, updated_by: uid })
        .select("*, master_domain:master_domain_id(id,name), technology:technology_id(id,technology_name)")
        .single();
      if (error) throw error;
      return data as Domain;
    },
    onSuccess: () => invalidateDomains(qc),
  });
}

export function useSoftDeleteDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from(TABLE) as any)
        .update({
          is_deleted: true,
          is_active: false,
          deleted_by: uid,
          deleted_at: new Date().toISOString(),
          updated_by: uid,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateDomains(qc),
  });
}

export function useRestoreDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from(TABLE) as any)
        .update({ is_deleted: false, deleted_by: null, deleted_at: null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateDomains(qc),
  });
}

export function useSetDomainActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from(TABLE) as any).update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateDomains(qc),
  });
}

export function useCloneDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sourceId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc("etdm_clone_domain", { _source_id: sourceId });
      if (error) throw error;
      return data as Domain;
    },
    onSuccess: () => invalidateDomains(qc),
  });
}

export function useReorderDomains() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ technologyId, orderedIds }: { technologyId: string; orderedIds: string[] }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).rpc("etdm_reorder_domains", {
        _technology_id: technologyId,
        _ordered_ids: orderedIds,
      });
      if (error) throw error;
    },
    onSuccess: () => invalidateDomains(qc),
  });
}

export function useDomainAuditLog(entityId: string | undefined) {
  return useQuery({
    enabled: !!entityId,
    queryKey: ["etdm-domain-audit", entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("etdm_record_audit_log")
        .select("*")
        .eq("entity_type", "domain")
        .eq("entity_id", entityId!)
        .order("changed_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });
}

/* --- Lightweight technologies list for filters/parent picker -------------- */

export function useTechnologyOptions() {
  return useQuery({
    queryKey: ["etdm-technology-options"],
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("etdm_technologies")
        .select("id,technology_name,short_name,slug")
        .eq("is_deleted", false)
        .order("technology_name", { ascending: true })
        .limit(1000);
      if (error) throw error;
      return (data ?? []) as { id: string; technology_name: string; short_name: string | null; slug: string }[];
    },
  });
}
