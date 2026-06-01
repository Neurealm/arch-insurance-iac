import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpsertActivity } from "@/hooks/crm/useCrmEntities";
import { toast } from "@/hooks/use-toast";
import type { Activity, Stakeholder } from "@/pages/crm/types";

const NONE = "__none__";
const TYPES = ["Call", "Meeting", "Email", "Note", "Task"];

export function ActivitySheet({
  open, onOpenChange, companyId, activity, stakeholders,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  companyId: string;
  activity?: Activity | null;
  stakeholders: Stakeholder[];
}) {
  const [form, setForm] = useState<Partial<Activity>>({});
  const upsert = useUpsertActivity();

  useEffect(() => {
    if (open)
      setForm(
        activity
          ? { ...activity }
          : { type: "Note", subject: "", description: "", stakeholder_id: null, occurred_at: new Date().toISOString() },
      );
  }, [open, activity]);

  const submit = async () => {
    if (!form.subject?.trim()) return toast({ title: "Subject required", variant: "destructive" });
    try {
      await upsert.mutateAsync({ ...form, company_id: companyId, id: activity?.id });
      toast({ title: activity ? "Activity updated" : "Activity logged" });
      onOpenChange(false);
    } catch (e: unknown) {
      toast({ title: e instanceof Error ? e.message : "Save failed", variant: "destructive" });
    }
  };

  const dateValue = form.occurred_at ? form.occurred_at.slice(0, 16) : "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader><SheetTitle>{activity ? "Edit Activity" : "Log Activity"}</SheetTitle></SheetHeader>
        <div className="mt-6 grid gap-4">
          <F label="Type">
            <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </F>
          <F label="Subject *"><Input value={form.subject ?? ""} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} /></F>
          <F label="Date">
            <Input type="datetime-local" value={dateValue} onChange={(e) => setForm((p) => ({ ...p, occurred_at: new Date(e.target.value).toISOString() }))} />
          </F>
          <F label="Linked Stakeholder">
            <Select value={form.stakeholder_id ?? NONE} onValueChange={(v) => setForm((p) => ({ ...p, stakeholder_id: v === NONE ? null : v }))}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>—</SelectItem>
                {stakeholders.map((s) => <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </F>
          <F label="Description"><Textarea rows={4} value={form.description ?? ""} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></F>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={upsert.isPending}>{upsert.isPending ? "Saving..." : "Save"}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}