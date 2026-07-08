import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Program = { id: string; name: string; description: string | null; status: string };
export type Workstream = { id: string; program_id: string; name: string; description: string | null; display_order: number };
export type Questionnaire = {
  id: string;
  workstream_id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
};
export type Section = {
  id: string;
  questionnaire_id: string;
  title: string;
  description: string | null;
  display_order: number;
};
export type Question = {
  id: string;
  section_id: string;
  question_id: string;
  question_text: string;
  why_asking: string | null;
  follow_up_questions: string | null;
  evidence_requested: string | null;
  question_type: string;
  priority: string | null;
  display_order: number;
  customer_visible: boolean;
  required: boolean;
};

export function usePrograms() {
  return useQuery({
    queryKey: ["q-programs"],
    queryFn: async (): Promise<Program[]> => {
      const { data, error } = await supabase
        .from("programs")
        .select("id,name,description,status")
        .order("name");
      if (error) throw error;
      return (data as Program[]) ?? [];
    },
  });
}

export function useWorkstreams(programId: string | null) {
  return useQuery({
    queryKey: ["q-workstreams", programId],
    enabled: !!programId,
    queryFn: async (): Promise<Workstream[]> => {
      const { data, error } = await supabase
        .from("workstreams")
        .select("id,program_id,name,description,display_order")
        .eq("program_id", programId!)
        .order("display_order");
      if (error) throw error;
      return (data as Workstream[]) ?? [];
    },
  });
}

export function useQuestionnaires(workstreamId: string | null) {
  return useQuery({
    queryKey: ["q-questionnaires", workstreamId],
    enabled: !!workstreamId,
    queryFn: async (): Promise<Questionnaire[]> => {
      const { data, error } = await supabase
        .from("questionnaires")
        .select("id,workstream_id,title,description,status,due_date")
        .eq("workstream_id", workstreamId!)
        .order("created_at");
      if (error) throw error;
      return (data as Questionnaire[]) ?? [];
    },
  });
}

export function useSections(questionnaireId: string | null) {
  return useQuery({
    queryKey: ["q-sections", questionnaireId],
    enabled: !!questionnaireId,
    queryFn: async (): Promise<Section[]> => {
      const { data, error } = await supabase
        .from("questionnaire_sections")
        .select("id,questionnaire_id,title,description,display_order")
        .eq("questionnaire_id", questionnaireId!)
        .order("display_order");
      if (error) throw error;
      return (data as Section[]) ?? [];
    },
  });
}

export function useQuestions(questionnaireId: string | null, sectionIds: string[]) {
  return useQuery({
    queryKey: ["q-questions", questionnaireId, sectionIds.join(",")],
    enabled: !!questionnaireId && sectionIds.length > 0,
    queryFn: async (): Promise<Question[]> => {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .in("section_id", sectionIds)
        .order("display_order");
      if (error) throw error;
      return (data as Question[]) ?? [];
    },
  });
}

