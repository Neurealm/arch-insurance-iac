import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Activity as ActivityIcon } from "lucide-react";
import { useActivities, useStakeholders, useDeleteActivity } from "@/hooks/crm/useCrmEntities";
import { ActivitySheet } from "@/components/crm/ActivitySheet";
import { toast } from "@/hooks/use-toast";
import type { Activity } from "../types";

export function ActivitiesTab({ companyId }: { companyId: string }) {
  const { data: activities = [] } = useActivities(companyId);
  const { data: stakeholders = [] } = useStakeholders(companyId);
  const del = useDeleteActivity();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);

  const sName = (id: string | null) => {
    if (!id) return null;
    const s = stakeholders.find((x) => x.id === id);
    return s ? `${s.first_name} ${s.last_name}` : null;
  };

  const onDelete = async (a: Activity) => {
    try { await del.mutateAsync(a.id); toast({ title: "Activity deleted" }); }
    catch (e: unknown) { toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Activities</h3>
        <Button className="gap-2" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />Log Activity</Button>
      </div>
      {activities.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <ActivityIcon className="h-10 w-10 mx-auto text-indigo mb-2" />
          <p className="text-sm text-muted-foreground">No activities logged yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card divide-y">
          {activities.map((a) => (
            <div key={a.id} className="p-4 flex items-start justify-between gap-4 group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{a.type}</Badge>
                  <span className="font-medium">{a.subject}</span>
                  {sName(a.stakeholder_id) && <span className="text-xs text-muted-foreground">· {sName(a.stakeholder_id)}</span>}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{new Date(a.occurred_at).toLocaleString()}</div>
                {a.description && <p className="text-sm mt-2 whitespace-pre-wrap">{a.description}</p>}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(a); setOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(a)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ActivitySheet open={open} onOpenChange={setOpen} companyId={companyId} activity={editing} stakeholders={stakeholders} />
    </div>
  );
}