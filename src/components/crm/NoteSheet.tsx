import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useUpsertNote } from "@/hooks/crm/useCrmEntities";
import { toast } from "@/hooks/use-toast";
import type { Note } from "@/pages/crm/types";

export function NoteSheet({
  open, onOpenChange, companyId, note,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  companyId: string;
  note?: Note | null;
}) {
  const [form, setForm] = useState<Partial<Note>>({});
  const upsert = useUpsertNote();

  useEffect(() => {
    if (open) setForm(note ? { ...note } : { body: "", author: "" });
  }, [open, note]);

  const submit = async () => {
    if (!form.body?.trim()) return toast({ title: "Note body required", variant: "destructive" });
    try {
      await upsert.mutateAsync({ ...form, company_id: companyId, id: note?.id });
      toast({ title: note ? "Note updated" : "Note added" });
      onOpenChange(false);
    } catch (e: unknown) {
      toast({ title: e instanceof Error ? e.message : "Save failed", variant: "destructive" });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader><SheetTitle>{note ? "Edit Note" : "Add Note"}</SheetTitle></SheetHeader>
        <div className="mt-6 grid gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Author</Label>
            <Input value={form.author ?? ""} onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Body *</Label>
            <Textarea rows={6} value={form.body ?? ""} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={upsert.isPending}>{upsert.isPending ? "Saving..." : "Save"}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}