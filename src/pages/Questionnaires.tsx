import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, Plus, Save, Eye, FileText, FolderKanban, Layers, ChevronRight, Sparkles, Settings2,
  ChevronDown, GripVertical, Pencil, Trash2, CheckCircle2, AlertCircle, Users, ShieldCheck, ArrowLeft,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Program, Questionnaire, Section, Workstream, usePrograms, useQMutations, useQuestionnaires,
  useQuestions, useSections, useWorkstreams,
} from "@/hooks/questionnaires/useQuestionnaireData";
import { QuestionCard } from "@/components/questionnaires/QuestionCard";
import { QuestionEditor, QuestionDraft } from "@/components/questionnaires/QuestionEditor";
import { PreviewMode } from "@/components/questionnaires/PreviewMode";
import type { Question } from "@/hooks/questionnaires/useQuestionnaireData";

/* ---------- helpers ---------- */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "bg-amber-100 text-amber-700 border-amber-200",
    ready: "bg-sky-100 text-sky-700 border-sky-200",
    published: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  return (
    <Badge variant="outline" className={`text-[10px] capitalize ${map[status] ?? "bg-slate-100 text-slate-700"}`}>
      {status}
    </Badge>
  );
}

/* ---------- left sidebar ---------- */
function LeftNav({
  programId, workstreamId, questionnaireId,
  onProgram, onWorkstream, onQuestionnaire,
}: {
  programId: string | null;
  workstreamId: string | null;
  questionnaireId: string | null;
  onProgram: (id: string) => void;
  onWorkstream: (id: string) => void;
  onQuestionnaire: (id: string) => void;
}) {
  const { data: programs = [] } = usePrograms();
  const [search, setSearch] = useState("");
  const [openProg, setOpenProg] = useState<Record<string, boolean>>({});
  const [openWs, setOpenWs] = useState<Record<string, boolean>>({});
  const { addProgram, addWorkstream, addQuestionnaire } = useQMutations();
  const [newProgOpen, setNewProgOpen] = useState(false);
  const [newProgName, setNewProgName] = useState("");

  const filtered = programs.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => { if (programId) setOpenProg((s) => ({ ...s, [programId]: true })); }, [programId]);
  useEffect(() => { if (workstreamId) setOpenWs((s) => ({ ...s, [workstreamId]: true })); }, [workstreamId]);

  return (
    <aside className="w-72 shrink-0 h-[calc(100vh-1rem)] sticky top-2 rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-lg p-3 flex flex-col">
      <Link
        to="/app"
        className="flex items-center gap-1.5 px-2 py-1 mb-1 text-[11px] text-muted-foreground hover:text-indigo-700 transition-colors"
      >
        <ArrowLeft className="h-3 w-3" /> Back to dashboard
      </Link>
      <div className="flex items-center gap-2 px-2 py-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">Questionnaire Studio</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">NeuGAIN Internal</p>
        </div>
      </div>

      <div className="relative px-2 mt-2">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search programs..." className="pl-7 h-8 text-xs bg-white/70" />
      </div>

      <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-1">
        {filtered.map((p) => (
          <ProgramRow
            key={p.id}
            program={p}
            isOpen={!!openProg[p.id]}
            active={programId === p.id}
            onToggle={() => setOpenProg((s) => ({ ...s, [p.id]: !s[p.id] }))}
            onSelect={() => onProgram(p.id)}
            workstreamId={workstreamId}
            questionnaireId={questionnaireId}
            openWs={openWs}
            setOpenWs={setOpenWs}
            onWorkstream={onWorkstream}
            onQuestionnaire={onQuestionnaire}
            onAddWorkstream={(name, order) => addWorkstream.mutate({ program_id: p.id, name, display_order: order })}
            onAddQuestionnaire={(workstream_id, title) => addQuestionnaire.mutate({ workstream_id, title })}
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8 px-3">No programs yet. Create one to get started.</p>
        )}
      </div>

      <Dialog open={newProgOpen} onOpenChange={setNewProgOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="mt-2 mx-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg transition-all">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> New program
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-white/90 backdrop-blur-xl">
          <DialogHeader><DialogTitle>New program</DialogTitle></DialogHeader>
          <Input placeholder="Program name" value={newProgName} onChange={(e) => setNewProgName(e.target.value)} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewProgOpen(false)}>Cancel</Button>
            <Button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
              onClick={async () => {
                if (!newProgName.trim()) return;
                await addProgram.mutateAsync(newProgName.trim());
                setNewProgName(""); setNewProgOpen(false);
              }}
            >Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}

function ProgramRow({
  program, isOpen, active, onToggle, onSelect,
  workstreamId, questionnaireId, openWs, setOpenWs,
  onWorkstream, onQuestionnaire, onAddWorkstream, onAddQuestionnaire,
}: any) {
  const { data: workstreams = [] } = useWorkstreams(isOpen ? program.id : null);
  return (
    <div>
      <button
        onClick={() => { onSelect(); onToggle(); }}
        className={`group w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all ${
          active ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700" : "hover:bg-white/80"
        }`}
      >
        <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-90" : ""}`} />
        <FolderKanban className="h-3.5 w-3.5 text-indigo-600" />
        <span className="text-xs font-medium flex-1 truncate">{program.name}</span>
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1 animate-fade-in border-l border-indigo-100 pl-2">
          {workstreams.map((w: Workstream) => (
            <WorkstreamRow
              key={w.id}
              ws={w}
              isOpen={!!openWs[w.id]}
              active={workstreamId === w.id}
              questionnaireId={questionnaireId}
              onToggle={() => setOpenWs((s: any) => ({ ...s, [w.id]: !s[w.id] }))}
              onSelect={() => onWorkstream(w.id)}
              onQuestionnaire={onQuestionnaire}
              onAddQuestionnaire={(title: string) => onAddQuestionnaire(w.id, title)}
            />
          ))}
          <AddInline placeholder="Workstream name" icon={<Layers className="h-3 w-3" />} label="Add workstream" onAdd={(name) => onAddWorkstream(name, workstreams.length)} />
        </div>
      )}
    </div>
  );
}

