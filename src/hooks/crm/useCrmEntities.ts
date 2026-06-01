import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Department, Team, Stakeholder, Activity, Note } from "@/pages/crm/types";

/* ---------- generic factory ---------- */
function makeListHook<T>(table: string) {
  return (companyId: string | undefined) =>
    useQuery({
      queryKey: [table, companyId],
      enabled: !!companyId,
      queryFn: async () => {
        const { data, error } = await supabase
          .from(table as never)
          .select("*")
          .eq("company_id", companyId!)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return (data ?? []) as T[];
      },
    });
}

function makeUpsertHook<T extends { id?: string }>(table: string, invalidateKeys: string[]) {
  return () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (input: Partial<T> & { id?: string }) => {
        if (input.id) {
          const { id, ...patch } = input;
          const { data, error } = await supabase
            .from(table as never)
            .update(patch as never)
            .eq("id", id)
            .select()
            .single();
          if (error) throw error;
          return data as T;
        }
        const { data, error } = await supabase
          .from(table as never)
          .insert(input as never)
          .select()
          .single();
        if (error) throw error;
        return data as T;
      },
      onSuccess: () => {
        invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      },
    });
  };
}

function makeDeleteHook(table: string, invalidateKeys: string[]) {
  return () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from(table as never).delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: () => invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: [k] })),
    });
  };
}

export const useDepartments = makeListHook<Department>("crm_departments");
export const useUpsertDepartment = makeUpsertHook<Department>("crm_departments", ["crm_departments"]);
export const useDeleteDepartment = makeDeleteHook("crm_departments", ["crm_departments", "crm_teams", "crm_stakeholders"]);

export const useTeams = makeListHook<Team>("crm_teams");
export const useUpsertTeam = makeUpsertHook<Team>("crm_teams", ["crm_teams"]);
export const useDeleteTeam = makeDeleteHook("crm_teams", ["crm_teams", "crm_stakeholders"]);

export const useStakeholders = makeListHook<Stakeholder>("crm_stakeholders");
export const useUpsertStakeholder = makeUpsertHook<Stakeholder>("crm_stakeholders", ["crm_stakeholders"]);
export const useDeleteStakeholder = makeDeleteHook("crm_stakeholders", ["crm_stakeholders"]);

export function useAllStakeholders() {
  return useQuery({
    queryKey: ["crm_stakeholders", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_stakeholders")
        .select("*")
        .order("first_name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Stakeholder[];
    },
  });
}

export const useActivities = makeListHook<Activity>("crm_activities");
export const useUpsertActivity = makeUpsertHook<Activity>("crm_activities", ["crm_activities"]);
export const useDeleteActivity = makeDeleteHook("crm_activities", ["crm_activities"]);

export const useNotes = makeListHook<Note>("crm_notes");
export const useUpsertNote = makeUpsertHook<Note>("crm_notes", ["crm_notes"]);
export const useDeleteNote = makeDeleteHook("crm_notes", ["crm_notes"]);