export function useQMutations() {
  const qc = useQueryClient();
  const inv = (keys: any[][]) => keys.forEach((k) => qc.invalidateQueries({ queryKey: k }));

  return {
    addProgram: useMutation({
      mutationFn: async (name: string) => {
        const { data, error } = await supabase.from("programs").insert({ name }).select().single();
        if (error) throw error;
        return data;
      },
      onSuccess: () => { inv([["q-programs"]]); toast.success("Program created"); },
      onError: (e: any) => toast.error(e.message),
    }),
    addWorkstream: useMutation({
      mutationFn: async (v: { program_id: string; name: string; display_order: number }) => {
        const { data, error } = await supabase.from("workstreams").insert(v).select().single();
        if (error) throw error;
        return data;
      },
      onSuccess: (_, v) => { inv([["q-workstreams", v.program_id]]); toast.success("Workstream added"); },
      onError: (e: any) => toast.error(e.message),
    }),
    addQuestionnaire: useMutation({
      mutationFn: async (v: { workstream_id: string; title: string }) => {
        const { data, error } = await supabase.from("questionnaires").insert(v).select().single();
        if (error) throw error;
        return data;
      },
      onSuccess: (_, v) => { inv([["q-questionnaires", v.workstream_id]]); toast.success("Questionnaire created"); },
      onError: (e: any) => toast.error(e.message),
    }),
    updateQuestionnaire: useMutation({
      mutationFn: async (v: { id: string; patch: Partial<Questionnaire> }) => {
        const { error } = await supabase.from("questionnaires").update(v.patch).eq("id", v.id);
        if (error) throw error;
      },
      onSuccess: () => { qc.invalidateQueries({ queryKey: ["q-questionnaires"] }); toast.success("Saved"); },
      onError: (e: any) => toast.error(e.message),
    }),
    addSection: useMutation({
      mutationFn: async (v: { questionnaire_id: string; title: string; display_order: number }) => {
        const { data, error } = await supabase.from("questionnaire_sections").insert(v).select().single();
        if (error) throw error;
        return data;
      },
      onSuccess: (_, v) => { inv([["q-sections", v.questionnaire_id]]); toast.success("Section added"); },
      onError: (e: any) => toast.error(e.message),
    }),
    updateSection: useMutation({
      mutationFn: async (v: { id: string; patch: Partial<Section>; questionnaire_id: string }) => {
        const { error } = await supabase.from("questionnaire_sections").update(v.patch).eq("id", v.id);
        if (error) throw error;
      },
      onSuccess: (_, v) => inv([["q-sections", v.questionnaire_id]]),
      onError: (e: any) => toast.error(e.message),
    }),
    deleteSection: useMutation({
      mutationFn: async (v: { id: string; questionnaire_id: string }) => {
        const { error } = await supabase.from("questionnaire_sections").delete().eq("id", v.id);
        if (error) throw error;
      },
      onSuccess: (_, v) => { inv([["q-sections", v.questionnaire_id]]); toast.success("Section removed"); },
      onError: (e: any) => toast.error(e.message),
    }),
    reorderSections: useMutation({
      mutationFn: async (v: { questionnaire_id: string; ordered: { id: string; display_order: number }[] }) => {
        for (const s of v.ordered) {
          const { error } = await supabase.from("questionnaire_sections").update({ display_order: s.display_order }).eq("id", s.id);
          if (error) throw error;
        }
      },
      onSuccess: (_, v) => inv([["q-sections", v.questionnaire_id]]),
    }),
    addQuestion: useMutation({
      mutationFn: async (v: Partial<Question> & { section_id: string; question_id: string; question_text: string }) => {
        const { data, error } = await supabase.from("questions").insert(v as any).select().single();
        if (error) throw error;
        return data;
      },
      onSuccess: () => { qc.invalidateQueries({ queryKey: ["q-questions"] }); toast.success("Question added"); },
      onError: (e: any) => toast.error(e.message),
    }),
    updateQuestion: useMutation({
      mutationFn: async (v: { id: string; patch: Partial<Question> }) => {
        const { error } = await supabase.from("questions").update(v.patch).eq("id", v.id);
        if (error) throw error;
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: ["q-questions"] }),
      onError: (e: any) => toast.error(e.message),
    }),
    deleteQuestion: useMutation({
      mutationFn: async (v: { id: string }) => {
        const { error } = await supabase.from("questions").delete().eq("id", v.id);
        if (error) throw error;
      },
      onSuccess: () => { qc.invalidateQueries({ queryKey: ["q-questions"] }); toast.success("Question removed"); },
      onError: (e: any) => toast.error(e.message),
    }),
    duplicateQuestion: useMutation({
      mutationFn: async (q: Question) => {
        const { id, ...rest } = q;
        const { error } = await supabase.from("questions").insert({
          ...rest,
          question_id: `${q.question_id}-copy`,
          display_order: q.display_order + 1,
        });
        if (error) throw error;
      },
      onSuccess: () => { qc.invalidateQueries({ queryKey: ["q-questions"] }); toast.success("Question duplicated"); },
      onError: (e: any) => toast.error(e.message),
    }),
    reorderQuestions: useMutation({
      mutationFn: async (v: { ordered: { id: string; display_order: number }[] }) => {
        for (const q of v.ordered) {
          const { error } = await supabase.from("questions").update({ display_order: q.display_order }).eq("id", q.id);
          if (error) throw error;
        }
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: ["q-questions"] }),
    }),
  };
}
