import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Search, FileText, ShieldCheck, CheckCircle2, AlertTriangle,
  Upload, Paperclip, X, ChevronLeft, ChevronRight, Sparkles, Info,
  Save, Clock, Layers, FolderKanban, Loader2, MessageCircle, Lock, Mail, ListFilter,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantScope } from "@/hooks/useTenantScope";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  useSections, useQuestions, type Question, type Section,
} from "@/hooks/questionnaires/useQuestionnaireData";

const ANSWER_STATUSES = [
  "Not Started", "In Progress", "Answered", "Needs Follow Up",
  "Needs Evidence", "Validated", "Deferred", "Not Applicable",
] as const;
type AnswerStatus = typeof ANSWER_STATUSES[number];

// Statuses a tenant user is allowed to set themselves.
// Reviewer-only states ("Validated", "Needs Follow Up", "Needs Evidence", "Deferred")
// stay visible as read-only badges when a reviewer has set them.
const TENANT_STATUSES: AnswerStatus[] = [
  "Not Started", "In Progress", "Answered", "Not Applicable",
];
const REVIEWER_STATUSES = new Set<AnswerStatus>([
  "Validated", "Needs Follow Up", "Needs Evidence", "Deferred",
]);

type FilterMode = "all" | "unanswered" | "needs_evidence";

type AssignedQuestionnaire = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  workstream_id: string;
  workstream_name: string;
  program_name: string;
};

type AnswerRow = {
  id: string;
  question_id: string;
  tenant_id: string;
  answer_text: string | null;
  status: AnswerStatus;
  answered_at: string | null;
  updated_at: string;
};

type EvidenceRow = {
  id: string; answer_id: string; file_name: string; file_url: string; uploaded_at: string;
};

type NoteRow = {
  id: string; answer_id: string; note_text: string; note_type: string; created_at: string;
};

/* -------------------- Hooks -------------------- */

function useAssignedQuestionnaires(tenantId: string | null) {
  return useQuery({
    queryKey: ["customer-questionnaires", tenantId],
    enabled: !!tenantId,
    queryFn: async (): Promise<AssignedQuestionnaire[]> => {
      const { data, error } = await supabase
        .from("questionnaires")
        .select(`
          id, title, description, status, due_date, workstream_id,
          workstreams ( name, programs ( name ) )
        `)
        .eq("assigned_to_tenant_id", tenantId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((q: any) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        status: q.status,
        due_date: q.due_date,
        workstream_id: q.workstream_id,
        workstream_name: q.workstreams?.name ?? "—",
        program_name: q.workstreams?.programs?.name ?? "—",
      }));
    },
  });
}

function useAnswers(tenantId: string | null, questionIds: string[]) {
  return useQuery({
    queryKey: ["customer-answers", tenantId, questionIds.join(",")],
    enabled: !!tenantId && questionIds.length > 0,
    queryFn: async (): Promise<AnswerRow[]> => {
      const { data, error } = await supabase
        .from("answers")
        .select("id,question_id,tenant_id,answer_text,status,answered_at,updated_at")
        .eq("tenant_id", tenantId!)
        .in("question_id", questionIds);
      if (error) throw error;
      return (data as AnswerRow[]) ?? [];
    },
  });
}

function useEvidence(answerIds: string[]) {
  return useQuery({
    queryKey: ["customer-evidence", answerIds.join(",")],
    enabled: answerIds.length > 0,
    queryFn: async (): Promise<EvidenceRow[]> => {
      const { data, error } = await supabase
        .from("evidence_files")
        .select("id,answer_id,file_name,file_url,uploaded_at")
        .in("answer_id", answerIds);
      if (error) throw error;
      return (data as EvidenceRow[]) ?? [];
    },
  });
}

function useCustomerNotes(answerIds: string[]) {
  return useQuery({
    queryKey: ["customer-notes", answerIds.join(",")],
    enabled: answerIds.length > 0,
    queryFn: async (): Promise<NoteRow[]> => {
      const { data, error } = await supabase
        .from("answer_notes")
        .select("id,answer_id,note_text,note_type,created_at")
        .in("answer_id", answerIds)
        .eq("note_type", "customer_visible")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as NoteRow[]) ?? [];
    },
  });
}

/* -------------------- UI helpers -------------------- */

