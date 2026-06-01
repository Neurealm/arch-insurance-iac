import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpsertDepartment } from "@/hooks/crm/useCrmEntities";
import { toast } from "@/hooks/use-toast";
import type { Department, Stakeholder } from "@/pages/crm/types";

const NONE = "__none__";

export function DepartmentSheet({
  open, onOpenChange, companyId, department, stakeholders,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  companyId: string;
  department?: Department | null;
  stakeholders: Stakeholder[];
}) {
  const [form, setForm] = useState<Partial<Department>>({});
  const upsert = useUpsertDepartment();

  useEffect(() => {
    if (open) setForm(department ? { ...department } : { name: "", description: "", head_stakeholder_id: null });
  }, [open, department]);

  const submit = async () => {
    if (!form.name?.trim()) return toast({ title: "Name required", variant: "destructive" });
    try {
      await upsert.mutateAsync({ ...form, company_id: companyId, id: department?.id });
      toast({ title: department ? "Department updated" : "Department added" });
      onOpenChange(false);
    } catch (e: unknown) {
      toast({ title: e instanceof Error ? e.message : "Save failed", variant: "destructive" });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader><SheetTitle>{department ? "Edit Department" : "Add Department"}</SheetTitle></SheetHeader>
        <div className="mt-6 grid gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Name *</Label>
            <Input value={form.name ?? ""} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Department Head</Label>
            <Select
              value={form.head_stakeholder_id ?? NONE}
              onValueChange={(v) => setForm((p) => ({ ...p, head_stakeholder_id: v === NONE ? null : v }))}
            >
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>—</SelectItem>
                {stakeholders.map((s) => <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Description</Label>
            <Textarea rows={3} value={form.description ?? ""} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
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