function WorkstreamRow({ ws, isOpen, active, questionnaireId, onToggle, onSelect, onQuestionnaire, onAddQuestionnaire }: any) {
  const { data: questionnaires = [] } = useQuestionnaires(isOpen ? ws.id : null);
  return (
    <div>
      <button
        onClick={() => { onSelect(); onToggle(); }}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all ${
          active ? "bg-indigo-50 text-indigo-700" : "hover:bg-white/80"
        }`}
      >
        <ChevronRight className={`h-3 w-3 transition-transform ${isOpen ? "rotate-90" : ""}`} />
        <Layers className="h-3 w-3 text-purple-600" />
        <span className="text-[11px] font-medium flex-1 truncate">{ws.name}</span>
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-0.5 border-l border-purple-100 pl-2 animate-fade-in">
          {questionnaires.map((q: Questionnaire) => (
            <button
              key={q.id}
              onClick={() => onQuestionnaire(q.id)}
              className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-left transition-all ${
                questionnaireId === q.id ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm" : "hover:bg-white/80"
              }`}
            >
              <FileText className="h-3 w-3 shrink-0" />
              <span className="text-[11px] flex-1 truncate">{q.title}</span>
              <StatusBadge status={q.status} />
            </button>
          ))}
          <AddInline placeholder="Questionnaire title" icon={<FileText className="h-3 w-3" />} label="Add questionnaire" onAdd={onAddQuestionnaire} />
        </div>
      )}
    </div>
  );
}

function AddInline({ placeholder, label, icon, onAdd }: { placeholder: string; label: string; icon: React.ReactNode; onAdd: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState("");
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full flex items-center gap-2 px-2 py-1 rounded-md text-[11px] text-muted-foreground hover:text-indigo-700 hover:bg-white/70">
        <Plus className="h-3 w-3" /> {label}
      </button>
    );
  }
  return (
    <div className="flex gap-1 px-1 py-1">
      <Input
        autoFocus value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder}
        className="h-7 text-xs bg-white/80"
        onKeyDown={(e) => {
          if (e.key === "Enter" && v.trim()) { onAdd(v.trim()); setV(""); setOpen(false); }
          if (e.key === "Escape") { setV(""); setOpen(false); }
        }}
      />
    </div>
  );
}

