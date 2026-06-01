import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpsertTeam } from "@/hooks/crm/useCrmEntities";
import { toast } from "@/hooks/use-toast";
import type { Team, Department, Stakeholder } from "@/pages/crm/types";

const NONE = "__none__";

export function TeamSheet({
  open, onOpenChange, companyId, team, departments, stakeholders,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  companyId: string;
  team?: Team | null;
  departments: Department[];
  stakeholders: Stakeholder[];
}) {
  const [form, setForm] = useState<Partial<Team>>({});
  const upsert = useUpsertTeam();

  useEffect(() => {
    if (open) setForm(team ? { ...team } : { name: "", description: "", department_id: null, lead_stakeholder_id: null });
  }, [open, team]);

  const submit = async () => {
    if (!form.name?.trim()) return toast({ title: "Name required", variant: "destructive" });
    try {
      await upsert.mutateAsync({ ...form, company_id: companyId, id: team?.id });
      toast({ title: team ? "Team updated" : "Team added" });
      onOpenChange(false);
    } catch (e: unknown) {
      toast({ title: e instanceof Error ? e.message : "Save failed", variant: "destructive" });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader><SheetTitle>{team ? "Edit Team" : "Add Team"}</SheetTitle></SheetHeader>
        <div className="mt-6 grid gap-4">
          <Field label="Name *">
            <Input value={form.name ?? ""} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </Field>
          <Field label="Department">
            <Select value={form.department_id ?? NONE} onValueChange={(v) => setForm((p) => ({ ...p, department_id: v === NONE ? null : v }))}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>—</SelectItem>
                {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Team Lead">
            <Select value={form.lead_stakeholder_id ?? NONE} onValueChange={(v) => setForm((p) => ({ ...p, lead_stakeholder_id: v === NONE ? null : v }))}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>—</SelectItem>
                {stakeholders.map((s) => <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Description">
            <Textarea rows={3} value={form.description ?? ""} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={upsert.isPending}>{upsert.isPending ? "Saving..." : "Save"}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}