import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, StickyNote } from "lucide-react";
import { useNotes, useDeleteNote } from "@/hooks/crm/useCrmEntities";
import { NoteSheet } from "@/components/crm/NoteSheet";
import { toast } from "@/hooks/use-toast";
import type { Note } from "../types";

export function NotesTab({ companyId }: { companyId: string }) {
  const { data: notes = [] } = useNotes(companyId);
  const del = useDeleteNote();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);

  const onDelete = async (n: Note) => {
    try { await del.mutateAsync(n.id); toast({ title: "Note deleted" }); }
    catch (e: unknown) { toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Notes</h3>
        <Button className="gap-2" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />Add Note</Button>
      </div>
      {notes.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <StickyNote className="h-10 w-10 mx-auto text-indigo mb-2" />
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {notes.map((n) => (
            <div key={n.id} className="rounded-lg border bg-card p-4 group">
              <div className="flex items-start justify-between">
                <div className="text-xs text-muted-foreground">
                  {n.author && <span className="font-medium text-foreground">{n.author}</span>}
                  {n.author && " · "}
                  {new Date(n.created_at).toLocaleString()}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(n); setOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(n)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <p className="text-sm mt-2 whitespace-pre-wrap">{n.body}</p>
            </div>
          ))}
        </div>
      )}
      <NoteSheet open={open} onOpenChange={setOpen} companyId={companyId} note={editing} />
    </div>
  );
}