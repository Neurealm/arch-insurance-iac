import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Technology {
  id: string;
  tenant_id: string | null;
  technology_name: string;
  short_name: string | null;
  slug: string;
  description: string | null;
  category: string | null;
  technology_type: string | null;
  vendor_name: string | null;
  product_family: string | null;
  product_name: string | null;
  version: string | null;
  edition: string | null;
  lifecycle_status: string | null;
  technology_icon_url: string | null;
  banner_image_url: string | null;
  color_theme: string | null;
  tags: string[] | null;
  technology_tower: string | null;
  primary_domain: string | null;
  secondary_domains: string[] | null;
  business_criticality: string | null;
  business_purpose: string | null;
  approval_status: string;
  visibility: string;
  is_active: boolean;
  is_deleted: boolean;
  is_sample: boolean;
  cloned_from_technology_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  deleted_by: string | null;
  deleted_at: string | null;
  // Everything else is stored but not narrowly typed here.
  [k: string]: unknown;
}

const TABLE = "etdm_technologies";

export interface TechFilters {
  search?: string;
  vendor?: string[];
  category?: string[];
  technology_type?: string[];
  lifecycle_status?: string[];
  business_criticality?: string[];
  approval_status?: string[];
  neurealm_practice?: string[];
  active?: "all" | "active" | "inactive";
  showDeleted?: boolean;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export function useTechnologies(f: TechFilters) {
  return useQuery({
    queryKey: ["etdm-technologies", f],
    queryFn: async () => {
      const from = ((f.page ?? 0)) * (f.pageSize ?? 25);
      const to = from + (f.pageSize ?? 25) - 1;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = supabase.from(TABLE).select("*", { count: "exact" });
      if (!f.showDeleted) q = q.eq("is_deleted", false);
      else q = q.eq("is_deleted", true);

      if (f.search?.trim()) {
        const s = f.search.trim();
        q = q.or(
          [
            `technology_name.ilike.%${s}%`,
            `short_name.ilike.%${s}%`,
            `vendor_name.ilike.%${s}%`,
            `product_family.ilike.%${s}%`,
            `product_name.ilike.%${s}%`,
            `description.ilike.%${s}%`,
          ].join(","),
        );
      }
      if (f.vendor?.length) q = q.in("vendor_name", f.vendor);
      if (f.category?.length) q = q.in("category", f.category);
      if (f.technology_type?.length) q = q.in("technology_type", f.technology_type);
      if (f.lifecycle_status?.length) q = q.in("lifecycle_status", f.lifecycle_status);
      if (f.business_criticality?.length) q = q.in("business_criticality", f.business_criticality);
      if (f.approval_status?.length) q = q.in("approval_status", f.approval_status);
      if (f.active === "active") q = q.eq("is_active", true);
      if (f.active === "inactive") q = q.eq("is_active", false);

      q = q.order(f.sortBy ?? "updated_at", { ascending: f.sortDir === "asc" });
      q = q.range(from, to);

      const { data, error, count } = await q;
      if (error) throw error;
      return { rows: (data ?? []) as Technology[], count: count ?? 0 };
    },
  });
}

export function useTechnology(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ["etdm-technology", id],
    queryFn: async () => {
      const { data, error } = await supabase.from(TABLE).select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data as Technology | null;
    },
  });
}

export function useUpsertTechnology() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Technology> & { id?: string }) => {
      const { id, ...rest } = payload;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase.from(TABLE) as any;
      if (id) {
        const { data, error } = await client.update(rest).eq("id", id).select().single();
        if (error) throw error;
        return data as Technology;
      }
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      const { data, error } = await client
        .insert({ ...rest, created_by: uid, updated_by: uid })
        .select()
        .single();
      if (error) throw error;
      return data as Technology;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["etdm-technologies"] }),
  });
}

export function useSoftDeleteTechnology() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from(TABLE) as any)
        .update({ is_deleted: true, is_active: false, deleted_by: uid, deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["etdm-technologies"] }),
  });
}

export function useRestoreTechnology() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from(TABLE) as any)
        .update({ is_deleted: false, deleted_by: null, deleted_at: null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["etdm-technologies"] }),
  });
}

export function useSetActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from(TABLE) as any).update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["etdm-technologies"] }),
  });
}

export function useCloneTechnology() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sourceId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc("etdm_clone_technology", { _source_id: sourceId });
      if (error) throw error;
      return data as Technology;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["etdm-technologies"] }),
  });
}

export function useAuditLog(entityId: string | undefined) {
  return useQuery({
    enabled: !!entityId,
    queryKey: ["etdm-audit", entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("etdm_record_audit_log")
        .select("*")
        .eq("entity_type", "technology")
        .eq("entity_id", entityId!)
        .order("changed_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });
}
