import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { useDepartments, useStakeholders, useDeleteDepartment } from "@/hooks/crm/useCrmEntities";
import { DepartmentSheet } from "@/components/crm/DepartmentSheet";
import { toast } from "@/hooks/use-toast";
import type { Department } from "../types";

export function DepartmentsTab({ companyId }: { companyId: string }) {
  const { data: departments = [] } = useDepartments(companyId);
  const { data: stakeholders = [] } = useStakeholders(companyId);
  const del = useDeleteDepartment();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);

  const head = (id: string | null) => {
    if (!id) return null;
    const s = stakeholders.find((x) => x.id === id);
    return s ? `${s.first_name} ${s.last_name}` : null;
  };

  const onDelete = async (d: Department) => {
    try { await del.mutateAsync(d.id); toast({ title: "Department deleted" }); }
    catch (e: unknown) { toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Departments</h3>
        <Button className="gap-2" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />Add Department</Button>
      </div>
      {departments.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Building2 className="h-10 w-10 mx-auto text-indigo mb-2" />
          <p className="text-sm text-muted-foreground">No departments yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {departments.map((d) => (
            <div key={d.id} className="rounded-lg border bg-card p-4 group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold flex items-center gap-2"><Building2 className="h-4 w-4 text-indigo" />{d.name}</div>
                  {head(d.head_stakeholder_id) && <div className="text-xs text-muted-foreground mt-1">Head: {head(d.head_stakeholder_id)}</div>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(d); setOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(d)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              {d.description && <p className="text-sm text-muted-foreground mt-2">{d.description}</p>}
            </div>
          ))}
        </div>
      )}
      <DepartmentSheet open={open} onOpenChange={setOpen} companyId={companyId} department={editing} stakeholders={stakeholders} />
    </div>
  );
}