/* ---------- section card with sortable questions ---------- */
function SortableSection({
  section, questions, onUpdate, onDelete, onAddQuestion, onEditQuestion,
  onDuplicateQuestion, onDeleteQuestion, onReorderQuestions, onSelectQuestion, selectedQuestionId,
}: {
  section: Section;
  questions: Question[];
  onUpdate: (patch: Partial<Section>) => void;
  onDelete: () => void;
  onAddQuestion: () => void;
  onEditQuestion: (q: Question) => void;
  onDuplicateQuestion: (q: Question) => void;
  onDeleteQuestion: (q: Question) => void;
  onReorderQuestions: (ordered: Question[]) => void;
  onSelectQuestion: (q: Question) => void;
  selectedQuestionId: string | null;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.7 : 1 };
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [desc, setDesc] = useState(section.description ?? "");
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const required = questions.filter((q) => q.required).length;
  const ready = questions.length > 0 ? Math.min(100, Math.round((questions.filter((q) => q.question_text?.trim()).length / questions.length) * 100)) : 0;

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="bg-white/70 backdrop-blur-md border-white/60 overflow-hidden shadow-md hover:shadow-lg transition-all">
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-b border-white/60">
          <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground/60 hover:text-indigo-600">
            <GripVertical className="h-4 w-4" />
          </button>
          <button onClick={() => setOpen((o) => !o)} className="text-indigo-600">
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? "" : "-rotate-90"}`} />
          </button>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 bg-white" />
                <Textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} className="bg-white text-xs" placeholder="Section description" />
              </div>
            ) : (
              <>
                <h3 className="text-sm font-semibold truncate">{section.title}</h3>
                {section.description && <p className="text-xs text-muted-foreground truncate">{section.description}</p>}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white/80 text-[10px]">{questions.length} questions</Badge>
            {required > 0 && <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">{required} required</Badge>}
            <div className="hidden md:flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Progress value={ready} className="w-16 h-1.5" />
              <span>{ready}%</span>
            </div>
            {editing ? (
              <Button size="sm" className="h-7 bg-indigo-600 text-white" onClick={() => { onUpdate({ title, description: desc }); setEditing(false); }}>
                Save
              </Button>
            ) : (
              <>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(true)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-600" onClick={onDelete}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>

        {open && (
          <div className="p-4 space-y-2 animate-fade-in">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={({ active, over }) => {
                if (!over || active.id === over.id) return;
                const oldIdx = questions.findIndex((q) => q.id === active.id);
                const newIdx = questions.findIndex((q) => q.id === over.id);
                onReorderQuestions(arrayMove(questions, oldIdx, newIdx));
              }}
            >
              <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
                {questions.map((q) => (
                  <QuestionCard
                    key={q.id} q={q} selected={selectedQuestionId === q.id}
                    onSelect={() => onSelectQuestion(q)}
                    onEdit={() => onEditQuestion(q)}
                    onDuplicate={() => onDuplicateQuestion(q)}
                    onDelete={() => onDeleteQuestion(q)}
                  />
                ))}
              </SortableContext>
            </DndContext>
            {questions.length === 0 && (
              <p className="text-xs text-center text-muted-foreground py-4">No questions yet.</p>
            )}
            <Button variant="outline" size="sm" onClick={onAddQuestion} className="w-full border-dashed border-indigo-200 text-indigo-700 hover:bg-indigo-50">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add question
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ---------- main page ---------- */
export default function Questionnaires() {
  const [programId, setProgramId] = useState<string | null>(null);
  const [workstreamId, setWorkstreamId] = useState<string | null>(null);
  const [questionnaireId, setQuestionnaireId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorDraft, setEditorDraft] = useState<QuestionDraft | null>(null);

  const { data: programs = [] } = usePrograms();
  const { data: workstreams = [] } = useWorkstreams(programId);
  const { data: questionnaires = [] } = useQuestionnaires(workstreamId);
  const { data: sections = [] } = useSections(questionnaireId);
  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);
  const { data: allQuestions = [] } = useQuestions(questionnaireId, sectionIds);

  const m = useQMutations();
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const questionnaire = questionnaires.find((q) => q.id === questionnaireId) ?? null;
  const questionsBySection = useMemo(() => {
    const m: Record<string, Question[]> = {};
    allQuestions.forEach((q) => { (m[q.section_id] ||= []).push(q); });
    return m;
  }, [allQuestions]);

  // Auto-select first program/workstream/questionnaire when available
  useEffect(() => { if (!programId && programs[0]) setProgramId(programs[0].id); }, [programs, programId]);
  useEffect(() => { setWorkstreamId(null); setQuestionnaireId(null); }, [programId]);
  useEffect(() => { if (!workstreamId && workstreams[0]) setWorkstreamId(workstreams[0].id); }, [workstreams, workstreamId]);
  useEffect(() => { setQuestionnaireId(null); }, [workstreamId]);
  useEffect(() => { if (!questionnaireId && questionnaires[0]) setQuestionnaireId(questionnaires[0].id); }, [questionnaires, questionnaireId]);

  const totalQ = allQuestions.length;
  const visibleQ = allQuestions.filter((q) => q.customer_visible).length;
  const requiredQ = allQuestions.filter((q) => q.required).length;

  const openEditor = (sectionId: string, q?: Question) => {
    setEditorDraft(
      q
        ? { ...q }
        : {
            section_id: sectionId,
            question_id: `Q${String((questionsBySection[sectionId]?.length ?? 0) + 1).padStart(2, "0")}`,
            question_text: "",
            question_type: "long_text",
            priority: "Medium",
            display_order: (questionsBySection[sectionId]?.length ?? 0),
            customer_visible: true,
            required: false,
          },
    );
    setEditorOpen(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/40" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-sky-400/15 rounded-full blur-3xl -z-10" />

      <div className="flex gap-4 p-2">
        <LeftNav
          programId={programId} workstreamId={workstreamId} questionnaireId={questionnaireId}
          onProgram={setProgramId} onWorkstream={setWorkstreamId} onQuestionnaire={setQuestionnaireId}
        />

        <main className="flex-1 min-w-0 space-y-4">
          {/* Top bar */}
          <Card className="bg-white/60 backdrop-blur-xl border-white/60 shadow-md p-3 flex flex-wrap items-center gap-3">
            <Select value={programId ?? ""} onValueChange={setProgramId}>
              <SelectTrigger className="w-48 bg-white/80 h-9"><SelectValue placeholder="Program" /></SelectTrigger>
              <SelectContent>{programs.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={workstreamId ?? ""} onValueChange={setWorkstreamId} disabled={!programId}>
              <SelectTrigger className="w-48 bg-white/80 h-9"><SelectValue placeholder="Workstream" /></SelectTrigger>
              <SelectContent>{workstreams.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={questionnaireId ?? ""} onValueChange={setQuestionnaireId} disabled={!workstreamId}>
              <SelectTrigger className="w-56 bg-white/80 h-9"><SelectValue placeholder="Questionnaire" /></SelectTrigger>
              <SelectContent>{questionnaires.map((q) => <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>)}</SelectContent>
            </Select>

            <div className="flex-1" />

            {questionnaire && <StatusBadge status={questionnaire.status} />}

            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-white/80 px-3 py-1.5">
              <Eye className="h-3.5 w-3.5 text-indigo-600" />
              <span className="text-xs">Preview</span>
              <Switch checked={preview} onCheckedChange={setPreview} />
            </div>

            {questionnaire && !preview && (
              <Button
                size="sm"
                onClick={() =>
                  m.updateQuestionnaire.mutate({
                    id: questionnaire.id,
                    patch: { status: questionnaire.status === "published" ? "draft" : "published" },
                  })
                }
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" /> {questionnaire.status === "published" ? "Unpublish" : "Publish"}
              </Button>
            )}
          </Card>

          {/* Body */}
          {!questionnaire ? (
            <Card className="bg-white/60 backdrop-blur-xl border-white/60 p-16 text-center">
              <Sparkles className="h-10 w-10 text-indigo-600 mx-auto mb-3" />
              <h2 className="text-lg font-semibold">Select or create a questionnaire</h2>
              <p className="text-sm text-muted-foreground mt-1">Pick a program, workstream, and questionnaire from the left panel.</p>
            </Card>
          ) : preview ? (
            <PreviewMode questionnaire={questionnaire} sections={sections} questions={allQuestions} />
          ) : (
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 xl:col-span-9 space-y-4">
                {/* Metadata card */}
                <MetaCard questionnaire={questionnaire} onSave={(patch) => m.updateQuestionnaire.mutate({ id: questionnaire.id, patch })} />

                {/* Sections */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={({ active, over }) => {
                    if (!over || active.id === over.id) return;
                    const oldIdx = sections.findIndex((s) => s.id === active.id);
                    const newIdx = sections.findIndex((s) => s.id === over.id);
                    const reordered = arrayMove(sections, oldIdx, newIdx).map((s, i) => ({ id: s.id, display_order: i }));
                    m.reorderSections.mutate({ questionnaire_id: questionnaire.id, ordered: reordered });
                  }}
                >
                  <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {sections.map((s) => (
                        <SortableSection
                          key={s.id}
                          section={s}
                          questions={questionsBySection[s.id] ?? []}
                          onUpdate={(patch) => m.updateSection.mutate({ id: s.id, patch, questionnaire_id: questionnaire.id })}
                          onDelete={() => m.deleteSection.mutate({ id: s.id, questionnaire_id: questionnaire.id })}
                          onAddQuestion={() => openEditor(s.id)}
                          onEditQuestion={(q) => openEditor(s.id, q)}
                          onDuplicateQuestion={(q) => m.duplicateQuestion.mutate(q)}
                          onDeleteQuestion={(q) => m.deleteQuestion.mutate({ id: q.id })}
                          onReorderQuestions={(ordered) =>
                            m.reorderQuestions.mutate({
                              ordered: ordered.map((q, i) => ({ id: q.id, display_order: i })),
                            })
                          }
                          onSelectQuestion={setSelectedQuestion}
                          selectedQuestionId={selectedQuestion?.id ?? null}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                <AddSectionRow onAdd={(title) => m.addSection.mutate({ questionnaire_id: questionnaire.id, title, display_order: sections.length })} />
              </div>

              {/* Right panel */}
              <aside className="col-span-12 xl:col-span-3">
                <RightPanel
                  questionnaire={questionnaire}
                  totalSections={sections.length}
                  totalQ={totalQ}
                  visibleQ={visibleQ}
                  requiredQ={requiredQ}
                  selected={selectedQuestion}
                  onPreview={() => setPreview(true)}
                />
              </aside>
            </div>
          )}
        </main>
      </div>

      {editorDraft && (
        <QuestionEditor
          open={editorOpen}
          onOpenChange={setEditorOpen}
          initial={editorDraft}
          onSubmit={async (d) => {
            if ((d as any).id) {
              await m.updateQuestion.mutateAsync({ id: (d as any).id, patch: d as any });
            } else {
              await m.addQuestion.mutateAsync(d as any);
            }
          }}
        />
      )}
    </div>
  );
}

function MetaCard({ questionnaire, onSave }: { questionnaire: Questionnaire; onSave: (patch: Partial<Questionnaire>) => void }) {
  const [title, setTitle] = useState(questionnaire.title);
  const [desc, setDesc] = useState(questionnaire.description ?? "");
  useEffect(() => { setTitle(questionnaire.title); setDesc(questionnaire.description ?? ""); }, [questionnaire.id]);

  return (
    <Card className="bg-white/70 backdrop-blur-xl border-white/60 shadow-md p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-7 w-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <Settings2 className="h-3.5 w-3.5 text-white" />
        </div>
        <h2 className="text-sm font-semibold">Questionnaire details</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-1.5 md:col-span-2">
          <Input
            value={title} onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title !== questionnaire.title && onSave({ title })}
            placeholder="Untitled questionnaire"
            className="text-lg font-semibold bg-transparent border-0 border-b border-border/60 rounded-none px-0 focus-visible:ring-0 focus-visible:border-indigo-500"
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Textarea
            rows={2} value={desc} onChange={(e) => setDesc(e.target.value)}
            onBlur={() => desc !== (questionnaire.description ?? "") && onSave({ description: desc })}
            placeholder="Describe what this questionnaire covers..." className="bg-white/60"
          />
        </div>
      </div>
    </Card>
  );
}

function AddSectionRow({ onAdd }: { onAdd: (title: string) => void }) {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState("");
  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)} className="w-full border-dashed border-indigo-300 text-indigo-700 hover:bg-indigo-50 bg-white/60 backdrop-blur-md py-6">
        <Plus className="h-4 w-4 mr-1.5" /> Add new section
      </Button>
    );
  }
  return (
    <Card className="bg-white/80 backdrop-blur-md border-indigo-200 p-3 flex gap-2">
      <Input autoFocus value={v} onChange={(e) => setV(e.target.value)} placeholder="Section title" className="bg-white"
        onKeyDown={(e) => { if (e.key === "Enter" && v.trim()) { onAdd(v.trim()); setV(""); setOpen(false); } }} />
      <Button onClick={() => { if (v.trim()) { onAdd(v.trim()); setV(""); setOpen(false); } }} className="bg-indigo-600 text-white">Add</Button>
      <Button variant="ghost" onClick={() => { setV(""); setOpen(false); }}>Cancel</Button>
    </Card>
  );
}

function RightPanel({
  questionnaire, totalSections, totalQ, visibleQ, requiredQ, selected, onPreview,
}: {
  questionnaire: Questionnaire;
  totalSections: number; totalQ: number; visibleQ: number; requiredQ: number;
  selected: Question | null;
  onPreview: () => void;
}) {
  const completeness =
    totalQ === 0 ? 0 : Math.round(((totalQ > 0 ? 1 : 0) + (totalSections > 0 ? 1 : 0) + (visibleQ > 0 ? 1 : 0) + (requiredQ > 0 ? 1 : 0)) * 25);

  return (
    <div className="sticky top-3 space-y-3">
      <Card className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 text-white border-0 p-5 shadow-xl">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/70 mb-1">
          <ShieldCheck className="h-3.5 w-3.5" /> Template
        </div>
        <p className="text-sm font-semibold truncate">{questionnaire.title}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stat label="Sections" value={totalSections} />
          <Stat label="Questions" value={totalQ} />
          <Stat label="Visible" value={visibleQ} />
          <Stat label="Required" value={requiredQ} />
        </div>
        <div className="mt-4 text-[10px] text-white/80 flex items-center justify-between mb-1">
          <span>Readiness</span><span>{completeness}%</span>
        </div>
        <Progress value={completeness} className="h-1.5 bg-white/20" />
        <Button onClick={onPreview} variant="secondary" size="sm" className="w-full mt-4 bg-white text-indigo-700 hover:bg-white/90">
          <Eye className="h-3.5 w-3.5 mr-1.5" /> Preview as customer
        </Button>
      </Card>

      <Card className="bg-white/70 backdrop-blur-xl border-white/60 shadow-md p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-3.5 w-3.5 text-indigo-600" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Selected question</h3>
        </div>
        {selected ? (
          <div className="space-y-2 animate-fade-in">
            <Badge variant="outline" className="font-mono text-[10px] bg-indigo-50 border-indigo-200 text-indigo-700">{selected.question_id}</Badge>
            <p className="text-sm leading-snug">{selected.question_text}</p>
            <Separator />
            <Row label="Priority" value={selected.priority ?? "—"} />
            <Row label="Type" value={selected.question_type} />
            <Row label="Required" value={selected.required ? "Yes" : "No"} />
            <Row label="Customer visible" value={selected.customer_visible ? "Yes" : "No"} />
            {selected.evidence_requested && <Row label="Evidence" value={selected.evidence_requested} />}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Click a question to inspect its details here.</p>
        )}
      </Card>

      <Card className="bg-white/70 backdrop-blur-xl border-white/60 shadow-md p-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Checklist
        </div>
        <ChecklistItem ok={totalSections > 0} label="At least one section" />
        <ChecklistItem ok={totalQ > 0} label="Has questions" />
        <ChecklistItem ok={visibleQ > 0} label="Customer-visible content" />
        <ChecklistItem ok={requiredQ > 0} label="Defined required questions" />
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white/15 backdrop-blur p-2">
      <p className="text-[10px] uppercase tracking-wider text-white/70">{label}</p>
      <p className="text-xl font-semibold leading-tight">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground/90">{value}</span>
    </div>
  );
}

function ChecklistItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs py-1">
      {ok ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <AlertCircle className="h-3.5 w-3.5 text-amber-500" />}
      <span className={ok ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}
