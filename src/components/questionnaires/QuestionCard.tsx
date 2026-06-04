import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical, Pencil, Copy, Trash2, Eye, EyeOff, AlertCircle, Paperclip, ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import type { Question } from "@/hooks/questionnaires/useQuestionnaireData";

const priorityStyles: Record<string, string> = {
  High: "bg-rose-100 text-rose-700 border-rose-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export function QuestionCard({
  q, onEdit, onDuplicate, onDelete, onSelect, selected,
}: {
  q: Question;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSelect: () => void;
  selected: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: q.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group relative rounded-xl border bg-white/70 backdrop-blur-md transition-all hover:shadow-lg hover:-translate-y-0.5 ${
        selected ? "border-indigo-400 ring-2 ring-indigo-200" : "border-white/60"
      }`}
    >
      <div className="flex items-start gap-3 p-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab text-muted-foreground/60 hover:text-indigo-600"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <Badge variant="outline" className="font-mono text-[10px] bg-indigo-50 border-indigo-200 text-indigo-700">
              {q.question_id}
            </Badge>
            {q.priority && (
              <Badge variant="outline" className={`text-[10px] ${priorityStyles[q.priority] ?? ""}`}>
                {q.priority}
              </Badge>
            )}
            {q.required && (
              <Tooltip><TooltipTrigger><Badge variant="outline" className="text-[10px] bg-rose-50 border-rose-200 text-rose-700">Required</Badge></TooltipTrigger><TooltipContent>Required question</TooltipContent></Tooltip>
            )}
            {q.evidence_requested && (
              <Tooltip><TooltipTrigger><Badge variant="outline" className="text-[10px] bg-violet-50 border-violet-200 text-violet-700 inline-flex items-center gap-1"><Paperclip className="h-2.5 w-2.5" /> Evidence</Badge></TooltipTrigger><TooltipContent>Evidence requested</TooltipContent></Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className={`text-[10px] inline-flex items-center gap-1 ${q.customer_visible ? "bg-sky-50 border-sky-200 text-sky-700" : "bg-slate-100 border-slate-200 text-slate-600"}`}>
                  {q.customer_visible ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
                  {q.customer_visible ? "Visible" : "Internal"}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>{q.customer_visible ? "Visible to customers" : "Internal only"}</TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-foreground leading-snug">{q.question_text}</p>

          {open && (
            <div className="mt-3 space-y-2 text-xs text-muted-foreground animate-fade-in">
              {q.why_asking && <p><span className="font-medium text-foreground/80">Why:</span> {q.why_asking}</p>}
              {q.follow_up_questions && <p><span className="font-medium text-foreground/80">Follow-up:</span> {q.follow_up_questions}</p>}
              {q.evidence_requested && <p><span className="font-medium text-foreground/80">Evidence:</span> {q.evidence_requested}</p>}
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Type: {q.question_type}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setOpen((o) => !o)}>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onEdit}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onDuplicate}><Copy className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-600 hover:text-rose-700" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
    </div>
  );
}