function StatusPill({ status }: { status: AnswerStatus | "Not Started" }) {
  const map: Record<string, string> = {
    "Not Started": "bg-slate-100 text-slate-600 border-slate-200",
    "In Progress": "bg-amber-100 text-amber-700 border-amber-200",
    "Answered": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Needs Follow Up": "bg-orange-100 text-orange-700 border-orange-200",
    "Needs Evidence": "bg-rose-100 text-rose-700 border-rose-200",
    "Validated": "bg-indigo-100 text-indigo-700 border-indigo-200",
    "Deferred": "bg-violet-100 text-violet-700 border-violet-200",
    "Not Applicable": "bg-zinc-100 text-zinc-600 border-zinc-200",
  };
  return (
    <Badge variant="outline" className={`text-[10px] font-medium ${map[status] ?? map["Not Started"]}`}>
      {status}
    </Badge>
  );
}

function OverallStatus(percent: number): "Not Started" | "In Progress" | "Completed" {
  if (percent === 0) return "Not Started";
  if (percent >= 100) return "Completed";
  return "In Progress";
}

function timeAgo(iso?: string | null) {
  if (!iso) return "—";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* -------------------- Main component -------------------- */

export default function CustomerExperience() {
  const { tenantId, tenantName, loading: tenantLoading } = useTenantScope();
  const { user } = useAuth();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [activeQId, setActiveQId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [submitOpen, setSubmitOpen] = useState(false);

  const { data: assigned = [], isLoading: loadingAssigned } = useAssignedQuestionnaires(tenantId);

  useEffect(() => {
    if (!activeQId && assigned[0]) setActiveQId(assigned[0].id);
  }, [assigned, activeQId]);

  const activeQuestionnaire = assigned.find((q) => q.id === activeQId) ?? null;

  const { data: sections = [], isLoading: loadingSections } = useSections(activeQId);
  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);
  const { data: allQuestions = [], isLoading: loadingQuestions } = useQuestions(activeQId, sectionIds);
  const visibleQuestions = useMemo(
    () => allQuestions.filter((q) => q.customer_visible),
    [allQuestions]
  );
  const questionIds = useMemo(() => visibleQuestions.map((q) => q.id), [visibleQuestions]);

  // Sequence number per question (Q1, Q2, …) using flat order across sections.
  const qNumberById = useMemo(() => {
    const m: Record<string, number> = {};
    let i = 0;
    sections.forEach((s) => {
      visibleQuestions
        .filter((q) => q.section_id === s.id)
        .forEach((q) => { i += 1; m[q.id] = i; });
    });
    return m;
  }, [sections, visibleQuestions]);

  const { data: answers = [] } = useAnswers(tenantId, questionIds);
  const answerByQ = useMemo(() => {
    const m: Record<string, AnswerRow> = {};
    answers.forEach((a) => { m[a.question_id] = a; });
    return m;
  }, [answers]);

  const answerIds = useMemo(() => answers.map((a) => a.id), [answers]);
  const { data: evidence = [] } = useEvidence(answerIds);
  const { data: customerNotes = [] } = useCustomerNotes(answerIds);

  const evidenceByAnswer = useMemo(() => {
    const m: Record<string, EvidenceRow[]> = {};
    evidence.forEach((e) => { (m[e.answer_id] ||= []).push(e); });
    return m;
  }, [evidence]);

  const notesByAnswer = useMemo(() => {
    const m: Record<string, NoteRow[]> = {};
    customerNotes.forEach((n) => { (m[n.answer_id] ||= []).push(n); });
    return m;
  }, [customerNotes]);

  const questionsBySection = useMemo(() => {
    const m: Record<string, Question[]> = {};
    visibleQuestions.forEach((q) => { (m[q.section_id] ||= []).push(q); });
    return m;
  }, [visibleQuestions]);

  // Apply the active filter chip to each section's question list.
  const matchesFilter = (q: Question): boolean => {
    if (filterMode === "all") return true;
    const a = answerByQ[q.id];
    const hasText = !!(a?.answer_text && a.answer_text.trim().length > 0);
    const isAnswered = a?.status === "Answered" || a?.status === "Validated" || hasText;
    if (filterMode === "unanswered") return !isAnswered;
    if (filterMode === "needs_evidence") return a?.status === "Needs Evidence";
    return true;
  };
  const filteredQuestionsBySection = useMemo(() => {
    const m: Record<string, Question[]> = {};
    Object.entries(questionsBySection).forEach(([sid, list]) => {
      m[sid] = list.filter(matchesFilter);
    });
    return m;
  }, [questionsBySection, filterMode, answerByQ]);

  // Auto-select first section / question
  useEffect(() => {
    if (sections.length > 0 && (!activeSectionId || !sections.find((s) => s.id === activeSectionId))) {
      setActiveSectionId(sections[0].id);
    }
  }, [sections, activeSectionId]);

  useEffect(() => {
    const list = activeSectionId ? questionsBySection[activeSectionId] ?? [] : [];
    if (list.length > 0 && (!activeQuestionId || !list.find((q) => q.id === activeQuestionId))) {
      setActiveQuestionId(list[0].id);
    }
  }, [activeSectionId, questionsBySection, activeQuestionId]);

  /* --------------- Counts --------------- */
  const counts = useMemo(() => {
    const total = visibleQuestions.length;
    let answered = 0, needsEvidence = 0, inProgress = 0;
    visibleQuestions.forEach((q) => {
      const a = answerByQ[q.id];
      if (!a) return;
      const hasText = !!(a.answer_text && a.answer_text.trim().length > 0);
      if (a.status === "Answered" || a.status === "Validated" || (hasText && a.status === "In Progress")) answered++;
      else if (a.status === "Needs Evidence") needsEvidence++;
      else if (a.status === "In Progress") inProgress++;
    });
    const percent = total === 0 ? 0 : Math.round((answered / total) * 100);
    return { total, answered, needsEvidence, inProgress, remaining: total - answered, percent };
  }, [visibleQuestions, answerByQ]);

  // Required questions still missing an answer — used by the submit gate.
  const missingRequired = useMemo(() => {
    return visibleQuestions.filter((q) => {
      if (!q.required) return false;
      const a = answerByQ[q.id];
      const hasText = !!(a?.answer_text && a.answer_text.trim().length > 0);
      const isAnswered = a?.status === "Answered" || a?.status === "Validated" || hasText;
      return !isAnswered;
    });
  }, [visibleQuestions, answerByQ]);

  /* --------------- Mutations --------------- */

  const saveAnswer = useMutation({
    mutationFn: async (v: { question_id: string; answer_text?: string; status?: AnswerStatus }) => {
      if (!tenantId) throw new Error("No tenant context");
      const existing = answerByQ[v.question_id];
      const patch: any = {
        question_id: v.question_id,
        tenant_id: tenantId,
        answered_by: user?.id ?? null,
        answered_at: new Date().toISOString(),
      };
      if (v.answer_text !== undefined) patch.answer_text = v.answer_text;
      if (v.status !== undefined) patch.status = v.status;
      else if (v.answer_text !== undefined && v.answer_text.trim().length > 0) patch.status = "Answered";
      else if (!existing) patch.status = "In Progress";

      const { data, error } = await supabase
        .from("answers")
        .upsert(patch, { onConflict: "question_id,tenant_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer-answers", tenantId] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to save answer"),
  });

  const uploadEvidence = useMutation({
    mutationFn: async (v: { question_id: string; file: File }) => {
      if (!tenantId) throw new Error("No tenant context");
      // Ensure an answer exists
      let answer = answerByQ[v.question_id];
      if (!answer) {
        const { data, error } = await supabase
          .from("answers")
          .upsert(
            {
              question_id: v.question_id,
              tenant_id: tenantId,
              status: "Needs Evidence",
              answered_by: user?.id ?? null,
            },
            { onConflict: "question_id,tenant_id" }
          )
          .select()
          .single();
        if (error) throw error;
        answer = data as AnswerRow;
      }
      const path = `${tenantId}/${answer.id}/${Date.now()}-${v.file.name}`;
      const { error: upErr } = await supabase.storage.from("evidence").upload(path, v.file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) throw upErr;
      const { error: insErr } = await supabase.from("evidence_files").insert({
        answer_id: answer.id,
        file_name: v.file.name,
        file_url: path,
        uploaded_by: user?.id ?? null,
      });
      if (insErr) throw insErr;
    },
    onSuccess: () => {
      toast.success("Evidence uploaded");
      qc.invalidateQueries({ queryKey: ["customer-answers", tenantId] });
      qc.invalidateQueries({ queryKey: ["customer-evidence"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Upload failed"),
  });

  const removeEvidence = useMutation({
    mutationFn: async (v: { id: string; file_url: string }) => {
      await supabase.storage.from("evidence").remove([v.file_url]);
      const { error } = await supabase.from("evidence_files").delete().eq("id", v.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Evidence removed");
      qc.invalidateQueries({ queryKey: ["customer-evidence"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to remove"),
  });

  const submitQuestionnaire = useMutation({
    mutationFn: async () => {
      if (!activeQId) throw new Error("No questionnaire selected");
      const { error } = await supabase
        .from("questionnaires")
        .update({ status: "submitted" })
        .eq("id", activeQId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Questionnaire submitted — thank you!");
      qc.invalidateQueries({ queryKey: ["customer-questionnaires", tenantId] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to submit"),
  });

  /* --------------- Render guards --------------- */
  if (tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!tenantId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Card className="max-w-md p-8 text-center bg-white/70 backdrop-blur-xl border-white/60 shadow-xl rounded-2xl">
          <ShieldCheck className="h-10 w-10 mx-auto text-indigo-400" />
          <h2 className="mt-3 text-lg font-semibold">Tenant access required</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your account is not linked to a tenant workspace. Contact your NeuGAIN administrator to be assigned.
          </p>
        </Card>
      </div>
    );
  }

  const filteredAssigned = assigned.filter(
    (q) =>
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.program_name.toLowerCase().includes(search.toLowerCase()) ||
      q.workstream_name.toLowerCase().includes(search.toLowerCase())
  );

  const activeSectionQuestions =
    activeSectionId ? questionsBySection[activeSectionId] ?? [] : [];
  const activeQuestion =
    activeSectionQuestions.find((q) => q.id === activeQuestionId) ?? null;
  const activeAnswer = activeQuestion ? answerByQ[activeQuestion.id] : null;
  const activeEvidence = activeAnswer ? evidenceByAnswer[activeAnswer.id] ?? [] : [];
  const activeNotes = activeAnswer ? notesByAnswer[activeAnswer.id] ?? [] : [];

  const flatQList = useMemo(() => {
    const flat: { sectionId: string; questionId: string }[] = [];
    sections.forEach((s) => {
      (questionsBySection[s.id] ?? []).forEach((q) => {
        flat.push({ sectionId: s.id, questionId: q.id });
      });
    });
    return flat;
  }, [sections, questionsBySection]);
  const activeIdx = flatQList.findIndex((f) => f.questionId === activeQuestionId);
  const isLastQ = activeIdx >= 0 && activeIdx === flatQList.length - 1;
  const isSubmitted = activeQuestionnaire?.status === "submitted";

  const overall = OverallStatus(counts.percent);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="relative min-h-screen overflow-hidden">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
          <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute top-1/3 -right-32 h-[360px] w-[360px] rounded-full bg-purple-200/40 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-fuchsia-100/40 blur-3xl" />
        </div>

        <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
          {/* Top header */}
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/app"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-indigo-700 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
            </Link>
            <Badge
              variant="outline"
              className="bg-white/60 backdrop-blur-md border-white/60 text-indigo-700"
            >
              <Sparkles className="h-3 w-3 mr-1" /> {tenantName ?? "Tenant workspace"}
            </Badge>
          </div>

          {/* Hero */}
          <Card className="relative overflow-hidden rounded-3xl border-white/60 bg-white/55 backdrop-blur-xl shadow-[0_8px_40px_-12px_rgba(99,102,241,0.25)] p-6 mb-5">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <p className="text-xs font-medium tracking-wide text-indigo-600 uppercase">
                  NeuGAIN Assessment
                </p>
                <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mt-1">
                  {activeQuestionnaire ? activeQuestionnaire.title : "My Questionnaires"}
                </h1>
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  {activeQuestionnaire
                    ? <>Currently working on <span className="font-medium text-slate-700">{activeQuestionnaire.title}</span> · {activeQuestionnaire.program_name} · {activeQuestionnaire.workstream_name}</>
                    : "Select an assigned questionnaire to begin."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill status={overall as AnswerStatus} />
                <div className="text-right">
                  <div className="text-3xl font-semibold text-slate-900 leading-none">
                    {counts.percent}%
                  </div>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground mt-1">
                    Complete
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <Progress value={counts.percent} className="h-2 bg-indigo-100" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <StatTile icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />} label="Answered" value={counts.answered} />
                <StatTile icon={<Clock className="h-4 w-4 text-amber-600" />} label="In Progress" value={counts.inProgress} />
                <StatTile icon={<AlertTriangle className="h-4 w-4 text-rose-600" />} label="Needs Evidence" value={counts.needsEvidence} />
                <StatTile icon={<FileText className="h-4 w-4 text-indigo-600" />} label="Remaining" value={counts.remaining} />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-12 gap-5">
            {/* Sidebar */}
            <aside className="col-span-12 lg:col-span-3">
              <Card className="rounded-2xl border-white/60 bg-white/60 backdrop-blur-xl shadow-md p-3 lg:sticky lg:top-4">
                <div className="flex items-center gap-2 px-1 mb-2">
                  <FolderKanban className="h-4 w-4 text-indigo-600" />
                  <div className="text-sm font-semibold">Assigned to you</div>
                  <Badge variant="outline" className="ml-auto text-[10px]">{assigned.length}</Badge>
                </div>
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search questionnaires..."
                    className="pl-8 h-8 text-xs bg-white/70 border-white/70"
                  />
                </div>

                <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-auto pr-1">
                  {loadingAssigned && (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                    </div>
                  )}
                  {!loadingAssigned && filteredAssigned.length === 0 && (
                    <div className="text-center py-8 px-3">
                      <ShieldCheck className="h-8 w-8 mx-auto text-indigo-300" />
                      <p className="text-xs font-medium text-slate-700 mt-2">
                        {search ? "No questionnaires match your search." : "Nothing assigned yet"}
                      </p>
                      {!search && (
                        <>
                          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                            Your NeuGAIN program lead will assign assessments to <span className="font-medium">{tenantName ?? "your workspace"}</span>. They'll appear here automatically.
                          </p>
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="mt-3 bg-white/70 text-[11px]"
                          >
                            <a href={`mailto:hello@neugain.io?subject=Questionnaire assignment for ${encodeURIComponent(tenantName ?? "my tenant")}`}>
                              <Mail className="h-3 w-3 mr-1.5" /> Contact program lead
                            </a>
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                  {filteredAssigned.map((q) => (
                    <QuestionnaireCard
                      key={q.id}
                      q={q}
                      active={q.id === activeQId}
                      onClick={() => setActiveQId(q.id)}
                    />
                  ))}
                </div>
              </Card>
            </aside>

            {/* Main */}
            <main className="col-span-12 lg:col-span-6">
              {!activeQuestionnaire ? (
                <Card className="rounded-2xl border-white/60 bg-white/60 backdrop-blur-xl shadow-md p-10 text-center">
                  <FileText className="h-10 w-10 mx-auto text-indigo-300" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Select a questionnaire from the left to begin.
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Sections accordion */}
                  <Card className="rounded-2xl border-white/60 bg-white/60 backdrop-blur-xl shadow-md p-3">
                    {/* Filter pills */}
                    <div className="flex items-center gap-2 px-1 pb-2 flex-wrap">
                      <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <ListFilter className="h-3 w-3" /> Show
                      </span>
                      {([
                        { key: "all", label: `All (${counts.total})` },
                        { key: "unanswered", label: `Unanswered (${counts.remaining})` },
                        { key: "needs_evidence", label: `Needs evidence (${counts.needsEvidence})` },
                      ] as { key: FilterMode; label: string }[]).map((f) => (
                        <button
                          key={f.key}
                          type="button"
                          onClick={() => setFilterMode(f.key)}
                          className={`px-2.5 py-1 rounded-full text-[11px] border transition-all ${
                            filterMode === f.key
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                              : "bg-white/70 border-white/70 hover:border-indigo-300 text-slate-700"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    {(loadingSections || loadingQuestions) ? (
                      <div className="space-y-2 p-1">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="border border-white/70 rounded-xl bg-white/50 p-3">
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-4 w-4 rounded" />
                              <Skeleton className="h-3 flex-1 max-w-[40%]" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Accordion
                        type="single"
                        collapsible
                        value={activeSectionId ?? undefined}
                        onValueChange={(v) => setActiveSectionId(v || null)}
                        className="space-y-2"
                      >
                        {sections.map((s) => {
                          const list = questionsBySection[s.id] ?? [];
                          const filteredList = filteredQuestionsBySection[s.id] ?? [];
                          const sectionAnswered = list.filter((q) => {
                            const a = answerByQ[q.id];
                            return a?.status === "Answered" || a?.status === "Validated";
                          }).length;
                          const pct = list.length === 0 ? 0 : Math.round((sectionAnswered / list.length) * 100);
                          return (
                            <AccordionItem
                              key={s.id}
                              value={s.id}
                              className="border border-white/70 rounded-xl bg-gradient-to-br from-white/80 to-white/40 px-3"
                            >
                              <AccordionTrigger className="hover:no-underline py-3">
                                <div className="flex flex-1 items-center gap-3 text-left">
                                  <Layers className="h-4 w-4 text-indigo-500 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-slate-800 truncate">{s.title}</div>
                                    {s.description && (
                                      <div className="text-[11px] text-muted-foreground truncate">{s.description}</div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px]">{sectionAnswered}/{list.length}</Badge>
                                    <div className="w-16 h-1.5 rounded-full bg-indigo-100 overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pb-3">
                                <div className="flex flex-wrap gap-1.5">
                                  {filteredList.map((q) => {
                                    const a = answerByQ[q.id];
                                    const status = a?.status ?? "Not Started";
                                    const isActive = q.id === activeQuestionId;
                                    const n = qNumberById[q.id];
                                    const preview = (q.question_text ?? "").slice(0, 80);
                                    return (
                                      <Tooltip key={q.id}>
                                        <TooltipTrigger asChild>
                                          <button
                                            onClick={() => setActiveQuestionId(q.id)}
                                            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] border transition-all ${
                                              isActive
                                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                                                : "bg-white/80 border-white/80 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700"
                                            }`}
                                          >
                                            {status === "Answered" || status === "Validated" ? (
                                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                            ) : status === "Needs Evidence" ? (
                                              <AlertTriangle className="h-3 w-3 text-rose-500" />
                                            ) : (
                                              <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                                            )}
                                            {q.required && <span className="text-rose-500" aria-label="required">*</span>}
                                            Q{n}
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                          <div className="text-[11px] font-medium">{preview}{(q.question_text?.length ?? 0) > 80 ? "…" : ""}</div>
                                          <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">{q.question_id}</div>
                                        </TooltipContent>
                                      </Tooltip>
                                    );
                                  })}
                                  {filteredList.length === 0 && (
                                    <div className="text-xs text-muted-foreground py-1">
                                      {list.length === 0
                                        ? "No customer-visible questions in this section."
                                        : "No questions match the current filter."}
                                    </div>
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                        {sections.length === 0 && (
                          <div className="text-xs text-muted-foreground py-4 text-center">
                            This questionnaire has no sections yet.
                          </div>
                        )}
                      </Accordion>
                    )}
                  </Card>

                  {/* Active question editor */}
                  {activeQuestion && (
                    <QuestionPanel
                      key={activeQuestion.id}
                      question={activeQuestion}
                      answer={activeAnswer}
                      evidence={activeEvidence}
                      notes={activeNotes}
                      saving={saveAnswer.isPending}
                      uploading={uploadEvidence.isPending}
                      onSave={(text) => saveAnswer.mutate({ question_id: activeQuestion.id, answer_text: text })}
                      onStatusChange={(status) => saveAnswer.mutate({ question_id: activeQuestion.id, status })}
                      onUpload={(file) => uploadEvidence.mutate({ question_id: activeQuestion.id, file })}
                      onRemoveEvidence={(id, url) => removeEvidence.mutate({ id, file_url: url })}
                      onPrev={() => navigateQuestion(-1)}
                      onNext={() => navigateQuestion(1)}
                      isLast={isLastQ}
                      isSubmitted={isSubmitted}
                      submitting={submitQuestionnaire.isPending}
                      onSubmit={() => submitQuestionnaire.mutate()}
                    />
                  )}
                </div>
              )}
            </main>

            {/* Right helper panel */}
            <aside className="col-span-12 lg:col-span-3">
              <Card className="rounded-2xl border-white/60 bg-white/60 backdrop-blur-xl shadow-md p-4 lg:sticky lg:top-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-4 w-4 text-indigo-600" />
                  <div className="text-sm font-semibold">Helper</div>
                </div>

                {!activeQuestion ? (
                  <p className="text-xs text-muted-foreground">Select a question to see guidance and quick navigation.</p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                        Current question
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-mono">{activeQuestion.question_id}</Badge>
                        <StatusPill status={(activeAnswer?.status ?? "Not Started") as AnswerStatus} />
                      </div>
                    </div>

                    {activeQuestion.evidence_requested && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                          <Paperclip className="h-3 w-3" /> Evidence requested
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed bg-rose-50/60 border border-rose-100 rounded-lg p-2">
                          {activeQuestion.evidence_requested}
                        </p>
                      </div>
                    )}

                    {activeNotes.length > 0 && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" /> Guidance from NeuGAIN
                        </div>
                        <div className="space-y-1.5">
                          {activeNotes.map((n) => (
                            <div key={n.id} className="text-xs text-slate-700 bg-indigo-50/60 border border-indigo-100 rounded-lg p-2">
                              {n.note_text}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Last saved</span>
                      <span>{timeAgo(activeAnswer?.updated_at)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button type="button" size="sm" variant="outline" className="bg-white/70" onClick={() => navigateQuestion(-1)}>
                        <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
                      </Button>
                      {isLastQ ? (
                        <Button
                          type="button"
                          size="sm"
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95"
                          onClick={() => submitQuestionnaire.mutate()}
                          disabled={submitQuestionnaire.isPending || isSubmitted}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          {isSubmitted ? "Submitted" : "Submit"}
                        </Button>
                      ) : (
                        <Button type="button" size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95" onClick={() => navigateQuestion(1)}>
                          Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </aside>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );

  function navigateQuestion(delta: number) {
    if (!activeSectionId || !activeQuestionId) return;
    // Build flat list of (sectionId, questionId)
    const flat: { sectionId: string; questionId: string }[] = [];
    sections.forEach((s) => {
      (questionsBySection[s.id] ?? []).forEach((q) => {
        flat.push({ sectionId: s.id, questionId: q.id });
      });
    });
    const idx = flat.findIndex((f) => f.questionId === activeQuestionId);
    if (idx === -1) return;
    const next = flat[idx + delta];
    if (!next) return;
    setActiveSectionId(next.sectionId);
    setActiveQuestionId(next.questionId);
  }
}

/* -------------------- Sub-components -------------------- */

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/70 bg-white/60 backdrop-blur-md p-3 flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-white/80 flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <div>
        <div className="text-lg font-semibold leading-none">{value}</div>
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
}

function QuestionnaireCard({
  q, active, onClick,
}: { q: AssignedQuestionnaire; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all ${
        active
          ? "border-indigo-400 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 shadow-md ring-1 ring-indigo-300/60"
          : "border-white/70 bg-white/60 hover:border-indigo-200 hover:bg-white/80"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-800 truncate">{q.title}</div>
          <div className="text-[10px] text-muted-foreground truncate mt-0.5">
            {q.program_name} · {q.workstream_name}
          </div>
        </div>
        <Badge variant="outline" className="text-[9px] capitalize bg-white/80">{q.status}</Badge>
      </div>
    </button>
  );
}

function QuestionPanel({
  question, answer, evidence, notes,
  saving, uploading,
  onSave, onStatusChange, onUpload, onRemoveEvidence, onPrev, onNext,
  isLast, isSubmitted, submitting, onSubmit,
}: {
  question: Question;
  answer: AnswerRow | null;
  evidence: EvidenceRow[];
  notes: NoteRow[];
  saving: boolean;
  uploading: boolean;
  onSave: (text: string) => void;
  onStatusChange: (s: AnswerStatus) => void;
  onUpload: (f: File) => void;
  onRemoveEvidence: (id: string, url: string) => void;
  onPrev: () => void;
  onNext: () => void;
  isLast: boolean;
  isSubmitted: boolean;
  submitting: boolean;
  onSubmit: () => void;
}) {
  const [text, setText] = useState(answer?.answer_text ?? "");
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const lastSavedRef = useRef(answer?.answer_text ?? "");

  useEffect(() => {
    setText(answer?.answer_text ?? "");
    lastSavedRef.current = answer?.answer_text ?? "";
  }, [answer?.id]);

  // Keep latest text in a ref so the unmount/question-switch flush sees it.
  const textRef = useRef(text);
  useEffect(() => { textRef.current = text; }, [text]);

  // Debounced autosave
  useEffect(() => {
    if (text === lastSavedRef.current) return;
    const t = setTimeout(() => {
      onSave(text);
      lastSavedRef.current = text;
    }, 1200);
    return () => clearTimeout(t);
  }, [text]); // eslint-disable-line

  // Flush unsaved text when question changes or panel unmounts.
  useEffect(() => {
    return () => {
      if (textRef.current !== lastSavedRef.current) {
        onSave(textRef.current);
      }
    };
  }, [answer?.id]); // eslint-disable-line

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach((f) => onUpload(f));
  };

  const status: AnswerStatus = (answer?.status ?? "Not Started") as AnswerStatus;

  return (
    <Card className="rounded-2xl border-white/60 bg-white/65 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(99,102,241,0.25)] p-5 transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="font-mono text-[10px] bg-white/80">{question.question_id}</Badge>
          {question.required && (
            <Badge className="text-[10px] bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-100">Required</Badge>
          )}
          {question.priority && (
            <Badge variant="outline" className="text-[10px] capitalize">
              {question.priority} priority
            </Badge>
          )}
          <StatusPill status={status} />
        </div>
        <Select value={status} onValueChange={(v) => onStatusChange(v as AnswerStatus)}>
          <SelectTrigger className="h-8 w-[170px] text-xs bg-white/70">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ANSWER_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <h2 className="text-base font-semibold text-slate-900 leading-relaxed">
        {question.question_text}
      </h2>

      <Accordion type="multiple" className="mt-3 space-y-1.5">
        {question.why_asking && (
          <AccordionItem value="why" className="border border-white/70 rounded-lg bg-white/50 px-3">
            <AccordionTrigger className="py-2 text-xs hover:no-underline">
              <span className="flex items-center gap-1.5"><Info className="h-3.5 w-3.5 text-indigo-500" /> Why we're asking</span>
            </AccordionTrigger>
            <AccordionContent className="text-xs text-slate-700 pb-3">
              {question.why_asking}
            </AccordionContent>
          </AccordionItem>
        )}
        {question.follow_up_questions && (
          <AccordionItem value="follow" className="border border-white/70 rounded-lg bg-white/50 px-3">
            <AccordionTrigger className="py-2 text-xs hover:no-underline">
              <span className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5 text-purple-500" /> Follow-up questions</span>
            </AccordionTrigger>
            <AccordionContent className="text-xs text-slate-700 whitespace-pre-line pb-3">
              {question.follow_up_questions}
            </AccordionContent>
          </AccordionItem>
        )}
        {question.evidence_requested && (
          <AccordionItem value="evi" className="border border-white/70 rounded-lg bg-white/50 px-3">
            <AccordionTrigger className="py-2 text-xs hover:no-underline">
              <span className="flex items-center gap-1.5"><Paperclip className="h-3.5 w-3.5 text-rose-500" /> Evidence requested</span>
            </AccordionTrigger>
            <AccordionContent className="text-xs text-slate-700 pb-3">
              {question.evidence_requested}
            </AccordionContent>
          </AccordionItem>
        )}
        {notes.length > 0 && (
          <AccordionItem value="notes" className="border border-white/70 rounded-lg bg-white/50 px-3">
            <AccordionTrigger className="py-2 text-xs hover:no-underline">
              <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Guidance notes ({notes.length})</span>
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-1.5">
              {notes.map((n) => (
                <div key={n.id} className="text-xs text-slate-700 bg-indigo-50/60 border border-indigo-100 rounded-md p-2">
                  {n.note_text}
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-slate-700">Your answer</label>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            {saving ? (
              <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Saving…</span>
            ) : answer ? (
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Saved {timeAgo(answer.updated_at)}</span>
            ) : (
              <span>Auto-saves as you type</span>
            )}
            <span>· {text.length} chars</span>
          </div>
        </div>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your answer here..."
          className="min-h-[140px] bg-white/80 border-white/80 backdrop-blur-md focus-visible:ring-indigo-300"
        />
      </div>

      {/* Evidence upload */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
            <Paperclip className="h-3.5 w-3.5 text-rose-500" /> Evidence files
          </label>
          {uploading && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
            </span>
          )}
        </div>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-all ${
            dragActive
              ? "border-indigo-400 bg-indigo-50/60"
              : "border-white/80 bg-white/40 hover:border-indigo-300 hover:bg-white/60"
          }`}
        >
          <Upload className="h-5 w-5 mx-auto text-indigo-500" />
          <p className="text-xs text-slate-700 mt-1.5">
            <span className="font-medium">Drop files</span> or click to browse
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            PDF, DOCX, XLSX, PPTX, PNG, JPG
          </p>
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              files.forEach((f) => onUpload(f));
              if (fileRef.current) fileRef.current.value = "";
            }}
          />
        </div>
        {evidence.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {evidence.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-white/70 border border-white/80 rounded-lg text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Paperclip className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">{e.file_name}</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(ev) => { ev.stopPropagation(); onRemoveEvidence(e.id, e.file_url); }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove file</TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Button type="button" variant="outline" size="sm" className="bg-white/70" onClick={onPrev}>
          <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
        </Button>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="bg-white/70"
            onClick={() => { onSave(text); lastSavedRef.current = text; }}
            disabled={saving}
          >
            <Save className="h-3.5 w-3.5 mr-1" /> Save
          </Button>
          {isLast ? (
            <Button
              type="button"
              size="sm"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95"
              onClick={() => { onSave(text); lastSavedRef.current = text; onSubmit(); }}
              disabled={submitting || isSubmitted}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              {isSubmitted ? "Submitted" : "Submit questionnaire"}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95"
              onClick={() => {
                if (text !== lastSavedRef.current) {
                  onSave(text);
                  lastSavedRef.current = text;
                }
                onNext();
              }}
            >
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
