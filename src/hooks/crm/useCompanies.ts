import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Company } from "@/pages/crm/types";

export function useCompanies() {
  return useQuery({
    queryKey: ["crm_companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_companies")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Company[];
    },
  });
}

export function useCompany(id: string | undefined) {
  return useQuery({
    queryKey: ["crm_companies", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_companies")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data as Company | null;
    },
  });
}

export function useUpsertCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Company> & { id?: string }) => {
      if (input.id) {
        const { id, ...patch } = input;
        const { data, error } = await supabase
          .from("crm_companies")
          .update(patch)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data as Company;
      }
      const { data, error } = await supabase
        .from("crm_companies")
        .insert(input as never)
        .select()
        .single();
      if (error) throw error;
      return data as Company;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm_companies"] });
    },
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crm_companies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm_companies"] }),
  });
}