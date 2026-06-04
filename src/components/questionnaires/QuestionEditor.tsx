import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { Question } from "@/hooks/questionnaires/useQuestionnaireData";

export type QuestionDraft = Partial<Question> & {
  section_id: string;
  question_id: string;
  question_text: string;
};

export function QuestionEditor({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: QuestionDraft;
  onSubmit: (draft: QuestionDraft) => Promise<void> | void;
}) {
  const [draft, setDraft] = useState<QuestionDraft>(initial);
  useEffect(() => setDraft(initial), [initial, open]);

  const set = <K extends keyof QuestionDraft>(k: K, v: QuestionDraft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white/90 backdrop-blur-xl border border-white/60">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">
            {initial.id ? "Edit question" : "New question"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label>Question ID</Label>
            <Input value={draft.question_id ?? ""} onChange={(e) => set("question_id", e.target.value)} placeholder="S1.Q01" />
          </div>
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={draft.priority ?? "Medium"} onValueChange={(v) => set("priority", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Question text</Label>
            <Textarea rows={2} value={draft.question_text ?? ""} onChange={(e) => set("question_text", e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Why are we asking?</Label>
            <Textarea rows={2} value={draft.why_asking ?? ""} onChange={(e) => set("why_asking", e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Follow-up questions</Label>
            <Textarea rows={2} value={draft.follow_up_questions ?? ""} onChange={(e) => set("follow_up_questions", e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Evidence requested</Label>
            <Textarea rows={2} value={draft.evidence_requested ?? ""} onChange={(e) => set("evidence_requested", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Question type</Label>
            <Select value={draft.question_type ?? "long_text"} onValueChange={(v) => set("question_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="long_text">Long Text</SelectItem>
                <SelectItem value="short_text">Short Text</SelectItem>
                <SelectItem value="single_choice">Single Choice</SelectItem>
                <SelectItem value="multi_choice">Multi Choice</SelectItem>
                <SelectItem value="boolean">Yes / No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Display order</Label>
            <Input
              type="number"
              value={draft.display_order ?? 0}
              onChange={(e) => set("display_order", Number(e.target.value))}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-white/60 px-3 py-2">
            <Label className="cursor-pointer">Required</Label>
            <Switch checked={!!draft.required} onCheckedChange={(v) => set("required", v)} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-white/60 px-3 py-2">
            <Label className="cursor-pointer">Customer visible</Label>
            <Switch checked={draft.customer_visible ?? true} onCheckedChange={(v) => set("customer_visible", v)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
            onClick={async () => { await onSubmit(draft); onOpenChange(false); }}
          >
            Save question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
