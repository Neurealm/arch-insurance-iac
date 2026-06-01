import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ORG_LEVELS, type OrgLevelKey } from "@/config/orgLevels";
import { toast } from "@/hooks/use-toast";
import { useTenantScope } from "@/hooks/useTenantScope";
import { useAuth } from "@/context/AuthContext";

export type OrgRecord = {
  id: string;
  name: string;
  short_name?: string | null;
  url?: string | null;
  description?: string | null;
  logo?: string | null;
  tagline?: string | null;
  mission?: string | null;
  strategic_value?: string | null;
  keywords: string[];
  semantic_tags: string[];
  strategic_themes: string[];
  ai_summary?: string | null;
  embedding_text?: string | null;
  created_by?: string | null;
  last_updated_by?: string | null;
  created_at: string;
  updated_at: string;
  [parentFk: string]: unknown;
};

const db = supabase as unknown as {
  from: (t: string) => any;
};

export function useOrgList(level: OrgLevelKey, parentId?: string | null) {
  const cfg = ORG_LEVELS[level];
  const { tenantId, scoped, loading } = useTenantScope();
  const { isAdmin } = useAuth();
  return useQuery({
    queryKey: ["org", level, "list", parentId ?? "all", tenantId ?? (isAdmin ? "admin" : "none")],
    enabled: isAdmin || (!loading && scoped && !!tenantId),
    queryFn: async () => {
      let q = db.from(cfg.table).select("*").order("name", { ascending: true });
      if (cfg.parentFk && parentId) q = q.eq(cfg.parentFk, parentId);
      if (!isAdmin && tenantId) q = q.eq("tenant_id", tenantId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as OrgRecord[];
    },
  });
}

export function useOrgRecord(level: OrgLevelKey, id?: string) {
  const cfg = ORG_LEVELS[level];
  return useQuery({
    enabled: !!id,
    queryKey: ["org", level, "one", id],
    queryFn: async () => {
      const { data, error } = await db.from(cfg.table).select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as OrgRecord | null;
    },
  });
}

export function useOrgMutations(level: OrgLevelKey) {
  const cfg = ORG_LEVELS[level];
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["org", level] });

  const create = useMutation({
    mutationFn: async (payload: Partial<OrgRecord>) => {
      const { data: u } = await supabase.auth.getUser();
      const userId = u.user?.id ?? null;
      const { data, error } = await db
        .from(cfg.table)
        .insert({ ...payload, created_by: userId, last_updated_by: userId })
        .select()
        .single();
      if (error) throw error;
      return data as OrgRecord;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: `${cfg.singular} created` });
    },
    onError: (e: any) => toast({ title: "Failed to create", description: e.message, variant: "destructive" }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<OrgRecord> & { id: string }) => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await db
        .from(cfg.table)
        .update({ ...payload, last_updated_by: u.user?.id ?? null })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as OrgRecord;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: `${cfg.singular} updated` });
    },
    onError: (e: any) => toast({ title: "Failed to update", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from(cfg.table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: `${cfg.singular} deleted` });
    },
    onError: (e: any) => toast({ title: "Failed to delete", description: e.message, variant: "destructive" }),
  });

  return { create, update, remove };
}