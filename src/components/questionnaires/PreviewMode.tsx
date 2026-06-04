import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { Questionnaire, Section, Question } from "@/hooks/questionnaires/useQuestionnaireData";

export function PreviewMode({
  questionnaire, sections, questions,
}: {
  questionnaire: Questionnaire;
  sections: Section[];
  questions: Question[];
}) {
  const visible = useMemo(() => questions.filter((q) => q.customer_visible), [questions]);
  const bySection = useMemo(() => {
    const m: Record<string, Question[]> = {};
    visible.forEach((q) => { (m[q.section_id] ||= []).push(q); });
    return m;
  }, [visible]);
  const sectionsWithQs = sections.filter((s) => (bySection[s.id]?.length ?? 0) > 0);
  const [idx, setIdx] = useState(0);
  const current = sectionsWithQs[idx];
  const totalQ = visible.length;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const answered = Object.values(answers).filter((v) => v?.trim()).length;
  const progress = totalQ ? Math.round((answered / totalQ) * 100) : 0;

  if (!current) {
    return (
      <Card className="bg-white/70 backdrop-blur-md border-white/60 p-10 text-center text-muted-foreground">
        No customer-visible questions yet.
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Card className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 text-white border-0 p-6 shadow-xl">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/70 mb-2">
          <Sparkles className="h-3.5 w-3.5" /> Customer preview
        </div>
        <h1 className="text-2xl font-semibold mb-1">{questionnaire.title}</h1>
        {questionnaire.description && <p className="text-white/80 text-sm mb-4">{questionnaire.description}</p>}
        <div className="flex items-center justify-between text-xs text-white/80 mb-1.5">
          <span>{answered} of {totalQ} answered</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-1.5 bg-white/20" />
      </Card>

      <div className="flex flex-wrap gap-2">
        {sectionsWithQs.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIdx(i)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              i === idx
                ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                : "bg-white/70 border-border/60 text-foreground hover:border-indigo-300"
            }`}
          >
            {i + 1}. {s.title}
          </button>
        ))}
      </div>

      <Card className="bg-white/80 backdrop-blur-md border-white/60 p-6">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wider text-indigo-600 font-semibold">Section {idx + 1} of {sectionsWithQs.length}</p>
          <h2 className="text-xl font-semibold">{current.title}</h2>
          {current.description && <p className="text-sm text-muted-foreground mt-1">{current.description}</p>}
        </div>

        <div className="space-y-5">
          {(bySection[current.id] ?? []).map((q) => (
            <div key={q.id} className="rounded-xl border border-border/60 bg-white/60 p-4 animate-fade-in">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Badge variant="outline" className="font-mono text-[10px] bg-indigo-50 border-indigo-200 text-indigo-700">{q.question_id}</Badge>
                    {q.required && <Badge variant="outline" className="text-[10px] bg-rose-50 border-rose-200 text-rose-700">Required</Badge>}
                  </div>
                  <p className="text-sm font-medium leading-snug">{q.question_text}</p>
                  {q.why_asking && (
                    <p className="text-xs text-muted-foreground mt-1.5 italic">{q.why_asking}</p>
                  )}
                </div>
              </div>
              <Textarea
                rows={4}
                placeholder="Type your answer..."
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                className="bg-white/80"
              />
              {q.evidence_requested && (
                <div className="mt-3 flex items-center gap-3 rounded-lg border border-dashed border-violet-300 bg-violet-50/50 p-3">
                  <Upload className="h-4 w-4 text-violet-600" />
                  <div className="flex-1 text-xs">
                    <p className="font-medium text-violet-900">Evidence requested</p>
                    <p className="text-violet-700">{q.evidence_requested}</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-violet-300 text-violet-700">Upload</Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/60">
          <Button variant="ghost" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
            disabled={idx === sectionsWithQs.length - 1}
            onClick={() => setIdx((i) => i + 1)}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
